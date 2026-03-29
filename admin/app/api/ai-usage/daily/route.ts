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
    .select('amount, created_at')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)
    .order('created_at', { ascending: true })

  if (queryError) {
    console.error('[ai-usage/daily]', queryError)
    return API_ERRORS.INTERNAL()
  }

  // Group by day
  const byDay = new Map<string, { call_count: number; total_credits: number }>()
  for (const row of rows ?? []) {
    const day = row.created_at.slice(0, 10)
    const entry = byDay.get(day) ?? { call_count: 0, total_credits: 0 }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    byDay.set(day, entry)
  }

  const daily = Array.from(byDay.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return apiSuccess(daily)
}
