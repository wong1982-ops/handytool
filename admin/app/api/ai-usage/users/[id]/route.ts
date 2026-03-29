import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id: userId } = await params
  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = 20
  const offset = (page - 1) * perPage

  const { from, to } = getDateRange(
    searchParams.get('preset') ?? '30',
    searchParams.get('from') ?? undefined,
    searchParams.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  // Fetch user info
  const { data: { user } } = await admin.auth.admin.getUserById(userId)
  const email = user?.email ?? 'unknown'
  const display_name = (user?.user_metadata?.display_name as string)
    ?? (user?.user_metadata?.full_name as string)
    ?? null

  // Fetch transactions with count
  const { data: rows, error: queryError, count } = await admin
    .from('credit_transactions')
    .select('id, tool_id, amount, description, created_at', { count: 'exact' })
    .eq('type', 'usage')
    .eq('user_id', userId)
    .gte('created_at', from)
    .lt('created_at', to)
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (queryError) {
    console.error('[ai-usage/users/id]', queryError)
    return API_ERRORS.INTERNAL()
  }

  // Also fetch summary for this user
  const { data: allRows } = await admin
    .from('credit_transactions')
    .select('tool_id, amount, created_at')
    .eq('type', 'usage')
    .eq('user_id', userId)
    .gte('created_at', from)
    .lt('created_at', to)

  const txns = allRows ?? []
  const total_calls = txns.length
  const total_credits = txns.reduce((sum, r) => sum + Math.abs(r.amount), 0)

  // Per-tool breakdown
  const byTool = new Map<string, { call_count: number; total_credits: number }>()
  for (const row of txns) {
    const tid = row.tool_id ?? 'unknown'
    const entry = byTool.get(tid) ?? { call_count: 0, total_credits: 0 }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    byTool.set(tid, entry)
  }

  const toolBreakdown = Array.from(byTool.entries())
    .map(([tool_id, vals]) => ({ tool_id, ...vals }))
    .sort((a, b) => b.total_credits - a.total_credits)

  // Find favorite tool and date range
  let favoriteTool = 'none'
  let maxCalls = 0
  for (const [tool, data] of byTool) {
    if (data.call_count > maxCalls) { favoriteTool = tool; maxCalls = data.call_count }
  }
  const firstActive = txns.length ? txns.reduce((min, r) => r.created_at < min ? r.created_at : min, txns[0].created_at) : null
  const lastActive = txns.length ? txns.reduce((max, r) => r.created_at > max ? r.created_at : max, txns[0].created_at) : null

  return apiSuccess({
    user: { user_id: userId, email, display_name },
    summary: { total_calls, total_credits, favorite_tool: favoriteTool, first_active: firstActive, last_active: lastActive },
    tool_breakdown: toolBreakdown,
    transactions: rows ?? [],
    pagination: { page, per_page: perPage, total: count ?? 0 },
  })
}
