import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

// ─── GET — list user's hazards ────────────────────────────────────────────────

export async function GET(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { searchParams } = new URL(request.url)
  const industry = searchParams.get('industry')

  const supabase = getAdminSupabase()
  let query = (supabase.from as any)('worksafe_hazards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (industry) {
    query = query.eq('industry', industry)
  }

  const { data, error } = await query

  if (error) {
    console.error('[worksafe/hazards] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ hazards: data || [] })
}

// ─── POST — create or update a hazard ────────────────────────────────────────

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    id?: string
    industry?: string
    hazard: string
    risk_level?: string
    likelihood?: string
    consequence?: string
    controls?: string
    responsible?: string
    review_date?: string
  }

  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!body.hazard?.trim()) {
    return API_ERRORS.VALIDATION({ message: 'hazard is required' })
  }

  const supabase = getAdminSupabase()

  // Update if id provided
  if (body.id) {
    const patch: Record<string, unknown> = {
      industry: body.industry ?? null,
      hazard: body.hazard,
      risk_level: body.risk_level ?? 'medium',
      likelihood: body.likelihood ?? null,
      consequence: body.consequence ?? null,
      controls: body.controls ?? null,
      responsible: body.responsible ?? null,
      review_date: body.review_date ?? null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await (supabase.from as any)('worksafe_hazards')
      .update(patch)
      .eq('id', body.id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('[worksafe/hazards] POST update error:', error)
      return API_ERRORS.INTERNAL()
    }

    return apiSuccess({ hazard: data })
  }

  // Create new
  const row = {
    user_id: userId,
    industry: body.industry ?? null,
    hazard: body.hazard,
    risk_level: body.risk_level ?? 'medium',
    likelihood: body.likelihood ?? null,
    consequence: body.consequence ?? null,
    controls: body.controls ?? null,
    responsible: body.responsible ?? null,
    review_date: body.review_date ?? null,
  }

  const { data, error } = await (supabase.from as any)('worksafe_hazards')
    .insert(row)
    .select('*')
    .single()

  if (error) {
    console.error('[worksafe/hazards] POST create error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ hazard: data }, 201)
}

// ─── DELETE — delete a hazard by id ──────────────────────────────────────────

export async function DELETE(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id?.trim()) {
    return API_ERRORS.VALIDATION({ message: 'id is required' })
  }

  const supabase = getAdminSupabase()

  const { error } = await (supabase.from as any)('worksafe_hazards')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('[worksafe/hazards] DELETE error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
