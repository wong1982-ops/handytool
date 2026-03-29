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
    .select('user_id, amount')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)

  if (queryError) {
    console.error('[ai-usage/summary]', queryError)
    return API_ERRORS.INTERNAL()
  }

  const txns = rows ?? []
  const total_calls = txns.length
  const total_credits = txns.reduce((sum, r) => sum + Math.abs(r.amount), 0)
  const unique_users = new Set(txns.map((r) => r.user_id)).size
  const avg_credits_per_call = total_calls > 0 ? Math.round((total_credits / total_calls) * 10) / 10 : 0

  return apiSuccess({ total_calls, total_credits, unique_users, avg_credits_per_call })
}
