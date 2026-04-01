import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const FOURSQUARE_API_KEY = (process.env.FOURSQUARE_API_KEY || '').trim()

const schema = z.object({
  lat: z.number(),
  lng: z.number(),
  category: z.string().min(1),
  radius: z.number().min(100).max(50000),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { lat, lng, category, radius } = parsed.data

  // Round lat/lng to 3 decimals for cache key (~111m precision)
  const latR = lat.toFixed(3)
  const lngR = lng.toFixed(3)
  const cacheKey = `${latR},${lngR}:${category}:${radius}`

  // Check cache
  try {
    const supabase = await createClient()
    const { data: cached } = await supabase
      .from('local_services_cache')
      .select('results, created_at')
      .eq('cache_key', cacheKey)
      .single()

    if (cached) {
      const age = (Date.now() - new Date(cached.created_at).getTime()) / 1000
      if (age < 86400) { // 24 hours
        return apiSuccess({ results: cached.results, cached: true, cacheAge: Math.floor(age) })
      }
      // Stale — delete and refetch
      await supabase.from('local_services_cache').delete().eq('cache_key', cacheKey)
    }
  } catch {}

  // Foursquare search
  if (!FOURSQUARE_API_KEY) {
    // No API key — return mock data for development
    return apiSuccess({ results: getMockResults(lat, lng, category, radius), cached: false, cacheAge: 0 })
  }

  try {
    const url = new URL('https://api.foursquare.com/v3/places/search')
    url.searchParams.set('ll', `${lat},${lng}`)
    url.searchParams.set('radius', String(radius))
    url.searchParams.set('categories', category)
    url.searchParams.set('limit', '20')
    url.searchParams.set('fields', 'fsq_id,name,location,tel,website,rating,hours,distance,categories,photos')

    const res = await fetch(url.toString(), {
      headers: { Authorization: FOURSQUARE_API_KEY, Accept: 'application/json' },
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Foursquare error:', errText)
      return apiError('Search failed', 'SEARCH_ERROR', 502)
    }

    const data = await res.json()
    const results = (data.results || []).map((place: any) => ({
      id: place.fsq_id,
      name: place.name,
      address: place.location?.formatted_address || place.location?.address || '',
      lat: place.geocodes?.main?.latitude || lat,
      lng: place.geocodes?.main?.longitude || lng,
      distance: place.distance || 0,
      phone: place.tel || null,
      website: place.website || null,
      rating: place.rating ? place.rating / 2 : null, // Foursquare is 0-10, normalize to 0-5
      hours: place.hours ? {
        display: place.hours.display || [],
        isOpenNow: place.hours.open_now || false,
      } : null,
      isOpenNow: place.hours?.open_now || false,
      category: place.categories?.[0]?.name || category,
      photoUrl: place.photos?.[0] ? `${place.photos[0].prefix}200x200${place.photos[0].suffix}` : null,
    }))

    // Cache results
    try {
      const supabase = await createClient()
      await supabase.from('local_services_cache').upsert({ cache_key: cacheKey, results, created_at: new Date().toISOString() })
    } catch {}

    return apiSuccess({ results, cached: false, cacheAge: 0 })
  } catch (e) {
    console.error('Search error:', e)
    return apiError('Search failed', 'SEARCH_ERROR', 500)
  }
}

// Mock data for development (when no Foursquare key)
function getMockResults(lat: number, lng: number, category: string, radius: number) {
  const names = ['Smith & Sons', 'City Pro Services', 'Quick Fix', 'Premier Care', 'Top Quality', 'Express Service']
  const streets = ['Queen St', 'High St', 'Main Rd', 'Park Ave', 'Victoria St', 'Albert St']

  return names.map((name, i) => ({
    id: `mock-${category}-${i}`,
    name: `${name} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
    address: `${100 + i * 20} ${streets[i % streets.length]}`,
    lat: lat + (Math.random() - 0.5) * 0.01,
    lng: lng + (Math.random() - 0.5) * 0.01,
    distance: Math.floor(Math.random() * radius),
    phone: `+64 9 ${100 + i}${200 + i} ${3000 + i}`,
    website: null,
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    hours: {
      display: ['Mon-Fri 8:00am - 5:30pm', 'Sat 9:00am - 1:00pm', 'Sun Closed'],
      isOpenNow: Math.random() > 0.3,
    },
    isOpenNow: Math.random() > 0.3,
    category,
    photoUrl: null,
  })).sort((a, b) => a.distance - b.distance)
}
