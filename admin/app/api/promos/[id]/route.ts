import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const patchSchema = z.object({
  active: z.boolean().optional(),
  credit_amount: z.number().int().min(1).optional(),
  max_redemptions: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const admin = createAdminClient()

  const { error: dbError } = await admin
    .from('promo_codes')
    .update(parsed.data)
    .eq('id', id)

  if (dbError) {
    console.error('admin/promos/[id]: update failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ updated: true })
}
