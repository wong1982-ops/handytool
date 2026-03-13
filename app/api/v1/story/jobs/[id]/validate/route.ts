import { withJobStep } from '@/lib/story/job-step'
import { validateAndFix, generateSlug } from '@/lib/story/enrich'
import type { StoryConcept } from '@/lib/story/types'

export const POST = withJobStep('validate', async (ctx) => {
  const { job, supabase } = ctx
  const { concept, skipValidation } = job.input as { concept: StoryConcept; skipValidation?: boolean }

  // Idempotent
  if (job.state.validated) {
    return { statePatch: {} }
  }

  const bible = job.state.bible
  const draft = job.state.draft as Record<string, unknown>

  if (!bible || !draft) {
    throw new Error('Bible or draft missing — cannot validate')
  }

  // Speed mode: skip AI validation, use draft as-is
  // Quality mode: run full consistency check & auto-fix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storyData = skipValidation ? draft : await validateAndFix(bible as any, draft)
  const slug = generateSlug((storyData as Record<string, unknown>).title as string || concept.title)

  // Determine author name
  let authorName = 'Anonymous'
  try {
    const { data: displayName } = await supabase.rpc('get_profile_display_name', {
      p_user_id: job.user_id,
    })
    if (displayName) authorName = displayName
  } catch {
    // Fall back to Anonymous
  }

  return {
    statePatch: {
      validated: true,
      storyData,
      slug,
      authorName,
    },
  }
})
