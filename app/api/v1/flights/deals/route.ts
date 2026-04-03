import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromCity = searchParams.get('from')?.toUpperCase()
  const sortBy = searchParams.get('sort') || 'discount'

  const supabase = await createClient()

  let query = supabase
    .from('flight_deals')
    .select('*')
    .gte('computed_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

  if (fromCity) {
    query = query.eq('origin', fromCity)
  }

  if (sortBy === 'price') {
    query = query.order('current_price', { ascending: true })
  } else if (sortBy === 'newest') {
    query = query.order('computed_at', { ascending: false })
  } else {
    query = query.order('discount_pct', { ascending: false })
  }

  query = query.limit(20)

  const { data, error } = await query

  if (error) {
    console.error('[flights/deals] Error:', error)
    return API_ERRORS.INTERNAL()
  }

  const enriched = await Promise.all(
    (data || []).map(async (deal: Record<string, unknown>) => {
      const { data: history } = await supabase
        .from('flight_price_history')
        .select('price')
        .eq('origin', deal.origin)
        .eq('destination', deal.destination)
        .gte('scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('scraped_at', { ascending: true })
        .limit(30)

      return {
        ...deal,
        priceHistory: (history || []).map((h: Record<string, unknown>) => h.price),
      }
    })
  )

  return apiSuccess({ deals: enriched, stale: (data || []).length === 0 })
}
