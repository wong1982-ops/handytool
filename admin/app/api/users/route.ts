import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const querySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const params = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = querySchema.safeParse(params)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { search, page, limit } = parsed.data
  const offset = (page - 1) * limit
  const admin = createAdminClient()

  // Query user_credits table with pagination
  let query = admin
    .from('user_credits')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // If search is provided, we'll filter after fetching user details
  const { data: credits, error: dbError, count } = await query

  if (dbError) {
    console.error('admin/users: query failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  // Enrich each record with user info from auth
  const users = await Promise.all(
    (credits ?? []).map(async (credit) => {
      const { data: { user: authUser } } = await admin.auth.admin.getUserById(credit.user_id)
      return {
        id: credit.user_id,
        email: authUser?.email ?? null,
        name: authUser?.user_metadata?.full_name ?? authUser?.user_metadata?.name ?? null,
        subscription_credits: credit.subscription_credits,
        purchased_credits: credit.purchased_credits,
        total_credits: credit.subscription_credits + credit.purchased_credits,
        current_tier_id: credit.current_tier_id,
        updated_at: credit.updated_at,
      }
    })
  )

  // Filter by search if provided (email or name)
  const filtered = search
    ? users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return apiSuccess({
    users: filtered,
    pagination: {
      page,
      limit,
      total: search ? filtered.length : (count ?? 0),
      total_pages: Math.ceil((search ? filtered.length : (count ?? 0)) / limit),
    },
  })
}
