import { createClient as createServiceClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getServiceClient() {
  return createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

/**
 * Popular routes from Australian cities.
 * Keep small to stay within SerpApi free tier (250 queries/month).
 */
const POPULAR_ROUTES: { origin: string; destination: string }[] = [
  { origin: 'SYD', destination: 'SIN' },
  { origin: 'SYD', destination: 'BKK' },
  { origin: 'SYD', destination: 'NRT' },
  { origin: 'SYD', destination: 'DPS' },
  { origin: 'SYD', destination: 'LAX' },
  { origin: 'MEL', destination: 'SIN' },
  { origin: 'MEL', destination: 'BKK' },
  { origin: 'MEL', destination: 'NRT' },
  { origin: 'BNE', destination: 'SIN' },
  { origin: 'BNE', destination: 'DPS' },
  { origin: 'PER', destination: 'SIN' },
  { origin: 'PER', destination: 'DPS' },
  { origin: 'ADL', destination: 'SIN' },
  { origin: 'ADL', destination: 'DPS' },
  { origin: 'SYD', destination: 'AKL' },
  // From Auckland
  { origin: 'AKL', destination: 'SIN' },
  { origin: 'AKL', destination: 'NRT' },
  { origin: 'AKL', destination: 'DPS' },
  { origin: 'AKL', destination: 'SYD' },
  { origin: 'AKL', destination: 'CTU' },
  // From/to Chengdu
  { origin: 'SYD', destination: 'CTU' },
  { origin: 'MEL', destination: 'CTU' },
  { origin: 'AKL', destination: 'LAX' },
  // From Chengdu
  { origin: 'CTU', destination: 'BKK' },
  { origin: 'CTU', destination: 'SIN' },
  { origin: 'CTU', destination: 'NRT' },
  { origin: 'CTU', destination: 'ICN' },
  { origin: 'CTU', destination: 'KUL' },
  { origin: 'CTU', destination: 'DPS' },
  { origin: 'CTU', destination: 'SYD' },
  { origin: 'CTU', destination: 'AKL' },
  { origin: 'CTU', destination: 'LHR' },
  { origin: 'CTU', destination: 'LAX' },
]

function getDepartureDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 21)
  return d.toISOString().split('T')[0]
}

function getReturnDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 28)
  return d.toISOString().split('T')[0]
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface ScrapeResult {
  routesScraped: number
  pricesRecorded: number
  dealsComputed: number
  errors: string[]
}

/* ---------- SerpApi response types ---------- */

interface SerpLeg {
  departure_airport?: { name?: string; id?: string; time?: string }
  arrival_airport?: { name?: string; id?: string; time?: string }
  duration?: number
  airplane?: string
  airline?: string
  airline_logo?: string
  travel_class?: string
  flight_number?: string
  legroom?: string
  extensions?: string[]
  overnight?: boolean
}

interface SerpLayover {
  duration?: number
  name?: string
  id?: string
  overnight?: boolean
}

interface SerpFlightGroup {
  flights?: SerpLeg[]
  layovers?: SerpLayover[]
  total_duration?: number
  carbon_emissions?: { this_flight?: number; typical_for_this_route?: number; difference_percent?: number }
  price?: number
  type?: string
  airline_logo?: string
  departure_token?: string
}

interface SerpResponse {
  best_flights?: SerpFlightGroup[]
  other_flights?: SerpFlightGroup[]
  price_insights?: { lowest_price?: number; typical_price_range?: number[] }
}

/* ---------- Rich deal details stored in JSONB ---------- */

export interface DealFlightLeg {
  depAirport: string      // "Sydney Airport"
  depCode: string         // "SYD"
  depTime: string         // "2026-04-25 13:00"
  arrAirport: string      // "Singapore Changi Airport"
  arrCode: string         // "SIN"
  arrTime: string         // "2026-04-25 19:30"
  duration: number        // minutes
  airline: string
  airlineLogo: string
  flightNumber: string
  airplane: string
  travelClass: string
  legroom: string
  overnight: boolean
}

export interface DealLayover {
  airport: string
  code: string
  duration: number        // minutes
}

export interface DealDetails {
  airline: string
  airlineLogo: string
  totalDuration: number   // minutes
  stops: number
  legs: DealFlightLeg[]
  layovers: DealLayover[]
  carbonKg: number | null
  tripType: string        // "Round trip"
  departureDate: string
  returnDate: string
  bookingToken: string | null
}

