'use client'

import type { TarotSpread, Language } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface SpreadCardProps {
  spread: TarotSpread
  language: Language
  selected: boolean
  recommended: boolean
  onClick: () => void
  t: I18nStrings
}

export function SpreadCard({ spread, language, selected, recommended, onClick, t }: SpreadCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative w-full text-left rounded-2xl border p-4 transition-all cursor-pointer min-h-[44px]',
        'bg-white dark:bg-[#0d1420]',
        'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]',
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/30 shadow-md shadow-purple-500/10'
          : 'border-slate-200 dark:border-[#1e2631] hover:border-purple-300 dark:hover:border-purple-700',
      ].join(' ')}
      aria-pressed={selected}
    >
      {/* Recommended badge */}
      {recommended && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 px-2.5 py-0.5 text-[10px] font-semibold text-white leading-tight">
          {t.spreadStep.recommended}
        </span>
      )}

      {/* Miniature layout preview */}
      <div
        className="relative w-full rounded-xl overflow-hidden mb-3 bg-slate-50 dark:bg-[#131a23] border border-slate-100 dark:border-[#1e2631]"
        style={{ paddingBottom: '60%' }}
        aria-hidden="true"
      >
        <div className="absolute inset-0">
          {spread.positions.map((pos, i) => (
            <div
              key={i}
              className={[
                'absolute w-[9%] rounded-sm border',
                selected
                  ? 'bg-purple-400/60 border-purple-500/70'
                  : 'bg-purple-300/40 dark:bg-purple-500/30 border-purple-400/50 dark:border-purple-500/40',
              ].join(' ')}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotation ?? 0}deg)`,
                aspectRatio: '2/3',
              }}
            />
          ))}
        </div>
      </div>

      {/* Spread info */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-[#e8eaf0] leading-snug">
            {spread.name[language]}
          </h3>
          <span className="shrink-0 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 rounded-full px-2 py-0.5 leading-tight">
            {spread.cardCount} {t.spreadStep.cards}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a6abb5] leading-relaxed line-clamp-2">
          {spread.description[language]}
        </p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="mt-3 flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm3.854-8.854a.5.5 0 0 0-.708-.708L7 9.586 4.854 7.44a.5.5 0 1 0-.708.708l2.5 2.5a.5.5 0 0 0 .708 0l4.5-4.5z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-semibold">{t.spreadStep.select}</span>
        </div>
      )}
    </button>
  )
}
