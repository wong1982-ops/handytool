import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { estimateCredits, type ArtStyle, type DurationPreset, type VideoProviderType, PIPELINE_STEPS, type PipelineStep, type StepStatus } from '@/tools/story-video/types'

/** Use admin client in dev (bypasses RLS), user client in prod */
async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/story-video/create — Create a new story video generation job.
 * Validates auth, deducts credits, fetches book title, and inserts job row.
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

  const { bookId, artStyle, targetDuration, provider } = body as {
    bookId?: string
    artStyle?: ArtStyle
    targetDuration?: DurationPreset
    provider?: VideoProviderType
  }

  if (!bookId?.trim()) {
    return apiError('bookId is required', 'VALIDATION_ERROR', 400)
  }

  const resolvedArtStyle: ArtStyle = artStyle ?? 'cartoon'
  const resolvedDuration: DurationPreset = targetDuration ?? 'auto'
  const resolvedProvider: VideoProviderType = provider ?? 'gemini'

  const supabase = await getSupabase()

  // Fetch book from books table
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('id, user_id, title, page_count')
    .eq('id', bookId)
    .single()

  if (bookError) {
    console.error('[story-video/create] Book query error:', bookError.message, bookError.code)
    return apiError(`Book not found: ${bookError.message}`, 'NOT_FOUND', 404)
  }

  if (!book) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  // Ensure the book belongs to the authenticated user (skip in dev — user IDs may differ)
  if (book.user_id !== userId && process.env.NODE_ENV !== 'development' && !process.env.DEV_USER_ID) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  const pageCount: number = (book.page_count as number) ?? 8
  const creditsRequired = estimateCredits(pageCount, resolvedDuration)

  // Reserve credits in production
  if (process.env.NODE_ENV !== 'development' && !process.env.DEV_USER_ID) {
    const { error: reserveError } = await (await createClient()).rpc('reserve_credits', {
      p_user_id: userId,
      p_amount: creditsRequired,
      p_description: `Story Video — ${resolvedDuration} duration (${resolvedArtStyle} style)`,
    })

    if (reserveError) {
      const isInsufficient = reserveError.message?.includes('insufficient_credits')
      return isInsufficient
        ? apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402, {
            required: creditsRequired,
            message: 'You do not have enough credits to generate a story video.',
          })
        : API_ERRORS.INTERNAL()
    }
  }

  // Build default step statuses
  const defaultSteps = PIPELINE_STEPS.reduce(
    (acc, step) => ({ ...acc, [step]: 'pending' as StepStatus }),
    {} as Record<PipelineStep, StepStatus>,
  )

  // Insert job row
  const { data: job, error: insertError } = await supabase
    .from('story_video_jobs')
    .insert({
      user_id: userId,
      book_id: bookId,
      book_title: (book.title as string) ?? 'Untitled Book',
      art_style: resolvedArtStyle,
      provider: resolvedProvider,
      target_duration: resolvedDuration,
      status: 'pending',
      current_step: 'characterLock',
      steps: defaultSteps,
      scene_status: [],
      artifacts: {},
      credits_charged: creditsRequired,
    })
    .select('id')
    .single()

  if (insertError || !job) {
    console.error('[story-video/create] Failed to insert job:', insertError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ jobId: job.id }, 201)
}
