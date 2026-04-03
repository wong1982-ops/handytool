import Amadeus from 'amadeus'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

let _amadeus: InstanceType<typeof Amadeus> | null = null

function getAmadeus() {
  if (!_amadeus) {
    const clientId = process.env.AMADEUS_CLIENT_ID
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      throw new Error('AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set')
    }
    _amadeus = new Amadeus({ clientId, clientSecret })
  }
  return _amadeus
}

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
  const response = await getAmadeus().shopping.flightOffersSearch.get({
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
  const response = await getAmadeus().referenceData.locations.get({
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
