import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, getAuthUserId, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const linkSchema = z.object({
  seriesId: z.string().uuid(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = linkSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { error: dbError } = await supabase.rpc('link_character_to_series', {
    p_character_id: characterId,
    p_series_id: parsed.data.seriesId,
    p_user_id: userId,
  })
  if (dbError) return apiError(dbError.message, 'DB_ERROR', 500)

  return apiSuccess({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: characterId } = await params
  const supabase = await createClient()
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const url = new URL(request.url)
  const seriesId = url.searchParams.get('seriesId')
  if (!seriesId) return apiError('seriesId query param required', 'VALIDATION_ERROR', 400)

  const { error: dbError2 } = await supabase.rpc('unlink_character_from_series', {
    p_character_id: characterId,
    p_series_id: seriesId,
    p_user_id: userId,
  })
  if (dbError2) return apiError(dbError2.message, 'DB_ERROR', 500)

  return apiSuccess({ success: true })
}
