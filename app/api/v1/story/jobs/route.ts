import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiError, API_ERRORS } from '@/lib/api/response'
import { generateRequestSchema } from '@/lib/story/types'
import { CREDIT_COSTS } from '@/lib/story/validation'
import { triggerNextStep } from '@/lib/story/queue'

/**
 * POST /api/v1/story/jobs — Create a new background generation job.
 * Validates input, checks concurrent job limit, reserves credits,
 * creates book_jobs row, triggers first step.
 * Returns { jobId } immediately (no SSE).
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return API_ERRORS.VALIDATION({ message: 'Invalid JSON body' })
  }

  const parsed = generateRequestSchema.safeParse(body)
  if (!parsed.success) {
    return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)
  }

  const { plot, concept, seriesId } = parsed.data
  const supabase = await createClient()

  // Check concurrent job limit (max 3 active jobs)
  const { data: activeCount } = await supabase.rpc('count_user_active_jobs', {
    p_user_id: userId,
  })
  if ((activeCount ?? 0) >= 3) {
    return apiError(
      'You have 3 books generating. Wait for one to finish.',
      'JOB_LIMIT_REACHED',
      429,
    )
  }

  // Reserve credits
  let reservationId: string | undefined
  if (process.env.NODE_ENV !== 'development') {
    const { data, error: reserveError } = await supabase.rpc('reserve_credits', {
      p_user_id: userId,
      p_amount: CREDIT_COSTS.generate,
      p_description: 'Story Studio — full book generation',
    })

    if (reserveError) {
      const isInsufficient = reserveError.message?.includes('insufficient_credits')
      return isInsufficient
        ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, {
            required: CREDIT_COSTS.generate,
            message: 'You do not have enough credits to generate a story book.',
          })
        : API_ERRORS.INTERNAL()
    }

    const row = Array.isArray(data) ? data[0] : data
    reservationId = row?.reservation_id
  }

  // Create job row
  const { data: job, error: insertError } = await supabase
    .from('book_jobs')
    .insert({
      user_id: userId,
      series_id: seriesId ?? null,
      status: 'scheduled',
      current_step: 'story_bible',
      total_pages: concept.tags.pageCount,
      input: { plot, concept, seriesId },
      state: {},
      credits_reservation_id: reservationId ?? null,
    })
    .select('id')
    .single()

  if (insertError || !job) {
    console.error('[jobs] Failed to create job:', insertError)
    // Release credits if job creation fails
    if (reservationId) {
      try {
        await supabase.rpc('release_reserved_credits', {
          p_reservation_id: reservationId,
          p_reason: 'Story Studio — job creation failed',
        })
      } catch { /* ignore */ }
    }
    return API_ERRORS.INTERNAL()
  }

  // Fire-and-forget: trigger the first step
  triggerNextStep(job.id, 'story_bible')

  return NextResponse.json({ jobId: job.id }, { status: 201 })
}

/**
 * GET /api/v1/story/jobs — List user's active/recent jobs.
 */
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_active_jobs', {
    p_user_id: userId,
  })

  if (error) {
    console.error('[jobs] Failed to fetch jobs:', error)
    return API_ERRORS.INTERNAL()
  }

  return NextResponse.json({ jobs: data ?? [] })
}
