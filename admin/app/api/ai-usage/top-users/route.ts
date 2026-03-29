import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const params = request.nextUrl.searchParams
  const limit = Math.min(parseInt(params.get('limit') ?? '20', 10), 100)
  const { from, to } = getDateRange(
    params.get('preset') ?? '30',
    params.get('from') ?? undefined,
    params.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  const { data: rows, error: queryError } = await admin
    .from('credit_transactions')
    .select('user_id, tool_id, amount, created_at')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)

  if (queryError) {
    console.error('[ai-usage/top-users]', queryError)
    return API_ERRORS.INTERNAL()
  }

  // Aggregate by user
  const byUser = new Map<string, {
    call_count: number
    total_credits: number
    tool_counts: Map<string, number>
    last_active: string
  }>()

  for (const row of rows ?? []) {
    const uid = row.user_id
    const entry = byUser.get(uid) ?? {
      call_count: 0,
      total_credits: 0,
      tool_counts: new Map(),
      last_active: row.created_at,
    }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    entry.tool_counts.set(row.tool_id ?? 'unknown', (entry.tool_counts.get(row.tool_id ?? 'unknown') ?? 0) + 1)
    if (row.created_at > entry.last_active) entry.last_active = row.created_at
    byUser.set(uid, entry)
  }

  // Sort by total credits, take top N
  const sorted = Array.from(byUser.entries())
    .sort((a, b) => b[1].total_credits - a[1].total_credits)
    .slice(0, limit)

  // Fetch user emails for the top users
  const userIds = sorted.map(([uid]) => uid)
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 100 })
  const userMap = new Map<string, { email: string; display_name: string | null }>()
  for (const u of users?.users ?? []) {
    if (userIds.includes(u.id)) {
      userMap.set(u.id, {
        email: u.email ?? 'unknown',
        display_name: (u.user_metadata?.display_name as string) ?? (u.user_metadata?.full_name as string) ?? null,
      })
    }
  }

  const topUsers = sorted.map(([uid, data]) => {
    let mostUsedTool = 'unknown'
    let maxCount = 0
    for (const [tool, count] of data.tool_counts) {
      if (count > maxCount) { mostUsedTool = tool; maxCount = count }
    }

    const userInfo = userMap.get(uid)
    return {
      user_id: uid,
      email: userInfo?.email ?? 'unknown',
      display_name: userInfo?.display_name ?? null,
      call_count: data.call_count,
      total_credits: data.total_credits,
      most_used_tool: mostUsedTool,
      last_active: data.last_active,
    }
  })

  return apiSuccess(topUsers)
}
