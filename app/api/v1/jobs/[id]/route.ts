import { NextRequest } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return API_ERRORS.NOT_FOUND('Job')
  }

  return apiSuccess(data)
}
