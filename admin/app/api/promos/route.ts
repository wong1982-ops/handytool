import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const postSchema = z.object({
  code: z.string().min(3).max(30).transform(v => v.trim().toUpperCase()),
  credit_amount: z.number().int().min(1),
  max_redemptions: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

export async function GET() {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const admin = createAdminClient()

  const { data: promos, error: dbError } = await admin
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbError) {
    console.error('admin/promos: query failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ promos: promos ?? [] })
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json().catch(() => null)
  const parsed = postSchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const admin = createAdminClient()

  const { data: promo, error: dbError } = await admin
    .from('promo_codes')
    .insert({
      ...parsed.data,
      created_by: user!.id,
    })
    .select()
    .single()

  if (dbError) {
    // Handle unique constraint violation on code
    if (dbError.code === '23505') {
      return apiError('Promo code already exists', 'DUPLICATE_CODE', 409)
    }
    console.error('admin/promos: insert failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ promo }, 201)
}
