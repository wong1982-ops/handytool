// app/api/v1/mood-board/share/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { boardId: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  if (!body.boardId) {
    return apiError('boardId is required', 'VALIDATION_ERROR', 400)
  }

  const shareId = crypto.randomUUID()
  const supabase = await createClient()

  const { error } = await supabase
    .from('mood_boards')
    .update({ shared: true, share_id: shareId })
    .eq('id', body.boardId)
    .eq('user_id', userId)

  if (error) {
    console.error('[mood-board/share] Error:', error)
    return API_ERRORS.INTERNAL()
  }

  const shareUrl = `/tools/mood-board/view/${shareId}`
  return apiSuccess({ shareId, shareUrl })
}
