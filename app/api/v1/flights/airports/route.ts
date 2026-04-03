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
