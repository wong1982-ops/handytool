import { getAdminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await getSupabase()
  const { data, error } = await (supabase.from as any)('tradie_tax_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('[tradie-tax/entries] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data || [] })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    date: string
    description: string
    amount: number
    category: string
    entry_type: string
    gst_inclusive?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  if (!body.date || !body.description || body.amount == null || !body.category || !body.entry_type) {
    return apiError('date, description, amount, category, and entry_type are required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()
  const { data, error } = await (supabase.from as any)('tradie_tax_entries')
    .insert({
      user_id: userId,
      date: body.date,
      description: body.description,
      amount: body.amount,
      category: body.category,
      entry_type: body.entry_type,
      gst_inclusive: body.gst_inclusive ?? true,
    })
    .select('*')
    .single()

  if (error) {
    console.error('[tradie-tax/entries] POST error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entry: data }, 201)
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
  const { error } = await (supabase.from as any)('tradie_tax_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('[tradie-tax/entries] DELETE error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
