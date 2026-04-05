import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  const { data, error } = await (supabase.from as any)('accountant_ai_conversations')
    .select('id, title, updated_at, created_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[accountant-ai/conversations] GET error:', error)
    return API_ERRORS.INTERNAL()
  }

  const conversations = (data || []).map((conv: any) => ({
    id: conv.id,
    title: conv.title,
    updatedAt: conv.updated_at,
    createdAt: conv.created_at,
  }))

  return apiSuccess(conversations)
}
