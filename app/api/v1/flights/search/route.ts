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
