'use client'

import type { ServiceResult } from '../local-services-types'

interface ResultCardProps {
  result: ServiceResult
  isSelected: boolean
  isFavourite: boolean
  onSelect: () => void
  onToggleFavourite: () => void
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating == null) return null
  const full = Math.floor(rating)
  const half = rating - full >= 0.5

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${
            i < full
              ? 'text-amber-400'
              : i === full && half
                ? 'text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {i === full && half ? (
            <>
              <defs>
                <linearGradient id={`half-${i}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </>
          ) : (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          )}
        </svg>
      ))}
      <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

export function ResultCard({
  result,
  isSelected,
  isFavourite,
  onSelect,
  onToggleFavourite,
}: ResultCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full p-4 text-left transition-colors border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer ${
        isSelected
          ? 'bg-[var(--tk-color-primary-500)]/5 border-l-2 border-l-[var(--tk-color-primary-500)]'
          : ''
      }`}
    >
      {/* Favourite button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavourite()
        }}
        className="absolute right-2 top-2 rounded-full p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
        aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      >
        <svg
          className={`h-4 w-4 ${
            isFavourite
              ? 'fill-red-400 text-red-400'
              : 'fill-none text-slate-300 group-hover:text-slate-400 dark:text-slate-600'
          }`}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Content */}
      <div className="pr-8">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {result.name}
        </h3>

        <RatingStars rating={result.rating} />

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
          {/* Distance */}
          <span className="font-medium text-[var(--tk-color-primary-500)]">
            {formatDistance(result.distance)}
          </span>

          {/* Open/closed status */}
          <span className="flex items-center gap-1">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                result.isOpenNow ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {result.isOpenNow ? 'Open' : 'Closed'}
          </span>
        </div>

        {/* Address */}
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {result.address}
        </p>

        {/* Phone */}
        {result.phone && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {result.phone}
          </p>
        )}
      </div>
    </button>
  )
}
