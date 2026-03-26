'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SavedComponent } from './types'

interface LibraryEntry {
  id: string
  name: string
  slug: string
  tags: string[]
  prompt: string
  settings: unknown
  thumbnail_url: string | null
  is_public: boolean
  copy_count: number
  created_at: string
  updated_at: string
}

function toSavedComponent(e: LibraryEntry): SavedComponent {
  return {
    id: e.id,
    name: e.name,
    slug: e.slug,
    tags: e.tags ?? [],
    prompt: e.prompt ?? '',
    settings: e.settings as SavedComponent['settings'],
    codeReact: '',
    codeVue: '',
    codeSvelte: '',
    codeHtml: '',
    thumbnailUrl: e.thumbnail_url,
    isPublic: e.is_public,
    copyCount: e.copy_count,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  }
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

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LibraryGrid() {
  const router = useRouter()
  const [entries, setEntries] = useState<SavedComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLibrary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/component-lab/library')
      if (!res.ok) throw new Error('Failed to load library')
      const json = await res.json()
      setEntries((json.data?.entries ?? []).map(toSavedComponent))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLibrary()
  }, [fetchLibrary])

  const handleTogglePublic = useCallback(
    async (id: string, currentPublic: boolean) => {
      // Optimistic update
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isPublic: !currentPublic } : e)),
      )
      try {
        const res = await fetch('/api/v1/component-lab/library', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isPublic: !currentPublic }),
        })
        if (!res.ok) throw new Error('Update failed')
      } catch {
        // Revert on failure
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isPublic: currentPublic } : e)),
        )
      }
    },
    [],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      const prev = entries
      setEntries((list) => list.filter((e) => e.id !== id))
      try {
        const res = await fetch(`/api/v1/component-lab/library?id=${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Delete failed')
      } catch {
        setEntries(prev)
      }
    },
    [entries],
  )

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
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
          onClick={fetchLibrary}
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
            d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
          />
        </svg>
        <p className="text-white font-semibold text-sm">No saved components yet</p>
        <p className="text-[#70767f] text-xs max-w-xs">
          Generate a component in the lab and save it to build your library.
        </p>
        <button
          type="button"
          onClick={() => router.push('/tools/component-lab')}
          className="mt-2 px-6 min-h-[44px] rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold text-sm cursor-pointer"
        >
          Open Lab
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-xl bg-[#131a23] border border-[#1e2631] hover:border-[#3D6AF2]/30 transition-all group overflow-hidden"
        >
          {/* Gradient fallback thumbnail */}
          <button
            type="button"
            onClick={() => router.push(`/tools/component-lab?load=${entry.slug}`)}
            className="w-full aspect-[16/10] bg-gradient-to-br cursor-pointer block"
          >
            <div
              className={`w-full h-full bg-gradient-to-br ${gradientFor(entry.id)} opacity-60 group-hover:opacity-80 transition-opacity flex items-center justify-center`}
            >
              <svg
                width="32"
                height="32"
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
          </button>

          <div className="p-3">
            {/* Name */}
            <button
              type="button"
              onClick={() => router.push(`/tools/component-lab?load=${entry.slug}`)}
              className="text-white font-semibold text-sm truncate block w-full text-left group-hover:text-[#3D6AF2] transition-colors cursor-pointer"
            >
              {entry.name}
            </button>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {entry.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1e2631] text-[#a6abb5]"
                  >
                    {tag}
                  </span>
                ))}
                {entry.tags.length > 3 && (
                  <span className="text-[10px] text-[#70767f]">
                    +{entry.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Date + actions */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#70767f]">
                {formatDate(entry.updatedAt)}
              </span>

              <div className="flex items-center gap-1">
                {/* Share toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTogglePublic(entry.id, entry.isPublic)
                  }}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                    entry.isPublic
                      ? 'text-[#3D6AF2] hover:bg-[#3D6AF2]/10'
                      : 'text-[#70767f] hover:text-[#a6abb5] hover:bg-[#1e2631]'
                  }`}
                  aria-label={entry.isPublic ? 'Make private' : 'Make public'}
                  title={entry.isPublic ? 'Public (click to make private)' : 'Private (click to make public)'}
                >
                  {entry.isPublic ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.243-3.068a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L5.25 9.75" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  )}
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(entry.id)
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#70767f] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label={`Delete ${entry.name}`}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
