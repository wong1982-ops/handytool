import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const effectiveUserId = await getAuthUserId()

  // Not logged in — return empty list (bookshelf uses localStorage as fallback)
  if (!effectiveUserId) return apiSuccess([])

  const supabase = await createClient()
  // Use RPC to bypass RLS (needed in dev when no auth session)
  const { data: books, error } = await supabase.rpc('get_user_books', {
    p_user_id: effectiveUserId,
  })

  if (error) {
    console.error('story/books: fetch failed', error)
    return API_ERRORS.INTERNAL()
  }

  // Collect unique series IDs to fetch their titles
  const seriesIds = [...new Set(
    (books || [])
      .map((b: Record<string, unknown>) => b.series_id as string | null)
      .filter(Boolean) as string[]
  )]

  let seriesTitles: Record<string, string> = {}
  if (seriesIds.length > 0) {
    const { data: seriesData } = await supabase
      .from('series')
      .select('id, title')
      .in('id', seriesIds)

    if (seriesData) {
      for (const s of seriesData) {
        seriesTitles[s.id] = s.title
      }
    }
  }

  // Return lightweight list (title, slug, cover, tags, dates, series info)
  const list = (books || []).map((b: Record<string, unknown>) => {
    const bookData = b.data as Record<string, unknown>
    const concept = bookData.concept as Record<string, unknown> | undefined
    const tags = concept?.tags as Record<string, unknown> | undefined
    const pages = bookData.pages as { imageUrl?: string }[] | undefined
    const bSeriesId = b.series_id as string | null

    return {
      id: b.id,
      slug: b.slug,
      title: bookData.title || 'Untitled',
      authors: (bookData.authors as string[]) || [],
      coverImageUrl: (bookData.coverImageUrl as string) || pages?.[0]?.imageUrl || null,
      audience: tags?.audience || '',
      style: tags?.style || '',
      pageCount: pages?.length || 0,
      isPublic: b.is_public,
      createdAt: b.created_at,
      seriesId: bSeriesId || null,
      seriesTitle: bSeriesId ? (seriesTitles[bSeriesId] || null) : null,
    }
  })

  return apiSuccess(list)
}
