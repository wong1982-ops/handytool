// app/api/v1/mood-board/save/route.ts
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch { /* fall through */ }
  }
  return createClient()
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { boardId?: string; title: string; theme: string; elements: unknown[]; mood?: string; colorPreference?: string }
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }

  const supabase = await getSupabase()

  if (body.boardId) {
    // Update existing board
    const { error } = await supabase
      .from('mood_boards')
      .update({
        title: body.title,
        theme: body.theme,
        elements: body.elements,
        mood: body.mood ?? null,
        color_preference: body.colorPreference ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.boardId)
      .eq('user_id', userId)

    if (error) {
      console.error('[mood-board/save] Update error:', error)
      return API_ERRORS.INTERNAL()
    }
    return apiSuccess({ boardId: body.boardId })
  }

  // Create new board
  const { data, error } = await supabase
    .from('mood_boards')
    .insert({
      user_id: userId,
      title: body.title || 'Untitled Board',
      theme: body.theme,
      elements: body.elements,
      mood: body.mood ?? null,
      color_preference: body.colorPreference ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[mood-board/save] Insert error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ boardId: data.id }, 201)
}
