# Flight Monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a flight price monitoring tool with search (Amadeus), price alerts (in-app + email), and auto-detected deals (Fli daily scrape).

**Architecture:** Three-tab UI (Search / My Alerts / Deals) following the Toolk1t Studio pattern. API routes proxy Amadeus SDK with Supabase caching (1hr TTL). GitHub Actions cron runs daily Fli scraper + alert checks + Resend emails.

**Tech Stack:** Next.js 16 App Router, Amadeus Node SDK, Supabase (Postgres + RLS), Resend (email), Fli (Python, GitHub Actions), Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-04-03-flight-monitor-design.md`
**Design:** `designs/flight/code.html`

---

## File Structure

```
# Database
supabase/migrations/040_flight_monitor.sql

# Tool registration
lib/tools.tsx                              (modify — add Flight Monitor entry)

# Page + components
app/tools/flight-monitor/page.tsx          (page entry — metadata + ToolFrame)
tools/flight-monitor/flight-monitor.tsx    (main orchestrator — tab state, data fetching)
tools/flight-monitor/tab-navigation.tsx    (sticky 3-tab bar)
tools/flight-monitor/search-form.tsx       (airport inputs, date, passengers)
tools/flight-monitor/flight-card.tsx       (single flight result card)
tools/flight-monitor/search-results.tsx    (results list + cache indicator)
tools/flight-monitor/alert-card.tsx        (single alert card with sparkline)
tools/flight-monitor/alerts-tab.tsx        (alerts list + empty state)
tools/flight-monitor/deal-card.tsx         (single deal card with sparkline)
tools/flight-monitor/deals-tab.tsx         (deals grid + filters)
tools/flight-monitor/set-alert-modal.tsx   (inline target price form)
tools/flight-monitor/sparkline.tsx         (tiny bar chart component)
tools/flight-monitor/types.ts             (shared TypeScript interfaces)

# API routes
app/api/v1/flights/search/route.ts        (GET — cached Amadeus search)
app/api/v1/flights/airports/route.ts      (GET — airport autocomplete)
app/api/v1/flights/alerts/route.ts        (GET + POST — list/create alerts)
app/api/v1/flights/alerts/[id]/route.ts   (PATCH + DELETE — update/delete alert)
app/api/v1/flights/deals/route.ts         (GET — list deals)

# Amadeus helper
lib/flights/amadeus.ts                    (Amadeus SDK wrapper + cache logic)

