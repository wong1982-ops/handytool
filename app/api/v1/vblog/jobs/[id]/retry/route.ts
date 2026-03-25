import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'
import type { JobSteps, PipelineStep } from '@/tools/vblog/types'

/**
 * POST /api/v1/vblog/jobs/[id]/retry — Retry a failed pipeline step.
 * Body: { step: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const { step } = body as Record<string, unknown>
  if (!step || typeof step !== 'string') {
    return API_ERRORS.VALIDATION({ step: 'Required string' })
  }

  const supabase = await createClient()

  // Fetch the job to verify ownership and get current steps
  const { data: job, error: fetchError } = await supabase
    .from('vblog_jobs')
    .select('id, user_id, steps')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !job) {
    return API_ERRORS.NOT_FOUND('Job')
  }

  // Reset the specified step to 'pending' in steps JSONB
  const currentSteps = (job.steps ?? {}) as JobSteps
  const updatedSteps: JobSteps = {
    ...currentSteps,
    [step as PipelineStep]: 'pending',
  }

  const { error: updateError } = await supabase
    .from('vblog_jobs')
    .update({
      steps: updatedSteps,
      status: 'processing',
      error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (updateError) {
    console.error('[vblog/retry] Failed to update job:', updateError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ ok: true, step, retrying: true })
}
