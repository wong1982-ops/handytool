import { createClient } from '@/lib/supabase/server'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await request.json()
  const { targetPrice } = body

  if (!targetPrice || targetPrice <= 0) {
    return API_ERRORS.VALIDATION({ message: 'targetPrice must be positive' })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('flight_alerts')
    .update({ target_price: targetPrice, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    return API_ERRORS.NOT_FOUND('Alert')
  }

  return apiSuccess({ alert: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('flight_alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    return API_ERRORS.NOT_FOUND('Alert')
  }

  return apiSuccess({ deleted: true })
}
