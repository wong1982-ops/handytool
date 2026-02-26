'use client'

import { type CurrencyPair } from './use-favorites'
import { getFlag } from './currency-select'

interface FavoritesBarProps {
  favorites: CurrencyPair[]
  recent: CurrencyPair[]
  currentFrom: string
  currentTo: string
  isFavorite: (from: string, to: string) => boolean
  onSelectPair: (from: string, to: string) => void
  onToggleFavorite: (from: string, to: string) => void
}

export function FavoritesBar({
  favorites,
  recent,
  currentFrom,
  currentTo,
  isFavorite,
  onSelectPair,
  onToggleFavorite,
}: FavoritesBarProps) {
  const hasFavorites = favorites.length > 0
  const hasRecent = recent.length > 0
  const currentIsFav = isFavorite(currentFrom, currentTo)

  if (!hasFavorites && !hasRecent && !currentFrom) return null

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
      {/* Save current pair button */}
      <button
        onClick={() => onToggleFavorite(currentFrom, currentTo)}
        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
          currentIsFav
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
        }`}
        aria-label={currentIsFav ? 'Remove from favorites' : 'Save as favorite'}
      >
        <span className="text-sm" aria-hidden="true">{currentIsFav ? '\u2605' : '\u2606'}</span>
        <span>{currentIsFav ? 'Saved' : 'Save'}</span>
      </button>

      {/* Divider */}
      {(hasFavorites || hasRecent) && (
        <div className="shrink-0 w-px h-5 bg-slate-700" aria-hidden="true" />
      )}

      {/* Favorite chips */}
      {favorites.map((pair) => (
        <PairChip
          key={`fav-${pair.from}-${pair.to}`}
          pair={pair}
          isFavorite
          isActive={pair.from === currentFrom && pair.to === currentTo}
          onSelect={() => onSelectPair(pair.from, pair.to)}
          onToggleFavorite={() => onToggleFavorite(pair.from, pair.to)}
        />
      ))}

      {/* Divider between favorites and recent */}
      {hasFavorites && hasRecent && (
        <div className="shrink-0 w-px h-5 bg-slate-700" aria-hidden="true" />
      )}

      {/* Recent chips (exclude any that are already in favorites) */}
      {recent
        .filter((r) => !favorites.some((f) => f.from === r.from && f.to === r.to))
        .map((pair) => (
          <PairChip
            key={`recent-${pair.from}-${pair.to}`}
            pair={pair}
            isFavorite={false}
            isActive={pair.from === currentFrom && pair.to === currentTo}
            onSelect={() => onSelectPair(pair.from, pair.to)}
            onToggleFavorite={() => onToggleFavorite(pair.from, pair.to)}
          />
        ))}
    </div>
  )
}

function PairChip({
  pair,
  isFavorite,
  isActive,
  onSelect,
  onToggleFavorite,
}: {
  pair: CurrencyPair
  isFavorite: boolean
  isActive: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}) {
  return (
    <div
      className={`shrink-0 flex items-center rounded-full text-xs font-medium transition-all border ${
        isActive
          ? 'bg-[var(--tk-color-primary-500)]/15 border-[var(--tk-color-primary-500)]/30 text-[var(--tk-color-primary-400)]'
          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <button
        onClick={onSelect}
        className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 cursor-pointer"
        aria-label={`Convert ${pair.from} to ${pair.to}`}
      >
        <span aria-hidden="true">{getFlag(pair.from)}</span>
        <span>{pair.from}</span>
        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <span>{pair.to}</span>
        <span aria-hidden="true">{getFlag(pair.to)}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        className={`pr-2.5 pl-1 py-1.5 cursor-pointer transition-colors ${
          isFavorite ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-amber-400'
        }`}
        aria-label={isFavorite ? `Remove ${pair.from}/${pair.to} from favorites` : `Add ${pair.from}/${pair.to} to favorites`}
      >
        <span className="text-xs">{isFavorite ? '\u2605' : '\u2606'}</span>
      </button>
    </div>
  )
}
