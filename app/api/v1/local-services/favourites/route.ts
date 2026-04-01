import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('local_services_favourites')
      .select('place_id, place_data, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return apiSuccess(data || [])
  } catch {
    return apiError('Failed to load favourites', 'ERROR', 500)
  }
}

const addSchema = z.object({
  placeId: z.string(),
  placeData: z.record(z.any()),
})

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: unknown
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  try {
    const supabase = await createClient()
    await supabase.from('local_services_favourites').upsert({
      user_id: userId,
      place_id: parsed.data.placeId,
      place_data: parsed.data.placeData,
    })
    return apiSuccess({ saved: true })
  } catch {
    return apiError('Failed to save', 'ERROR', 500)
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const placeId = request.nextUrl.searchParams.get('placeId')
  if (!placeId) return apiError('Missing placeId', 'VALIDATION_ERROR', 400)

  try {
    const supabase = await createClient()
    await supabase.from('local_services_favourites')
      .delete()
      .eq('user_id', userId)
      .eq('place_id', placeId)
    return apiSuccess({ deleted: true })
  } catch {
    return apiError('Failed to delete', 'ERROR', 500)
  }
}
