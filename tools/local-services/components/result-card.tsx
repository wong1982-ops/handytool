'use client'

import type { MergedResult } from '../local-services-types'

interface ResultCardProps {
  result: MergedResult
  isSelected: boolean
  isFavourite: boolean
  onSelect: () => void
  onToggleFavourite: () => void
}

export function ResultCard({ result, isSelected, isFavourite, onSelect, onToggleFavourite }: ResultCardProps) {
  const distanceLabel = result.distance != null
    ? result.distance >= 1000
      ? `${(result.distance / 1000).toFixed(1)}km away`
      : `${result.distance}m away`
    : null

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
        isSelected
          ? 'bg-[var(--tk-color-primary-500)]/10 ring-2 ring-[var(--tk-color-primary-500)]/30'
          : 'bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700/50'
      }`}
    >
      {/* Photo thumbnail */}
      <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
        {result.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{result.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.category}</p>
          </div>
          {result.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{result.rating.toFixed(1)}</span>
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          {distanceLabel && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {distanceLabel}
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            result.isOpenNow
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {result.isOpenNow ? 'Available' : 'Busy'}
          </span>
        </div>
      </div>
    </button>
  )
}
