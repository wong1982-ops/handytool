'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ExploreEntry {
  id: string
  name: string
  slug: string
  tags: string[]
  thumbnail_url: string | null
  copy_count: number
  created_at: string
}

const GRADIENT_FALLBACKS = [
  'from-blue-600 to-purple-600',
  'from-emerald-500 to-cyan-500',
  'from-orange-500 to-pink-500',
  'from-violet-500 to-indigo-500',
  'from-rose-500 to-amber-500',
  'from-teal-500 to-blue-500',
]

function gradientFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return GRADIENT_FALLBACKS[Math.abs(hash) % GRADIENT_FALLBACKS.length]
}

type SortMode = 'newest' | 'popular'

export default function ExploreGrid() {
  const router = useRouter()
  const [entries, setEntries] = useState<ExploreEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortMode>('newest')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const fetchEntries = useCallback(
    async (sortMode: SortMode, pageOffset: number, append: boolean) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          sort: sortMode,
          offset: String(pageOffset),
        })
        const res = await fetch(`/api/v1/component-lab/explore?${params}`)
        if (!res.ok) throw new Error('Failed to load components')
        const json = await res.json()
        const newEntries: ExploreEntry[] = json.data?.entries ?? []

        if (append) {
          setEntries((prev) => [...prev, ...newEntries])
        } else {
          setEntries(newEntries)
        }
        setHasMore(json.data?.hasMore ?? false)
        setOffset(pageOffset + newEntries.length)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load components')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [],
  )

  useEffect(() => {
    fetchEntries(sort, 0, false)
  }, [sort, fetchEntries])

  const handleSortChange = useCallback((newSort: SortMode) => {
    setSort(newSort)
    setOffset(0)
  }, [])

  const handleLoadMore = useCallback(() => {
    fetchEntries(sort, offset, true)
  }, [fetchEntries, sort, offset])

  // Loading state
  if (loading) {
    return (
      <div>
        {/* Sort toggle skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-20 rounded-full bg-[#1e2631] animate-pulse" />
          <div className="h-9 w-20 rounded-full bg-[#1e2631] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#131a23] border border-[#1e2631] p-4 animate-pulse"
            >
              <div className="aspect-[16/10] rounded-lg bg-[#1e2631] mb-3" />
              <div className="h-4 w-2/3 rounded bg-[#1e2631] mb-2" />
              <div className="h-3 w-1/3 rounded bg-[#1e2631]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
        <button
          type="button"
          onClick={() => fetchEntries(sort, 0, false)}
          className="px-4 min-h-[44px] rounded-xl border border-[#3D6AF2] text-[#3D6AF2] font-semibold text-sm hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#70767f"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
        <p className="text-white font-semibold text-sm">No public components yet</p>
        <p className="text-[#70767f] text-xs max-w-xs">
          Be the first to share a component with the community.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Sort toggle */}
      <div className="flex items-center gap-2 mb-4">
        {(['newest', 'popular'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleSortChange(mode)}
            className={`px-4 min-h-[44px] rounded-full text-sm font-semibold transition-all cursor-pointer ${
              sort === mode
                ? 'bg-[#3D6AF2] text-white'
                : 'bg-[#131a23] text-[#a6abb5] hover:bg-[#1a2333] hover:text-white border border-[#1e2631]'
            }`}
            aria-pressed={sort === mode}
          >
            {mode === 'newest' ? 'Newest' : 'Popular'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => router.push(`/tools/component-lab/view/${entry.slug}`)}
            className="rounded-xl bg-[#131a23] border border-[#1e2631] hover:border-[#3D6AF2]/30 transition-all group overflow-hidden text-left cursor-pointer"
          >
            {/* Gradient fallback */}
            <div
              className={`w-full aspect-[16/10] bg-gradient-to-br ${gradientFor(entry.id)} opacity-60 group-hover:opacity-80 transition-opacity flex items-center justify-center`}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                />
              </svg>
            </div>

            <div className="p-3">
              <p className="text-white font-semibold text-sm truncate group-hover:text-[#3D6AF2] transition-colors">
                {entry.name}
              </p>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {entry.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1e2631] text-[#a6abb5]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Copy count badge */}
              <div className="flex items-center gap-1 mt-2">
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#70767f"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m0 0a2.625 2.625 0 0 1 5.25 0"
                  />
                </svg>
                <span className="text-[10px] text-[#70767f]">
                  {entry.copy_count}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 min-h-[44px] rounded-xl border border-[#3D6AF2] text-[#3D6AF2] font-semibold text-sm hover:bg-[#3D6AF2]/10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
