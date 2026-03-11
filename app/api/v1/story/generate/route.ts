/**
 * @deprecated Use POST /api/v1/story/jobs instead.
 * This SSE-based generation route is kept temporarily for rollback safety.
 * The new queue-based flow provides checkpoint/resume and background generation.
 */
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiError, API_ERRORS } from '@/lib/api/response'
import { generateRequestSchema } from '@/lib/story/types'
import { generateStoryBible, generateStoryDraft, validateAndFix, generateSlug, rephrasePlot, type SeriesBookSummary } from '@/lib/story/enrich'
import { generateIllustration, generateCharacterReference, type CharacterReference } from '@/lib/story/illustrate'
import {
  assignVoices,
  segmentPageAudio,
  generateMultiVoicePageAudio,
  buildPageNarration,
  generatePageAudio,
  type TtsProvider,
} from '@/lib/story/tts'
import { CREDIT_COSTS } from '@/lib/story/validation'
import { revalidatePath } from 'next/cache'

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

/** Check if an error is a Gemini PROHIBITED_CONTENT block */
function isContentBlocked(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes('PROHIBITED_CONTENT') ||
           err.message.includes('Text not available') ||
           err.message.includes('SAFETY') ||
           err.message.includes('blocked')
  }
  return false
}


/** Run async tasks with limited concurrency */
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < tasks.length) {
      const idx = nextIndex++
      results[idx] = await tasks[idx]()
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()))
  return results
}

/** Retry an async function with exponential backoff */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxRetries) throw err
      const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error('Unreachable')
}

