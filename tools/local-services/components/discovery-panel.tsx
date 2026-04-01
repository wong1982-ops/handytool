'use client'

import { useState, useEffect } from 'react'
import { useLocalServices } from '../local-services-provider'
import { CATEGORIES } from '../local-services-categories'
import { RADIUS_OPTIONS } from '../local-services-types'
import { ResultCard } from './result-card'
import { SearchBar } from './search-bar'
import { FavouritesTab } from './favourites-tab'
import { RecentTab } from './recent-tab'
import { CategoryGrid } from './category-grid'
import type { MergedResult } from '../local-services-types'

/** Professional compact detail card (Google Maps / Yelp style) */
function CompactDetail({ result, onClose }: { result: MergedResult; onClose: () => void }) {
  const { state, dispatch } = useLocalServices()
  const [details, setDetails] = useState<{ hours: any; reviews: any[]; photos?: string[] } | null>(null)
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

  // Render star icons
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }
    return stars
  }

  return (
    <div className="mx-4 mb-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden animate-[slideDown_0.2s_ease-out]">
      {/* Photo banner */}
      {details?.photos && details.photos.length > 0 && (
        <div className="h-32 w-full overflow-hidden">
          <img
            src={details.photos[0]}
            alt={result.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header: name + rating */}
      <div className="px-4 pt-3 pb-2 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          aria-label="Close details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3 pr-8">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{result.name}</h3>
            {result.category && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.category}</p>
            )}
          </div>
          {result.rating && (
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                {renderStars(result.rating)}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {result.rating.toFixed(1)}
              </p>
            </div>
          )}
        </div>

        {/* Open/Closed status */}
        {details?.hours && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${details.hours.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className={details.hours.isOpen ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-500 dark:text-red-400 font-medium'}>
              {details.hours.isOpen ? 'Open' : 'Closed'}
            </span>
            {details.hours.closesAt && (
              <span className="text-slate-400 dark:text-slate-500">
                · Closes {details.hours.closesAt}
              </span>
            )}
            {details.hours.opensAt && !details.hours.isOpen && (
              <span className="text-slate-400 dark:text-slate-500">
                · Opens {details.hours.opensAt}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-700/50" />

      {/* Contact info */}
      <div className="px-4 py-2.5 space-y-2">
        {result.address && (
          <div className="flex items-start gap-2.5 text-xs">
            <svg className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-slate-600 dark:text-slate-300">{result.address}</span>
          </div>
        )}
        {result.phone && (
          <div className="flex items-center gap-2.5 text-xs">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <a href={`tel:${result.phone}`} className="text-[var(--tk-color-primary-500)] hover:underline">{result.phone}</a>
          </div>
        )}
        {result.website && (
          <div className="flex items-center gap-2.5 text-xs">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <a href={result.website} target="_blank" rel="noopener noreferrer" className="text-[var(--tk-color-primary-500)] hover:underline truncate">
              {result.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          </div>
        )}
      </div>

      {/* Hours section */}
      {details?.hours?.display && details.hours.display.length > 0 && (
        <>
          <div className="border-t border-slate-100 dark:border-slate-700/50" />
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Hours</p>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono">
              {details.hours.display.map((line: string, i: number) => (
                <p key={i} className="flex justify-between">
                  <span>{line}</span>
                </p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Reviews section */}
      {details?.reviews && details.reviews.length > 0 && (
        <>
          <div className="border-t border-slate-100 dark:border-slate-700/50" />
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Reviews</p>
            <div className="space-y-2.5">
              {details.reviews.slice(0, 3).map((review: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{review.author}</span>
                    {review.rating && (
                      <div className="flex items-center gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="border-t border-slate-100 dark:border-slate-700/50" />
      <div className="px-3 py-2.5 flex gap-2">
        {result.phone && (
          <a
            href={`tel:${result.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-xs font-semibold hover:bg-[var(--tk-color-primary-600)] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Call
          </a>
        )}
        {result.website && (
          <a
            href={result.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Website
          </a>
        )}
        <button
          onClick={toggleFav}
          className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            isFavourite
              ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
          aria-label={isFavourite ? 'Remove from saved' : 'Save place'}
        >
          <svg className="w-4 h-4" fill={isFavourite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {isFavourite ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function DiscoveryPanel() {
  const { state, dispatch, searchServices } = useLocalServices()

  const isFavourite = (id: string) => state.favourites.some(f => f.id === id)
  const selectedResult = state.results.find(r => r.id === state.selectedPlaceId)

  // Show different content based on active tab
  if (state.activeTab === 'favourites') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-4 py-4">
        <FavouritesTab />
      </div>
    )
  }

  if (state.activeTab === 'recent') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-4 py-4">
        <RecentTab />
      </div>
    )
  }

  // Service categories view
  if (state.activeTab === 'home' && !state.activeCategory && state.results.length === 0) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-4 pt-4 pb-2">
          <SearchBar />
        </div>
        <div className="px-4 pt-2 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Service Categories</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a category to find nearby services</p>
        </div>
        <div className="px-4 pb-4">
          <CategoryGrid />
        </div>
      </div>
    )
  }

  // Discovery / results view
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <SearchBar />
      </div>

      {/* Header */}
      <div className="px-4 pt-2 pb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Discovery</h2>
      </div>

      {/* Category pills */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { dispatch({ type: 'SET_CATEGORY', payload: null }); dispatch({ type: 'SET_RESULTS', payload: [] }) }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !state.activeCategory
                ? 'bg-[var(--tk-color-primary-500)] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Services
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => searchServices(cat.foursquareId)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                state.activeCategory === cat.foursquareId
                  ? 'bg-[var(--tk-color-primary-500)] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Distance filter */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Distance Filter</span>
          <span className="text-xs font-bold text-[var(--tk-color-primary-500)]">
            {state.radius >= 1000 ? `${state.radius / 1000} km` : `${state.radius} m`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={RADIUS_OPTIONS.length - 1}
          value={RADIUS_OPTIONS.indexOf(state.radius)}
          onChange={(e) => {
            const newRadius = RADIUS_OPTIONS[parseInt(e.target.value)]
            dispatch({ type: 'SET_RADIUS', payload: newRadius })
            if (state.activeCategory) searchServices(state.activeCategory)
          }}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[var(--tk-color-primary-500)]"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">500m</span>
          <span className="text-[10px] text-slate-400">10 km</span>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pb-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nearby results</h3>
          {state.results.length > 0 && (
            <span className="text-xs font-semibold text-[var(--tk-color-primary-500)]">
              {state.results.length} FOUND
            </span>
          )}
        </div>

        {state.resultsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--tk-color-primary-500)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : state.results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400">Select a category to discover nearby services</p>
          </div>
        ) : (
          <div className="space-y-3">
            {state.results.map(result => (
              <div key={result.id}>
                <ResultCard
                  result={result}
                  isSelected={state.selectedPlaceId === result.id}
                  isFavourite={isFavourite(result.id)}
                  onSelect={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: state.selectedPlaceId === result.id ? null : result.id })}
                  onToggleFavourite={() => {
                    if (isFavourite(result.id)) dispatch({ type: 'REMOVE_FAVOURITE', payload: result.id })
                    else dispatch({ type: 'ADD_FAVOURITE', payload: result })
                  }}
                />
                {/* Compact inline detail — shown below selected card */}
                {selectedResult?.id === result.id && (
                  <CompactDetail
                    result={result}
                    onClose={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: null })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
