import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

const putSchema = z.object({
  credit_cost: z.number().int().min(1).max(1000),
  display_name: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const admin = createAdminClient()

  const { data: tool, error: dbError } = await admin
    .from('tool_credit_costs')
    .select('*')
    .eq('tool_id', id)
    .single()

  if (dbError || !tool) {
    return API_ERRORS.NOT_FOUND('Tool pricing')
  }

  return apiSuccess({ tool })
}

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
    .from('tool_credit_costs')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
      updated_by: user!.id,
    })
    .eq('tool_id', id)

  if (dbError) {
    console.error('admin/tools/pricing: update failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ updated: true })
}