/** Extract rich details from a SerpApi flight group */
function extractDetails(group: SerpFlightGroup, departureDate: string, returnDate: string): DealDetails {
  const legs: DealFlightLeg[] = (group.flights || []).map((f) => ({
    depAirport: f.departure_airport?.name || '',
    depCode: f.departure_airport?.id || '',
    depTime: f.departure_airport?.time || '',
    arrAirport: f.arrival_airport?.name || '',
    arrCode: f.arrival_airport?.id || '',
    arrTime: f.arrival_airport?.time || '',
    duration: f.duration || 0,
    airline: f.airline || '',
    airlineLogo: f.airline_logo || '',
    flightNumber: f.flight_number || '',
    airplane: f.airplane || '',
    travelClass: f.travel_class || 'Economy',
    legroom: f.legroom || '',
    overnight: f.overnight || false,
  }))

  const layovers: DealLayover[] = (group.layovers || []).map((l) => ({
    airport: l.name || '',
    code: l.id || '',
    duration: l.duration || 0,
  }))

  return {
    airline: legs[0]?.airline || 'Unknown',
    airlineLogo: group.airline_logo || legs[0]?.airlineLogo || '',
    totalDuration: group.total_duration || 0,
    stops: Math.max(0, legs.length - 1),
    legs,
    layovers,
    carbonKg: group.carbon_emissions?.this_flight ? Math.round(group.carbon_emissions.this_flight / 1000) : null,
    tripType: group.type || 'Round trip',
    departureDate,
    returnDate,
    bookingToken: group.departure_token || null,
  }
}

/** Fetch cheapest flights for a route, returning price + rich details */
async function fetchViaSerpApi(
  apiKey: string,
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
): Promise<{ price: number; details: DealDetails } | null> {
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: origin,
    arrival_id: destination,
    outbound_date: departureDate,
    return_date: returnDate,
    currency: 'AUD',
    hl: 'en',
    type: '1',
    adults: '1',
    api_key: apiKey,
  })

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`)
    if (!res.ok) {
      const text = await res.text()
      console.error(`[deal-scraper] SerpApi error ${res.status} for ${origin}->${destination}:`, text)
      return null
    }

    const data: SerpResponse = await res.json()
    const allFlights = [...(data.best_flights || []), ...(data.other_flights || [])]
    if (allFlights.length === 0) return null

    // Find cheapest
    const cheapest = allFlights.reduce((min, f) =>
      (f.price && (!min.price || f.price < min.price)) ? f : min
    , allFlights[0])

    if (!cheapest.price) return null

    return {
      price: cheapest.price,
      details: extractDetails(cheapest, departureDate, returnDate),
    }
  } catch (err) {
    console.error(`[deal-scraper] Fetch error for ${origin}->${destination}:`, err)
    return null
  }
}

/**
 * Main scraper: fetch prices for popular routes, store history, compute deals with rich details.
 */
export async function scrapeFlightDeals(): Promise<ScrapeResult> {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) {
    throw new Error('SERPAPI_KEY must be set. Get a free key at https://serpapi.com')
  }

  const supabase = getServiceClient()
  const departureDate = getDepartureDate()
  const returnDate = getReturnDate()
  const now = new Date().toISOString()

  const result: ScrapeResult = { routesScraped: 0, pricesRecorded: 0, dealsComputed: 0, errors: [] }
  const scraped: Map<string, { price: number; details: DealDetails }> = new Map()

  // Phase 1: Scrape prices and store in history
  for (const route of POPULAR_ROUTES) {
    const routeKey = `${route.origin}-${route.destination}`
    const flight = await fetchViaSerpApi(apiKey, route.origin, route.destination, departureDate, returnDate)

    if (flight) {
      const { error } = await supabase.from('flight_price_history').insert({
        origin: route.origin,
        destination: route.destination,
        departure_date: departureDate,
        price: flight.price,
        source: 'google_flights',
        scraped_at: now,
      })
      if (error) result.errors.push(`History insert ${routeKey}: ${error.message}`)
      else result.pricesRecorded++

      scraped.set(routeKey, flight)
    }

    result.routesScraped++
    await sleep(500)
  }

  // Phase 2: Compute deals with details
  for (const [routeKey, { price: currentPrice, details }] of scraped) {
    const [origin, destination] = routeKey.split('-')

    const { data: history } = await supabase
      .from('flight_price_history')
      .select('price')
      .eq('origin', origin)
      .eq('destination', destination)
      .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('scraped_at', { ascending: false })
      .limit(60)

    const avgPrice = history && history.length > 0
      ? history.reduce((sum, h) => sum + Number(h.price), 0) / history.length
      : currentPrice

    const discountPct = avgPrice > 0
      ? Math.round(((avgPrice - currentPrice) / avgPrice) * 100)
      : 0

    const { error } = await supabase.from('flight_deals').upsert(
      {
        origin,
        destination,
        current_price: currentPrice,
        avg_price: Math.round(avgPrice * 100) / 100,
        discount_pct: Math.max(0, discountPct),
        computed_at: now,
        details,
      },
      { onConflict: 'origin,destination' },
    )
    if (error) result.errors.push(`Deal upsert ${routeKey}: ${error.message}`)
    else result.dealsComputed++
  }

  return result
}
