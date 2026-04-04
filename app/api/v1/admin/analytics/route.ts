import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

export async function GET(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Admin gate
  const supabase = getAdminSupabase()
  const { data: authUser } = await supabase.auth.admin.getUserById(userId)
  const email = authUser?.user?.email || ''

  if (ADMIN_EMAILS.length > 0) {
    if (!ADMIN_EMAILS.includes(email)) return API_ERRORS.UNAUTHORIZED()
  } else if (process.env.NODE_ENV !== 'development') {
    return API_ERRORS.UNAUTHORIZED()
  }

  // Parse period
  const { searchParams } = new URL(request.url)
  const period = Math.max(7, Math.min(90, Number(searchParams.get('period')) || 30))
  const now = new Date()
  const startDate = new Date(now.getTime() - period * 86400000).toISOString()
  const prevStartDate = new Date(now.getTime() - period * 2 * 86400000).toISOString()

  try {
    // Parallel queries
    const [txResult, prevTxResult, totalUsersResult, referralResult] = await Promise.all([
      (supabase.from as any)('credit_transactions')
        .select('user_id, type, amount, description, created_at')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })
        .limit(10000),
      (supabase.from as any)('credit_transactions')
        .select('user_id, type, amount, description, created_at')
        .gte('created_at', prevStartDate)
        .lt('created_at', startDate)
        .order('created_at', { ascending: true })
        .limit(10000),
      (supabase.from as any)('user_credits')
        .select('user_id', { count: 'exact', head: true }),
      (supabase.from as any)('referrals')
        .select('referrer_id, credits_awarded, created_at')
        .gte('created_at', startDate),
    ])

    const transactions: any[] = txResult.data || []
    const prevTransactions: any[] = prevTxResult.data || []
    const totalUsers = totalUsersResult.count || 0
    const referrals: any[] = referralResult.data || []

    // --- Users ---
    const activeUserIds = new Set(transactions.map((t: any) => t.user_id))
    const signupTx = transactions.filter((t: any) => t.type === 'signup')
    const newUserIds = new Set(signupTx.map((t: any) => t.user_id))

    // --- Signup chart (group by day) ---
    const signupByDay: Record<string, Set<string>> = {}
    for (const t of signupTx) {
      const day = t.created_at.slice(0, 10)
      if (!signupByDay[day]) signupByDay[day] = new Set()
      signupByDay[day].add(t.user_id)
    }
    const signupChart = Object.entries(signupByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, ids]) => ({ date, count: ids.size }))

    // --- Tool usage ---
    const usageTx = transactions.filter((t: any) => t.type === 'usage' || (t.amount < 0 && t.type !== 'signup'))
    const prevUsageTx = prevTransactions.filter((t: any) => t.type === 'usage' || (t.amount < 0 && t.type !== 'signup'))

    function extractToolName(desc: string): string {
      if (!desc) return 'Unknown'
      const colonIdx = desc.indexOf(':')
      if (colonIdx > 0 && colonIdx < 40) return desc.slice(0, colonIdx).trim()
      const words = desc.split(' ').slice(0, 3).join(' ')
      return words || 'Unknown'
    }

    const toolMap: Record<string, { creditsUsed: number; usageCount: number }> = {}
    for (const t of usageTx) {
      const name = extractToolName(t.description)
      if (!toolMap[name]) toolMap[name] = { creditsUsed: 0, usageCount: 0 }
      toolMap[name].creditsUsed += Math.abs(t.amount)
      toolMap[name].usageCount += 1
    }

    const prevToolMap: Record<string, number> = {}
    for (const t of prevUsageTx) {
      const name = extractToolName(t.description)
      prevToolMap[name] = (prevToolMap[name] || 0) + 1
    }

    const tools = Object.entries(toolMap)
      .map(([name, stats]) => {
        const prevCount = prevToolMap[name] || 0
        const trend: 'up' | 'down' | 'flat' =
          stats.usageCount > prevCount ? 'up' : stats.usageCount < prevCount ? 'down' : 'flat'
        return { name, ...stats, trend }
      })
      .sort((a, b) => b.creditsUsed - a.creditsUsed)

    // --- Credits ---
    const purchased = transactions
      .filter((t: any) => t.amount > 0)
      .reduce((sum: number, t: any) => sum + t.amount, 0)
    const consumed = transactions
      .filter((t: any) => t.amount < 0)
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)
    const conversionRate = purchased > 0 ? Math.round((consumed / purchased) * 100) : 0

    // Credits chart by day
    const creditsByDay: Record<string, { purchased: number; consumed: number }> = {}
    for (const t of transactions) {
      const day = t.created_at.slice(0, 10)
      if (!creditsByDay[day]) creditsByDay[day] = { purchased: 0, consumed: 0 }
      if (t.amount > 0) creditsByDay[day].purchased += t.amount
      else creditsByDay[day].consumed += Math.abs(t.amount)
    }
    const creditsChart = Object.entries(creditsByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }))

    // --- Referrals ---
    const totalReferrals = referrals.length
    const creditsAwarded = referrals.reduce((sum: number, r: any) => sum + (r.credits_awarded || 0), 0)
    const uniqueReferrers = new Set(referrals.map((r: any) => r.referrer_id))
    const referralConversion = totalReferrals > 0 ? Math.round((uniqueReferrers.size / totalReferrals) * 100) : 0

    // Top referrers
    const referrerMap: Record<string, { count: number; credits: number }> = {}
    for (const r of referrals) {
      if (!referrerMap[r.referrer_id]) referrerMap[r.referrer_id] = { count: 0, credits: 0 }
      referrerMap[r.referrer_id].count += 1
      referrerMap[r.referrer_id].credits += r.credits_awarded || 0
    }
    const topReferrers = Object.entries(referrerMap)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, stats]) => ({ email: id, ...stats }))

    return apiSuccess({
      users: {
        total: totalUsers,
        new: newUserIds.size,
        active: activeUserIds.size,
      },
      signupChart,
      tools,
      credits: { purchased, consumed, conversionRate },
      creditsChart,
      referrals: {
        total: totalReferrals,
        creditsAwarded,
        conversionRate: referralConversion,
      },
      topReferrers,
    })
  } catch (err) {
    console.error('[admin/analytics] Error:', err)
    return API_ERRORS.INTERNAL()
  }
}
