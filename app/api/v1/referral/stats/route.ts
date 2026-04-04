import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

const MAX_PER_MONTH = 10
const CREDITS_PER_REFERRAL = 15

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  // Fetch all referrals for this referrer
  const { data: referrals, error } = await (supabase.from as any)('referrals')
    .select('created_at, credits_awarded')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('referral/stats: query failed', error)
    return API_ERRORS.INTERNAL()
  }

  const rows = (referrals ?? []) as Array<{ created_at: string; credits_awarded: number }>

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const thisMonth = rows.filter((r) => r.created_at >= monthStart).length
  const totalReferrals = rows.length
  const creditsEarned = rows.reduce((sum, r) => sum + (r.credits_awarded ?? CREDITS_PER_REFERRAL), 0)

  const recent = rows.slice(0, 10).map((r) => ({
    date: r.created_at,
    credits: r.credits_awarded ?? CREDITS_PER_REFERRAL,
  }))

  return apiSuccess({
    totalReferrals,
    creditsEarned,
    thisMonth,
    maxPerMonth: MAX_PER_MONTH,
    recent,
  })
}
