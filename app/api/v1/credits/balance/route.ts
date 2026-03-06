import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return API_ERRORS.UNAUTHORIZED()
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select('subscription_balance, purchased_balance, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('credits/balance: query failed', error)
    return API_ERRORS.INTERNAL()
  }

  const subscription_balance = data?.subscription_balance ?? 0
  const purchased_balance = data?.purchased_balance ?? 0

  return apiSuccess({
    subscription_balance,
    purchased_balance,
    total: subscription_balance + purchased_balance,
    current_period_end: data?.current_period_end ?? null,
  })
}
