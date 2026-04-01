import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'

const FOURSQUARE_API_KEY = (process.env.FOURSQUARE_API_KEY || '').trim()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('id')
  if (!placeId) return apiError('Missing place id', 'VALIDATION_ERROR', 400)

  if (!FOURSQUARE_API_KEY) {
    return apiSuccess({
      hours: { display: ['Mon-Fri 8am-5pm', 'Sat 9am-1pm', 'Sun Closed'], isOpenNow: true },
      tips: [
        { text: 'Great service, very professional!', rating: 5 },
        { text: 'Quick and reliable. Highly recommend.', rating: 4 },
      ],
    })
  }

  try {
    const res = await fetch(`https://api.foursquare.com/v3/places/${placeId}?fields=hours,tips,photos,tel,website,rating`, {
      headers: { Authorization: FOURSQUARE_API_KEY, Accept: 'application/json' },
    })

    if (!res.ok) return apiError('Place not found', 'NOT_FOUND', 404)

    const data = await res.json()

    return apiSuccess({
      hours: data.hours ? {
        display: data.hours.display || [],
        isOpenNow: data.hours.open_now || false,
      } : null,
      tips: (data.tips || []).slice(0, 5).map((tip: any) => ({
        text: tip.text || '',
        rating: tip.rating || null,
      })),
    })
  } catch (e) {
    console.error('Place detail error:', e)
    return apiError('Failed to load details', 'ERROR', 500)
  }
}
