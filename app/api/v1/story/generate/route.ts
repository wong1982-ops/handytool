import { createClient } from '@/lib/supabase/server'
import { API_ERRORS } from '@/lib/api/response'
import { generateRequestSchema } from '@/lib/story/types'
import { generateStoryText, generateSlug } from '@/lib/story/enrich'
import { generateIllustration, generateCharacterReference } from '@/lib/story/illustrate'
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
  let userId: string | undefined

  // Try to authenticate — generation works without login, but DB save requires it
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      userId = user.id
    } else if (process.env.NODE_ENV === 'development' && process.env.DEV_USER_ID) {
      // Dev mode: use configured user ID so books are saved to the correct account
      userId = process.env.DEV_USER_ID
    }

    // Deduct credits (skip in dev to allow free generation)
    if (userId && process.env.NODE_ENV !== 'development') {
      const { error: deductError } = await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: CREDIT_COSTS.generate,
        p_description: 'Story Studio — full book generation',
      })

      if (deductError) {
        return API_ERRORS.FORBIDDEN()
      }
    }
  } catch {
    // Auth unavailable — proceed without user
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

  const { plot, concept } = parsed.data

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(sseEvent(data)))
      }

      try {
        // Step 1: Generate story text
        send({ type: 'status', message: 'Writing your story...' })

        const storyData = await generateStoryText({ plot, concept })
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

        // Step 2: Generate character reference sheet for visual consistency
        const totalPages = book.pages.length

        const characters = book.characters.map((c: { name: string; description: string }) => ({
          name: c.name,
          description: c.description,
        }))

        send({ type: 'status', message: 'Creating character references...' })
        const referenceImage = await generateCharacterReference(characters, concept.tags.style)
        if (referenceImage) {
          send({ type: 'status', message: `Character reference ready! Illustrating cover + ${totalPages} pages...` })
        } else {
          send({ type: 'status', message: `Illustrating cover + ${totalPages} pages...` })
        }

        // Generate cover + page illustrations with concurrency limit (3 at a time) and retry
        const coverTask = async () => {
          try {
            const coverPrompt = `${concept.tags.style} style book cover illustration. ${concept.coverDescription}. Beautiful, cinematic, no text or words in the image.`
            const coverUrl = await withRetry(() => generateIllustration({
              imagePrompt: coverPrompt,
              characters,
              referenceImage: referenceImage ?? undefined,
            }))
            book.coverImageUrl = coverUrl
            send({ type: 'status', message: 'Cover done! Illustrating pages...' })
          } catch (err) {
            console.error('Cover illustration failed:', err)
          }
        }

        type ImageResult = { sequence: number; imageUrl: string | undefined; imageStatus: 'done' | 'error' }

        const pageTasks = book.pages.map((page: { sequence: number; imagePrompt: string }, index: number) => {
          return async (): Promise<ImageResult> => {
            try {
              const imageUrl = await withRetry(() => generateIllustration({
                imagePrompt: page.imagePrompt,
                characters,
                referenceImage: referenceImage ?? undefined,
              }))
              send({ type: 'image-done', page: index + 1, url: imageUrl })
              return { sequence: page.sequence, imageUrl, imageStatus: 'done' }
            } catch (err) {
              console.error(`Illustration failed for page ${index + 1}:`, err)
              send({ type: 'image-done', page: index + 1, url: '' })
              return { sequence: page.sequence, imageUrl: undefined, imageStatus: 'error' }
            }
          }
        })

        // Run cover first, then pages with concurrency limit of 3
        await coverTask()
        const imageResults = await runWithConcurrency<ImageResult>(pageTasks, 3)

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
        const voiceMap = assignVoices(book.characters as { name: string; role: 'protagonist' | 'antagonist' | 'supporting'; description: string }[])

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
        const audioTasks = remainingPages.map((page: { sequence: number; narrativeText: string; dialogue?: { speaker: string; line: string }[] }, index: number) => {
          return async (): Promise<AudioResult> => {
            try {
              // If locked to OpenAI, fall back to single-voice
              if (lockedProvider === 'openai') {
                const narration = buildPageNarration(page.narrativeText, page.dialogue)
                const result = await generatePageAudio({
                  text: narration,
                  bookId,
                  pageNumber: index + 2,
                  forceProvider: 'openai',
                })
                send({ type: 'audio-done', page: index + 2, url: result.audioUrl })
                return { sequence: page.sequence, audioUrl: result.audioUrl }
              }

              // Gemini multi-voice
              const segments = segmentPageAudio(page.narrativeText, page.dialogue, voiceMap)
              const result = await generateMultiVoicePageAudio({
                segments,
                bookId,
                pageNumber: index + 2,
                forceProvider: lockedProvider,
              })
              send({ type: 'audio-done', page: index + 2, url: result.audioUrl })
              return { sequence: page.sequence, audioUrl: result.audioUrl }
            } catch (err) {
              console.error(`TTS failed for page ${index + 2}:`, err)
              send({ type: 'audio-done', page: index + 2, url: '' })
              return { sequence: page.sequence, audioUrl: undefined as string | undefined }
            }
          }
        })

        const remainingResults = await runWithConcurrency<AudioResult>(audioTasks, 3)

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
            })

            // Revalidate static page
            revalidatePath(`/tools/story-studio/book/${slug}`)
          } catch (err) {
            console.error('Failed to save book to DB:', err)
            // Don't fail the whole generation for a save error
          }
        }

        send({ type: 'complete', data: finalBook, creditsUsed: CREDIT_COSTS.generate })
      } catch (err) {
        console.error('story/generate: failed', err)
        send({ type: 'error', message: err instanceof Error ? err.message : 'Generation failed' })

        // Refund credits on failure
        if (userId) {
          try {
            const supabase = await createClient()
            await supabase.rpc('refund_credits', {
              p_user_id: userId,
              p_amount: CREDIT_COSTS.generate,
              p_description: 'Story Studio — generation failed (refund)',
            })
          } catch {
            // Silently ignore refund failures
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
