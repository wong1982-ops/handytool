'use client'

import { useRef, useEffect } from 'react'

export interface HistoryEntry {
  label: string
  index: number
}

interface HistoryStripProps {
  entries: HistoryEntry[]
  currentIndex: number
  onGoToIndex: (index: number) => void
}

export function HistoryStrip({ entries, currentIndex, onGoToIndex }: HistoryStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Auto-scroll to keep the current entry visible
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const elLeft = el.offsetLeft
      const elWidth = el.offsetWidth
      const containerWidth = container.clientWidth
      const scrollLeft = container.scrollLeft

      // If the active element is outside the visible area, scroll to center it
      if (elLeft < scrollLeft || elLeft + elWidth > scrollLeft + containerWidth) {
        container.scrollTo({
          left: elLeft - containerWidth / 2 + elWidth / 2,
          behavior: 'smooth',
        })
      }
    }
  }, [currentIndex])

  if (entries.length <= 1) return null

  return (
    <div className="h-12 bg-slate-900 border-t border-slate-700 shrink-0 flex items-center px-2 gap-1">
      {/* History icon */}
      <div className="shrink-0 text-slate-500 px-1" aria-hidden="true">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto flex items-center gap-1 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="listbox"
        aria-label="Edit history"
      >
        {entries.map((entry) => {
          const isCurrent = entry.index === currentIndex
          const isFuture = entry.index > currentIndex

          return (
            <button
              key={entry.index}
              ref={isCurrent ? activeRef : undefined}
              role="option"
              aria-selected={isCurrent}
              onClick={() => onGoToIndex(entry.index)}
              className={[
                'shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap border',
                isCurrent
                  ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/15 text-white'
                  : isFuture
                    ? 'border-transparent bg-slate-800/50 text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                    : 'border-transparent bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700',
              ].join(' ')}
            >
              {entry.label}
            </button>
          )
        })}
      </div>

      {/* Entry count */}
      <div className="shrink-0 text-[10px] text-slate-600 px-1 tabular-nums">
        {currentIndex + 1}/{entries.length}
      </div>
    </div>
  )
}
