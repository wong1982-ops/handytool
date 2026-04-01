import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { MergedResult } from '@/tools/local-services/local-services-types'

const GOOGLE_PLACES_API_KEY = (process.env.GOOGLE_PLACES_API_KEY || '').trim()

const schema = z.object({
  lat: z.number(),
  lng: z.number(),
  category: z.string().min(1),
  radius: z.number().min(100).max(50000),
})

/** Compute distance in meters between two lat/lng points */
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 111320
  const dLng = (lng2 - lng1) * 111320 * Math.cos(lat1 * Math.PI / 180)
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng))
}

/** Fetch community providers from Supabase and compute ratings */
async function fetchCommunityProviders(
  category: string,
  lat: number,
  lng: number,
  radius: number,
): Promise<MergedResult[]> {
  try {
    const supabase = await createClient()

    // Fetch providers matching category
    const { data: providers, error } = await supabase
      .from('community_providers')
      .select('*')
      .eq('category_id', category)
      .eq('status', 'active')
      .eq('is_approved', true)

    if (error || !providers?.length) return []

    // Fetch aggregated ratings for all matched providers
    const providerIds = providers.map((p: any) => p.id)
    const { data: reviews } = await supabase
      .from('community_reviews')
      .select('provider_id, rating')
      .in('provider_id', providerIds)
      .eq('is_flagged', false)

    // Build rating map
    const ratingMap: Record<string, { sum: number; count: number }> = {}
    for (const r of reviews || []) {
      if (!ratingMap[r.provider_id]) ratingMap[r.provider_id] = { sum: 0, count: 0 }
      ratingMap[r.provider_id].sum += r.rating
      ratingMap[r.provider_id].count += 1
    }

    // Map to MergedResult, filtering by distance or including if service_area only
    const results: MergedResult[] = []

    for (const p of providers) {
      let distance: number | null = null

      if (p.lat != null && p.lng != null) {
        distance = haversineMeters(lat, lng, p.lat, p.lng)
        // Skip if provider has location but is outside radius
        if (distance > radius) continue
      }
      // If provider has no lat/lng, include based on service_area (v1: include all for the category)

      const rm = ratingMap[p.id]
      const avgRating = rm ? Math.round((rm.sum / rm.count) * 10) / 10 : null
      const reviewCount = rm?.count ?? 0

      results.push({
        id: p.id,
        source: 'community',
        name: p.name,
        address: p.address || '',
        lat: p.lat,
        lng: p.lng,
        distance,
        phone: p.phone,
        website: p.website,
        rating: avgRating,
        reviewCount,
        hours: null,
        isOpenNow: false,
        category: p.category_id,
        photoUrl: p.profile_photo,
        // Community-only fields
        isVerified: p.is_verified,
        description: p.description,
        pricingInfo: p.pricing_info,
        availability: p.availability,
        serviceArea: p.service_area,
        socialLinks: p.social_links,
        portfolioPhotos: p.portfolio_photos,
        profilePhoto: p.profile_photo,
      })
    }

    return results
  } catch (e) {
    console.error('Community provider fetch error:', e)
    return []
  }
}

// Refresh threshold: data older than 30 days will be re-fetched on next access
const REFRESH_DAYS = 30

/**
 * Smart Google Places fetch: check local DB first, only call Google API
 * for searches we've never done before. Stores results permanently.
 */
