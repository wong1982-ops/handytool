import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_entities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[tax-manager/entities] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entities: data || [] })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    name: string
    type: string
    ird_number?: string
    gst_registered?: boolean
    gst_basis?: string
    gst_period?: string
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { name, type, ird_number, gst_registered, gst_basis, gst_period } = body

  if (!name?.trim()) {
    return apiError('Entity name is required', 'VALIDATION_ERROR', 400)
  }
  if (!type?.trim()) {
    return apiError('Entity type is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_entities')
    .insert({
      user_id: userId,
      name: name.trim(),
      type: type.trim(),
      ird_number: ird_number?.trim() || null,
      gst_registered: gst_registered ?? false,
      gst_basis: gst_basis?.trim() || 'invoice',
      gst_period: gst_period?.trim() || '2-monthly',
    })
    .select('*')
    .single()

  if (error) {
    console.error('[tax-manager/entities] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entity: data }, 201)
}

export async function PATCH(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    id: string
    name?: string
    type?: string
    ird_number?: string
    gst_registered?: boolean
    gst_basis?: string
    gst_period?: string
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { id, ...updates } = body

  if (!id?.trim()) {
    return apiError('Entity id is required', 'VALIDATION_ERROR', 400)
  }

  const patch: Record<string, unknown> = {}
  if (updates.name !== undefined) patch.name = updates.name.trim()
  if (updates.type !== undefined) patch.type = updates.type.trim()
  if (updates.ird_number !== undefined) patch.ird_number = updates.ird_number?.trim() || null
  if (updates.gst_registered !== undefined) patch.gst_registered = updates.gst_registered
  if (updates.gst_basis !== undefined) patch.gst_basis = updates.gst_basis?.trim()
  if (updates.gst_period !== undefined) patch.gst_period = updates.gst_period?.trim()

  if (Object.keys(patch).length === 0) {
    return apiError('No fields to update', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tax_entities')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) {
    console.error('[tax-manager/entities] PATCH error:', error)
    return API_ERRORS.INTERNAL()
  }

  if (!data) return API_ERRORS.NOT_FOUND('Entity')

  return apiSuccess({ entity: data })
}
