import { tools } from '@/lib/tools'

interface WeeklyData {
  total_views: number
  unique_visitors: number
  top_tools: { tool_slug: string; page_views: number }[]
  prev_week_views: number
}

function getToolName(slug: string): string {
  return tools.find((t) => t.href === `/tools/${slug}`)?.name || slug
}

export function generateWeeklyPost(data: WeeklyData) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const startStr = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const slugDate = `${weekAgo.toISOString().slice(5, 10)}-${now.toISOString().slice(5, 10)}-${now.getFullYear()}`
  const slug = `weekly-${slugDate}`

  const overallChange = data.prev_week_views > 0
    ? Math.round(((data.total_views - data.prev_week_views) / data.prev_week_views) * 100)
    : 0

  let highlight: string | null = null
  if (data.top_tools.length > 0) {
    const top = data.top_tools[0]
    highlight = `${getToolName(top.tool_slug)} was the most-used tool with ${top.page_views.toLocaleString()} uses this week.`
  }

  const top5 = data.top_tools.slice(0, 5).map((t) => ({
    name: getToolName(t.tool_slug),
    slug: t.tool_slug,
    views: t.page_views,
    change_pct: 0,
  }))

  return {
    slug,
    title: `Toolk1t Weekly: ${startStr} – ${endStr}`,
    description: `${data.total_views.toLocaleString()} tool uses and ${data.unique_visitors.toLocaleString()} visitors this week. See trending tools and usage stats.`,
    post_type: 'weekly-roundup' as const,
    content: {
      hero_stat: `${data.total_views.toLocaleString()} tool uses this week${overallChange !== 0 ? ` (${overallChange > 0 ? '+' : ''}${overallChange}%)` : ''}`,
      top_tools: top5,
      highlight,
      weekly_visitors: data.unique_visitors,
      total_views: data.total_views,
    },
    published_at: now.toISOString(),
  }
}
