import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

/**
 * GET /api/v1/vblog/jobs — List user's VBlog jobs (most recent first, limit 30).
 */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('vblog_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (error) {
    console.error('[vblog/jobs] Failed to fetch jobs:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data ?? [] })
}
