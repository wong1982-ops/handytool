'use client'

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { UsageSummary, DailyUsageRow, ToolUsageRow, TopUserRow } from '@/lib/ai-usage'
import { getToolCategory, getToolDisplayName, getOperationName, TOOL_CATEGORIES } from '@/lib/ai-usage'

const BRAND_BLUE = '#3D6AF2'
const BRAND_TEAL = '#32A9D9'
const PRESETS = [7, 14, 30, 90]

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: 8,
  color: '#fafafa',
}

function buildParams(preset: number, customFrom: string, customTo: string) {
  const p = new URLSearchParams()
  if (customFrom && customTo) {
    p.set('from', customFrom)
    p.set('to', customTo)
  } else {
    p.set('preset', String(preset))
  }
  return p.toString()
}

function delta(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const pct = Math.round(((current - previous) / previous) * 100)
  return pct >= 0 ? `+${pct}%` : `${pct}%`
}

export function AiUsageDashboard() {
  const [preset, setPreset] = useState(30)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [compare, setCompare] = useState(false)

  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [prevSummary, setPrevSummary] = useState<UsageSummary | null>(null)
  const [daily, setDaily] = useState<DailyUsageRow[]>([])
  const [byTool, setByTool] = useState<ToolUsageRow[]>([])
  const [topUsers, setTopUsers] = useState<TopUserRow[]>([])
  const [loading, setLoading] = useState(true)

  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const qs = useMemo(() => buildParams(preset, customFrom, customTo), [preset, customFrom, customTo])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, dailyRes, toolRes, usersRes] = await Promise.all([
        fetch(`/api/ai-usage/summary?${qs}`),
        fetch(`/api/ai-usage/daily?${qs}`),
        fetch(`/api/ai-usage/by-tool?${qs}`),
        fetch(`/api/ai-usage/top-users?${qs}`),
      ])

      const sumJson = await sumRes.json()
      const dailyJson = await dailyRes.json()
      const toolJson = await toolRes.json()
      const usersJson = await usersRes.json()

      setSummary(sumJson.data ?? null)
      setDaily(dailyJson.data ?? [])
      setByTool(toolJson.data ?? [])
      setTopUsers(usersJson.data ?? [])

      if (compare) {
        const pp = new URLSearchParams()
        if (customFrom && customTo) {
          const fromDate = new Date(customFrom)
          const toDate = new Date(customTo + 'T23:59:59.999Z')
          const durationMs = toDate.getTime() - fromDate.getTime()
          const pTo = new Date(fromDate.getTime() - 1)
          const pFrom = new Date(pTo.getTime() - durationMs)
          pp.set('from', pFrom.toISOString().slice(0, 10))
          pp.set('to', pTo.toISOString().slice(0, 10))
        } else {
          const prevFrom = new Date()
          prevFrom.setDate(prevFrom.getDate() - preset * 2)
          const prevTo = new Date()
          prevTo.setDate(prevTo.getDate() - preset)
          pp.set('from', prevFrom.toISOString().slice(0, 10))
          pp.set('to', prevTo.toISOString().slice(0, 10))
        }
        const prevRes = await fetch(`/api/ai-usage/summary?${pp.toString()}`)
        const prevJson = await prevRes.json()
        setPrevSummary(prevJson.data ?? null)
      } else {
        setPrevSummary(null)
      }
    } catch (err) {
      console.error('Failed to fetch AI usage data:', err)
    }
    setLoading(false)
  }, [qs, compare, preset, customFrom, customTo])

  useEffect(() => { fetchData() }, [fetchData])

  const toolGroups = useMemo(() => {
    const groups = new Map<string, { call_count: number; total_credits: number; operations: ToolUsageRow[] }>()
    for (const row of byTool) {
      const cat = getToolCategory(row.tool_id)
      const group = groups.get(cat) ?? { call_count: 0, total_credits: 0, operations: [] }
      group.call_count += row.call_count
      group.total_credits += row.total_credits
      group.operations.push(row)
      groups.set(cat, group)
    }
    return Array.from(groups.entries())
      .map(([category, data]) => ({
        category,
        displayName: TOOL_CATEGORIES[category] ?? category,
        ...data,
      }))
      .sort((a, b) => b.total_credits - a.total_credits)
  }, [byTool])

  const barData = toolGroups.map((g) => ({
    name: g.displayName,
    credits: g.total_credits,
    calls: g.call_count,
    category: g.category,
  }))

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-zinc-900 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setPreset(p); setCustomFrom(''); setCustomTo('') }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]
              ${preset === p && !customFrom
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
          >
            {p}d
          </button>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
          <span className="text-zinc-500">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="rounded border-zinc-600"
          />
          vs previous period
        </label>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { label: 'Total AI Calls', value: summary.total_calls, prev: prevSummary?.total_calls },
            { label: 'Credits Consumed', value: summary.total_credits, prev: prevSummary?.total_credits },
            { label: 'Unique Users', value: summary.unique_users, prev: prevSummary?.unique_users },
            { label: 'Avg Credits / Call', value: summary.avg_credits_per_call, prev: prevSummary?.avg_credits_per_call },
          ] as const).map((card) => (
            <div key={card.label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <p className="text-sm text-zinc-400 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
              {compare && card.prev !== undefined && card.prev !== null && (
                <p className={`text-xs mt-1 ${card.value >= card.prev ? 'text-emerald-400' : 'text-red-400'}`}>
                  {delta(card.value, card.prev)} vs prev
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Daily chart */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Usage Over Time</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis yAxisId="left" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="call_count" name="Calls" stroke={BRAND_BLUE} strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="total_credits" name="Credits" stroke={BRAND_TEAL} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tool breakdown */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tool Breakdown</h2>
        {barData.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 48)}>
            <BarChart data={barData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#a1a1aa', fontSize: 12 }} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="credits" name="Credits" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">Tool</th>
                <th className="text-right py-2 px-3 font-medium">Calls</th>
                <th className="text-right py-2 px-3 font-medium">Credits</th>
                <th className="text-right py-2 px-3 font-medium">Avg / Call</th>
              </tr>
            </thead>
            <tbody>
              {toolGroups.map((group) => (
                <Fragment key={group.category}>
                  <tr
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer"
                    onClick={() => setExpandedTool(expandedTool === group.category ? null : group.category)}
                  >
                    <td className="py-2.5 px-3 text-white font-medium">
                      <span className="mr-2 text-zinc-500">{expandedTool === group.category ? '\u25BC' : '\u25B6'}</span>
                      {group.displayName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">{group.call_count}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">{group.total_credits}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      {group.call_count > 0 ? (group.total_credits / group.call_count).toFixed(1) : '0'}
                    </td>
                  </tr>
                  {expandedTool === group.category && group.operations.map((op) => (
                    <tr key={op.tool_id} className="border-b border-zinc-800/30 bg-zinc-800/10">
                      <td className="py-2 px-3 pl-10 text-zinc-400">{getOperationName(op.tool_id)}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">{op.call_count}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">{op.total_credits}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">
                        {op.call_count > 0 ? (op.total_credits / op.call_count).toFixed(1) : '0'}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top users */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Top Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">User</th>
                <th className="text-right py-2 px-3 font-medium">Calls</th>
                <th className="text-right py-2 px-3 font-medium">Credits</th>
                <th className="text-left py-2 px-3 font-medium">Top Tool</th>
                <th className="text-left py-2 px-3 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-2.5 px-3">
                    <Link href={`/ai-usage/users/${user.user_id}`} className="text-blue-400 hover:underline">
                      {user.display_name ?? user.email}
                    </Link>
                    {user.display_name && <p className="text-xs text-zinc-500">{user.email}</p>}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{user.call_count}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{user.total_credits}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{getToolDisplayName(user.most_used_tool)}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{new Date(user.last_active).toLocaleDateString()}</td>
                </tr>
              ))}
              {topUsers.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No usage data in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
