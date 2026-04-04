import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  const { data, error } = await (supabase.from as any)('seo_audit_results')
    .select('*')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116' || error.code === '42P01') return apiSuccess(null)
    console.error('[seo-studio/audit/latest] Query failed:', error)
    return API_ERRORS.INTERNAL()
  }

  if (!data) return apiSuccess(null)

  const row = data as { id: string; scanned_at: string; overall_score: number; results: unknown }
  return apiSuccess({
    id: row.id,
    scannedAt: row.scanned_at,
    overallScore: row.overall_score,
    tools: row.results ?? [],
  })
}
