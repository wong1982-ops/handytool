import { apiSuccess, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, locale, updated_at, created_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return apiSuccess(data || [])
  } catch (e) {
    console.error('Resume list error:', e)
    return API_ERRORS.INTERNAL()
  }
}
