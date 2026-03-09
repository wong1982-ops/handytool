import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const effectiveUserId = await getAuthUserId()
  const supabase = await createClient()

  // Use the same RPC as the server component page
  const { data, error } = await supabase.rpc('get_book_by_slug', {
    p_slug: slug,
    p_user_id: effectiveUserId ?? null,
  })

  if (error) {
    console.error('[api/books/by-slug] get_book_by_slug failed:', error.message)
    return API_ERRORS.INTERNAL()
  }

  const book = Array.isArray(data) ? data[0] : data
  if (!book) return API_ERRORS.NOT_FOUND('Book')

  return apiSuccess(book)
}
