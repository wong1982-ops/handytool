import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const searchParams = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = querySchema.safeParse(searchParams)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { page, limit } = parsed.data
  const offset = (page - 1) * limit
  const admin = createAdminClient()

  const { data: transactions, error: dbError, count } = await admin
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (dbError) {
    console.error('admin/users/transactions: query failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({
    transactions: transactions ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / limit),
    },
  })
}
