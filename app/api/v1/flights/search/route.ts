import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId } from '@/lib/api/response'
import { checkSerpApiQuota, incrementSerpApiUsage } from '@/lib/flights/deal-scraper'

export const dynamic = 'force-dynamic'

const DAILY_SEARCH_LIMIT = 3
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')?.toUpperCase()
  const destination = searchParams.get('destination')?.toUpperCase()
  const departureDate = searchParams.get('departureDate')
  const returnDate = searchParams.get('returnDate') || undefined
  const adults = parseInt(searchParams.get('adults') || '1', 10)
  const liveSearch = searchParams.get('live') === 'true'

  if (!origin || !destination || !departureDate) {
    return apiError('origin, destination, and departureDate are required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()

  // Step 1: Check for cached deal data for this route
  const { data: cachedDeal } = await supabase
    .from('flight_deals')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .single()

  // Step 2: Check for cached search results (6hr TTL)
  const cacheKey = `${origin}|${destination}|${departureDate}|${returnDate || ''}|${adults}`
  const { data: cachedSearch } = await supabase
    .from('flight_searches')
    .select('results, fetched_at, expires_at')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (cachedSearch) {
    return apiSuccess({
      offers: cachedSearch.results,
      cachedAt: cachedSearch.fetched_at,
      expiresAt: cachedSearch.expires_at,
      source: 'cache',
    })
  }

  // If user doesn't want live search, return cached deal data
  if (!liveSearch) {
    if (cachedDeal) {
      return apiSuccess({
        offers: cachedDeal.details ? [formatDealAsOffer(cachedDeal)] : [],
        cachedAt: cachedDeal.computed_at,
        expiresAt: null,
        source: 'deal_cache',
        deal: cachedDeal,
      })
    }
    return apiSuccess({
      offers: [],
      cachedAt: null,
      expiresAt: null,
      source: 'none',
      message: 'No cached data for this route. Sign in for live search.',
    })
  }

  // Step 3: Live search — requires auth + rate limit
  const userId = await getAuthUserId()
  if (!userId) {
    return apiError('Sign in to use live flight search', 'AUTH_REQUIRED', 401)
  }

  // Check daily limit
  const today = new Date().toISOString().split('T')[0]
  const { data: limitRow } = await supabase
    .from('flight_search_limits')
    .select('search_count')
    .eq('user_id', userId)
    .eq('search_date', today)
    .single()

  const usedToday = limitRow?.search_count || 0
  if (usedToday >= DAILY_SEARCH_LIMIT) {
    return apiError(
      `Daily search limit reached (${DAILY_SEARCH_LIMIT}/${DAILY_SEARCH_LIMIT}). Resets tomorrow.`,
      'RATE_LIMITED',
      429,
    )
  }

  // Check global SerpApi quota
  const quota = await checkSerpApiQuota()
  if (!quota.allowed) {
    // Fallback to cached deal data
    if (cachedDeal) {
      return apiSuccess({
        offers: cachedDeal.details ? [formatDealAsOffer(cachedDeal)] : [],
        cachedAt: cachedDeal.computed_at,
        expiresAt: null,
        source: 'deal_cache',
        deal: cachedDeal,
        message: 'Live search temporarily unavailable. Showing cached prices.',
      })
    }
    return apiError('Live search temporarily unavailable. Try again later.', 'QUOTA_EXHAUSTED', 503)
  }

  // Step 4: Call SerpApi
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) {
    return apiError('Search service not configured', 'CONFIG_ERROR', 503)
  }

  try {
    const serpParams = new URLSearchParams({
      engine: 'google_flights',
      departure_id: origin,
      arrival_id: destination,
      outbound_date: departureDate,
      ...(returnDate ? { return_date: returnDate } : {}),
      currency: 'AUD',
      hl: 'en',
      type: returnDate ? '1' : '2', // 1=round trip, 2=one way
      adults: String(adults),
      api_key: apiKey,
    })

    const res = await fetch(`https://serpapi.com/search.json?${serpParams.toString()}`)
    if (!res.ok) {
      throw new Error(`SerpApi returned ${res.status}`)
    }

    const data = await res.json()
    const offers = parseSerpFlights(data)

    // Cache results
    const now = new Date()
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS)
    const crypto = await import('crypto')
    const hashKey = crypto.createHash('sha256').update(cacheKey).digest('hex')

    await supabase.from('flight_searches').upsert({
      cache_key: hashKey,
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || null,
      adults,
      results: offers,
      fetched_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'cache_key' })

    // Increment counters
    await supabase.from('flight_search_limits').upsert(
      { user_id: userId, search_date: today, search_count: usedToday + 1 },
      { onConflict: 'user_id,search_date' },
    )
    await incrementSerpApiUsage()

    return apiSuccess({
      offers,
      cachedAt: null,
      expiresAt: expiresAt.toISOString(),
      source: 'live',
      searchesRemaining: DAILY_SEARCH_LIMIT - usedToday - 1,
    })
  } catch (err) {
    console.error('[flights/search] SerpApi error:', err)

    // Fallback to cached deal
    if (cachedDeal) {
      return apiSuccess({
        offers: cachedDeal.details ? [formatDealAsOffer(cachedDeal)] : [],
        cachedAt: cachedDeal.computed_at,
        expiresAt: null,
        source: 'deal_cache',
        deal: cachedDeal,
        message: 'Live search failed. Showing cached prices.',
      })
    }

    return apiError('Flight search failed. Please try again.', 'SEARCH_ERROR', 502)
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Convert a flight_deals row into a FlightOffer-shaped object */
function formatDealAsOffer(deal: any) {
  const details = deal.details || {}
  const firstLeg = details.legs?.[0] || {}
  const lastLeg = details.legs?.[details.legs?.length - 1] || firstLeg
  return {
    airline: details.airline || 'Unknown',
    airlineCode: '',
    airlineLogo: details.airlineLogo || '',
    flightNumber: firstLeg.flightNumber || '',
    departureTime: firstLeg.depTime || '',
    arrivalTime: lastLeg.arrTime || '',
    departureAirport: deal.origin,
    arrivalAirport: deal.destination,
    duration: details.totalDuration ? `${Math.floor(details.totalDuration / 60)}h ${details.totalDuration % 60}m` : '',
    stops: details.stops || 0,
    stopCities: (details.layovers || []).map((l: any) => l.code),
    price: deal.current_price,
    currency: 'AUD',
    legs: details.legs || [],
    layovers: details.layovers || [],
    airplane: firstLeg.airplane || '',
    source: 'deal_cache',
  }
}

/** Parse SerpApi Google Flights response into FlightOffer array */
function parseSerpFlights(data: any): any[] {
  const allGroups = [...(data.best_flights || []), ...(data.other_flights || [])]

  return allGroups.map((group: any) => {
    const flights = group.flights || []
    const firstFlight = flights[0] || {}
    const lastFlight = flights[flights.length - 1] || firstFlight

    return {
      airline: firstFlight.airline || 'Unknown',
      airlineCode: '',
      airlineLogo: group.airline_logo || firstFlight.airline_logo || '',
      flightNumber: firstFlight.flight_number || '',
      departureTime: firstFlight.departure_airport?.time || '',
      arrivalTime: lastFlight.arrival_airport?.time || '',
      departureAirport: firstFlight.departure_airport?.id || '',
      arrivalAirport: lastFlight.arrival_airport?.id || '',
      duration: group.total_duration ? `${Math.floor(group.total_duration / 60)}h ${group.total_duration % 60}m` : '',
      stops: Math.max(0, flights.length - 1),
      stopCities: (group.layovers || []).map((l: any) => l.id || ''),
      price: group.price || 0,
      currency: 'AUD',
      legs: flights.map((f: any) => ({
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
      })),
      layovers: (group.layovers || []).map((l: any) => ({
        airport: l.name || '',
        code: l.id || '',
        duration: l.duration || 0,
      })),
      airplane: firstFlight.airplane || '',
      carbonKg: group.carbon_emissions?.this_flight ? Math.round(group.carbon_emissions.this_flight / 1000) : null,
      source: 'live',
    }
  })
}
