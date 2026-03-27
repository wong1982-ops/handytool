import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { uploadToR2 } from '@/lib/storage/r2'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

  if (!entityId?.trim()) {
    return apiError('entity_id is required', 'VALIDATION_ERROR', 400)
  }
  if (!taxYear?.trim()) {
    return apiError('tax_year is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('tax_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('entity_id', entityId)
    .eq('tax_year', taxYear)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[tax-manager/documents] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ documents: data || [] })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid multipart form data' })
  }

  const file = formData.get('file') as File | null
  const entityId = formData.get('entity_id') as string | null
  const type = formData.get('type') as string | null
  const taxYear = formData.get('tax_year') as string | null
  const bankName = formData.get('bank_name') as string | null

  if (!file) {
    return apiError('file is required', 'VALIDATION_ERROR', 400)
  }
  if (!entityId?.trim()) {
    return apiError('entity_id is required', 'VALIDATION_ERROR', 400)
  }
  if (!type?.trim()) {
    return apiError('type is required', 'VALIDATION_ERROR', 400)
  }
  if (!taxYear?.trim()) {
    return apiError('tax_year is required', 'VALIDATION_ERROR', 400)
  }

  // Verify entity belongs to this user
  const supabase = await getSupabase()
  const { data: entity, error: entityError } = await supabase
    .from('tax_entities')
    .select('id')
    .eq('id', entityId)
    .eq('user_id', userId)
    .maybeSingle()

  if (entityError || !entity) {
    return API_ERRORS.NOT_FOUND('Entity')
  }

  // Upload to R2
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const r2Path = `tax-manager/${userId}/${taxYear}/${safeFileName}`

  let fileUrl: string
  try {
    fileUrl = await uploadToR2(r2Path, buffer, file.type || 'application/octet-stream')
  } catch (err) {
    console.error('[tax-manager/documents] R2 upload error:', err)
    return apiError('Failed to upload file', 'UPLOAD_FAILED', 500)
  }

  // Insert DB row
  const { data, error } = await supabase
    .from('tax_documents')
    .insert({
      user_id: userId,
      entity_id: entityId,
      type: type.trim(),
      file_url: fileUrl,
      file_name: file.name,
      bank_name: bankName?.trim() || null,
      tax_year: taxYear.trim(),
    })
    .select('*')
    .single()

  if (error) {
    console.error('[tax-manager/documents] POST insert error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ document: data }, 201)
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

  // First verify ownership
  const { data: doc, error: fetchError } = await supabase
    .from('tax_documents')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError || !doc) {
    return API_ERRORS.NOT_FOUND('Document')
  }

  // Delete associated transactions first (in case FK is not cascade)
  await supabase
    .from('tax_transactions')
    .delete()
    .eq('document_id', id)
    .eq('user_id', userId)

  // Delete document
  const { error: deleteError } = await supabase
    .from('tax_documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (deleteError) {
    console.error('[tax-manager/documents] DELETE error:', deleteError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
