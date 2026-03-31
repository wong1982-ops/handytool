import { apiSuccess, getAuthUserId } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await getAuthUserId()

  const supabase = await createClient()
  const now = new Date().toISOString()

  // Active events
  const { data: events } = await supabase.from('casino_events')
    .select('*')
    .lte('starts_at', now)
    .gte('ends_at', now)

  if (!events || events.length === 0) return apiSuccess([])

  // Get user entries if logged in
  if (userId) {
    const eventIds = events.map((e: { id: string }) => e.id)
    const { data: entries } = await supabase.from('casino_event_entries')
      .select('event_id, score')
      .eq('user_id', userId)
      .in('event_id', eventIds)

    const entryMap = new Map(entries?.map((e: { event_id: string; score: number }) => [e.event_id, e.score]) || [])

    const eventsWithProgress = events.map((e: { id: string }) => ({
      ...e,
      userScore: entryMap.get(e.id) || 0,
    }))

    return apiSuccess(eventsWithProgress)
  }

  return apiSuccess(events)
}
