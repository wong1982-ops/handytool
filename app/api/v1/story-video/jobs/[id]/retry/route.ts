import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import type { PipelineStep, SceneStatus } from '@/tools/story-video/types'

/** Use admin client in dev (bypasses RLS), user client in prod */
async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/story-video/jobs/[id]/retry — Retry a specific step or scene.
 *
 * Body: { step?: PipelineStep, sceneIndex?: number }
 * - If sceneIndex provided: reset that scene's status to 'pending'.
 * - If step provided: reset that step's status to 'pending' in the steps map.
 * - Sets job status to 'processing' in either case.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = await getSupabase()

  // Fetch the job to verify ownership and current state
  const { data: job, error: fetchError } = await supabase
    .from('story_video_jobs')
    .select('id, user_id, status, current_step, steps, scene_status')
    .eq('id', id)
    .single()

  if (fetchError || !job) {
    return apiError('Job not found', 'NOT_FOUND', 404)
  }

  if ((job as { user_id: string }).user_id !== userId) {
    return apiError('Job not found', 'NOT_FOUND', 404)
  }

  let body: { step?: PipelineStep; sceneIndex?: number } = {}
  try {
    body = await request.json()
  } catch {
    // Body is optional — default to empty
  }

  const { step, sceneIndex } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobTyped = job as any

  const patch: Record<string, unknown> = {
    status: 'processing',
    error: null,
    updated_at: new Date().toISOString(),
  }

  if (typeof sceneIndex === 'number') {
    // Reset a specific scene to pending
    const sceneStatusArr: SceneStatus[] = Array.isArray(jobTyped.scene_status)
      ? (jobTyped.scene_status as SceneStatus[])
      : []

    const updatedScenes = sceneStatusArr.map((s) =>
      s.index === sceneIndex
        ? { ...s, status: 'pending' as const, error: undefined }
        : s,
    )

    patch.scene_status = updatedScenes
  } else if (step) {
    // Reset a specific pipeline step to pending
    const steps = (jobTyped.steps as Record<string, string>) ?? {}
    patch.steps = { ...steps, [step]: 'pending' }
    patch.current_step = step
  }

  const { error: updateError } = await supabase
    .from('story_video_jobs')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)

  if (updateError) {
    console.error('[story-video/retry] Update error:', updateError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ ok: true, step: step ?? null, sceneIndex: sceneIndex ?? null })
}
