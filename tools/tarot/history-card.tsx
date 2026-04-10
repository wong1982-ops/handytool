'use client'

import type { Language, SpreadCategory } from '@/tools/tarot/tarot-types'
import { getSpread } from '@/tools/tarot/tarot-spreads'

export interface SavedReading {
  id: string
  spread_id: string
  question: string
  category: SpreadCategory | null
  created_at: string
  cards: { cardId: number; positionIndex: number; reversed: boolean }[]
}

interface Props {
  reading: SavedReading
  language: Language
  onClick: () => void
  onDelete: () => void
}

export function HistoryCard({ reading, language, onClick, onDelete }: Props) {
  const spread = getSpread(reading.spread_id)
  const spreadName = spread ? spread.name[language] : reading.spread_id
  const date = new Date(reading.created_at).toLocaleDateString()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="group relative flex flex-col gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 cursor-pointer transition-all hover:border-purple-500/40 hover:bg-purple-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
    >
      {/* Spread name */}
      <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
        {spreadName}
      </p>

      {/* Question */}
      <p className="text-sm text-slate-200 leading-snug line-clamp-1">
        {reading.question || '—'}
      </p>

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#70767f]">
        <span>{date}</span>
        <span>{reading.cards.length} cards</span>
      </div>

      {/* Delete button */}
      <button
        type="button"
        aria-label="Delete reading"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute right-3 top-3 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        {/* Trash icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  )
}
