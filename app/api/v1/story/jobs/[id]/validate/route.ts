import { withJobStep } from '@/lib/story/job-step'
import { validateAndFix, generateSlug } from '@/lib/story/enrich'
import type { StoryConcept } from '@/lib/story/types'

export const POST = withJobStep('validate', async (ctx) => {
  const { job, supabase } = ctx
  const { concept, seriesId, skipValidation } = job.input as {
    concept: StoryConcept
    seriesId?: string
    skipValidation?: boolean
  }

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

  // Early save: create the book as draft immediately so it appears in My Stories
  // Illustrations and audio will be added by later pipeline steps
  const existingBookId = (job.input as { bookId?: string }).bookId
  const bookMode = (job.input as { mode?: string }).mode || 'speed'
  let savedBookId = existingBookId || null

  if (!existingBookId && !job.book_id) {
    const rawPages = ((storyData as Record<string, unknown>)?.pages || []) as Record<string, unknown>[]
    const draftBook = {
      slug,
      title: ((storyData as Record<string, unknown>)?.title as string) || concept.title,
      authors: ['AI', authorName],
      concept,
      theme: ((storyData as Record<string, unknown>)?.theme as string) || '',
      setting: ((storyData as Record<string, unknown>)?.setting as string) || '',
      characters: (storyData as Record<string, unknown>)?.characters || [],
      pages: rawPages.map((page, i) => ({
        ...page,
        sequence: (page.sequence as number) ?? i + 1,
      })),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: insertedBookId, error: insertError } = await supabase.rpc('insert_book', {
      p_user_id: job.user_id,
      p_slug: slug,
      p_data: draftBook,
      p_is_public: false,
      p_series_id: seriesId ?? null,
      p_mode: bookMode,
    })

    if (!insertError && insertedBookId) {
      savedBookId = insertedBookId
      // Link the job to this book so later steps can find it
      await supabase.from('book_jobs').update({ book_id: insertedBookId }).eq('id', job.id)
    } else {
      console.warn('[validate] Early save failed, will retry at final save:', insertError?.message)
    }
  }

  return {
    statePatch: {
      validated: true,
      storyData,
      slug,
      authorName,
      ...(savedBookId ? { bookId: savedBookId } : {}),
    },
  }
})
