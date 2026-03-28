import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const effectiveUserId = await getAuthUserId()
  if (!effectiveUserId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data: books, error } = await supabase.rpc('get_book_by_id', {
    p_user_id: effectiveUserId,
    p_book_id: id,
  })

  if (error) {
    console.error('story/books/[id] GET:', error)
    return API_ERRORS.INTERNAL()
  }

  const book = (books || [])[0]
  if (!book) return API_ERRORS.NOT_FOUND('Book')

  return apiSuccess(book)
}

// PATCH — update a page in a saved book
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const effectiveUserId = await getAuthUserId()
  if (!effectiveUserId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  let body: { pageSequence?: number; narrativeText?: string; sceneDescription?: string; dialogue?: { speaker: string; line: string }[]; mood?: string; imagePrompt?: string; imageUrl?: string; status?: string }
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  // Load current book
  const { data: books } = await supabase.rpc('get_book_by_id', {
    p_user_id: effectiveUserId,
    p_book_id: id,
  })
  const book = (books || [])[0]
  if (!book) return API_ERRORS.NOT_FOUND('Book')

  // Handle status update (e.g., mark as complete)
  if (body.status && !body.pageSequence) {
    const { error: statusError } = await supabase
      .from('book_jobs')
      .update({ status: body.status === 'complete' ? 'completed' : body.status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', effectiveUserId)

    if (statusError) {
      console.error('[story/books] Status update error:', statusError)
      return API_ERRORS.INTERNAL()
    }
    return apiSuccess({ updated: true })
  }

  if (!body.pageSequence || body.pageSequence < 1) {
    return apiError('pageSequence is required', 'VALIDATION_ERROR', 400)
  }

  const bookData = book.data as Record<string, unknown>
  const pages = bookData.pages as Record<string, unknown>[]

  // Find and update the page
  const pageIndex = pages.findIndex((p: Record<string, unknown>) => p.sequence === body.pageSequence)
  if (pageIndex === -1) return API_ERRORS.NOT_FOUND('Page')

  if (body.narrativeText !== undefined) pages[pageIndex].narrativeText = body.narrativeText
  if (body.sceneDescription !== undefined) pages[pageIndex].sceneDescription = body.sceneDescription
  if (body.dialogue !== undefined) pages[pageIndex].dialogue = body.dialogue
  if (body.mood !== undefined) pages[pageIndex].mood = body.mood
  if (body.imagePrompt !== undefined) pages[pageIndex].imagePrompt = body.imagePrompt
  if (body.imageUrl !== undefined) pages[pageIndex].imageUrl = body.imageUrl

  bookData.pages = pages
  bookData.updatedAt = new Date().toISOString()

  // Save back
  const { error } = await supabase.rpc('update_book_data', {
    p_user_id: effectiveUserId,
    p_book_id: id,
    p_data: bookData,
  })

  if (error) {
    console.error('book update failed:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ success: true, page: pages[pageIndex] })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const effectiveUserId = await getAuthUserId()
  if (!effectiveUserId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  // Use RPC to bypass RLS (needed in dev when no auth session)
  const { error } = await supabase.rpc('delete_user_book', {
    p_user_id: effectiveUserId,
    p_book_id: id,
  })

  if (error) {
    console.error('story/books/delete: failed', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ deleted: true })
}
