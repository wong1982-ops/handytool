import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  const { data: alerts, error } = await supabase
    .from('flight_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[flights/alerts] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  const enriched = await Promise.all(
    (alerts || []).map(async (alert: Record<string, unknown>) => {
      const { data: history } = await supabase
        .from('flight_price_history')
        .select('price')
        .eq('origin', alert.origin)
        .eq('destination', alert.destination)
        .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('scraped_at', { ascending: true })
        .limit(30)

      return {
        ...alert,
        priceHistory: (history || []).map((h: Record<string, unknown>) => h.price),
      }
    })
  )

  return apiSuccess({ alerts: enriched })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const { origin, destination, departureDate, targetPrice } = body

  if (!origin || !destination || !targetPrice) {
    return API_ERRORS.VALIDATION({ message: 'origin, destination, and targetPrice are required' })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('flight_alerts')
    .insert({
      user_id: userId,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departure_date: departureDate || null,
      target_price: targetPrice,
      status: 'tracking',
    })
    .select()
    .single()

  if (error) {
    console.error('[flights/alerts] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ alert: data }, 201)
}
