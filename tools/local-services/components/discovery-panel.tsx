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
import type { ServiceResult } from '../local-services-types'

/** Compact inline detail shown below selected card */
function CompactDetail({ result, onClose }: { result: ServiceResult; onClose: () => void }) {
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
    <div className="mx-4 mb-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 relative animate-[slideDown_0.2s_ease-out]">
      {/* Close */}
      <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500">×</button>

      {/* Actions row */}
      <div className="flex gap-2 mb-3">
        {result.phone && (
          <a href={`tel:${result.phone}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-xs font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            Call
          </a>
        )}
        {result.website && (
          <a href={result.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Website
          </a>
        )}
        <button onClick={toggleFav} className={`px-3 py-2 rounded-xl border text-xs font-semibold ${isFavourite ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500'}`}>
          {isFavourite ? '♥' : '♡'}
        </button>
      </div>

      {/* Address */}
      {result.address && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-start gap-1.5">
          <span className="text-[var(--tk-color-primary-500)] mt-0.5">📍</span>
          {result.address}
        </p>
      )}

      {/* Phone */}
      {result.phone && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <span>📞</span>
          <a href={`tel:${result.phone}`} className="text-[var(--tk-color-primary-500)]">{result.phone}</a>
        </p>
      )}

      {/* Hours (compact) */}
      {details?.hours && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Hours</p>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
            {details.hours.display.slice(0, 3).map((line: string, i: number) => (
              <p key={i}>{line}</p>
            ))}
            {details.hours.display.length > 3 && (
              <p className="text-[10px] text-slate-400">+{details.hours.display.length - 3} more days</p>
            )}
          </div>
        </div>
      )}

      {/* Reviews (compact — show first 1-2) */}
      {details?.reviews && details.reviews.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Reviews</p>
          {details.reviews.slice(0, 2).map((review: any, i: number) => (
            <div key={i} className="mb-1.5">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{review.author}</span>
                {review.rating && <span className="text-[10px] text-amber-400">{'★'.repeat(review.rating)}</span>}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{review.text}</p>
            </div>
          ))}
        </div>
      )}
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
