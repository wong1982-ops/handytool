import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function GET(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { searchParams } = new URL(request.url)
  const entityId = searchParams.get('entity_id')
  const taxYear = searchParams.get('tax_year')
  const category = searchParams.get('category')
  const approved = searchParams.get('approved')

  if (!entityId?.trim()) {
    return apiError('entity_id is required', 'VALIDATION_ERROR', 400)
  }
  if (!taxYear?.trim()) {
    return apiError('tax_year is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()
  let query = supabase
    .from('tax_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('entity_id', entityId)
    .eq('tax_year', taxYear)
    .order('date', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }
  if (approved !== null && approved !== undefined) {
    query = query.eq('approved', approved === 'true')
  }

  const { data, error } = await query

  if (error) {
    console.error('[tax-manager/transactions] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ transactions: data || [] })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    transactions: Array<{
      entity_id: string
      document_id?: string
      date: string
      description: string
      amount: number
      gst_amount?: number
      category?: string
      category_confidence?: string
      approved?: boolean
      tax_year: string
      notes?: string
    }>
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!Array.isArray(body.transactions) || body.transactions.length === 0) {
    return apiError('transactions array is required and must not be empty', 'VALIDATION_ERROR', 400)
  }

  const rows = body.transactions.map((t) => ({
    user_id: userId,
    entity_id: t.entity_id,
    document_id: t.document_id || null,
    date: t.date,
    description: t.description,
    amount: t.amount,
    gst_amount: t.gst_amount ?? null,
    category: t.category || null,
    category_confidence: t.category_confidence || 'low',
    approved: t.approved ?? false,
    tax_year: t.tax_year,
    notes: t.notes || null,
  }))

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('tax_transactions')
    .insert(rows)
    .select('id')

  if (error) {
    console.error('[tax-manager/transactions] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ inserted: data?.length ?? 0, ids: data?.map((r: { id: string }) => r.id) ?? [] }, 201)
}

export async function PATCH(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    id: string
    category?: string
    approved?: boolean
    notes?: string
    gst_amount?: number
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { id, ...updates } = body

  if (!id?.trim()) {
    return apiError('Transaction id is required', 'VALIDATION_ERROR', 400)
  }

  const patch: Record<string, unknown> = {}
  if (updates.category !== undefined) patch.category = updates.category
  if (updates.approved !== undefined) patch.approved = updates.approved
  if (updates.notes !== undefined) patch.notes = updates.notes
  if (updates.gst_amount !== undefined) patch.gst_amount = updates.gst_amount

  if (Object.keys(patch).length === 0) {
    return apiError('No fields to update', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('tax_transactions')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) {
    console.error('[tax-manager/transactions] PATCH error:', error)
    return API_ERRORS.INTERNAL()
  }

  if (!data) return API_ERRORS.NOT_FOUND('Transaction')

  return apiSuccess({ transaction: data })
}

export async function DELETE(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id?.trim()) {
    return apiError('id is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()
  const { error } = await supabase
    .from('tax_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('[tax-manager/transactions] DELETE error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
