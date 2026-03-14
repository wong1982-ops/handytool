import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  // Fetch character via RPC (SECURITY DEFINER — bypasses RLS)
  const { data: character, error: fetchErr } = await supabase.rpc('get_character_detail', {
    p_character_id: characterId,
    p_user_id: userId,
  })
  if (fetchErr || !character) return apiError('Character not found', 'NOT_FOUND', 404)
  if (!character.reference_image_url) return apiError('Character must have a portrait before approval', 'VALIDATION_ERROR', 400)
  if (character.status === 'approved') return apiError('Character is already approved', 'VALIDATION_ERROR', 400)

  // Update status via RPC (SECURITY DEFINER — bypasses RLS)
  const { error: updateErr } = await supabase.rpc('update_character', {
    p_user_id: userId,
    p_character_id: characterId,
    p_status: 'approved',
  })
  if (updateErr) return apiError(updateErr.message, 'DB_ERROR', 500)

  return apiSuccess({ success: true })
}
