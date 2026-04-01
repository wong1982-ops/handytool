import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const GOOGLE_PLACES_API_KEY = (process.env.GOOGLE_PLACES_API_KEY || '').trim()

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
      if (age < 86400) {
        return apiSuccess({ results: cached.results, cached: true, cacheAge: Math.floor(age) })
      }
      await supabase.from('local_services_cache').delete().eq('cache_key', cacheKey)
    }
  } catch {}

  // Google Places Nearby Search (New)
  if (!GOOGLE_PLACES_API_KEY) {
    return apiSuccess({ results: getMockResults(lat, lng, category, radius), cached: false, cacheAge: 0 })
  }

  try {
    // Use Google Places Nearby Search (New) API
    const url = 'https://places.googleapis.com/v1/places:searchNearby'

    const requestBody = {
      includedTypes: [mapCategoryToGoogleType(category)],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius,
        },
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.currentOpeningHours,places.regularOpeningHours,places.businessStatus,places.primaryType,places.photos',
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Google Places error:', errText)
      return apiError('Search failed', 'SEARCH_ERROR', 502)
    }

    const data = await res.json()
    const results = (data.places || []).map((place: any) => {
      // Calculate distance from search point
      const dLat = (place.location?.latitude - lat) * 111320
      const dLng = (place.location?.longitude - lng) * 111320 * Math.cos(lat * Math.PI / 180)
      const distance = Math.round(Math.sqrt(dLat * dLat + dLng * dLng))

      // Extract opening hours display
      let hours = null
      if (place.regularOpeningHours?.weekdayDescriptions) {
        hours = {
          display: place.regularOpeningHours.weekdayDescriptions,
          isOpenNow: place.currentOpeningHours?.openNow ?? false,
        }
      }

      // Get photo URL
      let photoUrl = null
      if (place.photos?.[0]?.name) {
        photoUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=200&maxWidthPx=200&key=${GOOGLE_PLACES_API_KEY}`
      }

      return {
        id: place.id || '',
        name: place.displayName?.text || '',
        address: place.formattedAddress || '',
        lat: place.location?.latitude || lat,
        lng: place.location?.longitude || lng,
        distance,
        phone: place.internationalPhoneNumber || null,
        website: place.websiteUri || null,
        rating: place.rating || null,
        ratingCount: place.userRatingCount || 0,
        hours,
        isOpenNow: place.currentOpeningHours?.openNow ?? false,
        category: place.primaryType || category,
        photoUrl,
      }
    }).sort((a: any, b: any) => a.distance - b.distance)

    // Cache results
    try {
      const supabase = await createClient()
      await supabase.from('local_services_cache').upsert({
        cache_key: cacheKey,
        results,
        created_at: new Date().toISOString(),
      })
    } catch {}

    return apiSuccess({ results, cached: false, cacheAge: 0 })
  } catch (e) {
    console.error('Search error:', e)
    return apiError('Search failed', 'SEARCH_ERROR', 500)
  }
}

// Map our category IDs to Google Places types
// https://developers.google.com/maps/documentation/places/web-service/place-types
function mapCategoryToGoogleType(category: string): string {
  const map: Record<string, string> = {
    '11178': 'plumber',
    '11176': 'electrician',
    '11057': 'hair_salon',
    '11182': 'landscaper',          // Not exact — closest match
    '11174': 'house_cleaning',      // Not exact
    '11183': 'locksmith',
    '11029': 'car_repair',
    '15014': 'doctor',
    '15010': 'dentist',
    '15022': 'pharmacy',
    '15048': 'veterinary_care',
    '12056': 'child_care',          // Not exact
    '13065': 'restaurant',
    '13032': 'cafe',
    '17069': 'supermarket',
    '18021': 'gym',
    '11185': 'laundry',
    // Fallback: use the category string directly as a Google type
    plumber: 'plumber',
    electrician: 'electrician',
    hairdresser: 'hair_salon',
    'lawn-garden': 'landscaper',
    cleaning: 'house_cleaning',
    locksmith: 'locksmith',
    mechanic: 'car_repair',
    doctor: 'doctor',
    dentist: 'dentist',
    pharmacy: 'pharmacy',
    vet: 'veterinary_care',
    childcare: 'child_care',
    restaurant: 'restaurant',
    cafe: 'cafe',
    supermarket: 'supermarket',
    gym: 'gym',
    laundry: 'laundry',
  }
  return map[category] || category
}

// Mock data for development
function getMockResults(lat: number, lng: number, category: string, radius: number) {
  const names = ['Smith & Sons', 'City Pro Services', 'Quick Fix', 'Premier Care', 'Top Quality', 'Express Service']
  const streets = ['Queen St', 'High St', 'Main Rd', 'Park Ave', 'Victoria St', 'Albert St']

  return names.map((name, i) => ({
    id: `mock-${category}-${i}`,
    name: `${name}`,
    address: `${100 + i * 20} ${streets[i % streets.length]}`,
    lat: lat + (Math.random() - 0.5) * 0.01,
    lng: lng + (Math.random() - 0.5) * 0.01,
    distance: Math.floor(Math.random() * radius),
    phone: `+64 9 ${100 + i}${200 + i} ${3000 + i}`,
    website: null,
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    ratingCount: Math.floor(Math.random() * 50),
    hours: {
      display: ['Monday: 8:00 AM – 5:30 PM', 'Tuesday: 8:00 AM – 5:30 PM', 'Wednesday: 8:00 AM – 5:30 PM', 'Thursday: 8:00 AM – 5:30 PM', 'Friday: 8:00 AM – 5:30 PM', 'Saturday: 9:00 AM – 1:00 PM', 'Sunday: Closed'],
      isOpenNow: Math.random() > 0.3,
    },
    isOpenNow: Math.random() > 0.3,
    category,
    photoUrl: null,
  })).sort((a, b) => a.distance - b.distance)
}
