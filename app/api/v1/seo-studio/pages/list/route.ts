import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('seo_landing_pages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[seo-studio/pages/list] Query failed:', error)
    // If table doesn't exist yet, return empty array
    if (error.code === '42P01') return apiSuccess([])
    return API_ERRORS.INTERNAL()
  }

  // Map snake_case to camelCase
  const pages = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    toolSlug: row.tool_slug,
    keyword: row.keyword,
    pageType: row.page_type,
    slug: row.slug,
    title: row.title,
    metaDescription: row.meta_description,
    content: row.content,
    structuredData: row.structured_data,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))

  return apiSuccess(pages)
}