export async function POST(request: Request) {
  let reservationId: string | undefined

  // Authenticate — generation requires login (for credit reservation)
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Reserve credits atomically (prevents parallel requests from double-spending)
  if (userId && process.env.NODE_ENV !== 'development') {
    try {
      const supabase = await createClient()
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

      // RPC returns array (RETURNS TABLE), take first row
      const row = Array.isArray(data) ? data[0] : data
      reservationId = row?.reservation_id
    } catch {
      return API_ERRORS.INTERNAL()
    }
  }

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

  // If series: load approved character reference images, voice preferences, and existing book summaries
  let seriesReferenceImages: { name: string; description: string; buffer: Buffer }[] = []
  let seriesVoicePreferences: Record<string, string> = {}
  let seriesExistingBooks: SeriesBookSummary[] = []
  if (seriesId) {
    try {
      const supabase = await createClient()
      const { data: seriesData } = await supabase.rpc('get_series_with_characters', {
        p_series_id: seriesId,
        p_user_id: userId ?? null,
      })
      const series = Array.isArray(seriesData) ? seriesData?.[0] : seriesData
      if (series) {
        const chars = (series.characters as { name: string; description: string; referenceImageUrl?: string; status: string; voice?: string | null }[]) || []

        // Collect voice preferences
        for (const c of chars) {
          if (c.voice) seriesVoicePreferences[c.name] = c.voice
        }

        const approvedChars = chars.filter(c => c.status === 'approved' && c.referenceImageUrl)
        for (const c of approvedChars) {
          try {
            const res = await fetch(c.referenceImageUrl!)
            if (res.ok) {
              const buf = Buffer.from(await res.arrayBuffer())
              seriesReferenceImages.push({ name: c.name, description: c.description, buffer: buf })
            }
          } catch { /* skip failed downloads */ }
        }
      }

      // Load existing books in the series for continuity context + voice consistency
      const { data: existingBooks } = await supabase
        .from('books')
        .select('data')
        .eq('series_id', seriesId)
        .order('created_at', { ascending: true })

      if (existingBooks?.length) {
        for (const b of existingBooks) {
          const bd = b.data as Record<string, unknown> | undefined
          if (!bd) continue
          const bookConcept = bd.concept as Record<string, unknown> | undefined
          const sections = bookConcept?.sections as Record<string, unknown> | undefined
          seriesExistingBooks.push({
            title: (bd.title as string) || 'Untitled',
            premise: (sections?.premise as string) || '',
            theme: (bd.theme as string) || '',
          })

          // Carry forward narrator voice from first book for consistency
          const bookVoiceMap = bd.voiceMap as Record<string, string> | undefined
          if (bookVoiceMap?.narrator && !seriesVoicePreferences['__narrator__']) {
            seriesVoicePreferences['__narrator__'] = bookVoiceMap.narrator
          }
        }
      }
    } catch (err) {
      console.error('[story] Failed to load series references:', err)
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(sseEvent(data)))
      }

      try {
        // Step 1: Build Story Bible (grounding document)
        send({ type: 'status', message: 'Building story foundation...' })
        let storyBible
        try {
          storyBible = await generateStoryBible({
            plot,
            concept,
            seriesContext: seriesExistingBooks.length > 0 ? { existingBooks: seriesExistingBooks } : undefined,
          })
        } catch (bibleErr) {
          if (isContentBlocked(bibleErr)) {
            send({ type: 'status', message: 'Rephrasing your plot for safety compliance...' })
            const safePlot = await rephrasePlot(plot)
            send({ type: 'status', message: 'Retrying story foundation...' })
            storyBible = await generateStoryBible({
              plot: safePlot,
              concept,
              seriesContext: seriesExistingBooks.length > 0 ? { existingBooks: seriesExistingBooks } : undefined,
            })
          } else {
            throw bibleErr
          }
        }

        // Step 2: Write story draft grounded against Story Bible
        send({ type: 'status', message: 'Writing your story...' })
        let rawDraft
        try {
          rawDraft = await generateStoryDraft({ plot, concept }, storyBible)
        } catch (draftErr) {
          if (isContentBlocked(draftErr)) {
            send({ type: 'status', message: 'Rephrasing your plot for safety compliance...' })
            const safePlot = await rephrasePlot(plot)
            send({ type: 'status', message: 'Retrying story draft...' })
            rawDraft = await generateStoryDraft({ plot: safePlot, concept }, storyBible)
          } else {
            throw draftErr
          }
        }

        // Step 3: Validate & auto-fix against Story Bible
        send({ type: 'status', message: 'Reviewing for consistency...' })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const storyData = await validateAndFix(storyBible, rawDraft) as any
        const now = new Date().toISOString()
        const bookId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
        const slug = generateSlug(storyData.title || concept.title)

        // Determine authors
        let authorName = 'Anonymous'
        if (userId) {
          try {
            const supabase = await createClient()
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', userId)
              .single()
            if (profile?.display_name) authorName = profile.display_name
          } catch {
            // Fall back to Anonymous
          }
        }

        const book = {
          id: bookId,
          slug,
          title: storyData.title || concept.title,
          authors: ['AI', authorName],
          coverImageUrl: undefined as string | undefined,
          concept,
          theme: storyData.theme || '',
          setting: storyData.setting || '',
          characters: storyData.characters || [],
          pages: (storyData.pages || []).map((p: Record<string, unknown>, i: number) => ({
            ...p,
            sequence: i + 1,
            imageStatus: 'pending' as const,
          })),
          status: 'generating' as const,
          createdAt: now,
          updatedAt: now,
        }

        send({ type: 'story-ready', data: book })

        // Step 2: Character reference for visual consistency
        const totalPages = book.pages.length

        const characters = book.characters.map((c: { name: string; description: string }) => ({
          name: c.name,
          description: c.description,
        }))

        let referenceImage: Buffer | null = null
        let characterReferences: CharacterReference[] = []

        if (seriesReferenceImages.length > 0) {
          // Series mode: use per-character portraits as individual subject references
          characterReferences = seriesReferenceImages
          const charNames = seriesReferenceImages.map(r => r.name).join(', ')
          send({ type: 'status', message: `Using ${seriesReferenceImages.length} character portrait${seriesReferenceImages.length > 1 ? 's' : ''} (${charNames}) as consistency seeds. Illustrating cover + ${totalPages} pages...` })
        } else {
          // Standalone mode: generate a new reference sheet
          send({ type: 'status', message: 'Creating character reference sheet for consistency...' })
          referenceImage = await generateCharacterReference(characters, concept.tags.style)

          // Retry once if reference fails — it's important for consistency
          if (!referenceImage) {
            send({ type: 'status', message: 'Retrying character reference...' })
            referenceImage = await generateCharacterReference(characters, concept.tags.style)
          }

          if (referenceImage) {
            send({ type: 'status', message: `Character reference ready! Illustrating cover + ${totalPages} pages...` })
          } else {
            send({ type: 'status', message: `Illustrating cover + ${totalPages} pages (without reference)...` })
          }
        }

        // Strategy 1: Lock the Seed — same seed for all pages in this book
        const bookSeed = Math.floor(Math.random() * 2147483647)
        console.log(`[story] Book seed: ${bookSeed}, reference: ${referenceImage ? 'yes' : 'no'}`)

        // Generate cover first — its buffer becomes the first "previous page" for chaining
        let previousPageBuffer: Buffer | null = null

        try {
          const coverPrompt = `${concept.tags.style} style book cover illustration. ${concept.coverDescription}. Beautiful, cinematic, no text or words in the image.`
          send({ type: 'status', message: 'Illustrating cover...' })
          const coverResult = await withRetry(() => generateIllustration({
            imagePrompt: coverPrompt,
            characters,
            referenceImage: referenceImage ?? undefined,
            characterReferences: characterReferences.length > 0 ? characterReferences : undefined,
            seed: bookSeed,
            style: concept.tags.style,
          }))
          book.coverImageUrl = coverResult.url
          previousPageBuffer = coverResult.buffer
          send({ type: 'status', message: 'Cover done! Illustrating pages...' })
        } catch (err) {
          console.error('Cover illustration failed:', err)
        }

        type ImageResult = { sequence: number; imageUrl: string | undefined; imageStatus: 'done' | 'error' }

        // Strategy 5: Sequential generation — chain each page's buffer as previousPageImage
        // This ensures visual continuity: cover → page 1 → page 2 → ... → page N
        const imageResults: ImageResult[] = []

        for (let index = 0; index < book.pages.length; index++) {
          const page = book.pages[index] as { sequence: number; imagePrompt: string }
          try {
            send({ type: 'status', message: `Illustrating page ${index + 1} of ${totalPages}...` })
            const result = await withRetry(() => generateIllustration({
              imagePrompt: page.imagePrompt,
              characters,
              referenceImage: referenceImage ?? undefined,
              characterReferences: characterReferences.length > 0 ? characterReferences : undefined,
              previousPageImage: previousPageBuffer ?? undefined,
              seed: bookSeed,
              style: concept.tags.style,
            }))
            // Chain: this page's buffer becomes the next page's previousPageImage
            if (result.buffer) previousPageBuffer = result.buffer
            send({ type: 'image-done', page: index + 1, url: result.url })
            imageResults.push({ sequence: page.sequence, imageUrl: result.url, imageStatus: 'done' })
          } catch (err) {
            console.error(`Illustration failed for page ${index + 1}:`, err)
            send({ type: 'image-done', page: index + 1, url: '' })
            imageResults.push({ sequence: page.sequence, imageUrl: undefined, imageStatus: 'error' })
          }
        }

        // Merge illustration results
        let pagesWithImages = book.pages.map((page: Record<string, unknown>) => {
          const result = imageResults.find(r => r.sequence === page.sequence)
          return {
            ...page,
            imageUrl: result?.imageUrl || page.imageUrl,
            imageStatus: result?.imageStatus || 'error',
          }
        })

        // Step 3: Multi-voice TTS — assign voices, segment pages, generate & stitch
        send({ type: 'status', message: 'Recording narration with character voices...' })

        // Assign distinct voices to narrator + each character
        const voiceMap = assignVoices(
          book.characters as { name: string; role: 'protagonist' | 'antagonist' | 'supporting'; description: string }[],
          Object.keys(seriesVoicePreferences).length > 0 ? seriesVoicePreferences : undefined,
        )

        type AudioResult = { sequence: number; audioUrl: string | undefined }

        // Page 1 first to detect which TTS provider works
        let lockedProvider: TtsProvider | undefined
        let page1AudioUrl: string | undefined

        const firstPage = pagesWithImages[0] as { sequence: number; narrativeText: string; dialogue?: { speaker: string; line: string }[] } | undefined
        if (firstPage) {
          try {
            const segments = segmentPageAudio(firstPage.narrativeText, firstPage.dialogue, voiceMap)
            const result = await generateMultiVoicePageAudio({
              segments,
              bookId,
              pageNumber: 1,
            })
            lockedProvider = result.provider
            page1AudioUrl = result.audioUrl
            send({ type: 'audio-done', page: 1, url: result.audioUrl })
          } catch (err) {
            console.error('TTS failed for page 1:', err)
            send({ type: 'audio-done', page: 1, url: '' })
          }
        }

        // Remaining pages forced to same provider for consistency
        const remainingPages = pagesWithImages.slice(1)
        const audioTasks = remainingPages.map((pg: { sequence: number; narrativeText: string; dialogue?: { speaker: string; line: string }[] }, index: number) => {
          return async (): Promise<AudioResult> => {
            const pageNum = index + 2

            const generateAudio = async (): Promise<AudioResult> => {
              // If locked to OpenAI, fall back to single-voice
              if (lockedProvider === 'openai') {
                const narration = buildPageNarration(pg.narrativeText, pg.dialogue)
                const result = await generatePageAudio({
                  text: narration,
                  bookId,
                  pageNumber: pageNum,
                  forceProvider: 'openai',
                })
                return { sequence: pg.sequence, audioUrl: result.audioUrl }
              }

              // Gemini multi-voice
              const segments = segmentPageAudio(pg.narrativeText, pg.dialogue, voiceMap)
              const result = await generateMultiVoicePageAudio({
                segments,
                bookId,
                pageNumber: pageNum,
                forceProvider: lockedProvider,
              })
              return { sequence: pg.sequence, audioUrl: result.audioUrl }
            }

            // Retry TTS up to 2 times to reduce missing audio
            try {
              const result = await withRetry(generateAudio, 2)
              send({ type: 'audio-done', page: pageNum, url: result.audioUrl })
              return result
            } catch (err) {
              console.error(`TTS failed for page ${pageNum} after retries:`, err)
              send({ type: 'audio-done', page: pageNum, url: '' })
              return { sequence: pg.sequence, audioUrl: undefined as string | undefined }
            }
          }
        })

        // Reduce concurrency to 2 to avoid TTS rate limits
        const remainingResults = await runWithConcurrency<AudioResult>(audioTasks, 2)

        const audioResults: AudioResult[] = [
          { sequence: firstPage?.sequence ?? 1, audioUrl: page1AudioUrl },
          ...remainingResults,
        ]

        // Merge audio results
        pagesWithImages = pagesWithImages.map((page: Record<string, unknown>) => {
          const result = audioResults.find(r => r.sequence === page.sequence)
          return {
            ...page,
            audioUrl: result?.audioUrl || undefined,
          }
        })

        const finalBook = {
          ...book,
          coverImageUrl: book.coverImageUrl,
          pages: pagesWithImages,
          voiceMap,
          status: 'complete' as const,
          updatedAt: new Date().toISOString(),
        }

        // Step 4: Save to database
        if (userId) {
          try {
            const supabase = await createClient()
            // Use RPC to bypass RLS (needed in dev when no auth session)
            await supabase.rpc('insert_book', {
              p_user_id: userId,
              p_slug: slug,
              p_data: finalBook,
              p_is_public: false,
              p_series_id: seriesId ?? null,
            })

            // Revalidate static page
            revalidatePath(`/tools/story-studio/book/${slug}`)
          } catch (err) {
            console.error('Failed to save book to DB:', err)
            // Don't fail the whole generation for a save error
          }
        }

        // Confirm credit reservation (finalize the charge)
        if (reservationId) {
          try {
            const supabase = await createClient()
            const { data: confirmResult } = await supabase.rpc('confirm_reserved_credits', {
              p_reservation_id: reservationId,
              p_description: `Story Studio — ${finalBook.title}`,
            })

            // Enrich the transaction with book metadata for linking in transaction history
            const row = Array.isArray(confirmResult) ? confirmResult[0] : confirmResult
            const txnId = row?.transaction_id
            if (txnId) {
              await supabase
                .from('credit_transactions')
                .update({
                  metadata: {
                    reservation_id: reservationId,
                    book_slug: slug,
                    book_title: finalBook.title,
                  },
                })
                .eq('id', txnId)
            }
          } catch (err) {
            console.error('Failed to confirm credit reservation:', err)
          }
        }

        send({ type: 'complete', data: finalBook, creditsUsed: CREDIT_COSTS.generate })
      } catch (err) {
        console.error('story/generate: failed', err)
        send({ type: 'error', message: err instanceof Error ? err.message : 'Generation failed' })

        // Release reserved credits on failure (credits return to available balance)
        if (reservationId) {
          try {
            const supabase = await createClient()
            await supabase.rpc('release_reserved_credits', {
              p_reservation_id: reservationId,
              p_reason: 'Story Studio — generation failed',
            })
          } catch {
            // Silently ignore release failures — cleanup job will handle expired reservations
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