# GitHub Actions
.github/workflows/flight-scraper.yml     (daily cron — Fli + alerts + email)
scripts/flight-scraper/scrape.py          (Python Fli script)
scripts/flight-scraper/requirements.txt   (fli, supabase, requests)
```

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/040_flight_monitor.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Flight Monitor tables

-- 1. Cached search results (global, shared)
CREATE TABLE IF NOT EXISTS public.flight_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  adults INT DEFAULT 1,
  results JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flight_searches_cache ON public.flight_searches (cache_key);
CREATE INDEX IF NOT EXISTS idx_flight_searches_expiry ON public.flight_searches (expires_at);

-- 2. User price alerts (RLS by user_id)
CREATE TABLE IF NOT EXISTS public.flight_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE,
  target_price NUMERIC NOT NULL,
  current_price NUMERIC,
  status TEXT DEFAULT 'tracking',
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_alerts_user ON public.flight_alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flight_alerts_status ON public.flight_alerts (status) WHERE status = 'price_drop';

-- 3. Daily price history (global)
CREATE TABLE IF NOT EXISTS public.flight_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE,
  price NUMERIC NOT NULL,
  source TEXT NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_price_history_route ON public.flight_price_history (origin, destination, scraped_at DESC);

-- 4. Materialized deals (global, recomputed daily)
CREATE TABLE IF NOT EXISTS public.flight_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  discount_pct NUMERIC NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_deals_discount ON public.flight_deals (discount_pct DESC);

-- RLS
ALTER TABLE public.flight_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_deals ENABLE ROW LEVEL SECURITY;

-- flight_alerts: users read/write own
CREATE POLICY "Users read own alerts" ON public.flight_alerts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alerts" ON public.flight_alerts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON public.flight_alerts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own alerts" ON public.flight_alerts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- flight_searches: global read, service-role write
CREATE POLICY "Anyone can read cached searches" ON public.flight_searches
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role inserts searches" ON public.flight_searches
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role updates searches" ON public.flight_searches
  FOR UPDATE TO service_role USING (true);

-- flight_price_history: global read, service-role write
CREATE POLICY "Anyone can read price history" ON public.flight_price_history
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role inserts history" ON public.flight_price_history
  FOR INSERT TO service_role WITH CHECK (true);

-- flight_deals: global read, service-role write
CREATE POLICY "Anyone can read deals" ON public.flight_deals
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages deals" ON public.flight_deals
  FOR ALL TO service_role USING (true);

-- Permissions
GRANT SELECT ON public.flight_searches TO anon, authenticated;
GRANT SELECT ON public.flight_price_history TO anon, authenticated;
GRANT SELECT ON public.flight_deals TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flight_alerts TO authenticated;
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase db reset` (local) or `npx supabase migration up` (remote)
Expected: All 4 tables created with indexes and RLS policies.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/040_flight_monitor.sql
git commit -m "feat(flight-monitor): add database migration for 4 tables"
```

---

### Task 2: Types + Amadeus Helper

**Files:**
- Create: `tools/flight-monitor/types.ts`
- Create: `lib/flights/amadeus.ts`

- [ ] **Step 1: Create shared types**

```typescript
// tools/flight-monitor/types.ts

export type FlightTab = 'search' | 'alerts' | 'deals'

export interface FlightOffer {
  airline: string
  airlineCode: string
  flightNumber: string
  departureTime: string
  arrivalTime: string
  departureAirport: string
  arrivalAirport: string
  duration: string
  stops: number
  stopCities: string[]
  price: number
  currency: string
  bookingUrl?: string
}

export interface SearchResult {
  offers: FlightOffer[]
  cachedAt: string | null
  expiresAt: string | null
}

export interface FlightAlert {
  id: string
  origin: string
  destination: string
  departure_date: string | null
  target_price: number
  current_price: number | null
  status: 'tracking' | 'price_drop' | 'expired'
  last_notified_at: string | null
  created_at: string
  updated_at: string
  priceHistory?: number[]
}

export interface FlightDeal {
  id: string
  origin: string
  destination: string
  current_price: number
  avg_price: number
  discount_pct: number
  computed_at: string
  priceHistory?: number[]
}

export interface AirportSuggestion {
  iataCode: string
  name: string
  cityName: string
  countryCode: string
}
```

- [ ] **Step 2: Create Amadeus helper with caching**

```typescript
// lib/flights/amadeus.ts

import Amadeus from 'amadeus'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || '',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
})

interface SearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults?: number
}

function buildCacheKey(params: SearchParams): string {
  const raw = `${params.origin}|${params.destination}|${params.departureDate}|${params.returnDate || ''}|${params.adults || 1}`
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export async function searchFlights(params: SearchParams, forceRefresh = false) {
  const cacheKey = buildCacheKey(params)
  const supabase = await createClient()

  // Check cache (unless force refresh)
  if (!forceRefresh) {
    const { data: cached } = await supabase
      .from('flight_searches')
      .select('results, fetched_at, expires_at')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cached) {
      return {
        offers: cached.results as unknown[],
        cachedAt: cached.fetched_at,
        expiresAt: cached.expires_at,
      }
    }
  }

  // Call Amadeus
  const response = await amadeus.shopping.flightOffersSearch.get({
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    ...(params.returnDate ? { returnDate: params.returnDate } : {}),
    adults: String(params.adults || 1),
    max: 10,
    currencyCode: 'AUD',
  })

  const offers = parseAmadeusResponse(response.data)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour

  // Upsert cache
  await supabase
    .from('flight_searches')
    .upsert({
      cache_key: cacheKey,
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
      return_date: params.returnDate || null,
      adults: params.adults || 1,
      results: offers,
      fetched_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'cache_key' })

  return {
    offers,
    cachedAt: null,
    expiresAt: expiresAt.toISOString(),
  }
}

