# Flight Monitor — Design Spec

**Date**: 2026-04-03
**Status**: Approved
**Tool slug**: `flight-monitor`

---

## Overview

A flight price monitoring tool that lets users search flights between cities, set price alerts with target prices, and discover deals through auto-detected price drops. Combines two data sources — Amadeus (official API, real-time) and Fli (Google Flights scraper, daily) — for price comparison and trend analysis.

## Core Features

1. **Flight search** — Search routes via Amadeus with results caching
2. **Price alerts** — Track routes with target prices, in-app badges + email notifications via Resend
3. **Deals feed** — Auto-detected deals from Fli daily scrape data (20%+ below 30-day average)
4. **Dual data sources** — Amadeus (primary, cached) + Fli (daily comparison scraper)

---

## 1. Page Layout & Navigation

Follows the Toolk1t Studio pattern (consistent with Story Studio / Sketch to Art):

- **Themed header** — gradient banner with tool icon, title "Flight Monitor", breadcrumb (desktop), home link (mobile)
- **Sticky tab navigation** — 3 tabs, always visible:

| Tab | Purpose |
|-----|---------|
| **Search** | Search flights, view results, set price alerts |
| **My Alerts** | Dashboard of tracked routes with status and trends |
| **Deals** | Auto-detected deals from price history data |

- **Content area** — each tab renders below the sticky tabs
- **Design system** — Toolk1t dark theme (`#090f16` bg, `#3D6AF2` primary, `#131a23` cards)

---

## 2. Search Tab

### Search Form

- **From / To** — airport code inputs with autocomplete via Amadeus Airport & City Search API
- **Departure date** — date picker
- **Return date** — optional (blank = one-way)
- **Passengers** — number input, default 1
- **Search button** — triggers Amadeus `flightOffersSearch.get()`

### Results List

- Cards showing: airline name, departure/arrival times, duration, stops count, price
- Default sort: cheapest first, with option to sort by duration
- Each card has a **"Set Alert"** button — opens inline form to enter target price
- If Fli comparison data exists for the route, show **price comparison badge**: "Google Flights: $X" vs "Amadeus: $Y"

### Caching

- Cache key: `SHA256(origin + dest + date + returnDate + adults)`
- TTL: 1 hour
- Stored in `flight_searches` Supabase table (global, not per-user)
- UI shows "Cached - refreshed X min ago" label when serving cached data
- Manual "Refresh" button to force new API call

---

## 3. My Alerts Tab

### Alert Cards

Each tracked route displays:

- **Route**: SYD to NRT (city names + airport codes)
- **Current price**: latest from Amadeus or Fli
- **Target price**: user-defined threshold
- **Status badge**:
  - `Tracking` (grey) — price above target
  - `Price Drop!` (green, animated pulse) — price at or below target
  - `Expired` (dim) — alert older than 90 days with no hit
- **Price trend sparkline** — tiny line chart, last 30 days from `flight_price_history`
- **Actions**: Edit target, Delete alert, "Book Now" (links to Google Flights)

### In-App Badge

The "My Alerts" tab label shows a count badge (e.g., `My Alerts (2)`) when any alert has status `price_drop`.

### Empty State

Illustration + "No alerts yet — search for a route and set your target price"

---

## 4. Deals Tab

### Deal Detection Logic

- Compares today's Fli price against 30-day rolling average per route
- Routes with **20%+ price drop** surface as deals
- Computed during GitHub Actions daily cron, stored in `flight_deals` table

### Deal Cards

- **Route**: Melbourne to Bali
- **Current price**: $320
- **Average price**: $450 (30-day avg)
- **Savings badge**: "29% below average"
- **Trend sparkline**: 30-day price history
- **"Set Alert" button**: one tap to start tracking
- **"Search" button**: jumps to Search tab pre-filled with route

### Filters

- **From city**: filter deals by departure city
- **Sort by**: biggest discount % / lowest price / newest

### Staleness

