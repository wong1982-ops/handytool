import { withJobStep } from '@/lib/story/job-step'
import { generateStoryBible, rephrasePlot, type SeriesBookSummary } from '@/lib/story/enrich'
import type { StoryConcept } from '@/lib/story/types'

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

export const POST = withJobStep('story_bible', async (ctx) => {
  const { job, supabase } = ctx
  const { plot, concept, seriesId } = job.input as {
    plot: string
    concept: StoryConcept
    seriesId?: string
  }

  // If already done (idempotent)
  if (job.state.bible) {
    return { statePatch: {} }
  }

  // Load series context if applicable
  let seriesExistingBooks: SeriesBookSummary[] = []
  if (seriesId) {
    try {
      const { data: existingBooks } = await supabase.rpc('get_series_books_data', {
        p_series_id: seriesId,
      })

      if (existingBooks?.length) {
        for (const b of existingBooks as { data: unknown }[]) {
          const bd = b.data as Record<string, unknown> | undefined
          if (!bd) continue
          const bookConcept = bd.concept as Record<string, unknown> | undefined
          const sections = bookConcept?.sections as Record<string, unknown> | undefined
          seriesExistingBooks.push({
            title: (bd.title as string) || 'Untitled',
            premise: (sections?.premise as string) || '',
            theme: (bd.theme as string) || '',
          })
        }
      }
    } catch (err) {
      console.error('[story-bible] Failed to load series books:', err)
    }
  }

  let storyBible
  try {
    storyBible = await generateStoryBible({
      plot,
      concept,
      seriesContext: seriesExistingBooks.length > 0 ? { existingBooks: seriesExistingBooks } : undefined,
    })
  } catch (bibleErr) {
    if (isContentBlocked(bibleErr)) {
      const safePlot = await rephrasePlot(plot)
      storyBible = await generateStoryBible({
        plot: safePlot,
        concept,
        seriesContext: seriesExistingBooks.length > 0 ? { existingBooks: seriesExistingBooks } : undefined,
      })
    } else {
      throw bibleErr
    }
  }

  return { statePatch: { bible: storyBible } }
})
