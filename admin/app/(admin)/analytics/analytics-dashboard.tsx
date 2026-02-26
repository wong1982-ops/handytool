'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

/* ---------- Types ---------- */

interface ToolPopularityRow {
  tool_slug: string
  tool_name: string
  view_count: number
  unique_visitors: number
  avg_duration_seconds: number
}

interface DailyTrafficRow {
  day: string
  view_count: number
  unique_visitors: number
}

interface DeviceRow {
  dimension: string
  label: string
  count: number
}

interface ReferrerRow {
  referrer_domain: string
  visit_count: number
}

interface Props {
  popularity: ToolPopularityRow[]
  traffic: DailyTrafficRow[]
  devices: DeviceRow[]
  referrers: ReferrerRow[]
  period: number
}

/* ---------- Constants ---------- */

const BRAND_BLUE = '#3D6AF2'
const BRAND_TEAL = '#32A9D9'
const PIE_COLORS = ['#3D6AF2', '#32A9D9', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#EC4899', '#6366F1']
const PERIODS = [7, 14, 30, 90]

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: 8,
  color: '#fafafa',
}

type SortKey = 'tool_name' | 'view_count' | 'unique_visitors' | 'avg_duration_seconds'
type SortDir = 'asc' | 'desc'

/* ---------- Component ---------- */

export function AnalyticsDashboard({ popularity, traffic, devices, referrers, period }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (days: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', String(days))
    router.push(`/analytics?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]
              ${period === p
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
          >
            {p}d
          </button>
        ))}
      </div>

      {/* Tool popularity bar chart */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Tool Popularity</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm">
          {popularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(300, popularity.length * 40)}>
              <BarChart layout="vertical" data={popularity} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis type="category" dataKey="tool_name" width={140} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="view_count" name="Views" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} />
                <Bar dataKey="unique_visitors" name="Unique Visitors" fill={BRAND_TEAL} radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 text-center py-8">No tool usage data yet.</p>
          )}
        </div>

        {popularity.length > 0 && <PopularityTable data={popularity} />}
      </section>

      {/* Daily traffic line chart */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Daily Traffic</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm">
          {traffic.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={traffic} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(label: string) => new Date(label).toLocaleDateString()} />
                <Line type="monotone" dataKey="view_count" name="Page Views" stroke={BRAND_BLUE} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="unique_visitors" name="Unique Visitors" stroke={BRAND_TEAL} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 text-center py-8">No traffic data yet.</p>
          )}
        </div>
      </section>

      {/* Device breakdown */}
      <DeviceBreakdownSection data={devices} />

      {/* Top referrers */}
      <ReferrersTable data={referrers} />
    </div>
  )
}

/* ---------- Sub-components ---------- */

function PopularityTable({ data }: { data: ToolPopularityRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('view_count')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [data, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function SortIndicator({ column }: { column: SortKey }) {
    if (sortKey !== column) return null
    return <span className="ml-1">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
  }

  const headerClass = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 cursor-pointer select-none hover:text-white transition-colors'

  return (
    <div className="mt-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className={headerClass} onClick={() => handleSort('tool_name')}>Tool<SortIndicator column="tool_name" /></th>
            <th className={headerClass} onClick={() => handleSort('view_count')}>Views<SortIndicator column="view_count" /></th>
            <th className={headerClass} onClick={() => handleSort('unique_visitors')}>Unique Visitors<SortIndicator column="unique_visitors" /></th>
            <th className={headerClass} onClick={() => handleSort('avg_duration_seconds')}>Avg Duration (s)<SortIndicator column="avg_duration_seconds" /></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.tool_slug} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
              <td className="px-4 py-3 font-medium text-white">{row.tool_name}</td>
              <td className="px-4 py-3 text-zinc-300">{row.view_count.toLocaleString()}</td>
              <td className="px-4 py-3 text-zinc-300">{row.unique_visitors.toLocaleString()}</td>
              <td className="px-4 py-3 text-zinc-300">{Math.round(row.avg_duration_seconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DeviceBreakdownSection({ data }: { data: DeviceRow[] }) {
  if (data.length === 0) return null

  const dimensions = [...new Set(data.map((d) => d.dimension))]
  const dimensionLabels: Record<string, string> = {
    device_type: 'Device Type',
    browser: 'Browser',
    os: 'Operating System',
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">Device Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dimensions.map((dim) => {
          const dimData = data.filter((d) => d.dimension === dim)
          return (
            <div key={dim} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">{dimensionLabels[dim] ?? dim}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dimData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ label, percent }: { label: string; percent: number }) => `${label} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dimData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ReferrersTable({ data }: { data: ReferrerRow[] }) {
  if (data.length === 0) return null

  const total = data.reduce((sum, r) => sum + r.visit_count, 0)

  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4">Top Referrers</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Visits</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.referrer_domain} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{row.referrer_domain}</td>
                <td className="px-4 py-3 text-zinc-300">{row.visit_count.toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-300">{total > 0 ? ((row.visit_count / total) * 100).toFixed(1) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
