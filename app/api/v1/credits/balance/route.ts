import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

const WELCOME_CREDITS = 65

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  let { data, error } = await supabase
    .from('user_credits')
    .select('subscription_balance, purchased_balance, current_period_end')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('credits/balance: query failed', error)
    return API_ERRORS.INTERNAL()
  }

  // First visit: grant welcome credits so new users can try story generation
  const isNew = !data || (data.subscription_balance === 0 && data.purchased_balance === 0)
  if (isNew) {
    // Check if user has any prior transactions (avoid re-granting to users who spent all credits)
    const { count } = await supabase
      .from('credit_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count ?? 0) === 0) {
      await supabase.rpc('grant_purchased_credits', {
        p_user_id: userId,
        p_amount: WELCOME_CREDITS,
        p_description: 'Welcome bonus — free credits for new users',
      })

      const { data: refreshed } = await supabase
        .from('user_credits')
        .select('subscription_balance, purchased_balance, current_period_end')
        .eq('user_id', userId)
        .maybeSingle()

      data = refreshed
    }
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
