'use client'

import { useEffect, useState } from 'react'
import type { ServiceResult } from '../local-services-types'
import { useLocalServices } from '../local-services-provider'

interface ResultDetailProps {
  result: ServiceResult
  isFavourite: boolean
  onClose: () => void
  onToggleFavourite: () => void
}

interface Review {
  author: string
  text: string
  rating: number
  date: string
}

export function ResultDetail({
  result,
  isFavourite,
  onClose,
  onToggleFavourite,
}: ResultDetailProps) {
  const { t } = useLocalServices()
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setReviewsLoading(true)

    fetch(`/api/v1/local-services/place?id=${encodeURIComponent(result.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setReviews(data.data?.reviews || [])
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })

    return () => { cancelled = true }
  }, [result.id])

  function handleCopyInfo() {
    const info = [
      result.name,
      result.address,
      result.phone,
      result.website,
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard.writeText(info).catch(() => {})
  }

  return (
    <div className="relative space-y-4 rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300"
        aria-label="Close details"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="pr-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {result.name}
        </h2>
        {result.rating != null && (
          <div className="mt-0.5 flex items-center gap-1 text-sm">
            <span className="font-semibold text-amber-500">{result.rating.toFixed(1)}</span>
            <span className="text-amber-400">{'★'.repeat(Math.round(result.rating))}</span>
          </div>
        )}
      </div>

      {/* Info rows */}
      <div className="space-y-2 text-sm">
        {/* Address */}
        <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>{result.address}</span>
        </div>

        {/* Phone */}
        {result.phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <a href={`tel:${result.phone}`} className="text-blue-600 hover:underline dark:text-blue-400">
              {result.phone}
            </a>
          </div>
        )}

        {/* Website */}
        {result.website && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <a
              href={result.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-blue-600 hover:underline dark:text-blue-400"
            >
              {result.website.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          </div>
        )}

        {/* Open/closed */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              result.isOpenNow ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span
            className={`text-sm font-medium ${
              result.isOpenNow
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {result.isOpenNow ? t.results.openNow : t.results.closed}
          </span>
        </div>
      </div>

      {/* Opening hours */}
      {result.hours?.display && result.hours.display.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t.detail.openingHours}
          </h3>
          <ul className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
            {result.hours.display.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {t.results.reviews}
        </h3>
        {reviewsLoading ? (
          <div className="flex items-center gap-2 py-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-xs text-gray-400">Loading reviews...</span>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-2">
            {reviews.slice(0, 5).map((review, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {review.author}
                  </span>
                  <span className="text-xs text-amber-500">
                    {'★'.repeat(review.rating)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t.results.noReviews}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {result.phone && (
          <a
            href={`tel:${result.phone}`}
            className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {t.detail.call}
          </a>
        )}

        {result.website && (
          <a
            href={result.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            {t.detail.visit}
          </a>
        )}

        <button
          type="button"
          onClick={handleCopyInfo}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {t.detail.copyInfo}
        </button>

        <button
          type="button"
          onClick={onToggleFavourite}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            isFavourite
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/5'
          }`}
        >
          <svg
            className={`h-3.5 w-3.5 ${isFavourite ? 'fill-current' : 'fill-none'}`}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {isFavourite ? t.detail.saved : t.detail.save}
        </button>
      </div>
    </div>
  )
}
