import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const supabase = await createClient()

  const { data: tiers, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('active', true)
    .order('monthly_credits', { ascending: true })

  if (error) {
    console.error('credits/tiers: query failed', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ tiers: tiers ?? [] })
}
