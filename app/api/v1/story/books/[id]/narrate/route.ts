import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
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

  // Verify book ownership
  const { data: book } = await supabase
    .from('books')
    .select('id, series_id')
    .eq('id', bookId)
    .eq('user_id', userId)
    .single()
  if (!book) return apiError('Book not found', 'NOT_FOUND', 404)

  // Fetch page content
  const { data: page } = await supabase
    .from('book_pages')
    .select('id, sequence, narrative_text, dialogue')
    .eq('id', pageId)
    .eq('book_id', bookId)
    .single()
  if (!page) return apiError('Page not found', 'NOT_FOUND', 404)

  // Reserve credits
  const adminClient = getAdminSupabase() as any
  const { data: reserveData, error: reserveErr } = await adminClient.rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: CREDIT_COST,
    p_description: `Story Studio — narration page ${page.sequence}`,
  })
  const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData
  if (reserveErr || !reservation?.reservation_id) {
    return apiError('Insufficient credits', 'INSUFFICIENT_CREDITS', 402)
  }

  try {
    // Build voice map
    const dialogueSpeakers = (page.dialogue as { speaker: string; line: string }[] ?? [])
      .map(d => d.speaker)
      .filter((v, i, a) => a.indexOf(v) === i)

    let characterVoices: Record<string, string> = {}
    if (dialogueSpeakers.length > 0) {
      const { data: chars } = await supabase
        .from('characters')
        .select('name, voice')
        .eq('user_id', userId)
        .in('name', dialogueSpeakers)
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
      page.dialogue as { speaker: string; line: string }[] | undefined,
      finalVoiceMap,
    )

    if (segments.length === 0) {
      await adminClient.rpc('release_reserved_credits', {
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

    // Store result
    const { data: existing } = await supabase
      .from('page_audio')
      .select('id')
      .eq('book_page_id', pageId)
      .single()

    const audioData = {
      book_page_id: pageId,
      audio_url: result.audioUrl,
      status: 'done' as const,
      voice_map: finalVoiceMap,
      duration_seconds: null,
    }

    if (existing) {
      await supabase.from('page_audio').update(audioData).eq('id', existing.id)
    } else {
      await supabase.from('page_audio').insert(audioData)
    }

    // Confirm credits
    await adminClient.rpc('confirm_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_description: `Story Studio — narration page ${page.sequence}`,
    })

    return apiSuccess({
      audioUrl: result.audioUrl,
      voiceMap: finalVoiceMap,
      pageId,
    })
  } catch (e) {
    await adminClient.rpc('release_reserved_credits', {
      p_reservation_id: reservation.reservation_id,
      p_reason: `Failed: ${e instanceof Error ? e.message : 'Unknown'}`,
    })

    const { data: existingAudio } = await supabase
      .from('page_audio')
      .select('id')
      .eq('book_page_id', pageId)
      .single()

    if (existingAudio) {
      await supabase.from('page_audio').update({ status: 'error', voice_map: {} }).eq('id', existingAudio.id)
    } else {
      await supabase.from('page_audio').insert({ book_page_id: pageId, status: 'error', voice_map: {} })
    }

    return apiError(
      e instanceof Error ? e.message : 'Failed to generate narration',
      'GENERATION_ERROR',
      500,
    )
  }
}

export const maxDuration = 120
