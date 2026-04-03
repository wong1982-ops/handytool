'use client'

import { useState, useEffect, useCallback } from 'react'
import type { RegexState, HistoryEntry } from './types'
import { getHistory, clearHistory } from './history'

interface HistoryDrawerProps {
  open: boolean
  onClose: () => void
  onRestore: (state: Partial<RegexState>) => void
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max) + '...'
}

export function HistoryDrawer({ open, onClose, onRestore }: HistoryDrawerProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    if (open) {
      setEntries(getHistory())
    }
  }, [open])

  const handleClearAll = useCallback(() => {
    clearHistory()
    setEntries([])
  }, [])

  const handleRestore = useCallback(
    (entry: HistoryEntry) => {
      onRestore({
        regex: entry.regex,
        flags: entry.flags,
        testInput: entry.testInput,
        mode: entry.mode,
      })
      onClose()
    },
    [onRestore, onClose],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-[#131a23] border-l border-[#1e2631] flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2631]">
          <h2 className="text-sm font-semibold text-white">History</h2>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-medium text-[#EF4444] hover:text-[#f87171] transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#70767f] hover:text-[#a6abb5] hover:bg-[#1e2631] transition-colors cursor-pointer"
              aria-label="Close history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="w-10 h-10 mb-3 text-[#1e2631]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[#70767f]">No history yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((entry, i) => (
                <button
                  key={`${entry.timestamp}-${i}`}
                  onClick={() => handleRestore(entry)}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-[#1e2631] transition-colors cursor-pointer min-h-[44px] group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs text-white truncate font-medium">
                      /{truncate(entry.regex, 30)}/{entry.flags}
                    </span>
                    <span className="text-[10px] text-[#70767f] shrink-0">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  {entry.testInput && (
                    <p className="text-[11px] text-[#70767f] truncate">
                      {truncate(entry.testInput.replace(/\n/g, ' '), 50)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
