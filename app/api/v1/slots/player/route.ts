import { apiSuccess, apiError, API_ERRORS, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await createClient()

  // Try to load existing player
  let { data } = await supabase.from('casino_players').select('*').eq('user_id', userId).single()

  if (!data) {
    // Create new player with welcome bonus
    const { data: newPlayer, error } = await supabase
      .from('casino_players')
      .insert({ user_id: userId, coins: 500000, xp: 0, level: 1, daily_streak: 0 })
      .select()
      .single()
    if (error) return apiError('Failed to create player', 'CREATE_ERROR', 500)
    data = newPlayer

    // Log welcome bonus transaction
    await supabase.from('casino_transactions').insert({
      user_id: userId, type: 'welcome_bonus', amount: 500000, metadata: {}
    })
  }

  return apiSuccess(data)
}
