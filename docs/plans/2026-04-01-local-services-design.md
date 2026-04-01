# Local Services Discovery Tool — Design Document

**Date:** 2026-04-01
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Summary

A location-based local services discovery tool for Toolk1t. Users find nearby businesses (plumber, hairdresser, doctor, etc.) with contact info, opening hours, and reviews. Category-first landing page, split-view results (map + list), server-side caching, favourites + recent searches.

### Key Features
- 17 predefined service categories + custom search
- Browser geolocation + manual address input
- Split view: scrollable result list + Leaflet map with pins
- Smart radius defaults (urban/suburban detection) + preset buttons
- Business details: name, address, phone, website, hours, rating, reviews
- Server-side cache in Supabase (24h TTL) to conserve API quota
- Favourites (Supabase for logged-in, localStorage for guests) + recent searches

### Data Source
- Primary: Foursquare Places API (100k free calls/month)
- Future: Google Places API upgrade path

### Non-Goals (v1)
- No booking/appointment system
- No user-submitted reviews
- No directions/navigation
- No Google Places integration yet

---

## Page Layout

### Home State (category grid)
- Top bar: back button, "Local Services" title, current location + "Change" button
- Search bar: always visible
- Category grid: 17 cards (6 cols desktop, 3 cols mobile), icon + label each
- Bottom tabs: Home / Favourites / Recent

### Results State (after category/search)
- Radius pills: 500m, 1km, 2km, 5km, 10km (smart default based on density)
- Split view: 40% list / 60% map on desktop
- Mobile: stacked with List/Map toggle

### Categories (17)
Plumber, Electrician, Hairdresser/Barber, Lawn/Garden, Cleaning, Locksmith, Mechanic, Doctor/GP, Dentist, Pharmacy, Vet, Childcare, Restaurant, Cafe, Supermarket, Gym, Laundry

---

## Result Card

```
┌────────────────────────────────────┐
│ Smith's Plumbing          ⭐ 4.5   │
│ 📍 0.3 km · 123 Queen St          │
│ 🟢 Open now · Closes 5:30pm       │
│ 📞 09-123-4567                     │
│ [♡ Save]                           │
└────────────────────────────────────┘
```

### Expanded Detail
- Full address, phone (tappable), website link
- Opening hours (full week schedule)
- Reviews from Foursquare
- Actions: Call, Visit website, Copy Info, Save, Center on Map

### Map Pin Popup
- Name, rating, distance, open/closed status
- "View Details" link scrolls to list card

---

## Data Flow

```
User taps category
    → Check Supabase cache (cache_key, < 24h)
        → HIT: return cached results
        → MISS: call Foursquare API → cache → return
```

### API Routes

**POST /api/v1/local-services/search**
- Input: lat, lng, category, radius
- Output: ServiceResult[], cached flag, cache age
- Checks Supabase cache first, then calls Foursquare

**GET /api/v1/local-services/place?id={placeId}**
- Returns detailed place info (hours, reviews, photos)

**GET/POST/DELETE /api/v1/local-services/favourites**
- Manage user favourites

### Foursquare API
- Search: `GET /v3/places/search?ll={lat},{lng}&radius={r}&categories={id}&limit=20`
- Detail: `GET /v3/places/{id}?fields=hours,tips,photos,tel,website,rating`
- Auth: `Authorization: {FOURSQUARE_API_KEY}`

### Category → Foursquare ID Mapping

| Category | ID |
|---|---|
| Plumber | 11178 |
| Electrician | 11176 |
| Hairdresser | 11057 |
| Lawn/Garden | 11182 |
| Cleaning | 11174 |
| Locksmith | 11183 |
| Mechanic | 11029 |
| Doctor/GP | 15014 |
| Dentist | 15010 |
| Pharmacy | 15022 |
| Vet | 15048 |
| Childcare | 12056 |
| Restaurant | 13065 |
| Cafe | 13032 |
| Supermarket | 17069 |
| Gym | 18021 |
| Laundry | 11185 |

---

## Caching

Supabase table: `local_services_cache`
- `cache_key`: `"{lat_3dp},{lng_3dp}:{category}:{radius}"` (lat/lng rounded to 3 decimals ≈ 111m)
- `results`: JSONB array of ServiceResult
- `created_at`: TTL = 24 hours
- Nearby users share cache hits

---

## Favourites & Recent

### Favourites
- Logged-in: Supabase (`local_services_favourites` table)
- Guest: localStorage
- Stores snapshot of ServiceResult (instant load, no API call)

### Recent Searches
- localStorage only (max 20, FIFO)
- Stores: query, category, location label, timestamp, result count
- Tap to re-run with current location

### Bottom Tabs
| Tab | Content |
|---|---|
| Home | Category grid or active results |
| Favourites | Saved businesses grouped by category |
| Recent | Chronological search history |

---

## File Structure

```
app/tools/local-services/
├── layout.tsx
└── page.tsx

tools/local-services/
├── local-services-types.ts
├── local-services-provider.tsx
├── local-services-categories.ts
├── components/
│   ├── location-bar.tsx
│   ├── search-bar.tsx
│   ├── category-grid.tsx
│   ├── radius-pills.tsx
│   ├── results-list.tsx
│   ├── result-card.tsx
│   ├── result-detail.tsx
│   ├── results-map.tsx
│   ├── bottom-tabs.tsx
│   ├── favourites-tab.tsx
│   ├── recent-tab.tsx
│   └── location-modal.tsx
└── i18n/
    └── en.ts

app/api/v1/local-services/
├── search/route.ts
├── place/route.ts
└── favourites/route.ts

supabase/migrations/037_local_services.sql
```

~16 components + 3 API routes + 1 migration.

---

## Database Schema

```sql
-- Search results cache
CREATE TABLE local_services_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ls_cache_key ON local_services_cache(cache_key);

-- User favourites
CREATE TABLE local_services_favourites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, place_id)
);

CREATE INDEX idx_ls_fav_user ON local_services_favourites(user_id);
```

Both tables with RLS (users read/write own favourites, cache is public read).

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | Foursquare primary | Google, OSM, both | Good free tier, upgrade path |
| 2 | Browser geolocation + manual | GPS only, IP-based | Accuracy + fallback |
| 3 | 17 predefined categories + search | Free-text only | Quick access + flexibility |
| 4 | Smart radius + presets | Fixed, slider | Adapts to density |
| 5 | Split view (map + list) | List only, map only | Best discovery UX |
| 6 | Server-side cache 24h | No cache, client only | Quota conservation |
| 7 | Favourites + recent | Stateless | Recurring use case |
| 8 | Category-first landing | Search-first, feed | Users come with a need |
| 9 | Snapshot in favourites | Refetch | Instant load |
| 10 | Recent in localStorage | Supabase | Too ephemeral |
| 11 | Lat/lng 3dp cache key | Exact coords | Groups nearby users |
