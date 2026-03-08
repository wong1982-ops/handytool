import { createClient } from '@/lib/supabase/server'
import { API_ERRORS } from '@/lib/api/response'
import { generateRequestSchema } from '@/lib/story/types'
import { generateStoryText, generateSlug } from '@/lib/story/enrich'
import { generateIllustration } from '@/lib/story/illustrate'
import { generatePageAudio, buildPageNarration } from '@/lib/story/tts'
import { CREDIT_COSTS } from '@/lib/story/validation'
import { revalidatePath } from 'next/cache'

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function POST(request: Request) {
  const isDev = process.env.NODE_ENV === 'development'

  let userId: string | undefined

  if (!isDev) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return API_ERRORS.UNAUTHORIZED()
    }
    userId = user.id

    const { error: deductError } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: CREDIT_COSTS.generate,
      p_description: 'Story Studio — full book generation',
    })

    if (deductError) {
      return API_ERRORS.FORBIDDEN()
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

        const book = {
          id: bookId,
          slug,
          title: storyData.title || concept.title,
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

        // Step 2: Generate illustrations in parallel
        const totalPages = book.pages.length
        send({ type: 'status', message: `Illustrating ${totalPages} pages...` })

        const characters = book.characters.map((c: { name: string; description: string }) => ({
          name: c.name,
          description: c.description,
        }))

        const illustrationPromises = book.pages.map(async (page: { sequence: number; imagePrompt: string }, index: number) => {
          try {
            const imageUrl = await generateIllustration({
              imagePrompt: page.imagePrompt,
              characters,
            })
            send({ type: 'image-done', page: index + 1, url: imageUrl })
            return { sequence: page.sequence, imageUrl, imageStatus: 'done' as const }
          } catch (err) {
            console.error(`Illustration failed for page ${index + 1}:`, err)
            send({ type: 'image-done', page: index + 1, url: '' })
            return { sequence: page.sequence, imageUrl: undefined, imageStatus: 'error' as const }
          }
        })

        const imageResults = await Promise.all(illustrationPromises)

        // Merge illustration results
        let pagesWithImages = book.pages.map((page: Record<string, unknown>) => {
          const result = imageResults.find(r => r.sequence === page.sequence)
          return {
            ...page,
            imageUrl: result?.imageUrl || page.imageUrl,
            imageStatus: result?.imageStatus || 'error',
          }
        })

        // Step 3: Generate TTS audio in parallel
        send({ type: 'status', message: 'Recording narration...' })

        const audioPromises = pagesWithImages.map(async (page: { sequence: number; narrativeText: string; dialogue?: { speaker: string; line: string }[] }, index: number) => {
          try {
            const narration = buildPageNarration(page.narrativeText, page.dialogue)
            const audioUrl = await generatePageAudio({
              text: narration,
              bookId,
              pageNumber: index + 1,
            })
            send({ type: 'audio-done', page: index + 1, url: audioUrl })
            return { sequence: page.sequence, audioUrl }
          } catch (err) {
            console.error(`TTS failed for page ${index + 1}:`, err)
            send({ type: 'audio-done', page: index + 1, url: '' })
            return { sequence: page.sequence, audioUrl: undefined }
          }
        })

        const audioResults = await Promise.all(audioPromises)

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
          pages: pagesWithImages,
          status: 'complete' as const,
          updatedAt: new Date().toISOString(),
        }

        // Step 4: Save to database
        if (!isDev && userId) {
          try {
            const supabase = await createClient()
            await supabase.from('books').insert({
              user_id: userId,
              slug,
              data: finalBook,
              is_public: false,
            })

            // Revalidate static page
            revalidatePath(`/tools/story-studio/book/${slug}`)
          } catch (err) {
            console.error('Failed to save book to DB:', err)
            // Don't fail the whole generation for a save error
          }
        }

        send({ type: 'complete', data: finalBook })
      } catch (err) {
        console.error('story/generate: failed', err)
        send({ type: 'error', message: err instanceof Error ? err.message : 'Generation failed' })

        // Refund credits on failure
        if (!isDev && userId) {
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
