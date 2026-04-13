import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const createBookSchema = z.object({
  title: z.string().min(1).max(500),
  status: z.enum(['draft', 'complete']).default('draft'),
  seriesId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const parsed = createBookSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { title, status, seriesId } = parsed.data
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('insert_book', {
    p_user_id: userId,
    p_slug: slug,
    p_data: { title, pages: [], concept: {} },
    p_is_public: false,
    p_series_id: seriesId ?? null,
  })

  if (error) return apiError(error.message, 'DB_ERROR', 500)

  // Set status if draft
  if (status === 'draft' && data) {
    await supabase.from('books').update({ status: 'draft' }).eq('id', data)
  }

  return apiSuccess({ id: data }, 201)
}

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
      hasAudio: Boolean(b.has_audio),
      hasIllustrations: Boolean(b.has_illustrations ?? b.cover_image_url),
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
    const pages = Array.isArray(bd?.pages) ? (bd.pages as Record<string, unknown>[]) : []
    return {
      id: b.id,
      slug: b.slug,
      title: (bd?.title as string) || 'Untitled',
      authors: (bd?.authors as string[]) || ['AI'],
      coverImageUrl: (bd?.coverImageUrl as string) || null,
      audience: (tags?.audience as string) || '',
      style: (tags?.style as string) || '',
      pageCount: pages.length,
      isPublic: b.is_public,
      hasAudio: pages.some(p => Boolean(p.audioUrl)),
      hasIllustrations: pages.some(p => Boolean(p.imageUrl)),
      createdAt: b.created_at,
      seriesId: (b.series_id as string) || null,
      seriesTitle: null,
    }
  })

  return apiSuccess(list)
}
