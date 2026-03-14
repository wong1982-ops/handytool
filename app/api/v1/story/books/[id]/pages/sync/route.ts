import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

/**
 * POST /api/v1/story/books/:id/pages/sync
 *
 * Ensures all pages from the book's JSONB data column exist in the
 * normalized `book_pages` table (upsert by book_id + sequence).
 * Returns the page IDs mapped by sequence number.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: bookId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Load book JSONB
  const { data: books, error: bookErr } = await supabase.rpc('get_book_by_id', {
    p_user_id: userId,
    p_book_id: bookId,
  })

  const book = (books || [])[0]
  if (bookErr || !book) return apiError('Book not found', 'NOT_FOUND', 404)

  const bookData = (book.data as Record<string, unknown>) || {}
  const rawPages = (bookData.pages as Record<string, unknown>[]) ?? []

  if (rawPages.length === 0) {
    return apiSuccess({ pages: [] })
  }

  // Upsert each page into book_pages via the insert_book_page RPC (ON CONFLICT upsert)
  const results: { sequence: number; pageId: string }[] = []

  for (const p of rawPages) {
    const seq = p.sequence as number
    const dialogue = (p.dialogue as { speaker: string; line: string }[]) ?? []

    const { data: pageId, error: insertErr } = await supabase.rpc('insert_book_page', {
      p_user_id: userId,
      p_book_id: bookId,
      p_sequence: seq,
      p_scene_description: (p.sceneDescription as string) || null,
      p_narrative_text: (p.narrativeText as string) || null,
      p_image_prompt: (p.imagePrompt as string) || null,
      p_dialogue: JSON.stringify(dialogue),
      p_mood: (p.mood as string) || null,
    })

    if (insertErr) {
      console.error(`[pages/sync] insert_book_page seq=${seq} failed:`, insertErr.message)
      continue
    }

    results.push({ sequence: seq, pageId: pageId as string })
  }

  return apiSuccess({ pages: results })
}
