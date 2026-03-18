import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, API_ERRORS } from '@/lib/api/response'

/**
 * GET /api/v1/story/jobs/[id] — Get single job detail.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id: jobId } = await params
  const supabase = await createClient()

  // First try the lightweight active-jobs RPC (no state JSONB — fast and reliable)
  const { data: activeJobs } = await supabase.rpc('get_user_active_jobs', {
    p_user_id: userId,
  })

  const activeJob = (activeJobs || []).find(
    (j: { id: string }) => j.id === jobId,
  )

  if (activeJob) {
    // Active job found in lightweight RPC — fetch full row for state/input/retry_count
    const { data: fullRows } = await supabase.rpc('get_job_by_id', {
      p_job_id: jobId,
    })
    const fullJob = Array.isArray(fullRows) ? fullRows[0] : fullRows

    const jobState = (fullJob?.state as Record<string, unknown>) ?? {}
    const jobInput = (fullJob?.input as Record<string, unknown>) ?? {}

    return NextResponse.json({
      job: {
        id: activeJob.id,
        user_id: userId,
        book_id: null,
        status: activeJob.status,
        current_step: activeJob.current_step,
        total_pages: activeJob.total_pages,
        error_message: activeJob.error_message,
        retry_count: fullJob?.retry_count ?? 0,
        created_at: activeJob.created_at,
        updated_at: activeJob.updated_at,
        input: {
          concept: jobInput.concept ?? undefined,
          plot: jobInput.plot ?? undefined,
        },
        state: {
          coverUrl: jobState.coverUrl,
          characterRefUrl: jobState.characterRefUrl,
          pages: jobState.pages,
          audio: jobState.audio,
        },
      },
    })
  }

  // Job not in active list — it might be completed. Use get_job_by_id
  // but only to get book_id and status (the state JSONB may be huge).
  const { data: rows, error } = await supabase.rpc('get_job_by_id', {
    p_job_id: jobId,
  })

  const job = Array.isArray(rows) ? rows[0] : rows
  if (error || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Verify ownership
  if (job.user_id !== userId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Return response for completed jobs
  const state = job.state as Record<string, unknown> | undefined
  const input = job.input as Record<string, unknown> | undefined
  return NextResponse.json({
    job: {
      id: job.id,
      user_id: job.user_id,
      book_id: job.book_id,
      status: job.status,
      current_step: job.current_step,
      total_pages: job.total_pages,
      error_message: job.error_message,
      retry_count: job.retry_count ?? 0,
      created_at: job.created_at,
      updated_at: job.updated_at,
      input: {
        concept: input?.concept ?? undefined,
        plot: input?.plot ?? undefined,
      },
      state: {
        slug: state?.slug,
        bookId: state?.bookId,
        savedAt: state?.savedAt,
        coverUrl: state?.coverUrl,
        pages: state?.pages,
        audio: state?.audio,
      },
    },
  })
}

/**
 * DELETE /api/v1/story/jobs/[id] — Delete a stuck or failed job.
 * Uses SECURITY DEFINER RPC to bypass RLS (no DELETE policy on book_jobs).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: deleted, error } = await supabase.rpc('delete_book_job', {
    p_job_id: jobId,
    p_user_id: userId,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }

  if (!deleted) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
