import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

interface RouteParams { params: Promise<{ id: string; charId: string }> }

// POST — approve a character (lock for book generation)
export async function POST(_request: Request, { params }: RouteParams) {
  const { id: seriesId, charId } = await params
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Use update_series_character RPC to set status to approved (verifies ownership)
  // First check the character has a reference image
  const { data: charData } = await supabase.rpc('get_series_with_characters', {
    p_series_id: seriesId,
    p_user_id: userId,
  })

  const series = Array.isArray(charData) ? charData?.[0] : charData
  if (!series) return API_ERRORS.NOT_FOUND('Series')

  const chars = (series.characters as { id: string; referenceImageUrl: string | null; status: string }[]) || []
  const char = chars.find(c => c.id === charId)
  if (!char) return API_ERRORS.NOT_FOUND('Character')

  if (!char.referenceImageUrl) {
    return apiError(
      'Character must have a generated portrait before approval',
      'NO_REFERENCE_IMAGE',
      400,
    )
  }

  if (char.status === 'approved') {
    return apiSuccess({ success: true, message: 'Already approved' })
  }

  const { error } = await supabase.rpc('update_series_character', {
    p_user_id: userId,
    p_series_id: seriesId,
    p_character_id: charId,
    p_status: 'approved',
  })

  if (error) {
    console.error('character approve error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ success: true })
}
