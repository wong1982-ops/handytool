import { searchAirportsLocal } from '@/lib/flights/airports'
import { apiSuccess } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get('q')?.trim()

  if (!keyword || keyword.length < 2) {
    return apiSuccess([])
  }

  const airports = searchAirportsLocal(keyword)
  return apiSuccess(airports)
}
