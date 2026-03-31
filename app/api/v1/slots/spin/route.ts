import { NextRequest } from 'next/server'
import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  gameId: z.string(),
  betPerLine: z.number().positive(),
  totalBet: z.number().positive(),
  totalWin: z.number().min(0),
  bonusTriggered: z.boolean(),
})

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 'VALIDATION_ERROR', 400)

  const { gameId, totalBet, totalWin, bonusTriggered } = parsed.data
  const supabase = await createClient()

  // Load player
  const { data: player } = await supabase.from('casino_players').select('*').eq('user_id', userId).single()
  if (!player) return apiError('Player not found', 'NOT_FOUND', 404)
  if (player.coins < totalBet) return apiError('Insufficient coins', 'INSUFFICIENT_COINS', 400)

  // Calculate new state
  const netChange = totalWin - totalBet
  const newCoins = player.coins + netChange
  const xpGain = Math.floor(totalBet * 0.1)
  const newXp = player.xp + xpGain

  // Check level up (exponential: 1000 * 2^(level-1))
  let newLevel = player.level
  let levelReward = 0
  const xpForNext = Math.floor(1000 * Math.pow(2, newLevel - 1))
  if (newXp >= xpForNext) {
    newLevel++
    levelReward = newLevel * 5000
  }

  // Update player
  await supabase.from('casino_players').update({
    coins: newCoins + levelReward,
    xp: newXp,
    level: newLevel,
  }).eq('user_id', userId)

  // Log transactions
  const transactions: { user_id: string; type: string; amount: number; metadata: Record<string, unknown> }[] = [
    { user_id: userId, type: 'spin_bet', amount: -totalBet, metadata: { gameId } },
  ]
  if (totalWin > 0) {
    transactions.push({ user_id: userId, type: 'spin_win', amount: totalWin, metadata: { gameId, bonusTriggered } })
  }
  if (levelReward > 0) {
    transactions.push({ user_id: userId, type: 'level_up', amount: levelReward, metadata: { level: newLevel } })
  }
  await supabase.from('casino_transactions').insert(transactions)

  // Update leaderboard
  await supabase.rpc('update_casino_leaderboard', { p_user_id: userId, p_win: totalWin, p_biggest: totalWin })
    .then(() => {}) // ignore if RPC doesn't exist yet
    .catch(() => {})

  return apiSuccess({
    coins: newCoins + levelReward,
    xp: newXp,
    level: newLevel,
    levelUp: newLevel > player.level,
    levelReward,
  })
}
