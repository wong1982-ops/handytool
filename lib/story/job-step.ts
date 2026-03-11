/**
 * Shared wrapper for all job step routes.
 *
 * Each step route uses `withJobStep()` which handles:
 * 1. CRON_SECRET verification
 * 2. Load job from DB (input + state)
 * 3. Call the step handler
 * 4. Write result to state via `update_job_step` RPC
 * 5. Trigger next step (or handle errors)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { verifyCronSecret, triggerNextStep, triggerTtsBatch, getNextStep, type PipelineStep } from './queue'

/** Job row from the database. */
export interface JobRow {
  id: string
  user_id: string
  book_id: string | null
  series_id: string | null
  status: string
  current_step: string
  total_pages: number
  input: Record<string, unknown>
  state: Record<string, unknown>
  credits_reservation_id: string | null
  retry_count: number
  error_message: string | null
}

/** Context passed to step handlers. */
export interface StepContext {
  job: JobRow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  /** Query params from the request (e.g., page number) */
  params: Record<string, string>
}

/** Result returned by step handlers. */
export interface StepResult {
  /** JSONB patch to merge into job state */
  statePatch: Record<string, unknown>
  /** Override next step (optional — normally auto-computed) */
  nextStep?: PipelineStep
  /** Additional params for next step (e.g., { page: '2' }) */
  nextParams?: Record<string, string>
  /** If true, trigger TTS batch instead of normal next step */
  triggerTtsBatch?: boolean
  /** Set total_pages on the job (used after story_draft determines page count) */
  setTotalPages?: number
}

type StepHandler = (ctx: StepContext) => Promise<StepResult>

/**
 * Wrap a step handler with standard job-step boilerplate.
 *
 * Usage in a route:
 * ```ts
 * export const POST = withJobStep('story_bible', async (ctx) => {
 *   // do work using ctx.job.input and ctx.job.state
 *   return { statePatch: { bible: result } }
 * })
 * ```
 */
export function withJobStep(
  stepName: PipelineStep,
  handler: StepHandler,
) {
  return async (
    request: NextRequest,
    { params: routeParams }: { params: Promise<{ id: string }> },
  ) => {
    // 1. Verify secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await routeParams

    // 2. Load job from DB (service role — bypasses RLS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = getAdminSupabase()
    const { data: job, error: fetchError } = await supabase
      .from('book_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      console.error(`[job-step] Job ${jobId} not found:`, fetchError)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const jobRow = job as JobRow

    // Don't process completed jobs
    if (jobRow.status === 'completed') {
      console.log(`[job-step] Job ${jobId} already completed, skipping ${stepName}`)
      return NextResponse.json({ ok: true, skipped: true })
    }

    // Mark job as running
    if (jobRow.status === 'scheduled') {
      await supabase
        .from('book_jobs')
        .update({ status: 'running', updated_at: new Date().toISOString() })
        .eq('id', jobId)
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const queryParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      queryParams[key] = value
    })

    // 3. Execute step handler
    try {
      const result = await handler({
        job: jobRow,
        supabase,
        params: queryParams,
      })

      // 4. Write state to DB via RPC
      const currentPage = queryParams.page ? parseInt(queryParams.page, 10) : undefined

      // Determine the next step
      const nextStepInfo = result.nextStep
        ? { step: result.nextStep, params: result.nextParams }
        : getNextStep(stepName, {
            totalPages: result.setTotalPages ?? jobRow.total_pages,
            currentPage,
            completedTtsCount: result.triggerTtsBatch ? 0 : undefined,
          })

      const nextStepName = nextStepInfo === 'tts_batch'
        ? 'tts_page'
        : nextStepInfo
          ? nextStepInfo.step
          : stepName === 'save' ? 'done' : stepName

      const nextStatus = nextStepName === 'done' ? 'completed' : 'running'

      const { error: updateError } = await supabase.rpc('update_job_step', {
        p_job_id: jobId,
        p_step: stepName,
        p_state_patch: result.statePatch,
        p_next_step: nextStepName,
        p_status: nextStatus,
      })

      if (updateError) {
        console.error(`[job-step] Failed to update job ${jobId}:`, updateError)
        throw new Error(`DB update failed: ${updateError.message}`)
      }

      // Update total_pages if set by the handler
      if (result.setTotalPages !== undefined) {
        await supabase
          .from('book_jobs')
          .update({ total_pages: result.setTotalPages })
          .eq('id', jobId)
      }

      // 5. Trigger next step
      if (nextStepInfo === 'tts_batch') {
        triggerTtsBatch(jobId, result.setTotalPages ?? jobRow.total_pages)
      } else if (nextStepInfo && nextStepName !== 'done') {
        triggerNextStep(jobId, nextStepInfo.step, nextStepInfo.params)
      }

      return NextResponse.json({ ok: true, step: stepName, next: nextStepName })
    } catch (err) {
      console.error(`[job-step] Step ${stepName} failed for job ${jobId}:`, err)

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      const newRetryCount = jobRow.retry_count + 1

      if (newRetryCount >= 3) {
        // Park as failed after 3 retries
        await supabase.rpc('fail_job_step', {
          p_job_id: jobId,
          p_step: stepName,
          p_error: errorMessage,
          p_retry_count: newRetryCount,
        })

        // Release reserved credits on permanent failure
        if (jobRow.credits_reservation_id) {
          try {
            await supabase.rpc('release_reserved_credits', {
              p_reservation_id: jobRow.credits_reservation_id,
              p_reason: `Story Studio — generation failed at ${stepName}: ${errorMessage}`,
            })
          } catch (releaseErr) {
            console.error(`[job-step] Failed to release credits for job ${jobId}:`, releaseErr)
          }
        }

        return NextResponse.json({ error: errorMessage, parked: true }, { status: 500 })
      }

      // Increment retry count and let cron pick it up
      await supabase
        .from('book_jobs')
        .update({
          retry_count: newRetryCount,
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      return NextResponse.json({ error: errorMessage, retryCount: newRetryCount }, { status: 500 })
    }
  }
}
