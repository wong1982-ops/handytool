// app/api/v1/component-lab/library/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

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
