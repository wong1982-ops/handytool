import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

function getEffectiveUserId(userId?: string) {
  return userId || (process.env.NODE_ENV === 'development' ? process.env.DEV_USER_ID : undefined)
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  let authUserId: string | undefined
  try {
    const { data: { user } } = await supabase.auth.getUser()
    authUserId = user?.id
  } catch { /* no auth session */ }

  const effectiveUserId = getEffectiveUserId(authUserId)
  if (!effectiveUserId) return API_ERRORS.UNAUTHORIZED()

  // Use RPC to bypass RLS
  const { data: books } = await supabase.rpc('get_user_books', {
    p_user_id: effectiveUserId,
  })

  const book = (books || []).find((b: Record<string, unknown>) => b.id === id)
  if (!book) return API_ERRORS.NOT_FOUND('Book')

  return apiSuccess(book)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const effectiveUserId = user?.id
    || (process.env.NODE_ENV === 'development' ? process.env.DEV_USER_ID : undefined)

  if (!effectiveUserId) return API_ERRORS.UNAUTHORIZED()

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
