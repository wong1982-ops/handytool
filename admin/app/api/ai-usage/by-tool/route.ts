import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const params = request.nextUrl.searchParams
  const { from, to } = getDateRange(
    params.get('preset') ?? '30',
    params.get('from') ?? undefined,
    params.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  const { data: rows, error: queryError } = await admin
    .from('credit_transactions')
    .select('tool_id, amount')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)

  if (queryError) {
    console.error('[ai-usage/by-tool]', queryError)
    return API_ERRORS.INTERNAL()
  }

  const byTool = new Map<string, { call_count: number; total_credits: number }>()
  for (const row of rows ?? []) {
    const tid = row.tool_id ?? 'unknown'
    const entry = byTool.get(tid) ?? { call_count: 0, total_credits: 0 }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    byTool.set(tid, entry)
  }

  const tools = Array.from(byTool.entries())
    .map(([tool_id, vals]) => ({ tool_id, ...vals }))
    .sort((a, b) => b.total_credits - a.total_credits)

  return apiSuccess(tools)
}
