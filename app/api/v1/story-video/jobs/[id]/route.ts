import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

/** Use admin client in dev (bypasses RLS), user client in prod */
async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/story-video/jobs/[id] — Fetch a single video job by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = await getSupabase()

  const { data: job, error } = await supabase
    .from('story_video_jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    return apiError('Job not found', 'NOT_FOUND', 404)
  }

  // Verify ownership
  if ((job as { user_id: string }).user_id !== userId) {
    return apiError('Job not found', 'NOT_FOUND', 404)
  }

  return apiSuccess({ job })
}

/**
 * DELETE /api/v1/story-video/jobs/[id] — Delete a video job.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = await getSupabase()

  const { error } = await supabase
    .from('story_video_jobs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[story-video] Delete error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