async function fetchGooglePlaces(
  category: string,
  lat: number,
  lng: number,
  radius: number,
): Promise<MergedResult[]> {
  const latR = lat.toFixed(3)
  const lngR = lng.toFixed(3)
  const searchKey = `${latR},${lngR}:${mapCategoryToGoogleType(category)}:${radius}`

  try {
    const supabase = await createClient()

    // 1. Check if we've done this exact search before
    const { data: searchLog } = await supabase
      .from('google_places_search_log')
      .select('searched_at, refreshed_at')
      .eq('cache_key', searchKey)
      .single()

    if (searchLog) {
      const age = (Date.now() - new Date(searchLog.refreshed_at).getTime()) / (1000 * 60 * 60 * 24)
      const needsRefresh = age > REFRESH_DAYS

      if (!needsRefresh) {
        // Serve from local DB — zero Google API cost
        const { data: searchResults } = await supabase
          .from('google_places_search_results')
          .select('place_id, distance')
          .eq('search_key', searchKey)

        if (searchResults && searchResults.length > 0) {
          const placeIds = searchResults.map((r: any) => r.place_id)
          const distanceMap = new Map(searchResults.map((r: any) => [r.place_id, r.distance]))

          const { data: places } = await supabase
            .from('google_places_local')
            .select('*')
            .in('id', placeIds)

          if (places && places.length > 0) {
            return places.map((p: any) => ({
              id: p.id,
              source: 'google' as const,
              name: p.name,
              address: p.address || '',
              lat: p.lat,
              lng: p.lng,
              distance: distanceMap.get(p.id) ?? null,
              phone: p.phone,
              website: p.website,
              rating: p.rating,
              reviewCount: p.rating_count || 0,
              hours: p.hours,
              isOpenNow: p.hours?.isOpenNow ?? false,
              category: p.category || category,
              photoUrl: p.photo_url,
            })).sort((a: MergedResult, b: MergedResult) => (a.distance ?? 99999) - (b.distance ?? 99999))
          }
        }
      }
      // If needs refresh, fall through to fetch from Google
    }

    // 2. Not in local DB (or needs refresh) — fetch from Google API
    if (!GOOGLE_PLACES_API_KEY) {
      return getMockResults(lat, lng, category, radius)
    }

    const url = 'https://places.googleapis.com/v1/places:searchNearby'
    const requestBody = {
      includedTypes: [mapCategoryToGoogleType(category)],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius,
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
      // Fallback: try local DB even if stale
      return fetchFromLocalDbFallback(supabase, searchKey, category)
    }

    const data = await res.json()
    const results: MergedResult[] = (data.places || []).map((place: any) => {
      const distance = haversineMeters(lat, lng, place.location?.latitude ?? lat, place.location?.longitude ?? lng)

      let hours = null
      if (place.regularOpeningHours?.weekdayDescriptions) {
        hours = {
          display: place.regularOpeningHours.weekdayDescriptions,
          isOpenNow: place.currentOpeningHours?.openNow ?? false,
        }
      }

      let photoUrl = null
      if (place.photos?.[0]?.name) {
        photoUrl = `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=200&maxWidthPx=200&key=${GOOGLE_PLACES_API_KEY}`
      }

      return {
        id: place.id || '',
        source: 'google' as const,
        name: place.displayName?.text || '',
        address: place.formattedAddress || '',
        lat: place.location?.latitude || lat,
        lng: place.location?.longitude || lng,
        distance,
        phone: place.internationalPhoneNumber || null,
        website: place.websiteUri || null,
        rating: place.rating || null,
        reviewCount: place.userRatingCount || 0,
        hours,
        isOpenNow: place.currentOpeningHours?.openNow ?? false,
        category: place.primaryType || category,
        photoUrl,
      }
    })

    // 3. Store in local DB (permanent — no TTL)
    try {
      // Upsert each place
      for (const r of results) {
        await supabase.from('google_places_local').upsert({
          id: r.id,
          name: r.name,
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          phone: r.phone,
          website: r.website,
          rating: r.rating,
          rating_count: r.reviewCount,
          category: r.category,
          google_type: mapCategoryToGoogleType(category),
          photo_url: r.photoUrl,
          hours: r.hours,
          business_status: 'OPERATIONAL',
          refreshed_at: new Date().toISOString(),
        })
      }

      // Log this search
      await supabase.from('google_places_search_log').upsert({
        cache_key: searchKey,
        result_count: results.length,
        searched_at: searchLog ? searchLog.searched_at : new Date().toISOString(),
        refreshed_at: new Date().toISOString(),
      })

      // Link places to this search
      for (const r of results) {
        await supabase.from('google_places_search_results').upsert({
          search_key: searchKey,
          place_id: r.id,
          distance: r.distance,
        })
      }
    } catch (e) {
      console.error('Failed to store in local DB:', e)
      // Non-fatal — results still returned to user
    }

    return results
  } catch (e) {
    console.error('Google Places fetch error:', e)
    if (!GOOGLE_PLACES_API_KEY) return getMockResults(lat, lng, category, radius)
    return []
  }
}

