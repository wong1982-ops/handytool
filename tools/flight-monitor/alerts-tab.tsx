'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertCard } from './alert-card'
import type { FlightAlert } from './types'

interface AlertsTabProps {
  onAlertCountChange: (count: number) => void
}

export function AlertsTab({ onAlertCountChange }: AlertsTabProps) {
  const [alerts, setAlerts] = useState<FlightAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/flights/alerts')
      if (!res.ok) throw new Error('Failed to load alerts')
      const json = await res.json()
      const list: FlightAlert[] = json.data?.alerts ?? []
      setAlerts(list)
      const dropCount = list.filter((a) => a.status === 'price_drop').length
      onAlertCountChange(dropCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [onAlertCountChange])

  useEffect(() => {
    void fetchAlerts()
  }, [fetchAlerts])

  async function handleEdit(id: string, targetPrice: number) {
    try {
      const res = await fetch(`/api/v1/flights/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPrice }),
      })
      if (!res.ok) throw new Error('Failed to update alert')
      await fetchAlerts()
    } catch (err) {
      console.error('[alerts-tab] edit error:', err)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/v1/flights/alerts/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete alert')
      // Optimistic remove, then refresh
      setAlerts((prev) => {
        const next = prev.filter((a) => a.id !== id)
        const dropCount = next.filter((a) => a.status === 'price_drop').length
        onAlertCountChange(dropCount)
        return next
      })
    } catch (err) {
      console.error('[alerts-tab] delete error:', err)
    }
  }

  const activeCount = alerts.filter((a) => a.status !== 'expired').length

  return (
    <section aria-label="Tracked flight alerts">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold">Tracked Routes</h2>
        {!loading && !error && (
          <p className="text-[#a6abb5] text-sm mt-0.5">
            {activeCount === 0
              ? 'No active alerts'
              : `${activeCount} active alert${activeCount !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && <SkeletonList />}

      {/* Error state */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl bg-[#131a23] border border-[#EF4444]/30 p-6 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-[#EF4444] text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void fetchAlerts()}
            className="rounded-lg bg-[#1e2631] text-white text-sm font-medium px-5 hover:bg-[#2a3340] transition-colors"
            style={{ minHeight: '44px' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && alerts.length === 0 && <EmptyState />}

      {/* Alert list */}
      {!loading && !error && alerts.length > 0 && (
        <ul className="flex flex-col gap-4" role="list">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <AlertCard alert={alert} onEdit={handleEdit} onDelete={handleDelete} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Loading alerts">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5 animate-pulse"
          style={{ minHeight: '140px' }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 rounded bg-[#1e2631]" />
              <div className="h-4 w-4 rounded bg-[#1e2631]" />
              <div className="h-4 w-24 rounded bg-[#1e2631]" />
              <div className="ml-auto h-6 w-20 rounded-full bg-[#1e2631]" />
            </div>
            <div className="flex gap-6 mt-1">
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-16 rounded bg-[#1e2631]" />
                <div className="h-7 w-20 rounded bg-[#1e2631]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-16 rounded bg-[#1e2631]" />
                <div className="h-5 w-16 rounded bg-[#1e2631]" />
              </div>
            </div>
            <div className="h-9 w-full rounded bg-[#1e2631] mt-1" />
            <div className="flex gap-2 mt-1">
              <div className="h-10 w-24 rounded-lg bg-[#1e2631]" />
              <div className="h-10 w-16 rounded-lg bg-[#1e2631]" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      {/* SVG illustration */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer circle */}
        <circle cx="36" cy="36" r="35" stroke="#1e2631" strokeWidth="2" />
        {/* Bell shape */}
        <path
          d="M36 18c-7.18 0-13 5.82-13 13v9l-3 3v2h32v-2l-3-3v-9c0-7.18-5.82-13-13-13Z"
          stroke="#70767f"
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Bell clapper */}
        <path
          d="M33 45a3 3 0 0 0 6 0"
          stroke="#70767f"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        {/* Slash — no alert */}
        <line
          x1="22"
          y1="50"
          x2="50"
          y2="22"
          stroke="#3D6AF2"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      <div>
        <p className="text-white font-semibold text-base">No alerts yet</p>
        <p className="text-[#70767f] text-sm mt-1 max-w-xs mx-auto">
          Search for a route and set your target price to start tracking flight deals.
        </p>
      </div>
    </div>
  )
}
