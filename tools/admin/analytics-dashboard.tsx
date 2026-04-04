'use client'

import { useState, useEffect, useCallback } from 'react'

interface AnalyticsData {
  users: { total: number; new: number; active: number }
  signupChart: { date: string; count: number }[]
  tools: { name: string; creditsUsed: number; usageCount: number; trend: 'up' | 'down' | 'flat' }[]
  credits: { purchased: number; consumed: number; conversionRate: number }
  creditsChart: { date: string; purchased: number; consumed: number }[]
  referrals: { total: number; creditsAwarded: number; conversionRate: number }
  topReferrers: { email: string; count: number; credits: number }[]
}

type Period = 7 | 30 | 90

const PERIODS: { label: string; value: Period }[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
]

function MetricCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color: color || '#fff' }}>{value}</p>
    </div>
  )
}

function SkeletonCard() {
  return <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 h-20 animate-pulse" />
}

function SkeletonChart() {
  return <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 h-[180px] animate-pulse" />
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>(30)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/admin/analytics?period=${p}`)
      const json = await res.json()
      setData(json.data ?? json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  const handlePeriod = (p: Period) => setPeriod(p)

  // --- Render helpers ---

  const trendIcon = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return <span className="text-[#10B981]">&#8593;</span>
    if (trend === 'down') return <span className="text-red-400">&#8595;</span>
    return <span className="text-slate-400">&#8594;</span>
  }

  // --- Loading state ---
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Analytics</h2>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#1e2631] text-slate-400 min-h-[44px]"
                disabled
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonChart />
        <SkeletonChart />
      </div>
    )
  }

  const d = data || {
    users: { total: 0, new: 0, active: 0 },
    signupChart: [],
    tools: [],
    credits: { purchased: 0, consumed: 0, conversionRate: 0 },
    creditsChart: [],
    referrals: { total: 0, creditsAwarded: 0, conversionRate: 0 },
    topReferrers: [],
  }

  const maxSignup = Math.max(1, ...d.signupChart.map((s) => s.count))
  const topTools = d.tools.slice(0, 5)
  const maxToolCredits = Math.max(1, ...topTools.map((t) => t.creditsUsed))
  const maxCreditsDay = Math.max(
    1,
    ...d.creditsChart.map((c) => Math.max(c.purchased, c.consumed))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Analytics</h2>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePeriod(p.value)}
              className={`px-3 py-1.5 text-xs rounded-lg min-h-[44px] transition-colors cursor-pointer ${
                period === p.value
                  ? 'bg-[#3D6AF2] text-white'
                  : 'bg-[#1e2631] text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: User Growth */}
      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">User Growth</h3>
        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <MetricCard label="Total Users" value={d.users.total.toLocaleString()} color="#3D6AF2" />
          <MetricCard label="New Users" value={d.users.new.toLocaleString()} color="#10B981" />
          <MetricCard label="Active Users" value={d.users.active.toLocaleString()} color="#7C3AED" />
        </div>

        {/* Signup bar chart */}
        {d.signupChart.length > 0 && (
          <div className="mt-3 rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
            <p className="text-xs text-slate-400 mb-2">Signups over time</p>
            <div className="flex items-end gap-1 h-[120px]">
              {d.signupChart.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-[6px]">
                  {s.count > 0 && (
                    <span className="text-[10px] text-slate-400 mb-0.5">{s.count}</span>
                  )}
                  <div
                    className="w-full bg-[#3D6AF2] rounded-t-sm min-w-[6px]"
                    style={{ height: `${(s.count / maxSignup) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Tool Usage */}
      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tool Usage</h3>

        {d.tools.length === 0 ? (
          <div className="rounded-xl bg-[#131a23] border border-[#1e2631] p-6 text-center text-sm text-slate-500">
            No tool usage in this period
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-xl bg-[#131a23] border border-[#1e2631] overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_80px_40px] gap-2 px-4 py-2 text-xs text-slate-500 border-b border-[#1e2631]">
                <span>Tool</span>
                <span className="text-right">Credits</span>
                <span className="text-right">Uses</span>
                <span className="text-right">Trend</span>
              </div>
              {d.tools.map((tool, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_80px_80px_40px] gap-2 px-4 py-2.5 text-sm border-b border-[#1e2631] last:border-b-0"
                >
                  <span className="text-white truncate">{tool.name}</span>
                  <span className="text-right text-slate-300">{tool.creditsUsed}</span>
                  <span className="text-right text-slate-300">{tool.usageCount}</span>
                  <span className="text-right">{trendIcon(tool.trend)}</span>
                </div>
              ))}
            </div>

            {/* Horizontal bars */}
            {topTools.length > 0 && (
              <div className="mt-3 rounded-xl bg-[#131a23] border border-[#1e2631] p-4 space-y-2">
                <p className="text-xs text-slate-400 mb-2">Top tools by credits</p>
                {topTools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 w-24 truncate shrink-0">{tool.name}</span>
                    <div className="flex-1 h-4 bg-[#1e2631] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3D6AF2] rounded-full"
                        style={{ width: `${(tool.creditsUsed / maxToolCredits) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{tool.creditsUsed}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Section 3: Credits */}
      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Credits</h3>
        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <MetricCard label="Purchased" value={d.credits.purchased.toLocaleString()} color="#10B981" />
          <MetricCard label="Consumed" value={d.credits.consumed.toLocaleString()} color="#3D6AF2" />
          <MetricCard label="Conversion" value={`${d.credits.conversionRate}%`} color="#7C3AED" />
        </div>

        {/* Credits chart */}
        {d.creditsChart.length > 0 && (
          <div className="mt-3 rounded-xl bg-[#131a23] border border-[#1e2631] p-4">
            <p className="text-xs text-slate-400 mb-2">Credits over time</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="inline-block w-2 h-2 rounded-sm bg-[#10B981]" /> Purchased
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="inline-block w-2 h-2 rounded-sm bg-[#3D6AF2]" /> Consumed
              </span>
            </div>
            <div className="flex items-end gap-1 h-[120px]">
              {d.creditsChart.map((c, i) => (
                <div key={i} className="flex-1 flex gap-px items-end h-full min-w-[6px]">
                  <div
                    className="flex-1 bg-[#10B981] rounded-t-sm min-w-[3px]"
                    style={{ height: `${(c.purchased / maxCreditsDay) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-[#3D6AF2] rounded-t-sm min-w-[3px]"
                    style={{ height: `${(c.consumed / maxCreditsDay) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 4: Referrals */}
      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Referrals</h3>
        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          <MetricCard label="Total Referrals" value={d.referrals.total.toLocaleString()} color="#3D6AF2" />
          <MetricCard label="Credits Awarded" value={d.referrals.creditsAwarded.toLocaleString()} color="#10B981" />
          <MetricCard label="Conversion" value={`${d.referrals.conversionRate}%`} color="#7C3AED" />
        </div>

        {/* Top referrers */}
        {d.topReferrers.length > 0 && (
          <div className="mt-3 rounded-xl bg-[#131a23] border border-[#1e2631] overflow-hidden">
            <div className="grid grid-cols-[1fr_60px_80px] gap-2 px-4 py-2 text-xs text-slate-500 border-b border-[#1e2631]">
              <span>Referrer</span>
              <span className="text-right">Count</span>
              <span className="text-right">Credits</span>
            </div>
            {d.topReferrers.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_60px_80px] gap-2 px-4 py-2.5 text-sm border-b border-[#1e2631] last:border-b-0"
              >
                <span className="text-white truncate">{r.email}</span>
                <span className="text-right text-slate-300">{r.count}</span>
                <span className="text-right text-slate-300">{r.credits}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
