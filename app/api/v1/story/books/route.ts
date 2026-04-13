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

const DEFAULT_PAGE_SIZE = 12

// Bookshelf columns — lightweight, no JSONB `data` column
const BOOKSHELF_SELECT = `
  id, slug, title, cover_url, audience, style, page_count,
  is_public, has_audio, has_illustrations, created_at, series_id,
  series:series_id ( title )
`.replace(/\s+/g, ' ').trim()

export async function GET(request: NextRequest) {
  // Single client for both auth + query
  const supabase = await createClient()

  // Get user — fast path for dev, otherwise decode from session
  let userId: string | null = null
  const devId = await getAuthUserId()
  if (devId) {
    userId = devId
  } else {
    // Already checked in getAuthUserId, but just in case
    return apiSuccess({ items: [], nextCursor: null })
  }

  const url = request.nextUrl
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || DEFAULT_PAGE_SIZE, 1), 50)
  const cursor = url.searchParams.get('cursor')

  // Single query — lightweight columns only, cursor pagination
  // Uses .eq('user_id') which works with both RLS (prod) and service-role (dev)
  let query = supabase
    .from('books')
    .select(BOOKSHELF_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: books, error } = await query

  if (error) {
    console.error('story/books: query failed', error)
    return API_ERRORS.INTERNAL()
  }

  const rows = (books || []) as Record<string, unknown>[]
  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows

  const list = page.map((b: Record<string, unknown>) => {
    const series = b.series as Record<string, unknown> | null
    return {
      id: b.id,
      slug: b.slug,
      title: (b.title as string) || 'Untitled',
      coverImageUrl: (b.cover_url as string) || null,
      audience: (b.audience as string) || '',
      style: (b.style as string) || '',
      pageCount: (b.page_count as number) || 0,
      isPublic: b.is_public,
      hasAudio: Boolean(b.has_audio),
      hasIllustrations: Boolean(b.has_illustrations),
      createdAt: b.created_at,
      seriesId: (b.series_id as string) || null,
      seriesTitle: (series?.title as string) || null,
    }
  })

  const nextCursor = hasMore ? (page[page.length - 1].created_at as string) : null

  return apiSuccess({ items: list, nextCursor })
}
