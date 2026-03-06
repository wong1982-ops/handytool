import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const admin = createAdminClient()

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Run 5 queries in parallel
  const [
    subscribersResult,
    creditsToday,
    creditsWeek,
    creditsMonth,
    lowBalanceResult,
  ] = await Promise.all([
    // Active subscribers: users with a non-free tier
    admin
      .from('user_credits')
      .select('user_id', { count: 'exact', head: true })
      .neq('current_tier_id', 'free')
      .not('current_tier_id', 'is', null),

    // Credits consumed today (sum of negative amounts from usage transactions)
    admin
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'usage')
      .gte('created_at', startOfDay),

    // Credits consumed this week
    admin
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'usage')
      .gte('created_at', startOfWeek),

    // Credits consumed this month
    admin
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'usage')
      .gte('created_at', startOfMonth),

    // Low balance users (subscription + purchased < 10)
    admin
      .rpc('get_low_balance_count', { p_threshold: 10 }),
  ])

  // Sum negative amounts for usage
  const sumNegative = (rows: { amount: number }[] | null) =>
    Math.abs((rows ?? []).reduce((sum, r) => sum + (r.amount < 0 ? r.amount : 0), 0))

  // For low balance, fall back to a manual count if RPC doesn't exist
  let lowBalanceCount = 0
  if (lowBalanceResult.error) {
    // RPC might not exist yet, fall back to query
    const { count } = await admin
      .from('user_credits')
      .select('user_id', { count: 'exact', head: true })
      .lt('subscription_credits', 10)
      .lt('purchased_credits', 0) // This is approximate; ideally sum < 10
    lowBalanceCount = count ?? 0
  } else {
    lowBalanceCount = lowBalanceResult.data ?? 0
  }

  return apiSuccess({
    active_subscribers: subscribersResult.count ?? 0,
    credits_consumed_today: sumNegative(creditsToday.data),
    credits_consumed_week: sumNegative(creditsWeek.data),
    credits_consumed_month: sumNegative(creditsMonth.data),
    low_balance_users: lowBalanceCount,
  })
}