function parseAmadeusResponse(data: unknown[]): unknown[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((offer: any) => {
    const firstSegment = offer.itineraries?.[0]?.segments?.[0]
    const lastSegment = offer.itineraries?.[0]?.segments?.slice(-1)[0]
    const segments = offer.itineraries?.[0]?.segments || []

    return {
      airline: offer.validatingAirlineCodes?.[0] || firstSegment?.carrierCode || 'Unknown',
      airlineCode: firstSegment?.carrierCode || '',
      flightNumber: `${firstSegment?.carrierCode || ''} ${firstSegment?.number || ''}`.trim(),
      departureTime: firstSegment?.departure?.at || '',
      arrivalTime: lastSegment?.arrival?.at || '',
      departureAirport: firstSegment?.departure?.iataCode || '',
      arrivalAirport: lastSegment?.arrival?.iataCode || '',
      duration: offer.itineraries?.[0]?.duration || '',
      stops: Math.max(0, segments.length - 1),
      stopCities: segments.slice(1).map((s: { departure?: { iataCode?: string } }) => s.departure?.iataCode || ''),
      price: parseFloat(offer.price?.total || '0'),
      currency: offer.price?.currency || 'AUD',
    }
  })
}

export async function searchAirports(keyword: string): Promise<unknown[]> {
  const response = await amadeus.referenceData.locations.get({
    keyword,
    subType: 'AIRPORT,CITY',
    'page[limit]': '8',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response.data || []).map((loc: any) => ({
    iataCode: loc.iataCode,
    name: loc.name,
    cityName: loc.address?.cityName || loc.name,
    countryCode: loc.address?.countryCode || '',
  }))
}
```

- [ ] **Step 3: Install amadeus package**

Run: `pnpm add amadeus`

- [ ] **Step 4: Commit**

```bash
git add tools/flight-monitor/types.ts lib/flights/amadeus.ts package.json pnpm-lock.yaml
git commit -m "feat(flight-monitor): add types and Amadeus SDK helper with caching"
```

---

### Task 3: API Routes

**Files:**
- Create: `app/api/v1/flights/search/route.ts`
- Create: `app/api/v1/flights/airports/route.ts`
- Create: `app/api/v1/flights/alerts/route.ts`
- Create: `app/api/v1/flights/alerts/[id]/route.ts`
- Create: `app/api/v1/flights/deals/route.ts`

- [ ] **Step 1: Search route**

```typescript
// app/api/v1/flights/search/route.ts
import { searchFlights } from '@/lib/flights/amadeus'
import { apiSuccess, apiError } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')?.toUpperCase()
  const destination = searchParams.get('destination')?.toUpperCase()
  const departureDate = searchParams.get('departureDate')
  const returnDate = searchParams.get('returnDate') || undefined
  const adults = parseInt(searchParams.get('adults') || '1', 10)
  const refresh = searchParams.get('refresh') === 'true'

  if (!origin || !destination || !departureDate) {
    return apiError('origin, destination, and departureDate are required', 'VALIDATION_ERROR', 400)
  }

  try {
    const result = await searchFlights({ origin, destination, departureDate, returnDate, adults }, refresh)
    return apiSuccess(result)
  } catch (err) {
    console.error('[flights/search] Error:', err)
    return apiError('Flight search failed', 'SEARCH_ERROR', 502)
  }
}
```

- [ ] **Step 2: Airports autocomplete route**

```typescript
// app/api/v1/flights/airports/route.ts
import { searchAirports } from '@/lib/flights/amadeus'
import { apiSuccess, apiError } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('q')?.trim()

  if (!keyword || keyword.length < 2) {
    return apiSuccess({ airports: [] })
  }

  try {
    const airports = await searchAirports(keyword)
    return apiSuccess({ airports })
  } catch (err) {
    console.error('[flights/airports] Error:', err)
    return apiError('Airport search failed', 'SEARCH_ERROR', 502)
  }
}
```

- [ ] **Step 3: Alerts CRUD routes**

```typescript
// app/api/v1/flights/alerts/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Fetch alerts
  const { data: alerts, error } = await supabase
    .from('flight_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[flights/alerts] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  // Fetch 30-day price history for each alert's route
  const enriched = await Promise.all(
    (alerts || []).map(async (alert) => {
      const { data: history } = await supabase
        .from('flight_price_history')
        .select('price')
        .eq('origin', alert.origin)
        .eq('destination', alert.destination)
        .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('scraped_at', { ascending: true })
        .limit(30)

      return {
        ...alert,
        priceHistory: (history || []).map((h) => h.price),
      }
    })
  )

  return apiSuccess({ alerts: enriched })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const { origin, destination, departureDate, targetPrice } = body

  if (!origin || !destination || !targetPrice) {
    return API_ERRORS.VALIDATION({ message: 'origin, destination, and targetPrice are required' })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('flight_alerts')
    .insert({
      user_id: userId,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departure_date: departureDate || null,
      target_price: targetPrice,
      status: 'tracking',
    })
    .select()
    .single()

  if (error) {
    console.error('[flights/alerts] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ alert: data }, 201)
}
```

```typescript
// app/api/v1/flights/alerts/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await request.json()
  const { targetPrice } = body

  if (!targetPrice || targetPrice <= 0) {
    return API_ERRORS.VALIDATION({ message: 'targetPrice must be positive' })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('flight_alerts')
    .update({ target_price: targetPrice, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    return API_ERRORS.NOT_FOUND('Alert')
  }

  return apiSuccess({ alert: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('flight_alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return API_ERRORS.NOT_FOUND('Alert')
  }

  return apiSuccess({ deleted: true })
}
```

- [ ] **Step 4: Deals route**

```typescript
// app/api/v1/flights/deals/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromCity = searchParams.get('from')?.toUpperCase()
  const sortBy = searchParams.get('sort') || 'discount' // discount | price | newest

  const supabase = await createClient()

  let query = supabase
    .from('flight_deals')
    .select('*')
    .gte('computed_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

  if (fromCity) {
    query = query.eq('origin', fromCity)
  }

  if (sortBy === 'price') {
    query = query.order('current_price', { ascending: true })
  } else if (sortBy === 'newest') {
    query = query.order('computed_at', { ascending: false })
  } else {
    query = query.order('discount_pct', { ascending: false })
  }

  query = query.limit(20)

  const { data, error } = await query

  if (error) {
    console.error('[flights/deals] Error:', error)
    return API_ERRORS.INTERNAL()
  }

  // Enrich with price history sparklines
  const enriched = await Promise.all(
    (data || []).map(async (deal) => {
      const { data: history } = await supabase
        .from('flight_price_history')
        .select('price')
        .eq('origin', deal.origin)
        .eq('destination', deal.destination)
        .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('scraped_at', { ascending: true })
        .limit(30)

      return {
        ...deal,
        priceHistory: (history || []).map((h) => h.price),
      }
    })
  )

  return apiSuccess({ deals: enriched, stale: (data || []).length === 0 })
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/flights/
git commit -m "feat(flight-monitor): add API routes for search, airports, alerts, deals"
```

---

### Task 4: UI Components — Shared (Tab Navigation, Sparkline, Types)

**Files:**
- Create: `tools/flight-monitor/tab-navigation.tsx`
- Create: `tools/flight-monitor/sparkline.tsx`

- [ ] **Step 1: Tab navigation**

```tsx
// tools/flight-monitor/tab-navigation.tsx
'use client'

import type { FlightTab } from './types'

interface TabNavigationProps {
  activeTab: FlightTab
  onTabChange: (tab: FlightTab) => void
  alertCount: number
}

const TABS: { id: FlightTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    id: 'alerts',
    label: 'My Alerts',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
  },
]

export function FlightTabNavigation({ activeTab, onTabChange, alertCount }: TabNavigationProps) {
  return (
    <nav
      className="flex overflow-x-auto border-b border-[#1e2631] bg-[#0c1219]/95 backdrop-blur-lg
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      aria-label="Flight Monitor navigation"
    >
      <div className="flex w-full max-w-5xl mx-auto px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
                border-b-2 ${
                  isActive
                    ? 'border-[#3D6AF2] text-[#93aaff]'
                    : 'border-transparent text-[#70767f] hover:text-[#a6abb5] hover:border-[#2a3545]'
                }`}
              style={{ minHeight: '44px' }}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'alerts' && alertCount > 0 && (
                <span className="bg-[#10B981] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {alertCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Sparkline component**

```tsx
// tools/flight-monitor/sparkline.tsx
'use client'

interface SparklineProps {
  data: number[]
  height?: number
  highlightDrop?: boolean
}

export function Sparkline({ data, height = 32, highlightDrop = true }: SparklineProps) {
  if (data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const avg = data.reduce((a, b) => a + b, 0) / data.length

  return (
    <div className="flex items-end gap-[2px]" style={{ height }} aria-hidden="true">
      {data.map((value, i) => {
        const pct = ((value - min) / range) * 70 + 30 // 30-100% range
        const isDown = highlightDrop && value < avg * 0.85
        const isLast = i === data.length - 1
        return (
          <div
            key={i}
            className={`rounded-t-sm transition-opacity ${
              isDown ? 'bg-[#10B981]' : 'bg-[#3D6AF2]'
            } ${isLast ? 'opacity-100' : 'opacity-60'}`}
            style={{ width: 4, height: `${pct}%` }}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add tools/flight-monitor/tab-navigation.tsx tools/flight-monitor/sparkline.tsx
git commit -m "feat(flight-monitor): add tab navigation and sparkline components"
```

---

### Task 5: UI Components — Search Tab

**Files:**
- Create: `tools/flight-monitor/search-form.tsx`
- Create: `tools/flight-monitor/flight-card.tsx`
- Create: `tools/flight-monitor/search-results.tsx`
- Create: `tools/flight-monitor/set-alert-modal.tsx`

- [ ] **Step 1: Search form with airport autocomplete**

Create `tools/flight-monitor/search-form.tsx` — a form component with From/To airport inputs (with debounced autocomplete fetching from `/api/v1/flights/airports?q=`), departure date picker, optional return date, passengers number, and search button. Use the Toolk1t dark theme tokens. Follow the layout from `designs/flight/code.html` (the search form section). All inputs must have `min-height: 44px`.

- [ ] **Step 2: Flight result card**

Create `tools/flight-monitor/flight-card.tsx` — displays a single flight offer: airline badge (2-letter code with colored background), departure/arrival times with duration bar and stop indicators, price, optional Google Flights comparison badge, and "Set Alert" button. Follow the card layout from `designs/flight/code.html`.

- [ ] **Step 3: Search results list**

Create `tools/flight-monitor/search-results.tsx` — renders a list of `FlightCard` components, a result count header with cache indicator ("Cached - refreshed X min ago" + Refresh button), sort toggle (price/duration), loading skeleton, and empty state.

- [ ] **Step 4: Set alert modal**

Create `tools/flight-monitor/set-alert-modal.tsx` — an inline form that appears below a flight card when "Set Alert" is clicked. Shows route info, current price, a target price input, and "Create Alert" button. Posts to `/api/v1/flights/alerts`.

- [ ] **Step 5: Commit**

```bash
git add tools/flight-monitor/search-form.tsx tools/flight-monitor/flight-card.tsx tools/flight-monitor/search-results.tsx tools/flight-monitor/set-alert-modal.tsx
git commit -m "feat(flight-monitor): add search tab components"
```

---

### Task 6: UI Components — Alerts Tab

**Files:**
- Create: `tools/flight-monitor/alert-card.tsx`
- Create: `tools/flight-monitor/alerts-tab.tsx`

- [ ] **Step 1: Alert card**

Create `tools/flight-monitor/alert-card.tsx` — displays a single alert with: left accent border (green for `price_drop`, grey for `tracking`), route (city + airport code), current price vs target price, status badge with animated pulse for `price_drop`, sparkline from `priceHistory`, and action buttons (Book Now, Edit, Delete). Edit opens an inline target price input. Delete calls `DELETE /api/v1/flights/alerts/[id]`. Book Now links to Google Flights. Follow `designs/flight/code.html` alerts section.

- [ ] **Step 2: Alerts tab**

Create `tools/flight-monitor/alerts-tab.tsx` — fetches alerts from `/api/v1/flights/alerts`, renders a list of `AlertCard` components, shows loading skeleton, error state with retry, and empty state ("No alerts yet — search for a route and set your target price" with an SVG illustration). Reports `alertCount` (number of `price_drop` alerts) to parent via callback.

- [ ] **Step 3: Commit**

```bash
git add tools/flight-monitor/alert-card.tsx tools/flight-monitor/alerts-tab.tsx
git commit -m "feat(flight-monitor): add alerts tab components"
```

---

### Task 7: UI Components — Deals Tab

**Files:**
- Create: `tools/flight-monitor/deal-card.tsx`
- Create: `tools/flight-monitor/deals-tab.tsx`

- [ ] **Step 1: Deal card**

Create `tools/flight-monitor/deal-card.tsx` — displays a single deal: route, current price (large), avg price (strikethrough), discount percentage badge (e.g., "-34%"), sparkline from `priceHistory`, "Set Alert" and "Search" buttons. Follow `designs/flight/code.html` deals grid section.

- [ ] **Step 2: Deals tab**

Create `tools/flight-monitor/deals-tab.tsx` — fetches deals from `/api/v1/flights/deals`, renders a 2-column grid (1-col on mobile) of `DealCard` components, filter bar (from city dropdown, sort dropdown), freshness indicator ("Updated X hours ago"), stale banner if no recent data, loading skeleton, and empty state.

- [ ] **Step 3: Commit**

```bash
git add tools/flight-monitor/deal-card.tsx tools/flight-monitor/deals-tab.tsx
git commit -m "feat(flight-monitor): add deals tab components"
```

---

### Task 8: Main Page + Tool Registration

**Files:**
- Create: `tools/flight-monitor/flight-monitor.tsx`
- Create: `app/tools/flight-monitor/page.tsx`
- Modify: `lib/tools.tsx` (add entry)

- [ ] **Step 1: Main orchestrator component**

Create `tools/flight-monitor/flight-monitor.tsx` — the main `'use client'` component that:
- Manages `activeTab` state (`FlightTab`)
- Manages `alertCount` state (updated by AlertsTab callback)
- Renders themed header (gradient banner + icon + title "Flight Monitor" + breadcrumb on desktop + home link on mobile — follow the pattern from `app/tools/sketch-to-art/page.tsx` header section)
- Renders sticky `FlightTabNavigation`
- Renders content area with `SearchResults`, `AlertsTab`, or `DealsTab` based on active tab
- Passes `onSwitchToSearch(origin, dest)` to DealsTab so "Search" button on deal cards can pre-fill the search form

- [ ] **Step 2: Page entry**

```tsx
// app/tools/flight-monitor/page.tsx
import type { Metadata } from 'next'
import FlightMonitor from '@/tools/flight-monitor/flight-monitor'

export const metadata: Metadata = {
  title: 'Flight Monitor — Track Prices & Discover Deals | Toolk1t',
  description: 'Search flights, set price alerts, and discover deals with auto-detected price drops. Powered by Amadeus and Google Flights data.',
}

export default function FlightMonitorPage() {
  return <FlightMonitor />
}
```

- [ ] **Step 3: Register in tool list**

Add the following entry to the `tools` array in `lib/tools.tsx`:

```tsx
{
  name: 'Flight Monitor',
  href: '/tools/flight-monitor',
  description: 'Track flight prices, set alerts, and discover deals',
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  ),
  color: 'from-[#3D6AF2] to-[#32A9D9]',
}
```

- [ ] **Step 4: Build and verify**

Run: `pnpm build`
Expected: Build passes with no errors. Flight Monitor page accessible at `/tools/flight-monitor`.

- [ ] **Step 5: Commit**

```bash
git add tools/flight-monitor/flight-monitor.tsx app/tools/flight-monitor/page.tsx lib/tools.tsx
git commit -m "feat(flight-monitor): add main page, orchestrator, and tool registration"
```

---

### Task 9: GitHub Actions — Fli Scraper + Alert Checks + Email

**Files:**
- Create: `.github/workflows/flight-scraper.yml`
- Create: `scripts/flight-scraper/scrape.py`
- Create: `scripts/flight-scraper/requirements.txt`

- [ ] **Step 1: Python requirements**

```
# scripts/flight-scraper/requirements.txt
google-flights-search>=0.1.0
supabase>=2.0.0
requests>=2.31.0
```

Note: `google-flights-search` is the Fli package name on PyPI. If it's published under a different name, check `pip install fli` or `pip install google-flights-search`.

- [ ] **Step 2: Scraper script**

Create `scripts/flight-scraper/scrape.py` — a Python script that:
1. Connects to Supabase using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars
2. Fetches all distinct `(origin, destination)` pairs from `flight_alerts` where `status != 'expired'`
3. For each pair, uses Fli to search Google Flights and get the cheapest price
4. Inserts each result into `flight_price_history` with `source = 'fli'`
5. Computes deals: for each scraped route, queries last 30 days of `flight_price_history`, calculates average, and upserts into `flight_deals` where `discount_pct >= 20`
6. Checks alerts: queries `flight_alerts` where the latest `flight_price_history` price for that route <= `target_price` and (`last_notified_at` is null or > 24hrs ago)
7. For each triggered alert, sends email via Resend API (POST `https://api.resend.com/emails`), updates `current_price`, `status = 'price_drop'`, and `last_notified_at`

- [ ] **Step 3: GitHub Actions workflow**

```yaml
# .github/workflows/flight-scraper.yml
name: Flight Price Scraper

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 06:00 UTC
  workflow_dispatch:       # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install -r scripts/flight-scraper/requirements.txt

      - name: Run scraper
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          SITE_URL: ${{ secrets.SITE_URL }}
        run: python scripts/flight-scraper/scrape.py
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/flight-scraper.yml scripts/flight-scraper/
git commit -m "feat(flight-monitor): add GitHub Actions cron for Fli scraper + alert emails"
```

---

### Task 10: Integration Testing + Final Polish

- [ ] **Step 1: Add AMADEUS env vars**

Add to `.env.local`:
```
AMADEUS_CLIENT_ID=your_test_client_id
AMADEUS_CLIENT_SECRET=your_test_client_secret
```

Sign up at https://developers.amadeus.com/ for free test credentials.

- [ ] **Step 2: Run dev server and test all tabs**

Run: `pnpm dev`

Test manually:
1. Navigate to `/tools/flight-monitor`
2. Search tab: enter SYD → NRT, select a date, click Search — verify results appear
3. Click "Set Alert" on a result — verify alert creation
4. Switch to My Alerts — verify the alert appears with "Tracking" badge
5. Switch to Deals — verify deals grid renders (may be empty initially until Fli runs)

- [ ] **Step 3: Build check**

Run: `pnpm build`
Expected: Clean build with no errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(flight-monitor): complete Flight Monitor tool v1"
```
