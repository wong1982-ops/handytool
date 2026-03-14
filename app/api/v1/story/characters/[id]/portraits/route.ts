import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { data, error } = await supabase.rpc('get_character_portraits', {
    p_character_id: characterId,
    p_user_id: userId,
  })
  if (error) return apiError(error.message, 'DB_ERROR', 500)

  const portraits = (data ?? []).map((p: any) => ({
    id: p.id,
    imageUrl: p.image_url,
    artStyle: p.art_style,
    isPrimary: p.is_primary,
    refinementCount: p.refinement_count,
    createdAt: p.created_at,
  }))

  return apiSuccess(portraits)
}
