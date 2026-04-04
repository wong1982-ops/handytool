import { createClient as createServiceClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getServiceClient() {
  return createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

/**
 * Popular routes from Australian cities.
 * Keep small to stay within SerpApi free tier (250 queries/month).
 * 10 routes × 2 runs/week = ~80 queries/month.
 */
const POPULAR_ROUTES: { origin: string; destination: string; originCity: string; destCity: string }[] = [
  { origin: 'SYD', destination: 'SIN', originCity: 'Sydney', destCity: 'Singapore' },
  { origin: 'SYD', destination: 'BKK', originCity: 'Sydney', destCity: 'Bangkok' },
  { origin: 'SYD', destination: 'NRT', originCity: 'Sydney', destCity: 'Tokyo' },
  { origin: 'SYD', destination: 'DPS', originCity: 'Sydney', destCity: 'Bali' },
  { origin: 'SYD', destination: 'LAX', originCity: 'Sydney', destCity: 'Los Angeles' },
  { origin: 'MEL', destination: 'SIN', originCity: 'Melbourne', destCity: 'Singapore' },
  { origin: 'MEL', destination: 'BKK', originCity: 'Melbourne', destCity: 'Bangkok' },
  { origin: 'MEL', destination: 'NRT', originCity: 'Melbourne', destCity: 'Tokyo' },
  { origin: 'BNE', destination: 'SIN', originCity: 'Brisbane', destCity: 'Singapore' },
  { origin: 'BNE', destination: 'DPS', originCity: 'Brisbane', destCity: 'Bali' },
  { origin: 'PER', destination: 'SIN', originCity: 'Perth', destCity: 'Singapore' },
  { origin: 'PER', destination: 'DPS', originCity: 'Perth', destCity: 'Bali' },
  { origin: 'ADL', destination: 'SIN', originCity: 'Adelaide', destCity: 'Singapore' },
  { origin: 'ADL', destination: 'DPS', originCity: 'Adelaide', destCity: 'Bali' },
  { origin: 'SYD', destination: 'AKL', originCity: 'Sydney', destCity: 'Auckland' },
]

/** Get a departure date ~3 weeks out (good for finding deals) */
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

/** Sleep to respect API rate limits */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface ScrapeResult {
  routesScraped: number
  pricesRecorded: number
  dealsComputed: number
  errors: string[]
}

interface SerpFlightResult {
  best_flights?: { price?: number; flights?: { airline?: string }[] }[]
  other_flights?: { price?: number; flights?: { airline?: string }[] }[]
  price_insights?: { lowest_price?: number; typical_price_range?: number[] }
}

/**
 * Fetch cheapest price for a route using SerpApi Google Flights.
 */
async function fetchViaSerpApi(
  apiKey: string,
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string,
): Promise<{ price: number; airline: string } | null> {
  const params = new URLSearchParams({
    engine: 'google_flights',
    departure_id: origin,
    arrival_id: destination,
    outbound_date: departureDate,
    return_date: returnDate,
    currency: 'AUD',
    hl: 'en',
    type: '1', // round trip
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

    const data: SerpFlightResult = await res.json()

    // Get cheapest from best_flights or other_flights
    const allFlights = [...(data.best_flights || []), ...(data.other_flights || [])]
    if (allFlights.length === 0) return null

    const cheapest = allFlights.reduce((min, f) =>
      (f.price && (!min.price || f.price < min.price)) ? f : min
    , allFlights[0])

    if (!cheapest.price) return null

    return {
      price: cheapest.price,
      airline: cheapest.flights?.[0]?.airline || 'Unknown',
    }
  } catch (err) {
    console.error(`[deal-scraper] Fetch error for ${origin}->${destination}:`, err)
    return null
  }
}

/**
 * Main scraper: fetch prices for popular routes, store history, compute deals.
 * Uses SerpApi Google Flights engine.
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

  // Phase 1: Scrape prices and store in history
  const currentPrices: Map<string, number> = new Map()

  for (const route of POPULAR_ROUTES) {
    const routeKey = `${route.origin}-${route.destination}`

    const flight = await fetchViaSerpApi(apiKey, route.origin, route.destination, departureDate, returnDate)

    if (flight) {
      // Store in price history
      const { error } = await supabase.from('flight_price_history').insert({
        origin: route.origin,
        destination: route.destination,
        departure_date: departureDate,
        price: flight.price,
        source: 'google_flights',
        scraped_at: now,
      })
      if (error) {
        result.errors.push(`History insert ${routeKey}: ${error.message}`)
      } else {
        result.pricesRecorded++
      }

      currentPrices.set(routeKey, flight.price)
    }

    result.routesScraped++

    // Rate limit: 500ms between calls to stay under SerpApi limits
    await sleep(500)
  }

  // Phase 2: Compute deals by comparing current vs 30-day average
  for (const [routeKey, currentPrice] of currentPrices) {
    const [origin, destination] = routeKey.split('-')

    // Get 30-day average from history
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
      : currentPrice // First run — use current price as avg

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
      },
      { onConflict: 'origin,destination' },
    )
    if (error) {
      result.errors.push(`Deal upsert ${routeKey}: ${error.message}`)
    } else {
      result.dealsComputed++
    }
  }

  return result
}
