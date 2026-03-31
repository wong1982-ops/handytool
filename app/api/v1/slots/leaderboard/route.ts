import { NextRequest } from 'next/server'
import { apiSuccess } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period') || 'weekly'

  const supabase = await createClient()

  const query = supabase.from('casino_leaderboard')
    .select('user_id, coins_won, biggest_win, spins_count')
    .eq('period', period)
    .order('coins_won', { ascending: false })
    .limit(50)

  const { data } = await query

  return apiSuccess(data || [])
}
