import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  const params = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { page, limit } = parsed.data
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: transactions, error, count } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('credits/history: query failed', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({
    transactions: transactions ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
    },
  })
}
