import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  let authUserId: string | undefined
  try {
    const { data: { user } } = await supabase.auth.getUser()
    authUserId = user?.id
  } catch { /* no auth session */ }

  const effectiveUserId = authUserId
    || (process.env.NODE_ENV === 'development' ? process.env.DEV_USER_ID : undefined)

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
