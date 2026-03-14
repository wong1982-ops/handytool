import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; portraitId: string }> },
) {
  const { portraitId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { data, error } = await supabase.rpc('set_primary_portrait', {
    p_portrait_id: portraitId,
    p_user_id: userId,
  })
  if (error) return apiError(error.message, 'DB_ERROR', 500)
  if (!data) return apiError('Portrait not found', 'NOT_FOUND', 404)

  return apiSuccess({ success: true })
}
