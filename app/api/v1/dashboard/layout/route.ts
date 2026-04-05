import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { DEFAULT_WIDGETS } from '@/tools/dashboard/default-layout'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch {}
  }
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await getSupabase()
  const { data } = await (supabase.from as any)('user_dashboard_layouts')
    .select('layout')
    .eq('user_id', userId)
    .single()

  return apiSuccess({ widgets: data?.layout || DEFAULT_WIDGETS })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { layout: unknown[] }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  if (!Array.isArray(body.layout)) return apiError('layout must be an array', 'VALIDATION_ERROR', 400)

  const supabase = await getSupabase()
  const { error } = await (supabase.from as any)('user_dashboard_layouts')
    .upsert({ user_id: userId, layout: body.layout, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  if (error) {
    console.error('[dashboard/layout] Save error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ saved: true })
}
