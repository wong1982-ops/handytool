import { withJobStep } from '@/lib/story/job-step'
import { cleanupJobSeeds } from '@/lib/story/r2-seeds'
import { notifyBookComplete } from '@/lib/notifications/push'
import { emailBookComplete } from '@/lib/notifications/email'
import type { StoryConcept } from '@/lib/story/types'
import { revalidatePath } from 'next/cache'

export const POST = withJobStep('save', async (ctx) => {
  const { job, supabase } = ctx
  const { concept, seriesId } = job.input as {
    concept: StoryConcept
    seriesId?: string
  }

  // Idempotent — if already fully saved (not just early draft)
  if (job.book_id && job.state.savedAt) {
    return { statePatch: {} }
  }

  const storyData = job.state.storyData as Record<string, unknown>
  const slug = job.state.slug as string
  const authorName = job.state.authorName as string || 'Anonymous'
  const existingBookId = (job.input as { bookId?: string }).bookId
  const coverUrl = job.state.coverUrl as string | undefined
  const illustratedPages = (job.state.pages as { seq: number; imageUrl: string }[] | undefined) ?? []
  const audioPages = (job.state.audio as { seq: number; audioUrl: string }[] | undefined) ?? []
  const voiceMap = job.state.voiceMap as Record<string, string> | undefined

  const now = new Date().toISOString()
  const bookId = `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  // Merge illustrations and audio into pages
  const rawPages = (storyData?.pages || []) as Record<string, unknown>[]
  const pagesWithAssets = rawPages.map((page, i) => {
    const seq = (page.sequence as number) ?? i + 1
    const illustration = illustratedPages.find(p => p.seq === seq)
    const audio = audioPages.find(a => a.seq === seq)
    return {
      ...page,
      sequence: seq,
      // For illustrations: use new if available, otherwise keep existing page data
      imageUrl: illustration?.imageUrl || (page.imageUrl as string) || '',
      imageStatus: illustration?.imageUrl ? 'done' : (page.imageStatus as string) || 'error',
      // For audio: use new if available, otherwise keep existing page data
      audioUrl: audio?.audioUrl || (page.audioUrl as string) || undefined,
    }
  })

  const finalBook = {
    id: existingBookId || bookId,
    slug,
    title: (storyData?.title as string) || concept.title,
    authors: ['AI', authorName],
    coverImageUrl: coverUrl || (storyData?.coverImageUrl as string) || undefined,
    concept,
    theme: (storyData?.theme as string) || '',
    setting: (storyData?.setting as string) || '',
    characters: storyData?.characters || [],
    pages: pagesWithAssets,
    voiceMap,
    status: 'complete' as const,
    createdAt: now,
    updatedAt: now,
  }

  // Save to books table via SECURITY DEFINER RPC (step routes have no user session)
  const bookMode = (job.input as { mode?: string }).mode || 'speed'

  // Check if this is a bulk job updating an existing book
  const isBulkMode = existingBookId && (bookMode === 'bulk-illustrate' || bookMode === 'bulk-narrate')
  // Check if book was already created by validate step (early save)
  const earlySavedBookId = (job.state.bookId as string) || job.book_id || null

  let savedBookId: string

  if (isBulkMode) {
    // Update existing book's data with new illustrations/audio
    const { error: updateError } = await supabase.rpc('update_book_data', {
      p_user_id: job.user_id,
      p_book_id: existingBookId,
      p_data: finalBook,
    })

    if (updateError) {
      console.error('[save] Failed to update book:', updateError)
      throw new Error(`Failed to update book: ${updateError.message}`)
    }

    savedBookId = existingBookId

    await supabase.rpc('complete_job', {
      p_job_id: job.id,
      p_book_id: savedBookId,
    })
  } else if (earlySavedBookId) {
    // Book was already created by validate step — update it with final assets
    const { error: updateError } = await supabase.rpc('update_book_data', {
      p_user_id: job.user_id,
      p_book_id: earlySavedBookId,
      p_data: finalBook,
    })

    if (updateError) {
      console.error('[save] Failed to update early-saved book:', updateError)
      throw new Error(`Failed to update book: ${updateError.message}`)
    }

    savedBookId = earlySavedBookId

    await supabase.rpc('complete_job', {
      p_job_id: job.id,
      p_book_id: savedBookId,
    })
  } else {
    // Fallback: insert new book via RPC (if early save failed)
    const { data: insertedBookId, error: insertError } = await supabase.rpc('insert_book', {
      p_user_id: job.user_id,
      p_slug: slug,
      p_data: finalBook,
      p_is_public: false,
      p_series_id: seriesId ?? null,
      p_mode: bookMode,
    })

    if (insertError || !insertedBookId) {
      console.error('[save] Failed to save book:', insertError)
      throw new Error(`Failed to save book: ${insertError?.message || 'No book ID returned'}`)
    }

    savedBookId = insertedBookId

    await supabase.rpc('complete_job', {
      p_job_id: job.id,
      p_book_id: savedBookId,
    })
  }

  // Set has_audio / has_illustrations flags based on job mode
  const flagUpdate: Record<string, boolean> = {}
  if (bookMode === 'bulk-illustrate') {
    flagUpdate.has_illustrations = true
  } else if (bookMode === 'bulk-narrate') {
    flagUpdate.has_audio = true
  } else {
    // speed/professional mode — check the generated pages
    const pages = Array.isArray(finalBook.pages) ? finalBook.pages : []
    if (pages.some((p: Record<string, unknown>) => p.imageUrl)) flagUpdate.has_illustrations = true
    if (pages.some((p: Record<string, unknown>) => p.audioUrl)) flagUpdate.has_audio = true
  }
  if (Object.keys(flagUpdate).length > 0) {
    await supabase.from('books').update(flagUpdate).eq('id', savedBookId)
  }

  // Confirm credit reservation
  if (job.credits_reservation_id) {
    try {
      const { data: confirmResult } = await supabase.rpc('confirm_reserved_credits', {
        p_reservation_id: job.credits_reservation_id,
        p_description: `Story Studio — ${finalBook.title}`,
      })

      const confirmRow = Array.isArray(confirmResult) ? confirmResult[0] : confirmResult
      const txnId = confirmRow?.transaction_id
      if (txnId) {
        await supabase.rpc('update_credit_transaction_metadata', {
          p_txn_id: txnId,
          p_metadata: {
            reservation_id: job.credits_reservation_id,
            book_slug: slug,
            book_title: finalBook.title,
          },
        })
      }
    } catch (err) {
      console.error('[save] Failed to confirm credits:', err)
    }
  }

  // Cleanup seed buffers from R2
  await cleanupJobSeeds(job.id, job.total_pages)

  // Revalidate static pages
  try {
    revalidatePath(`/tools/story-studio/book/${slug}`)
  } catch { /* ignore */ }

  // Send notifications (fire-and-forget — don't block save completion)
  Promise.allSettled([
    notifyBookComplete(job.user_id, finalBook.title, slug, coverUrl),
    emailBookComplete(job.user_id, finalBook.title, slug, coverUrl),
  ]).catch(() => { /* ignore notification failures */ })

  return {
    statePatch: {
      bookId: savedBookId,
      savedAt: now,
    },
  }
})
