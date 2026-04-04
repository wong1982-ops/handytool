import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

// Tier priority for "hottest" sort
const TIER_ORDER: Record<string, number> = {
  lowest_ever: 0,
  hot_deal: 1,
  price_drop: 2,
  normal: 3,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fromCity = searchParams.get('from')?.toUpperCase()
  const sortBy = searchParams.get('sort') || 'hottest'

  const supabase = await createClient()

  // Extended window to 4 days (cron runs every 3 days)
  let query = supabase
    .from('flight_deals')
    .select('*')
    .gte('computed_at', new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString())

  if (fromCity) {
    query = query.eq('origin', fromCity)
  }

  if (sortBy === 'price') {
    query = query.order('current_price', { ascending: true })
  } else if (sortBy === 'newest') {
    query = query.order('computed_at', { ascending: false })
  } else if (sortBy === 'discount') {
    query = query.order('discount_pct', { ascending: false })
  } else {
    // 'hottest' — sort by tier then discount
    query = query.order('discount_pct', { ascending: false })
  }

  query = query.limit(40)

  const { data, error } = await query

  if (error) {
    console.error('[flights/deals] Error:', error)
    return API_ERRORS.INTERNAL()
  }

  // Enrich with price history
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

  // Apply "hottest" sort client-side (tier priority + discount)
  if (sortBy === 'hottest') {
    enriched.sort((a, b) => {
      const tierA = TIER_ORDER[(a.deal_tier as string) || 'normal'] ?? 3
      const tierB = TIER_ORDER[(b.deal_tier as string) || 'normal'] ?? 3
      if (tierA !== tierB) return tierA - tierB
      return (b.discount_pct as number) - (a.discount_pct as number)
    })
  }

  return apiSuccess({ deals: enriched, stale: (data || []).length === 0 })
}
