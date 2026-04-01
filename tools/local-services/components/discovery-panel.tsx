'use client'

import { useLocalServices } from '../local-services-provider'
import { CATEGORIES } from '../local-services-categories'
import { RADIUS_OPTIONS } from '../local-services-types'
import { ResultCard } from './result-card'
import { SearchBar } from './search-bar'

export function DiscoveryPanel() {
  const { state, dispatch, searchServices } = useLocalServices()

  const isFavourite = (id: string) => state.favourites.some(f => f.id === id)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <SearchBar />
      </div>

      {/* Discovery header */}
      <div className="px-4 pt-2 pb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Discovery</h2>
      </div>

      {/* Category pills — horizontal scrollable */}
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
          <span className="text-[10px] text-slate-400">1 km</span>
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
              <ResultCard
                key={result.id}
                result={result}
                isSelected={state.selectedPlaceId === result.id}
                isFavourite={isFavourite(result.id)}
                onSelect={() => dispatch({ type: 'SET_SELECTED_PLACE', payload: result.id })}
                onToggleFavourite={() => {
                  if (isFavourite(result.id)) {
                    dispatch({ type: 'REMOVE_FAVOURITE', payload: result.id })
                  } else {
                    dispatch({ type: 'ADD_FAVOURITE', payload: result })
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
