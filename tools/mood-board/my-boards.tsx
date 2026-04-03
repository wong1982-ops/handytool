'use client'

import { useState, useEffect, useCallback } from 'react'

interface BoardEntry {
  id: string
  title?: string | null
  theme?: string | null
  elements?: { type: string; src?: string; [key: string]: unknown }[]
  shared?: boolean
  created_at: string
}

interface MyBoardsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoadBoard: (entry: any) => void
  onBack: () => void
}

export function MyBoards({ onLoadBoard, onBack }: MyBoardsProps) {
  const [entries, setEntries] = useState<BoardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/mood-board/history')
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load history')
        return
      }
      setEntries(json.data?.entries ?? [])
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-[#70767f] hover:text-white transition-colors cursor-pointer w-fit mb-6 bg-transparent border-none p-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to board
      </button>

      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">My Boards</h2>
        {!loading && !error && entries.length > 0 && (
          <span className="text-[13px] text-[#70767f]">{entries.length} {entries.length === 1 ? 'board' : 'boards'}</span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-[#3D6AF2]/30 border-t-[#3D6AF2] rounded-full animate-spin" />
          <p className="text-sm text-[#70767f]">Loading your boards...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={fetchHistory}
            className="text-sm text-[#3D6AF2] font-medium hover:underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#3D6AF2]/10 flex items-center justify-center mb-1">
            {/* Canvas / layout icon */}
            <svg className="w-7 h-7 text-[#3D6AF2]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zm0 9.75C2.25 16.254 2.754 15.75 3.375 15.75h6c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-1.5zm9.75-9.75c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-1.5zm0 9c0-.621.504-1.125 1.125-1.125h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75z" />
            </svg>
          </div>
          <p className="text-white font-semibold">No boards yet</p>
          <p className="text-sm text-[#70767f] max-w-xs">Create your first mood board to see it here.</p>
        </div>
      )}

      {/* Entry list */}
      {!loading && !error && entries.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {entries.map((entry) => {
            const firstImage = entry.elements?.find((el) => el.type === 'image' && el.src)
            const title = entry.title || 'Untitled Board'
            const elementCount = entry.elements?.length ?? 0
            const dateLabel = new Date(entry.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onLoadBoard(entry)}
                className="w-full rounded-xl bg-[#131a23] hover:bg-[#1e2631] border border-[#1e2631] hover:border-[#3D6AF2]/30 transition-all p-4 text-left cursor-pointer group"
              >
                <div className="flex gap-4 items-start">
                  {/* Thumbnail */}
                  {firstImage?.src ? (
                    <img
                      src={firstImage.src as string}
                      alt={title}
                      className="w-16 h-16 rounded-[10px] object-cover shrink-0 bg-white"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-[10px] shrink-0 bg-white/5 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#70767f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-[#3D9DF2] transition-colors">
                        {title}
                      </p>
                      {entry.shared && (
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3D6AF2]/20 text-[#3D6AF2]">
                          Shared
                        </span>
                      )}
                    </div>

                    {entry.theme && (
                      <p className="text-[#70767f] text-xs truncate">{entry.theme}</p>
                    )}

                    <p className="text-[#70767f] text-xs mt-1.5">
                      {elementCount} {elementCount === 1 ? 'element' : 'elements'} &middot; {dateLabel}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
