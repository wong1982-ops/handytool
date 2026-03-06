import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const bodySchema = z.object({
  amount: z.number().int(),
  reason: z.string().min(1).max(500),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { amount, reason } = parsed.data
  const admin = createAdminClient()

  const { error: rpcError } = await admin.rpc('admin_adjust_credits', {
    p_user_id: id,
    p_amount: amount,
    p_admin_id: user!.id,
    p_reason: reason,
  })

  if (rpcError) {
    console.error('admin/users/adjust: RPC failed', rpcError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ adjusted: true })
}
