import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

interface RouteParams { params: Promise<{ id: string }> }

/**
 * GET /api/v1/story/books/:id/pages?offset=0&limit=4
 * Lazy-loads pages from a book's JSONB data.
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params
  const url = new URL(request.url)
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0)
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get('limit') || '4', 10) || 4))

  const userId = await getAuthUserId()
  const supabase = await createClient()

  const { data: pages, error } = await supabase.rpc('get_book_pages', {
    p_book_id: id,
    p_user_id: userId ?? null,
    p_offset: offset,
    p_limit: limit,
  })

  if (error) {
    console.error('[api/books/pages] get_book_pages failed:', error.message)
    return API_ERRORS.INTERNAL()
  }

  // Each row has { page_data: {...} } — unwrap to flat array
  const pageList = (pages || []).map((row: { page_data: unknown }) => row.page_data)

  return apiSuccess(pageList)
}
