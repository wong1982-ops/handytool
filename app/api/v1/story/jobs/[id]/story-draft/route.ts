import { withJobStep } from '@/lib/story/job-step'
import { generateStoryDraft, rephrasePlot } from '@/lib/story/enrich'
import type { StoryConcept } from '@/lib/story/types'

function isContentBlocked(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes('PROHIBITED_CONTENT') ||
           err.message.includes('Text not available') ||
           err.message.includes('SAFETY') ||
           err.message.includes('blocked')
  }
  return false
}

export const POST = withJobStep('story_draft', async (ctx) => {
  const { job } = ctx
  const input = job.input as { plot: string; concept: StoryConcept; mode?: string }
  const { plot, concept } = input
  const mode = (input.mode as 'speed' | 'professional') || 'speed'
  const bible = job.state.bible

  // Idempotent
  if (job.state.draft) {
    return { statePatch: {} }
  }

  if (!bible) {
    throw new Error('Story bible not found in job state — cannot generate draft')
  }

  let rawDraft
  try {
    rawDraft = await generateStoryDraft({ plot, concept, mode }, bible as Parameters<typeof generateStoryDraft>[1])
  } catch (draftErr) {
    if (isContentBlocked(draftErr)) {
      const safePlot = await rephrasePlot(plot)
      rawDraft = await generateStoryDraft({ plot: safePlot, concept, mode }, bible as Parameters<typeof generateStoryDraft>[1])
    } else {
      throw draftErr
    }
  }

  // Store draft and set total pages
  const pages = (rawDraft as Record<string, unknown>).pages as unknown[]
  const totalPages = pages?.length ?? 0

  return {
    statePatch: { draft: rawDraft },
    setTotalPages: totalPages,
  }
})
