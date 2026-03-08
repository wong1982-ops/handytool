import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const supabase = await createClient()

  let authUserId: string | undefined
  try {
    const { data: { user } } = await supabase.auth.getUser()
    authUserId = user?.id
  } catch {
    // Auth failed — continue with dev fallback
  }

  const effectiveUserId = authUserId
    || (process.env.NODE_ENV === 'development' ? process.env.DEV_USER_ID : undefined)

  // Not logged in — return empty list (bookshelf uses localStorage as fallback)
  if (!effectiveUserId) return apiSuccess([])

  // Use RPC to bypass RLS (needed in dev when no auth session)
  const { data: books, error } = await supabase.rpc('get_user_books', {
    p_user_id: effectiveUserId,
  })

  if (error) {
    console.error('story/books: fetch failed', error)
    return API_ERRORS.INTERNAL()
  }

  // Return lightweight list (title, slug, cover, tags, dates)
  const list = (books || []).map((b: Record<string, unknown>) => {
    const bookData = b.data as Record<string, unknown>
    const concept = bookData.concept as Record<string, unknown> | undefined
    const tags = concept?.tags as Record<string, unknown> | undefined
    const pages = bookData.pages as { imageUrl?: string }[] | undefined

    return {
      id: b.id,
      slug: b.slug,
      title: bookData.title || 'Untitled',
      coverImageUrl: (bookData.coverImageUrl as string) || pages?.[0]?.imageUrl || null,
      audience: tags?.audience || '',
      style: tags?.style || '',
      pageCount: pages?.length || 0,
      isPublic: b.is_public,
      createdAt: b.created_at,
    }
  })

  return apiSuccess(list)
}
