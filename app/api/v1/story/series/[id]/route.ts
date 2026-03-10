import { createClient } from '@/lib/supabase/server'
import { apiSuccess, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { deleteManyFromR2 } from '@/lib/storage/r2'
import { z } from 'zod'

interface RouteParams { params: Promise<{ id: string }> }

const updateSeriesSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  setting: z.string().max(2000).optional(),
  artStyle: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
})

// GET — series detail with characters and books
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const userId = await getAuthUserId()
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_series_with_characters', {
    p_series_id: id,
    p_user_id: userId ?? null,
  })

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    return API_ERRORS.NOT_FOUND('Series')
  }

  const series = Array.isArray(data) ? data[0] : data

  // Fetch books in series — try lightweight RPC first, fall back to direct query
  let bookItems: { id: string; slug: string; title: string; coverImageUrl: string | null; pageCount: number; isPublic: boolean; createdAt: string }[] = []

  const { data: books, error: booksErr } = await supabase.rpc('get_series_books_lightweight', {
    p_series_id: id,
  })

  if (!booksErr && books) {
    bookItems = (books || []).map((b: Record<string, unknown>) => ({
      id: b.id as string,
      slug: b.slug as string,
      title: (b.title as string) || 'Untitled',
      coverImageUrl: (b.cover_image_url as string) || null,
      pageCount: (b.page_count as number) || 0,
      isPublic: b.is_public as boolean,
      createdAt: b.created_at as string,
    }))
  } else {
    // Fallback: direct query (RPC may not exist yet)
    const { data: fallbackBooks } = await supabase
      .from('books')
      .select('id, slug, data, is_public, created_at')
      .eq('series_id', id)
      .order('created_at', { ascending: false })

    bookItems = (fallbackBooks || []).map((b: Record<string, unknown>) => {
      const bd = b.data as Record<string, unknown> | undefined
      return {
        id: b.id as string,
        slug: b.slug as string,
        title: (bd?.title as string) || 'Untitled',
        coverImageUrl: (bd?.coverImageUrl as string) || null,
        pageCount: Array.isArray(bd?.pages) ? (bd.pages as unknown[]).length : 0,
        isPublic: b.is_public as boolean,
        createdAt: b.created_at as string,
      }
    })
  }

  return apiSuccess({
    id: series.id,
    title: series.title,
    description: series.description,
    setting: series.setting,
    artStyle: series.art_style,
    isPublic: series.is_public,
    createdAt: series.created_at,
    characters: series.characters,
    books: bookItems,
    isOwner: userId === series.user_id,
  })
}

// PATCH — update series via RPC
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  const parsed = updateSeriesSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const supabase = await createClient()
  const { error } = await supabase.rpc('update_series', {
    p_user_id: userId,
    p_series_id: id,
    p_title: parsed.data.title ?? null,
    p_description: parsed.data.description ?? null,
    p_setting: parsed.data.setting ?? null,
    p_art_style: parsed.data.artStyle ?? null,
    p_is_public: parsed.data.isPublic ?? null,
  })

  if (error) {
    console.error('series update error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ success: true })
}

// DELETE — delete series via RPC (orphans books, cascades characters)
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Delete character images from storage
  const { data: chars } = await supabase
    .from('series_characters')
    .select('id')
    .eq('series_id', id)

  if (chars?.length) {
    const paths = chars.map((c: { id: string }) => `series/${id}/characters/${c.id}.png`)
    await deleteManyFromR2(paths)
  }

  // Delete via RPC (handles orphaning books + cascade)
  const { error } = await supabase.rpc('delete_series', {
    p_user_id: userId,
    p_series_id: id,
  })

  if (error) {
    console.error('series delete error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ success: true })
}