- Deals only shown if Fli data is <48hrs old
- If GitHub Action hasn't run, banner: "Deals data is being updated — check back soon"

---

## 5. Data Architecture

### Supabase Tables

```sql
-- Cached Amadeus search results (global, shared)
flight_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  adults INT DEFAULT 1,
  results JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
)

-- User price alerts (RLS by user_id)
flight_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE,
  target_price NUMERIC NOT NULL,
  current_price NUMERIC,
  status TEXT DEFAULT 'tracking', -- tracking | price_drop | expired
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Daily price history from Fli + Amadeus (global)
flight_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE,
  price NUMERIC NOT NULL,
  source TEXT NOT NULL, -- 'fli' | 'amadeus'
  scraped_at TIMESTAMPTZ DEFAULT now()
)

-- Materialized deals (global, recomputed daily)
flight_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  discount_pct NUMERIC NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
)
```

### RLS Policy

- `flight_alerts`: user can only read/write their own alerts (`auth.uid() = user_id`)
- `flight_searches`, `flight_price_history`, `flight_deals`: global read, service-role write

---

## 6. API Routes (Next.js)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/v1/flights/search` | Check cache, fallback to Amadeus, return results |
| GET | `/api/v1/flights/airports` | Airport autocomplete (proxy to Amadeus) |
| POST | `/api/v1/flights/alerts` | Create a price alert |
| GET | `/api/v1/flights/alerts` | List user's alerts with current prices |
| PATCH | `/api/v1/flights/alerts/[id]` | Update target price |
| DELETE | `/api/v1/flights/alerts/[id]` | Delete an alert |
| GET | `/api/v1/flights/deals` | List auto-detected deals |

---

## 7. GitHub Actions Cron Job

**Schedule**: Daily (e.g., 06:00 UTC)

**Steps**:
1. **Fli scrape** — Run Python script with Fli library, scrape Google Flights for all routes in `flight_alerts` table
2. **Store prices** — Insert results into `flight_price_history` with `source = 'fli'`
3. **Compute deals** — Compare today's price vs 30-day avg per route, upsert `flight_deals` where discount >= 20%
4. **Check alerts** — Query `flight_alerts` where `current_price <= target_price` and `last_notified_at` is null or > 24hrs ago
5. **Send emails** — For each triggered alert, POST to Resend API, update `last_notified_at`

**Secrets required**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`

---

## 8. Email Notification

**Trigger**: GitHub Actions cron detects `current_price <= target_price`

**Email via Resend**:
- **Subject**: "Price Drop! SYD -> NRT is now $580"
- **Body**:
  - Route and dates
  - Current price vs target price
  - Price trend (last 7 days as text)
  - "View in Flight Monitor" link
  - "Book on Google Flights" direct search URL

**Rate limit**: Max 1 email per alert per 24hrs (prevents spam if price fluctuates around target)

**Sender**: `alerts@toolk1t.com` (or configured domain)

---

## 9. Dependencies

| Package | Purpose |
|---------|---------|
| `amadeus` (npm) | Official Amadeus Node SDK for flight search |
| `fli` (pip, Python) | Google Flights scraper via reverse-engineered protobuf |
| `resend` (npm or raw fetch) | Email delivery for price alerts |
| Supabase | Database, auth, RLS |
| GitHub Actions | Daily cron for Fli scraper + alert checks |

---

## 10. Tool Registry Entry

```tsx
// In lib/tools.tsx
{
  name: 'Flight Monitor',
  slug: 'flight-monitor',
  description: 'Track flight prices, set alerts, and discover deals',
  category: 'travel',
  icon: '...', // plane SVG icon
  credit: 0, // free tool, API costs handled server-side
}
```

---

## Out of Scope (v1)

- Manually curated promotion links (v2)
- Multi-city / complex itinerary search
- Hotel or car rental bundling
- Booking directly through the app (links to Google Flights instead)
- Redis caching (Supabase table cache is sufficient for v1)
