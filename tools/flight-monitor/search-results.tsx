'use client'

import type { FlightOffer } from './types'
import { FlightCard } from './flight-card'

interface SearchResultsProps {
  offers: FlightOffer[]
  loading: boolean
  cachedAt: string | null
  onSetAlert: (offer: FlightOffer) => void
  onRefresh: () => void
}

function getMinutesAgo(cachedAt: string): number {
  const diff = Date.now() - new Date(cachedAt).getTime()
  return Math.max(0, Math.round(diff / 60_000))
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] p-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:w-36">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-[#1e2631]" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-[#1e2631]" />
            <div className="h-2.5 w-14 rounded bg-slate-200 dark:bg-[#1e2631]" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="space-y-1.5 text-right">
              <div className="h-5 w-12 rounded bg-slate-200 dark:bg-[#1e2631]" />
              <div className="h-2.5 w-8 rounded bg-slate-200 dark:bg-[#1e2631]" />
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="h-2.5 w-10 rounded bg-slate-200 dark:bg-[#1e2631]" />
              <div className="w-full h-px bg-slate-200 dark:bg-[#1e2631]" />
              <div className="h-2.5 w-8 rounded bg-slate-200 dark:bg-[#1e2631]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-5 w-12 rounded bg-slate-200 dark:bg-[#1e2631]" />
              <div className="h-2.5 w-8 rounded bg-slate-200 dark:bg-[#1e2631]" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
          <div className="h-6 w-16 rounded bg-slate-200 dark:bg-[#1e2631]" />
          <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-[#1e2631]" />
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] p-8 text-center">
      <svg className="w-12 h-12 mx-auto text-[#2a3545] mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
      <p className="text-sm text-slate-500 dark:text-[#a6abb5]">No flights found for this route.</p>
      <p className="text-xs text-slate-400 dark:text-[#70767f] mt-1">Try different dates or airports.</p>
    </div>
  )
}

export function SearchResults({ offers, loading, cachedAt, onSetAlert, onRefresh }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState />
      </div>
    )
  }

  const minutesAgo = cachedAt ? getMinutesAgo(cachedAt) : null

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500 dark:text-[#a6abb5]">
          <span className="font-medium text-white">{offers.length}</span> flight{offers.length !== 1 ? 's' : ''} found
        </p>

        <div className="flex items-center gap-2">
          {minutesAgo !== null && (
            <span className="text-xs text-slate-400 dark:text-[#70767f]">
              Cached &middot; refreshed {minutesAgo === 0 ? 'just now' : `${minutesAgo} min ago`}
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs text-[#3D6AF2] hover:text-[#6b8ff7] font-medium transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Results */}
      {offers.map((offer, i) => (
        <FlightCard key={`${offer.flightNumber}-${i}`} offer={offer} onSetAlert={onSetAlert} />
      ))}
    </div>
  )
}
