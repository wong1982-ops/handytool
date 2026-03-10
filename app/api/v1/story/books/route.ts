import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const effectiveUserId = await getAuthUserId()

  // Not logged in — return empty list (bookshelf uses localStorage as fallback)
  if (!effectiveUserId) return apiSuccess([])

  const supabase = await createClient()

  // Try lightweight bookshelf RPC first
  const { data: books, error } = await supabase.rpc('get_user_bookshelf', {
    p_user_id: effectiveUserId,
  })

  if (!error && books) {
    // Map DB column names to camelCase for client
    const list = (books || []).map((b: Record<string, unknown>) => ({
      id: b.id,
      slug: b.slug,
      title: b.title || 'Untitled',
      authors: (b.authors as string[]) || ['AI'],
      coverImageUrl: (b.cover_image_url as string) || null,
      audience: b.audience || '',
      style: b.style || '',
      pageCount: b.page_count || 0,
      isPublic: b.is_public,
      createdAt: b.created_at,
      seriesId: (b.series_id as string) || null,
      seriesTitle: (b.series_title as string) || null,
    }))

    return apiSuccess(list)
  }

  // Fallback: direct query (RPC may not exist yet)
  console.warn('story/books: get_user_bookshelf RPC failed, using fallback', error?.message)
  const { data: fallbackBooks, error: fbErr } = await supabase
    .from('books')
    .select('id, slug, data, is_public, created_at, series_id')
    .eq('user_id', effectiveUserId)
    .order('created_at', { ascending: false })

  if (fbErr) {
    console.error('story/books: fallback fetch failed', fbErr)
    return API_ERRORS.INTERNAL()
  }

  const list = (fallbackBooks || []).map((b: Record<string, unknown>) => {
    const bd = b.data as Record<string, unknown> | undefined
    const concept = bd?.concept as Record<string, unknown> | undefined
    const tags = concept?.tags as Record<string, unknown> | undefined
    return {
      id: b.id,
      slug: b.slug,
      title: (bd?.title as string) || 'Untitled',
      authors: (bd?.authors as string[]) || ['AI'],
      coverImageUrl: (bd?.coverImageUrl as string) || null,
      audience: (tags?.audience as string) || '',
      style: (tags?.style as string) || '',
      pageCount: Array.isArray(bd?.pages) ? (bd.pages as unknown[]).length : 0,
      isPublic: b.is_public,
      createdAt: b.created_at,
      seriesId: (b.series_id as string) || null,
      seriesTitle: null,
    }
  })

  return apiSuccess(list)
}
