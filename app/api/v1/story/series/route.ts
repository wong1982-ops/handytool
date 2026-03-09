import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { getUserEntitlements } from '@/lib/entitlements'
import { z } from 'zod'

const createSeriesSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  setting: z.string().max(2000).default(''),
  artStyle: z.string().min(1).max(100),
})

// GET — list user's series with characters + book counts
export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_series', { p_user_id: userId })

  if (error) {
    console.error('series list error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess(data || [])
}

// POST — create a new series (limited by entitlements)
export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Check series limit
  const { tier, limits } = await getUserEntitlements(userId)
  const supabase = await createClient()

  const { count } = await supabase
    .from('series')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) >= limits.max_series) {
    return apiError(
      tier === 'free'
        ? `Free users can create up to ${limits.max_series} series. Upgrade to Premium for more.`
        : `You've reached your series limit (${limits.max_series}).`,
      'SERIES_LIMIT_REACHED',
      403,
      { limit: limits.max_series, current: count ?? 0, tier },
    )
  }

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  const parsed = createSeriesSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const { title, description, setting, artStyle } = parsed.data

  const { data, error } = await supabase.rpc('insert_series', {
    p_user_id: userId,
    p_title: title,
    p_description: description,
    p_setting: setting,
    p_art_style: artStyle,
  })

  if (error) {
    console.error('series create error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ id: data }, 201)
}
