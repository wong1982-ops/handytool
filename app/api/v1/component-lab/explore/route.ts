// app/api/v1/component-lab/explore/route.ts
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

const LIMIT = 20

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sort = searchParams.get('sort') || 'newest'
  const tag = searchParams.get('tag') || ''
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const supabase = await createClient()

  let query = supabase
    .from('components_library')
    .select(
      'id, name, slug, tags, thumbnail_url, copy_count, created_at, updated_at',
    )
    .eq('is_public', true)

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (sort === 'popular') {
    query = query.order('copy_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + LIMIT - 1)

  const { data, error } = await query

  if (error) {
    console.error('[component-lab/explore] Query error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ entries: data, hasMore: data.length === LIMIT })
}
