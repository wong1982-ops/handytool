import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const putSchema = z.object({
  name: z.string().min(1).optional(),
  monthly_credits: z.number().int().min(0).optional(),
  stripe_price_id: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
  active: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = putSchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const admin = createAdminClient()

  const { error: dbError } = await admin
    .from('subscription_tiers')
    .update(parsed.data)
    .eq('id', id)

  if (dbError) {
    console.error('admin/tiers/[id]: update failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ updated: true })
}
