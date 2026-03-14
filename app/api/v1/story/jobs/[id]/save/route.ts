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

  // Idempotent
  if (job.book_id) {
    return { statePatch: {} }
  }

  const storyData = job.state.storyData as Record<string, unknown>
  const slug = job.state.slug as string
  const authorName = job.state.authorName as string || 'Anonymous'
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
      imageUrl: illustration?.imageUrl || '',
      imageStatus: illustration?.imageUrl ? 'done' : 'error',
      audioUrl: audio?.audioUrl || undefined,
    }
  })

  const finalBook = {
    id: bookId,
    slug,
    title: (storyData?.title as string) || concept.title,
    authors: ['AI', authorName],
    coverImageUrl: coverUrl,
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

  // Save to books table
  const { data: insertedBook, error: insertError } = await supabase.rpc('insert_book', {
    p_user_id: job.user_id,
    p_slug: slug,
    p_data: finalBook,
    p_is_public: false,
    p_series_id: seriesId ?? null,
  })

  if (insertError) {
    console.error('[save] Failed to save book:', insertError)
    throw new Error(`Failed to save book: ${insertError.message}`)
  }

  // Extract the book UUID from the RPC result
  // insert_book returns UUID directly (not an object)
  const row = Array.isArray(insertedBook) ? insertedBook[0] : insertedBook
  const savedBookId = typeof row === 'string' ? row : (row?.id || row?.book_id)

  // Complete the job
  if (savedBookId) {
    await supabase.rpc('complete_job', {
      p_job_id: job.id,
      p_book_id: savedBookId,
    })
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
