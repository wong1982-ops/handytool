import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  const { data, error } = await (supabase.from as any)('healthy_homes_properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[healthy-homes/properties] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess(data || [])
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    id?: string
    address?: string
    city?: string
    climateZone?: number
    checklist?: Record<string, unknown>
    complianceStatus?: string
    lastChecked?: string
  }

  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const supabase = getAdminSupabase()

  // Update existing property
  if (body.id) {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.checklist !== undefined) patch.checklist = body.checklist
    if (body.complianceStatus !== undefined) patch.compliance_status = body.complianceStatus
    if (body.lastChecked !== undefined) patch.last_checked = body.lastChecked

    const { data, error } = await (supabase.from as any)('healthy_homes_properties')
      .update(patch)
      .eq('id', body.id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('[healthy-homes/properties] POST update error:', error)
      return API_ERRORS.INTERNAL()
    }

    if (!data) return API_ERRORS.NOT_FOUND('Property')

    return apiSuccess(data)
  }

  // Create new property
  if (!body.address?.trim()) {
    return API_ERRORS.VALIDATION({ message: 'address is required' })
  }

  const row = {
    user_id: userId,
    address: body.address,
    city: body.city || null,
    climate_zone: body.climateZone ?? 2,
    compliance_status: 'not-checked',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await (supabase.from as any)('healthy_homes_properties')
    .insert(row)
    .select('*')
    .single()

  if (error) {
    console.error('[healthy-homes/properties] POST create error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess(data, 201)
}

export async function DELETE(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { id?: string }

  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!body.id?.trim()) {
    return API_ERRORS.VALIDATION({ message: 'id is required' })
  }

  const supabase = getAdminSupabase()

  const { error } = await (supabase.from as any)('healthy_homes_properties')
    .delete()
    .eq('id', body.id)
    .eq('user_id', userId)

  if (error) {
    console.error('[healthy-homes/properties] DELETE error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
