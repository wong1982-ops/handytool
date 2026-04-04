import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from('seo_audit_results')
    .select('*')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // No rows or table doesn't exist yet — return null
    if (error.code === 'PGRST116' || error.code === '42P01') return apiSuccess(null)
    console.error('[seo-studio/audit/latest] Query failed:', error)
    return API_ERRORS.INTERNAL()
  }

  if (!data) return apiSuccess(null)

  return apiSuccess({
    id: data.id,
    scannedAt: data.scanned_at,
    overallScore: data.overall_score,
    tools: data.results ?? [],
  })
}
