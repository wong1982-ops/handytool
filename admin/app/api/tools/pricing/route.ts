import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const admin = createAdminClient()

  const { data: tools, error: dbError } = await admin
    .from('tool_credit_costs')
    .select('*')
    .order('tool_id', { ascending: true })

  if (dbError) {
    console.error('admin/tools/pricing: query failed', dbError)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ tools: tools ?? [] })
}
