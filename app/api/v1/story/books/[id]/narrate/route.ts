import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import {
  segmentPageAudio,
  generateMultiVoicePageAudio,
} from '@/lib/story/tts'
import { cloneVoice } from '@/lib/story/voice-clone'

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
    let chars: { id: string; name: string; voice: string | null }[] = []
    if (dialogueSpeakers.length > 0) {
      const { data: charRows } = await supabase.rpc('get_characters_by_names', {
        p_user_id: userId,
        p_names: dialogueSpeakers,
      })
      chars = (charRows ?? []) as typeof chars
      for (const c of chars) {
        if (c.voice) characterVoices[c.name] = c.voice
      }
    }

    const finalVoiceMap: Record<string, string> = {
      narrator: narratorVoice,
      ...characterVoices,
      ...(voiceOverrides ?? {}),
    }

    // Look up custom cloned voices for dialogue speakers
    const customVoiceMap: Record<string, { provider: string; providerVoiceId: string }> = {}

    if (dialogueSpeakers.length > 0) {
      const charIds = (chars ?? [])
        .filter((c: { id: string }) => c.id)
        .map((c: { id: string }) => c.id)

      if (charIds.length > 0) {
        const { data: voiceRows } = await supabase.rpc('get_character_voices_by_ids', {
          p_user_id: userId,
          p_character_ids: charIds,
        })

        for (const v of voiceRows ?? []) {
          if (v.status === 'ready' && v.provider && v.provider_voice_id) {
            const char = (chars ?? []).find((c: { id: string }) => c.id === v.character_id)
            if (char?.name) {
              customVoiceMap[char.name] = {
                provider: v.provider,
                providerVoiceId: v.provider_voice_id,
              }
            }
          } else if (v.status === 'recorded' && v.recording_url) {
            // Lazy clone: trigger cloning now
            try {
              const audioRes = await fetch(v.recording_url)
              const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
              const char = (chars ?? []).find((c: { id: string }) => c.id === v.character_id)
              const result = await cloneVoice({
                audioBuffer,
                characterName: char?.name || 'character',
              })

              await supabase.rpc('update_character_voice_provider', {
                p_user_id: userId,
                p_character_id: v.character_id,
                p_provider: result.provider,
                p_provider_voice_id: result.providerVoiceId,
                p_status: 'ready',
              })

              if (char?.name) {
                customVoiceMap[char.name] = {
                  provider: result.provider,
                  providerVoiceId: result.providerVoiceId,
                }
              }
            } catch (cloneErr) {
              const errMsg = cloneErr instanceof Error ? cloneErr.message : String(cloneErr)
              console.warn(`Lazy voice clone failed for character ${v.character_id}:`, cloneErr)
              await supabase.rpc('update_character_voice_provider', {
                p_user_id: userId,
                p_character_id: v.character_id,
                p_provider: null,
                p_provider_voice_id: null,
                p_status: 'error',
                p_error_message: errMsg.slice(0, 500),
              })
            }
          }
        }
      }
    }

    // Narrator custom voice resolution (if narratorVoice is a character UUID)
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (UUID_RE.test(narratorVoice)) {
      const { data: narratorVoiceRows } = await supabase.rpc('get_character_voices_by_ids', {
        p_user_id: userId,
        p_character_ids: [narratorVoice],
      })
      const nv = (narratorVoiceRows ?? [])[0]
      if (nv?.status === 'ready' && nv.provider && nv.provider_voice_id) {
        customVoiceMap['narrator'] = {
          provider: nv.provider,
          providerVoiceId: nv.provider_voice_id,
        }
      } else if (nv?.status === 'recorded' && nv.recording_url) {
        try {
          const audioRes = await fetch(nv.recording_url)
          const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
          const cloneResult = await cloneVoice({ audioBuffer, characterName: 'narrator' })
          await supabase.rpc('update_character_voice_provider', {
            p_user_id: userId,
            p_character_id: narratorVoice,
            p_provider: cloneResult.provider,
            p_provider_voice_id: cloneResult.providerVoiceId,
            p_status: 'ready',
          })
          customVoiceMap['narrator'] = {
            provider: cloneResult.provider,
            providerVoiceId: cloneResult.providerVoiceId,
          }
        } catch (cloneErr) {
          const errMsg = cloneErr instanceof Error ? cloneErr.message : String(cloneErr)
          console.warn(`Lazy voice clone failed for narrator character ${narratorVoice}:`, cloneErr)
          await supabase.rpc('update_character_voice_provider', {
            p_user_id: userId,
            p_character_id: narratorVoice,
            p_provider: null,
            p_provider_voice_id: null,
            p_status: 'error',
            p_error_message: errMsg.slice(0, 500),
          })
        }
      }
    }

    const segments = segmentPageAudio(
      page.narrative_text || '',
      dialogue.length > 0 ? dialogue : undefined,
      finalVoiceMap,
    )

    // Annotate segments with custom voice info
    for (const seg of segments) {
      if (customVoiceMap[seg.speaker]) {
        seg.customVoice = customVoiceMap[seg.speaker]
      }
    }

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
