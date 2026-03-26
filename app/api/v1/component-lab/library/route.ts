// app/api/v1/component-lab/library/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('components_library')
    .select(
      'id, name, slug, tags, prompt, settings, thumbnail_url, is_public, copy_count, created_at, updated_at',
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[component-lab/library] Query error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data })
}

export async function PATCH(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { id: string; isPublic: boolean }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.id) {
    return apiError('id is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('components_library')
    .update({ is_public: body.isPublic })
    .eq('id', body.id)
    .eq('user_id', userId)

  if (error) {
    console.error('[component-lab/library] Update error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ ok: true })
}

export async function DELETE(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return apiError('id is required', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('components_library')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    console.error('[component-lab/library] Delete error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ ok: true })
}
