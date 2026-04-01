'use client'

import { useState, useEffect } from 'react'
import type { MergedResult } from '../local-services-types'
import { useLocalServices } from '../local-services-provider'

interface BusinessDetailProps {
  result: MergedResult
  onBack: () => void
}

export function BusinessDetail({ result, onBack }: BusinessDetailProps) {
  const { state, dispatch } = useLocalServices()
  const [details, setDetails] = useState<{ hours: any; reviews: any[] } | null>(null)
  const isFavourite = state.favourites.some(f => f.id === result.id)

  useEffect(() => {
    fetch(`/api/v1/local-services/place?id=${result.id}`)
      .then(r => r.json())
      .then(json => setDetails(json.data || json))
      .catch(() => {})
  }, [result.id])

  const toggleFav = () => {
    if (isFavourite) dispatch({ type: 'REMOVE_FAVOURITE', payload: result.id })
    else dispatch({ type: 'ADD_FAVOURITE', payload: result })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-white dark:bg-slate-900">
      {/* Hero image */}
      <div className="relative h-56 sm:h-72 bg-slate-200 dark:bg-slate-800 shrink-0">
        {result.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.photoUrl} alt={result.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
        )}
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
        >
          <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {/* Availability badge */}
        {result.isOpenNow && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">
            AVAILABLE NOW
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-5 space-y-5 max-w-3xl mx-auto w-full">
        {/* Name + rating */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{result.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{result.category}</p>
          {result.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--tk-color-primary-500)]/10">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-bold text-[var(--tk-color-primary-500)]">{result.rating.toFixed(1)}</span>
              </div>
              {(result as any).ratingCount > 0 && (
                <span className="text-xs text-slate-400">{(result as any).ratingCount} reviews</span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          {result.phone && (
            <a
              href={`tel:${result.phone}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-semibold shadow-md shadow-[var(--tk-color-primary-500)]/25 hover:bg-[var(--tk-color-primary-600)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call Now
            </a>
          )}
          {result.website && (
            <a
              href={result.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              Visit Website
            </a>
          )}
          <button
            onClick={toggleFav}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
              isFavourite
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {isFavourite ? 'Saved' : 'Add to Favorites'}
          </button>
        </div>

        {/* Address */}
        {result.address && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Address</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.address}</p>
            </div>
          </div>
        )}

        {/* Opening hours */}
        {details?.hours && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Opening Hours</h3>
            </div>
            <div className="space-y-1">
              {details.hours.display.map((line: string, i: number) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-400">{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {details?.reviews && details.reviews.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Reviews</h3>
            <div className="space-y-3">
              {details.reviews.map((review: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{review.author}</span>
                    {review.rating && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }, (_, j) => (
                          <svg key={j} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{review.text}</p>
                  {review.time && <p className="text-[10px] text-slate-400 mt-1">{review.time}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phone */}
        {result.phone && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Phone</p>
              <a href={`tel:${result.phone}`} className="text-xs text-[var(--tk-color-primary-500)]">{result.phone}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
