import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { triggerNextStep } from '@/lib/story/queue'
import { z } from 'zod'

const bodySchema = z.object({
  narratorVoice: z.string().optional(),
  voiceMap: z.record(z.string()).optional(),
  narrationLanguage: z.enum(['en', 'zh']).optional(),
}).optional()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id: bookId } = await params
  const supabase = await createClient()

  // Parse optional body (voice selection)
  let narratorVoice: string | undefined
  let voiceMap: Record<string, string> | undefined
  let narrationLanguage: 'en' | 'zh' | undefined
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (parsed.success && parsed.data) {
      narratorVoice = parsed.data.narratorVoice
      voiceMap = parsed.data.voiceMap
      narrationLanguage = parsed.data.narrationLanguage
    }
  } catch {
    // Empty body is fine — use defaults
  }

  // Load book via SECURITY DEFINER RPC (bypasses RLS)
  const { data: books, error: bookErr } = await supabase.rpc('get_book_by_id', {
    p_user_id: userId,
    p_book_id: bookId,
  })
  const book = (books || [])[0]
  if (bookErr || !book) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  // Verify ownership
  if (book.user_id !== userId) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  const bookData = book.data as Record<string, unknown>

  // Get page count from pages array
  const pages = (bookData.pages ?? []) as Array<Record<string, unknown>>
  const pageCount = pages.length

  // Check if book already has narration (pages with audioUrl)
  const hasNarration = pages.some((p) => !!p.audioUrl)
  if (hasNarration) {
    return apiError('Book already has narration', 'ALREADY_EXISTS', 409)
  }

  // Reserve credits (skip in dev mode)
  let reservationId: string | null = null
  if (process.env.NODE_ENV !== 'development') {
    const creditCost = pageCount * 3
    const { data: reserveData, error: reserveErr } = await supabase.rpc('reserve_credits', {
      p_user_id: userId,
      p_amount: creditCost,
      p_description: `Story Studio — bulk narrate (${pageCount} pages)`,
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
      skipIllustration: true,
      skipAudio: false,
      skipValidation: true,
      mode: 'bulk-narrate',
      narratorVoice: narratorVoice || undefined,
      voiceMapOverride: voiceMap || undefined,
      narrationLanguage: narrationLanguage || undefined,
    },
    p_mode: 'bulk-narrate',
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
  // Also include existing illustrations so the save step can preserve them
  const existingPages = pages
    .filter((p: any) => p.imageUrl)
    .map((p: any) => ({ seq: p.sequence, imageUrl: p.imageUrl }))

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
      // Preserve existing illustrations
      coverUrl: bookData.coverImageUrl || undefined,
      pages: existingPages.length > 0 ? existingPages : undefined,
    },
  })

  // Trigger TTS batch — start with page 1
  triggerNextStep(jobId, 'tts_page', { page: '1' })

  return apiSuccess({
    message: `Generating narration for ${pageCount} pages`,
    pageCount,
    jobId,
    narratorVoice: narratorVoice || 'default',
  })
}