/** Fallback: serve stale data from local DB when Google API fails */
async function fetchFromLocalDbFallback(
  supabase: any,
  searchKey: string,
  category: string,
): Promise<MergedResult[]> {
  try {
    const { data: searchResults } = await supabase
      .from('google_places_search_results')
      .select('place_id, distance')
      .eq('search_key', searchKey)

    if (!searchResults?.length) return []

    const placeIds = searchResults.map((r: any) => r.place_id)
    const distanceMap = new Map(searchResults.map((r: any) => [r.place_id, r.distance]))

    const { data: places } = await supabase
      .from('google_places_local')
      .select('*')
      .in('id', placeIds)

    if (!places?.length) return []

    return places.map((p: any) => ({
      id: p.id,
      source: 'google' as const,
      name: p.name,
      address: p.address || '',
      lat: p.lat,
      lng: p.lng,
      distance: distanceMap.get(p.id) ?? null,
      phone: p.phone,
      website: p.website,
      rating: p.rating,
      reviewCount: p.rating_count || 0,
      hours: p.hours,
      isOpenNow: p.hours?.isOpenNow ?? false,
      category: p.category || category,
      photoUrl: p.photo_url,
    }))
  } catch {
    return []
  }
}

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

  try {
    // Fetch community and Google results in parallel
    const [communityResults, googleResults] = await Promise.all([
      fetchCommunityProviders(category, lat, lng, radius),
      fetchGooglePlaces(category, lat, lng, radius),
    ])

    // Merge: community first, then Google, sorted by distance
    const merged: MergedResult[] = [...communityResults, ...googleResults]
      .sort((a, b) => {
        // Providers with distance come before those without
        if (a.distance == null && b.distance == null) return 0
        if (a.distance == null) return 1
        if (b.distance == null) return -1
        return a.distance - b.distance
      })

    // Cache merged results
    try {
      const supabase = await createClient()
      await supabase.from('local_services_cache').upsert({
        cache_key: cacheKey,
        results: merged,
        created_at: new Date().toISOString(),
      })
    } catch {}

    return apiSuccess({ results: merged, cached: false, cacheAge: 0 })
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
    '11182': 'landscaper',
    '11174': 'house_cleaning',
    '11183': 'locksmith',
    '11029': 'car_repair',
    '15014': 'doctor',
    '15010': 'dentist',
    '15022': 'pharmacy',
    '15048': 'veterinary_care',
    '12056': 'child_care',
    '13065': 'restaurant',
    '13032': 'cafe',
    '17069': 'supermarket',
    '18021': 'gym',
    '11185': 'laundry',
    moving: 'moving_company',
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

// Mock data for development (returns MergedResult[])
function getMockResults(lat: number, lng: number, category: string, radius: number): MergedResult[] {
  const names = ['Smith & Sons', 'City Pro Services', 'Quick Fix', 'Premier Care', 'Top Quality', 'Express Service']
  const streets = ['Queen St', 'High St', 'Main Rd', 'Park Ave', 'Victoria St', 'Albert St']

  return names.map((name, i) => ({
    id: `mock-${category}-${i}`,
    source: 'google' as const,
    name,
    address: `${100 + i * 20} ${streets[i % streets.length]}`,
    lat: lat + (Math.random() - 0.5) * 0.01,
    lng: lng + (Math.random() - 0.5) * 0.01,
    distance: Math.floor(Math.random() * radius),
    phone: `+64 9 ${100 + i}${200 + i} ${3000 + i}`,
    website: null,
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    reviewCount: Math.floor(Math.random() * 50),
    hours: {
      display: ['Monday: 8:00 AM – 5:30 PM', 'Tuesday: 8:00 AM – 5:30 PM', 'Wednesday: 8:00 AM – 5:30 PM', 'Thursday: 8:00 AM – 5:30 PM', 'Friday: 8:00 AM – 5:30 PM', 'Saturday: 9:00 AM – 1:00 PM', 'Sunday: Closed'],
      isOpenNow: Math.random() > 0.3,
    },
    isOpenNow: Math.random() > 0.3,
    category,
    photoUrl: null,
  })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
}
