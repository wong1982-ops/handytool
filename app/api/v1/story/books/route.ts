import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return API_ERRORS.UNAUTHORIZED()

  const { data: books, error } = await supabase
    .from('books')
    .select('id, slug, data, is_public, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('story/books: fetch failed', error)
    return API_ERRORS.INTERNAL()
  }

  // Return lightweight list (title, slug, cover, tags, dates)
  const list = (books || []).map((b) => {
    const bookData = b.data as Record<string, unknown>
    const concept = bookData.concept as Record<string, unknown> | undefined
    const tags = concept?.tags as Record<string, unknown> | undefined
    const pages = bookData.pages as { imageUrl?: string }[] | undefined

    return {
      id: b.id,
      slug: b.slug,
      title: bookData.title || 'Untitled',
      coverImageUrl: pages?.[0]?.imageUrl || null,
      audience: tags?.audience || '',
      style: tags?.style || '',
      pageCount: pages?.length || 0,
      isPublic: b.is_public,
      createdAt: b.created_at,
    }
  })

  return apiSuccess(list)
}
