import { createAdminClient } from '@/lib/supabase/admin'

export async function fetchToolPopularity(days: number = 30) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('tool_popularity', { time_range_days: days })
  if (error) throw error
  return data ?? []
}

export async function fetchDailyTraffic(days: number = 30) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('daily_traffic', { time_range_days: days })
  if (error) throw error
  return data ?? []
}

export async function fetchUserStats() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('user_stats_summary')
  if (error) throw error
  return data?.[0] ?? { total_users: 0, new_users_7d: 0, active_users_7d: 0, profile_completion_rate: 0 }
}

export async function fetchDemographics() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('user_demographics')
  if (error) throw error
  return data ?? []
}

export async function fetchToolDetail(slug: string, days: number = 30) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('tool_detail', { target_tool_slug: slug, time_range_days: days })
  if (error) throw error
  return data ?? []
}

export async function fetchDashboardSummary() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('dashboard_summary')
  if (error) throw error
  return data?.[0] ?? {
    total_views_30d: 0,
    unique_visitors_30d: 0,
    avg_duration_30d: 0,
    total_views_7d: 0,
    unique_visitors_7d: 0,
    avg_duration_7d: 0,
    active_today: 0,
  }
}

export async function fetchTopTools(days: number = 30, limit: number = 5) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('tool_popularity', { time_range_days: days })
  if (error) throw error
  return (data ?? []).slice(0, limit)
}
