import { withJobStep } from '@/lib/story/job-step'
import { validateAndFix, generateSlug } from '@/lib/story/enrich'
import type { StoryConcept } from '@/lib/story/types'

export const POST = withJobStep('validate', async (ctx) => {
  const { job, supabase } = ctx
  const { concept } = job.input as { concept: StoryConcept }

  // Idempotent
  if (job.state.validated) {
    return { statePatch: {} }
  }

  const bible = job.state.bible
  const draft = job.state.draft as Record<string, unknown>

  if (!bible || !draft) {
    throw new Error('Bible or draft missing — cannot validate')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storyData = await validateAndFix(bible as any, draft)
  const slug = generateSlug((storyData as Record<string, unknown>).title as string || concept.title)

  // Determine author name
  let authorName = 'Anonymous'
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', job.user_id)
      .single()
    if (profile?.display_name) authorName = profile.display_name
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
