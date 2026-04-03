'use client'

import { useCallback, useEffect, useState } from 'react'
import { DealCard } from './deal-card'
import type { FlightDeal } from './types'

type SortOption = 'discount' | 'price' | 'newest'
type FromFilter = 'all' | string

const FROM_CITIES: { value: string; label: string }[] = [
  { value: 'SYD', label: 'From: Sydney' },
  { value: 'MEL', label: 'From: Melbourne' },
  { value: 'BNE', label: 'From: Brisbane' },
  { value: 'PER', label: 'From: Perth' },
  { value: 'ADL', label: 'From: Adelaide' },
]

interface DealsTabProps {
  onSetAlert: (origin: string, destination: string) => void
  onSearch: (origin: string, destination: string) => void
}

interface DealsApiResponse {
  data: {
    deals: FlightDeal[]
    stale?: boolean
  }
}

function computeUpdatedAgo(deals: FlightDeal[]): string {
  if (deals.length === 0) return 'unknown'

  const timestamps = deals
    .map((d) => new Date(d.computed_at).getTime())
    .filter((t) => !isNaN(t))

  if (timestamps.length === 0) return 'unknown'

  const newest = Math.max(...timestamps)
  const diffMs = Date.now() - newest
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours === 1) return '1 hour ago'
  return `${diffHours} hours ago`
}

export function DealsTab({ onSetAlert, onSearch }: DealsTabProps) {
  const [deals, setDeals] = useState<FlightDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [from, setFrom] = useState<FromFilter>('all')
  const [sort, setSort] = useState<SortOption>('discount')

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (from !== 'all') params.set('from', from)
      params.set('sort', sort)

      const res = await fetch(`/api/v1/flights/deals?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load deals')

      const json: DealsApiResponse = await res.json()
      setDeals(json.data?.deals ?? [])
      setStale(json.data?.stale ?? false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [from, sort])

  useEffect(() => {
    void fetchDeals()
  }, [fetchDeals])

  const updatedAgo = computeUpdatedAgo(deals)

  return (
    <section aria-label="Flight deals">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-white text-xl font-bold">Flight Deals</h2>
        <p className="text-[#a6abb5] text-sm mt-0.5">
          Best fares with the biggest discounts right now
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        {/* From city dropdown */}
        <div className="relative">
          <label htmlFor="deals-from-filter" className="sr-only">
            Filter by origin city
          </label>
          <select
            id="deals-from-filter"
            value={from}
            onChange={(e) => setFrom(e.target.value as FromFilter)}
            className="appearance-none rounded-lg bg-[#131a23] border border-[#1e2631] text-[#a6abb5] text-sm pl-3 pr-8 focus:outline-none focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] cursor-pointer hover:border-[#70767f] transition-colors"
            style={{ minHeight: '44px' }}
          >
            <option value="all">All cities</option>
            {FROM_CITIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#70767f]" />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <label htmlFor="deals-sort" className="sr-only">
            Sort deals by
          </label>
          <select
            id="deals-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none rounded-lg bg-[#131a23] border border-[#1e2631] text-[#a6abb5] text-sm pl-3 pr-8 focus:outline-none focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] cursor-pointer hover:border-[#70767f] transition-colors"
            style={{ minHeight: '44px' }}
          >
            <option value="discount">Biggest discount</option>
            <option value="price">Lowest price</option>
            <option value="newest">Newest</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#70767f]" />
        </div>

        {/* Freshness indicator */}
        {!loading && deals.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[#70767f]">
            <CheckCircleIcon className="text-[#10B981]" />
            <span>Updated {updatedAgo}</span>
          </div>
        )}
      </div>

      {/* Stale banner */}
      {stale && !loading && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex items-center gap-2"
        >
          <WarningIcon className="text-amber-400 shrink-0" />
          <p className="text-amber-400 text-sm">
            Deals data is being updated — check back soon
          </p>
        </div>
      )}

      {/* Loading state — 4 skeleton cards */}
      {loading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          aria-busy="true"
          aria-label="Loading deals"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-[#131a23] border border-[#1e2631] p-5 animate-pulse"
              style={{ minHeight: '200px' }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 rounded bg-[#1e2631]" />
                  <div className="h-3 w-3 rounded bg-[#1e2631]" />
                  <div className="h-5 w-20 rounded bg-[#1e2631]" />
                </div>
                <div className="h-6 w-12 rounded-full bg-[#1e2631]" />
              </div>
              <div className="h-3 w-40 rounded bg-[#1e2631] mb-4" />
              <div className="flex items-end justify-between mb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-16 rounded bg-[#1e2631]" />
                  <div className="h-7 w-20 rounded bg-[#1e2631]" />
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <div className="h-3 w-14 rounded bg-[#1e2631]" />
                  <div className="h-5 w-16 rounded bg-[#1e2631]" />
                </div>
              </div>
              <div className="h-6 w-full rounded bg-[#1e2631] mb-4" />
              <div className="flex gap-2">
                <div className="flex-1 h-11 rounded-lg bg-[#1e2631]" />
                <div className="flex-1 h-11 rounded-lg bg-[#1e2631]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl bg-[#131a23] border border-[#EF4444]/30 p-6 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-[#EF4444] text-sm">{error}</p>
          <button
            type="button"
            onClick={() => void fetchDeals()}
            className="rounded-lg bg-[#1e2631] text-white text-sm font-medium px-5 hover:bg-[#2a3340] transition-colors"
            style={{ minHeight: '44px' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && deals.length === 0 && <EmptyState />}

      {/* Deals grid */}
      {!loading && !error && deals.length > 0 && (
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          role="list"
          aria-label="Available deals"
        >
          {deals.map((deal) => (
            <li key={deal.id}>
              <DealCard deal={deal} onSetAlert={onSetAlert} onSearch={onSearch} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="36" cy="36" r="35" stroke="#1e2631" strokeWidth="2" />
        {/* Tag shape */}
        <path
          d="M24 24h12l12 12-12 12-12-12V24Z"
          stroke="#70767f"
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="29" cy="29" r="2" fill="#70767f" />
        {/* Slash */}
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
        <p className="text-white font-semibold text-base">No deals found</p>
        <p className="text-[#70767f] text-sm mt-1 max-w-xs mx-auto">
          Try changing the origin city or check back later for fresh deals.
        </p>
      </div>
    </div>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
