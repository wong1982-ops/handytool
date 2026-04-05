import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  if (!id) return API_ERRORS.NOT_FOUND('Conversation')

  const supabase = getAdminSupabase()

  // Verify the conversation belongs to the user
  const { data: conversation, error: convError } = await (supabase.from as any)(
    'accountant_ai_conversations',
  )
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (convError || !conversation) {
    return API_ERRORS.NOT_FOUND('Conversation')
  }

  if (conversation.user_id !== userId) {
    return API_ERRORS.FORBIDDEN()
  }

  // Fetch messages for this conversation
  const { data: messages, error: msgError } = await (supabase.from as any)(
    'accountant_ai_messages',
  )
    .select('id, role, content, sources, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (msgError) {
    console.error('[accountant-ai/conversations/[id]] GET error:', msgError)
    return API_ERRORS.INTERNAL()
  }

  const formatted = (messages || []).map((msg: any) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    sources: msg.sources || [],
    createdAt: msg.created_at,
  }))

  return apiSuccess(formatted)
}
