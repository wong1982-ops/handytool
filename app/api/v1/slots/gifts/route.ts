import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data } = await supabase.from('casino_gifts')
    .select('*').eq('receiver_id', userId).eq('claimed', false)
    .order('created_at', { ascending: false })

  return apiSuccess(data || [])
}

const sendSchema = z.object({ friendId: z.string().uuid() })

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const supabase = await createClient()

  // Check if already sent today
  const today = new Date().toISOString().slice(0, 10)
  const { data: existing } = await supabase.from('casino_gifts')
    .select('id').eq('sender_id', userId).eq('receiver_id', parsed.data.friendId)
    .gte('created_at', today)

  if (existing && existing.length > 0) return apiError('Already sent today', 'ALREADY_SENT', 400)

  await supabase.from('casino_gifts').insert({
    sender_id: userId, receiver_id: parsed.data.friendId, amount: 1000
  })

  return apiSuccess({ sent: true })
}

export async function PATCH() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Get unclaimed gifts
  const { data: gifts } = await supabase.from('casino_gifts')
    .select('id, amount').eq('receiver_id', userId).eq('claimed', false)

  if (!gifts || gifts.length === 0) return apiSuccess({ claimed: 0, total: 0 })

  const total = gifts.reduce((sum: number, g: { amount: number }) => sum + g.amount, 0)
  const ids = gifts.map((g: { id: string }) => g.id)

  // Claim all
  await supabase.from('casino_gifts').update({ claimed: true }).in('id', ids)

  // Credit coins
  const { data: player } = await supabase.from('casino_players').select('coins').eq('user_id', userId).single()
  if (player) {
    await supabase.from('casino_players').update({ coins: player.coins + total }).eq('user_id', userId)
  }

  // Log transaction
  await supabase.from('casino_transactions').insert({
    user_id: userId, type: 'gift_received', amount: total, metadata: { count: gifts.length }
  })

  return apiSuccess({ claimed: gifts.length, total })
}
