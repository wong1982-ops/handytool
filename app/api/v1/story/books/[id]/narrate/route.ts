import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import {
  segmentPageAudio,
  generateMultiVoicePageAudio,
} from '@/lib/story/tts'

const narrateSchema = z.object({
  pageId: z.string().uuid(),
  narratorVoice: z.string().min(1),
  voiceMap: z.record(z.string()).optional(),
})

const CREDIT_COST = 3

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = narrateSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { pageId, narratorVoice, voiceMap: voiceOverrides } = parsed.data

  // Verify book ownership via SECURITY DEFINER RPC
  const { data: books, error: bookErr } = await supabase.rpc('get_book_by_id', {
    p_user_id: userId,
    p_book_id: bookId,
  })
  if (bookErr || !(books || [])[0]) return apiError('Book not found', 'NOT_FOUND', 404)

  // Fetch page content via SECURITY DEFINER RPC
  const { data: pageRows, error: pageErr } = await supabase.rpc('get_book_page_by_id', {
    p_user_id: userId,
    p_book_id: bookId,
    p_page_id: pageId,
  })
  const page = (pageRows || [])[0]
  if (pageErr || !page) return apiError('Page not found', 'NOT_FOUND', 404)

  // Reserve credits
  const { data: reserveData, error: reserveErr } = await supabase.rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_description: `Story Studio — narration page ${page.sequence}`,
  })
  const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData
  if (reserveErr || !reservation?.reservation_id) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  try {
    // Parse dialogue (may come as string from RPC or as object from direct query)
    const rawDialogue = page.dialogue
    const dialogue: { speaker: string; line: string }[] =
      typeof rawDialogue === 'string' ? JSON.parse(rawDialogue || '[]') :
      Array.isArray(rawDialogue) ? rawDialogue : []

    // Build voice map
    const dialogueSpeakers = dialogue
      .map((d: { speaker: string }) => d.speaker)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)

    let characterVoices: Record<string, string> = {}
    if (dialogueSpeakers.length > 0) {
      const { data: chars } = await supabase.rpc('get_characters_by_names', {
        p_user_id: userId,
        p_names: dialogueSpeakers,
      })
      for (const c of chars ?? []) {
        if (c.voice) characterVoices[c.name] = c.voice
      }
    }

    const finalVoiceMap: Record<string, string> = {
      narrator: narratorVoice,
      ...characterVoices,
      ...(voiceOverrides ?? {}),
    }

    const segments = segmentPageAudio(
      page.narrative_text || '',
      dialogue.length > 0 ? dialogue : undefined,
      finalVoiceMap,
    )

    if (segments.length === 0) {
      await supabase.rpc('release_reserved_credits', {
        p_reservation_id: reservation.reservation_id,
        p_reason: 'No audio segments to generate',
      })
      return apiError('Page has no text content to narrate', 'VALIDATION_ERROR', 400)
    }

    const result = await generateMultiVoicePageAudio({
      segments,
      bookId,
      pageNumber: page.sequence,
    })

    if (!result?.audioUrl) throw new Error('TTS returned no audio')

    // Store result via SECURITY DEFINER RPC
    await supabase.rpc('upsert_page_audio', {
      p_book_page_id: pageId,
      p_audio_url: result.audioUrl,
      p_status: 'done',
      p_voice_map: finalVoiceMap,
      p_duration_seconds: null,
    })

    // Confirm credits
    await supabase.rpc('confirm_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_description: `Story Studio — narration page ${page.sequence}`,
    })

    return apiSuccess({
      audioUrl: result.audioUrl,
      voiceMap: finalVoiceMap,
      pageId,
    })
  } catch (e) {
    await supabase.rpc('release_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_reason: `Failed: ${e instanceof Error ? e.message : 'Unknown'}`,
    })

    // Mark audio as error
    await supabase.rpc('upsert_page_audio', {
      p_book_page_id: pageId,
      p_status: 'error',
      p_voice_map: {},
    })

    return apiError(
      e instanceof Error ? e.message : 'Failed to generate narration',
      'GENERATION_ERROR',
      500,
    )
  }
}

export const maxDuration = 120
