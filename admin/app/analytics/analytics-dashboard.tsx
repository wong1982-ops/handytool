'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
}

interface UserStats {
  total_users: number
  new_users_7d: number
  active_users_7d: number
  profile_completion_rate: number
}

interface DemographicRow {
  dimension: string
  label: string
  count: number
}

interface Props {
  popularity: ToolPopularityRow[]
  traffic: DailyTrafficRow[]
  userStats: UserStats
  demographics: DemographicRow[]
}

/* ---------- Constants ---------- */

const BRAND_BLUE = '#3D6AF2'
const BRAND_TEAL = '#32A9D9'
const PIE_COLORS = ['#3D6AF2', '#32A9D9', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#EC4899', '#6366F1']

type SortKey = 'tool_name' | 'view_count' | 'unique_visitors' | 'avg_duration_seconds'
type SortDir = 'asc' | 'desc'

/* ---------- Component ---------- */

export function AnalyticsDashboard({ popularity, traffic, userStats, demographics }: Props) {
  const hasData = popularity.length > 0 || traffic.length > 0 || demographics.length > 0

  if (!hasData && userStats.total_users === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            No data yet. Analytics will appear once users start visiting tools.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* User stats cards */}
      <UserStatsCards stats={userStats} />

      {/* Tool popularity */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Tool Popularity (Last 30 Days)
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          {popularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(300, popularity.length * 40)}>
              <BarChart layout="vertical" data={popularity} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="tool_name"
                  width={140}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    color: '#fafafa',
                  }}
                />
                <Bar dataKey="view_count" name="Views" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} />
                <Bar dataKey="unique_visitors" name="Unique Visitors" fill={BRAND_TEAL} radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No tool usage data yet.</p>
          )}
        </div>

        {/* Sortable table */}
        {popularity.length > 0 && <PopularityTable data={popularity} />}
      </section>

      {/* Traffic over time */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Daily Traffic (Last 30 Days)
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          {traffic.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={traffic} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 8,
                    color: '#fafafa',
                  }}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="view_count"
                  name="Page Views"
                  stroke={BRAND_BLUE}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No traffic data yet.</p>
          )}
        </div>
      </section>

      {/* Demographics */}
      <DemographicsSection data={demographics} />
    </div>
  )
}

/* ---------- Sub-components ---------- */

function UserStatsCards({ stats }: { stats: UserStats }) {
  const cards = [
    { label: 'Total Users', value: stats.total_users.toLocaleString() },
    { label: 'New Signups (7d)', value: stats.new_users_7d.toLocaleString() },
    { label: 'Active Users (7d)', value: stats.active_users_7d.toLocaleString() },
    { label: 'Profile Completion', value: `${Math.round(stats.profile_completion_rate)}%` },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  )
}

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

  const headerClass =
    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-white transition-colors'

  return (
    <div className="mt-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className={headerClass} onClick={() => handleSort('tool_name')}>
              Tool<SortIndicator column="tool_name" />
            </th>
            <th className={headerClass} onClick={() => handleSort('view_count')}>
              Views<SortIndicator column="view_count" />
            </th>
            <th className={headerClass} onClick={() => handleSort('unique_visitors')}>
              Unique Visitors<SortIndicator column="unique_visitors" />
            </th>
            <th className={headerClass} onClick={() => handleSort('avg_duration_seconds')}>
              Avg Duration (s)<SortIndicator column="avg_duration_seconds" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.tool_slug}
              className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{row.tool_name}</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{row.view_count.toLocaleString()}</td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                {row.unique_visitors.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                {Math.round(row.avg_duration_seconds)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DemographicsSection({ data }: { data: DemographicRow[] }) {
  if (data.length === 0) return null

  const dimensions = [...new Set(data.map((d) => d.dimension))]

  const dimensionLabels: Record<string, string> = {
    gender: 'Gender',
    age: 'Age Group',
    country: 'Country',
    occupation: 'Occupation',
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">User Demographics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimensions.map((dim) => {
          const dimData = data.filter((d) => d.dimension === dim)
          return (
            <div
              key={dim}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                {dimensionLabels[dim] ?? dim}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dimData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ label, percent }: { label: string; percent: number }) =>
                      `${label} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {dimData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: 8,
                      color: '#fafafa',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </section>
  )
}
