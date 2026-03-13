import { withJobStep, type StepResult } from '@/lib/story/job-step'
import {
  assignVoices,
  segmentPageAudio,
  generateMultiVoicePageAudio,
  buildPageNarration,
  generatePageAudio,
  type TtsProvider,
} from '@/lib/story/tts'

export const POST = withJobStep('tts_page', async (ctx) => {
  const { job, supabase } = ctx
  const pageNum = parseInt(ctx.params.page, 10)
  const { seriesId } = job.input as { seriesId?: string }

  // Idempotent: check if this page's audio is already done
  const existingAudio = (job.state.audio as { seq: number; audioUrl: string }[] | undefined) ?? []
  if (existingAudio.find(a => a.seq === pageNum)) {
    // Check if all TTS pages are done
    const totalPages = job.total_pages
    if (existingAudio.length >= totalPages) {
      return { statePatch: {}, nextStep: 'save' as const }
    }
    return { statePatch: {} }
  }

  const storyData = job.state.storyData as Record<string, unknown>
  const allPages = (storyData?.pages || []) as {
    sequence: number
    narrativeText: string
    dialogue?: { speaker: string; line: string }[]
  }[]
  const page = allPages.find(p => p.sequence === pageNum)

  if (!page) {
    throw new Error(`Page ${pageNum} not found in story data`)
  }

  // Get or build voice map
  let voiceMap = job.state.voiceMap as Record<string, string> | undefined
  if (!voiceMap) {
    // Load series voice preferences if applicable
    let seriesVoicePreferences: Record<string, string> = {}
    if (seriesId) {
      try {
        const { data: seriesData } = await supabase.rpc('get_series_with_characters', {
          p_series_id: seriesId,
          p_user_id: job.user_id,
        })
        const series = Array.isArray(seriesData) ? seriesData?.[0] : seriesData
        if (series) {
          const chars = (series.characters as { name: string; voice?: string | null }[]) || []
          for (const c of chars) {
            if (c.voice) seriesVoicePreferences[c.name] = c.voice
          }
        }

        // Carry forward narrator voice from first book
        const { data: seriesBooks } = await supabase.rpc('get_series_books_data', {
          p_series_id: seriesId,
        })

        const firstBook = Array.isArray(seriesBooks) ? seriesBooks[0] : null
        if (firstBook) {
          const bd = firstBook.data as Record<string, unknown> | undefined
          const bookVoiceMap = bd?.voiceMap as Record<string, string> | undefined
          if (bookVoiceMap?.narrator && !seriesVoicePreferences['__narrator__']) {
            seriesVoicePreferences['__narrator__'] = bookVoiceMap.narrator
          }
        }
      } catch (err) {
        console.error('[tts-page] Failed to load series voice preferences:', err)
      }
    }

    const characters = (storyData?.characters || []) as { name: string; role: 'protagonist' | 'antagonist' | 'supporting'; description: string }[]
    voiceMap = assignVoices(
      characters,
      Object.keys(seriesVoicePreferences).length > 0 ? seriesVoicePreferences : undefined,
    )
  }

  const bookId = `job_${job.id}`
  let audioUrl: string | undefined
  let lockedProvider: TtsProvider | undefined = job.state.ttsProvider as TtsProvider | undefined

  try {
    if (lockedProvider === 'openai') {
      const narration = buildPageNarration(page.narrativeText, page.dialogue)
      const result = await generatePageAudio({
        text: narration,
        bookId,
        pageNumber: pageNum,
        forceProvider: 'openai',
      })
      audioUrl = result.audioUrl
    } else {
      const segments = segmentPageAudio(page.narrativeText, page.dialogue, voiceMap)
      const result = await generateMultiVoicePageAudio({
        segments,
        bookId,
        pageNumber: pageNum,
        forceProvider: lockedProvider,
      })
      audioUrl = result.audioUrl
      lockedProvider = result.provider
    }
  } catch (err) {
    console.error(`[tts-page] TTS failed for page ${pageNum}:`, err)
    // Don't fail the whole job — continue with empty audio
  }

  const updatedAudio = [...existingAudio, { seq: pageNum, audioUrl: audioUrl || '' }]
  const totalPages = job.total_pages

  // Build result
  const result: StepResult = {
    statePatch: {
      audio: updatedAudio,
      voiceMap,
      ttsProvider: lockedProvider,
    },
  }

  // Check if this is the last TTS page
  if (updatedAudio.length >= totalPages) {
    result.nextStep = 'save'
  } else if (process.env.NODE_ENV === 'development') {
    // Dev mode: TTS runs sequentially (not batched) to avoid Turbopack crashes.
    // Chain to the next TTS page explicitly.
    result.nextStep = 'tts_page'
    result.nextParams = { page: String(pageNum + 1) }
  }

  return result
})
