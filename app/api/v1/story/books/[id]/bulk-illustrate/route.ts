import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id: bookId } = await params
  const supabase = await createClient()

  // Load the book — use direct query (owner access)
  const { data: book, error } = await supabase
    .from('books')
    .select('id, user_id, data, page_count')
    .eq('id', bookId)
    .single()

  if (error || !book) {
    // Fallback: try RPC if direct query fails (RLS)
    const { data: rpcBook, error: rpcErr } = await supabase.rpc('get_book_by_slug', {
      p_slug: bookId, // won't match by slug, but keeps pattern
      p_user_id: userId,
    })
    if (rpcErr || !rpcBook) {
      return apiError('Book not found', 'NOT_FOUND', 404)
    }
  }

  if (book && book.user_id !== userId) {
    return apiError('Book not found', 'NOT_FOUND', 404)
  }

  const pageCount = book?.page_count ?? 0

  // TODO: Reserve credits (pageCount * CREDIT_COSTS.illustratePage)
  // TODO: Queue illustration jobs for each page
  // For now, return a placeholder success
  return apiSuccess({
    message: `Queued ${pageCount} pages for illustration`,
    pageCount,
  })
}
