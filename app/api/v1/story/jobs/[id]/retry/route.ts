import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { triggerNextStep, type PipelineStep } from '@/lib/story/queue'

/**
 * POST /api/v1/story/jobs/[id]/retry — Re-trigger a failed step.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('book_jobs')
    .select('id, user_id, status, current_step')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single()

  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  if (job.status !== 'failed') {
    return NextResponse.json({ error: 'Job is not in failed state' }, { status: 400 })
  }

  // Reset retry count and re-trigger the failed step
  await supabase
    .from('book_jobs')
    .update({
      status: 'running',
      retry_count: 0,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)

  // Determine params for the current step (page number for illustrate/tts)
  const step = job.current_step as PipelineStep
  let stepParams: Record<string, string> | undefined

  // For page-based steps, we need to know which page to retry
  // The page number is tracked in the state — re-derive from completed count
  if (step === 'illustrate_page' || step === 'tts_page') {
    // Fetch full job to check state
    const { data: fullJob } = await supabase
      .from('book_jobs')
      .select('state, total_pages')
      .eq('id', jobId)
      .single()

    if (fullJob) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = fullJob.state as any
      if (step === 'illustrate_page') {
        const completedPages = (state?.pages as unknown[])?.length ?? 0
        stepParams = { page: String(completedPages + 1) }
      } else {
        const completedAudio = (state?.audio as unknown[])?.length ?? 0
        stepParams = { page: String(completedAudio + 1) }
      }
    }
  }

  triggerNextStep(jobId, step, stepParams)

  return NextResponse.json({ ok: true, step, retrying: true })
}
