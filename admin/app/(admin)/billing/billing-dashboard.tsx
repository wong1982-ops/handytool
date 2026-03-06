'use client'

import { useEffect, useState } from 'react'

interface DashboardStats {
  activeSubscribers: number
  creditsToday: number
  creditsThisWeek: number
  creditsThisMonth: number
  lowBalanceUsers: number
}

const METRIC_CARDS: {
  key: keyof DashboardStats
  label: string
  color: string
  bgColor: string
}[] = [
  { key: 'activeSubscribers', label: 'Active Subscribers', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'creditsToday', label: 'Credits Today', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/20' },
  { key: 'creditsThisWeek', label: 'Credits This Week', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'creditsThisMonth', label: 'Credits This Month', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  { key: 'lowBalanceUsers', label: 'Low Balance Users', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20' },
]

export function BillingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Billing Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {METRIC_CARDS.map((card) => (
          <div
            key={card.key}
            className={`rounded-xl border p-5 ${card.bgColor}`}
          >
            <p className="text-sm text-zinc-400 mb-2">{card.label}</p>
            {loading ? (
              <div className="h-8 w-20 bg-zinc-700/50 rounded animate-pulse" />
            ) : (
              <p className={`text-2xl font-bold ${card.color}`}>
                {stats ? stats[card.key].toLocaleString() : '--'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
