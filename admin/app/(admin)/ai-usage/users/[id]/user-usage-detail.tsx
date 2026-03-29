'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { ToolUsageRow, UserTransactionRow } from '@/lib/ai-usage'
import { getToolCategory, getToolDisplayName, getOperationName, TOOL_CATEGORIES } from '@/lib/ai-usage'

const BRAND_BLUE = '#3D6AF2'
const PRESETS = [7, 14, 30, 90]

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: 8,
  color: '#fafafa',
}

interface UserInfo {
  user_id: string
  email: string
  display_name: string | null
}

interface UserSummary {
  total_calls: number
  total_credits: number
  favorite_tool: string
  first_active: string | null
  last_active: string | null
}

interface PageData {
  user: UserInfo
  summary: UserSummary
  tool_breakdown: ToolUsageRow[]
  transactions: UserTransactionRow[]
  pagination: { page: number; per_page: number; total: number }
}

export function UserUsageDetail({ userId }: { userId: string }) {
  const [preset, setPreset] = useState(30)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (customFrom && customTo) {
      p.set('from', customFrom)
      p.set('to', customTo)
    } else {
      p.set('preset', String(preset))
    }
    p.set('page', String(page))

    try {
      const res = await fetch(`/api/ai-usage/users/${userId}?${p.toString()}`)
      const json = await res.json()
      setData(json.data ?? null)
    } catch (err) {
      console.error('Failed to fetch user usage:', err)
    }
    setLoading(false)
  }, [userId, preset, customFrom, customTo, page])

  useEffect(() => { fetchData() }, [fetchData])

  const toolGroups = useMemo(() => {
    if (!data) return []
    const groups = new Map<string, { call_count: number; total_credits: number }>()
    for (const row of data.tool_breakdown) {
      const cat = getToolCategory(row.tool_id)
      const group = groups.get(cat) ?? { call_count: 0, total_credits: 0 }
      group.call_count += row.call_count
      group.total_credits += row.total_credits
      groups.set(cat, group)
    }
    return Array.from(groups.entries())
      .map(([cat, vals]) => ({ name: TOOL_CATEGORIES[cat] ?? cat, ...vals }))
      .sort((a, b) => b.total_credits - a.total_credits)
  }, [data])

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.per_page) : 0

  if (loading && !data) {
    return <div className="h-96 rounded-xl bg-zinc-900 animate-pulse" />
  }

  if (!data) {
    return <p className="text-zinc-400">No data found.</p>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ai-usage" className="text-zinc-400 hover:text-white transition-colors min-h-[44px] flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{data.user.display_name ?? data.user.email}</h1>
          {data.user.display_name && <p className="text-sm text-zinc-400">{data.user.email}</p>}
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setPreset(p); setCustomFrom(''); setCustomTo(''); setPage(1) }}
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
            onChange={(e) => { setCustomFrom(e.target.value); setPage(1) }}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
          <span className="text-zinc-500">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => { setCustomTo(e.target.value); setPage(1) }}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Total Calls</p>
          <p className="text-2xl font-bold text-white">{data.summary.total_calls.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Credits Consumed</p>
          <p className="text-2xl font-bold text-white">{data.summary.total_credits.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Favorite Tool</p>
          <p className="text-2xl font-bold text-white">{getToolDisplayName(data.summary.favorite_tool)}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Last Active</p>
          <p className="text-2xl font-bold text-white">
            {data.summary.last_active ? new Date(data.summary.last_active).toLocaleDateString() : '\u2014'}
          </p>
        </div>
      </div>

      {/* Tool breakdown chart */}
      {toolGroups.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Usage by Tool</h2>
          <ResponsiveContainer width="100%" height={Math.max(200, toolGroups.length * 48)}>
            <BarChart data={toolGroups} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#a1a1aa', fontSize: 12 }} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total_credits" name="Credits" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction history */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">Date</th>
                <th className="text-left py-2 px-3 font-medium">Tool</th>
                <th className="text-left py-2 px-3 font-medium">Operation</th>
                <th className="text-right py-2 px-3 font-medium">Credits</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-2.5 px-3 text-zinc-300">
                    {new Date(txn.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">{getToolDisplayName(txn.tool_id)}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{getOperationName(txn.tool_id)}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{Math.abs(txn.amount)}</td>
                </tr>
              ))}
              {data.transactions.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-500">No transactions in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-400">
              Page {page} of {totalPages} ({data.pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm disabled:opacity-40 hover:bg-zinc-700 transition-colors min-h-[44px]"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm disabled:opacity-40 hover:bg-zinc-700 transition-colors min-h-[44px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
