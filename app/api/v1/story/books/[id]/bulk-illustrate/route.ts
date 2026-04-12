import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { triggerNextStep } from '@/lib/story/queue'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id: bookId } = await params
  const supabase = await createClient()

  // Load book via SECURITY DEFINER RPC (bypasses RLS)
  const { data: books, error: bookErr } = await supabase.rpc('get_book_by_id', {
    p_user_id: userId,
    p_book_id: bookId,
  })
  const book = Array.isArray(books) ? books[0] : books
  if (bookErr || !book) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  // Verify ownership
  if (book.user_id !== userId) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  const bookData = book.data as Record<string, unknown>

  // Check if book already has illustrations
  const pages = (bookData.pages ?? []) as Array<Record<string, unknown>>
  const pageCount = pages.length
  const hasIllustrations = pages.some((p) => !!p.imageUrl)
  if (hasIllustrations) {
    return apiError('Book already has illustrations', 'ALREADY_EXISTS', 409)
  }

  // Reserve credits (skip in dev mode)
  let reservationId: string | null = null
  if (process.env.NODE_ENV !== 'development') {
    const creditCost = pageCount * 5
    const { data: reserveData, error: reserveErr } = await supabase.rpc('reserve_credits', {
      p_user_id: userId,
      p_amount: creditCost,
      p_description: `Story Studio — bulk illustrate (${pageCount} pages)`,
    })
    const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData
    if (reserveErr || !reservation?.reservation_id) {
      return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
    }
    reservationId = reservation.reservation_id
  }

  // Create a job in book_jobs table
  const { data: jobId, error: insertError } = await supabase.rpc('create_book_job', {
    p_user_id: userId,
    p_series_id: book.series_id ?? null,
    p_total_pages: pageCount,
    p_input: {
      bookId: book.id,
      concept: bookData.concept,
      plot: '',
      characterIds: [],
      artStyle: (bookData.concept as any)?.tags?.style || 'watercolor',
      skipIllustration: false,
      skipAudio: true,
      skipValidation: true,
      mode: 'bulk-illustrate',
    },
    p_mode: 'bulk-illustrate',
  })

  if (insertError || !jobId) {
    // Release credits if reserved
    if (reservationId) {
      await supabase.rpc('release_reserved_credits', {
        p_reservation_id: reservationId,
        p_reason: 'Job creation failed',
      })
    }
    return API_ERRORS.INTERNAL()
  }

  // Seed job state with existing book data (skip bible/draft/validate steps)
  await supabase.rpc('update_job_step', {
    p_job_id: jobId,
    p_step: 'story_bible',
    p_state_patch: {
      bible: { seeded: true },
      draft: { seeded: true },
      validated: true,
      storyData: bookData,
      slug: book.slug,
      authorName: (bookData.authors as string[])?.[1] || 'Anonymous',
    },
  })

  // Trigger character_ref step (first illustration step)
  triggerNextStep(jobId, 'character_ref')

  return apiSuccess({
    message: `Generating illustrations for ${pageCount} pages`,
    pageCount,
    jobId,
  })
}
