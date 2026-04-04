import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

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
  const { data, error } = await supabase
    .from('seo_content_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[seo-studio/content/plans] GET failed:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess(data)
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: {
    id?: string
    keyword: string
    topic?: string | null
    toolSlug?: string | null
    scheduledDate?: string | null
    status?: string | null
    draftContent?: unknown
  }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  if (!body.keyword?.trim()) return apiError('keyword is required', 'VALIDATION_ERROR', 400)

  const supabase = await getSupabase()

  if (body.id) {
    // Update existing plan
    const { data, error } = await supabase
      .from('seo_content_plans')
      .update({
        keyword: body.keyword.trim(),
        topic: body.topic ?? null,
        tool_slug: body.toolSlug ?? null,
        scheduled_date: body.scheduledDate ?? null,
        status: body.status ?? undefined,
        draft_content: body.draftContent ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[seo-studio/content/plans] UPDATE failed:', error)
      return API_ERRORS.INTERNAL()
    }

    return apiSuccess(data)
  }

  // Insert new plan
  const { data, error } = await supabase
    .from('seo_content_plans')
    .insert({
      user_id: userId,
      keyword: body.keyword.trim(),
      topic: body.topic ?? null,
      tool_slug: body.toolSlug ?? null,
      scheduled_date: body.scheduledDate ?? null,
      status: body.status ?? 'idea',
    })
    .select()
    .single()

  if (error) {
    console.error('[seo-studio/content/plans] INSERT failed:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess(data, 201)
}
