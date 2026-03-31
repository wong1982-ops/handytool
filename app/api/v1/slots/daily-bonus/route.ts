import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { DAILY_BONUS_AMOUNTS } from '@/tools/slots/slots-types'

export async function POST() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()
  const { data: player } = await supabase.from('casino_players').select('*').eq('user_id', userId).single()
  if (!player) return apiError('Player not found', 'NOT_FOUND', 404)

  // Check cooldown (24 hours)
  if (player.last_daily) {
    const elapsed = Date.now() - new Date(player.last_daily).getTime()
    if (elapsed < 24 * 60 * 60 * 1000) {
      return apiError('Already claimed today', 'ALREADY_CLAIMED', 400)
    }
  }

  // Calculate streak
  let newStreak = 1
  if (player.last_daily) {
    const elapsed = Date.now() - new Date(player.last_daily).getTime()
    if (elapsed < 48 * 60 * 60 * 1000) {
      newStreak = Math.min(player.daily_streak + 1, 7)
    }
  }

  const amount = DAILY_BONUS_AMOUNTS[Math.min(newStreak - 1, DAILY_BONUS_AMOUNTS.length - 1)]

  await supabase.from('casino_players').update({
    coins: player.coins + amount,
    daily_streak: newStreak,
    last_daily: new Date().toISOString(),
  }).eq('user_id', userId)

  await supabase.from('casino_transactions').insert({
    user_id: userId, type: 'daily_bonus', amount, metadata: { streak: newStreak }
  })

  return apiSuccess({ streak: newStreak, amount, newCoins: player.coins + amount })
}
