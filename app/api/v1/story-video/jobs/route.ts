import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

/** Use admin client in dev (bypasses RLS), user client in prod */
async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/story-video/jobs — List the authenticated user's video jobs (latest 20).
 */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('story_video_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[story-video/jobs] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ jobs: data ?? [] })
}
