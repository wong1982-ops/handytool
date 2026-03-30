import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return apiError('Missing resume id', 'VALIDATION_ERROR', 400)

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) return apiError('Resume not found', 'NOT_FOUND', 404)

    return apiSuccess(data)
  } catch (e) {
    console.error('Resume load error:', e)
    return API_ERRORS.INTERNAL()
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return apiError('Missing resume id', 'VALIDATION_ERROR', 400)

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error

    return apiSuccess({ deleted: true })
  } catch (e) {
    console.error('Resume delete error:', e)
    return API_ERRORS.INTERNAL()
  }
}
