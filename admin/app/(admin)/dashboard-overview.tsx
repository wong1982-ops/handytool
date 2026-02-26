'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface Summary {
  total_views_30d: number
  unique_visitors_30d: number
  avg_duration_30d: number | null
  total_views_7d: number
  unique_visitors_7d: number
  avg_duration_7d: number | null
  active_today: number
}

interface ToolRow {
  tool_slug: string
  tool_name: string
  view_count: number
  unique_visitors: number
  avg_duration_seconds: number
}

interface TrafficRow {
  day: string
  view_count: number
  unique_visitors: number
}

interface Props {
  summary: Summary
  topTools: ToolRow[]
  traffic7d: TrafficRow[]
}

export function DashboardOverview({ summary, topTools, traffic7d }: Props) {
  const cards = [
    { label: 'Page Views (30d)', value: summary.total_views_30d.toLocaleString(), sub: `${summary.total_views_7d.toLocaleString()} this week` },
    { label: 'Unique Visitors (30d)', value: summary.unique_visitors_30d.toLocaleString(), sub: `${summary.unique_visitors_7d.toLocaleString()} this week` },
    { label: 'Avg Stay Time (30d)', value: summary.avg_duration_30d ? `${summary.avg_duration_30d}s` : '—', sub: summary.avg_duration_7d ? `${summary.avg_duration_7d}s this week` : '—' },
    { label: 'Active Today', value: summary.active_today.toLocaleString(), sub: 'unique sessions' },
  ]

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm">
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 7-day traffic sparkline */}
      {traffic7d.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Last 7 Days Traffic</h2>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={traffic7d}>
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fafafa' }}
                labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
              />
              <Line type="monotone" dataKey="view_count" name="Views" stroke="#3D6AF2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="unique_visitors" name="Visitors" stroke="#32A9D9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 tools */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-400">Top Tools (30 days)</h2>
        </div>
        {topTools.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {topTools.map((tool, i) => (
              <div key={tool.tool_slug} className="flex items-center gap-4 px-6 py-3">
                <span className="text-sm font-mono text-zinc-500 w-6">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-white">{tool.tool_name}</span>
                <span className="text-sm text-zinc-400">{tool.view_count.toLocaleString()} views</span>
                <span className="text-sm text-zinc-500">{Math.round(tool.avg_duration_seconds)}s avg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-zinc-500 text-center">No data yet.</p>
        )}
      </div>
    </div>
  )
}
