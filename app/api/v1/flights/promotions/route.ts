import { createClient } from '@/lib/supabase/server'
import { apiSuccess } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('flight_promotions')
    .select('*')
    .eq('active', true)
    .order('scraped_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('[flights/promotions] Error:', error)
    return apiSuccess({ promotions: [] })
  }

  return apiSuccess({ promotions: data || [] })
}
