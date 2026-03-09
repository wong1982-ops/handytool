import { createClient } from '@/lib/supabase/server'
import { apiSuccess, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'
import { GEMINI_VOICE_NAMES } from '@/lib/story/tts'

interface RouteParams { params: Promise<{ id: string; charId: string }> }

const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  voice: z.enum(GEMINI_VOICE_NAMES as unknown as [string, ...string[]]).nullable().optional(),
})

// PATCH — update character name/description via RPC
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id: seriesId, charId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  const parsed = updateCharacterSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten().fieldErrors)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('update_series_character', {
    p_user_id: userId,
    p_series_id: seriesId,
    p_character_id: charId,
    p_name: parsed.data.name ?? null,
    p_description: parsed.data.description ?? null,
    p_voice: parsed.data.voice ?? null,
  })

  if (error) {
    console.error('character update error:', error)
    return API_ERRORS.INTERNAL()
  }

  if (data === false) return API_ERRORS.NOT_FOUND('Series')

  return apiSuccess({ success: true })
}

// DELETE — remove character via RPC
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id: seriesId, charId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Remove reference image from storage
  await supabase.storage.from('story-assets').remove([`series/${seriesId}/characters/${charId}.png`])

  const { data, error } = await supabase.rpc('delete_series_character', {
    p_user_id: userId,
    p_series_id: seriesId,
    p_character_id: charId,
  })

  if (error) {
    console.error('character delete error:', error)
    return API_ERRORS.INTERNAL()
  }

  if (data === false) return API_ERRORS.NOT_FOUND('Series')

  return apiSuccess({ success: true })
}
