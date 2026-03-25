import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

/**
 * GET /api/v1/vblog/jobs/[id] — Get a single VBlog job by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('vblog_jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !job) {
    return API_ERRORS.NOT_FOUND('Job')
  }

  return apiSuccess({ job })
}
