'use client'

import { useLocalServices } from '../local-services-provider'
import { ResultCard } from './result-card'

export function ResultsList() {
  const { state, dispatch, t } = useLocalServices()

  const favouriteIds = new Set(state.favourites.map((f) => f.id))

  function handleSelect(id: string) {
    dispatch({
      type: 'SET_SELECTED_PLACE',
      payload: state.selectedPlaceId === id ? null : id,
    })
  }

  function handleToggleFavourite(result: typeof state.results[number]) {
    if (favouriteIds.has(result.id)) {
      dispatch({ type: 'REMOVE_FAVOURITE', payload: result.id })
    } else {
      dispatch({ type: 'ADD_FAVOURITE', payload: result })
    }
  }

  // Loading
  if (state.resultsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.results.loading}</p>
      </div>
    )
  }

  // Empty
  if (!state.results.length && (state.activeCategory || state.searchQuery)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <svg
          className="h-10 w-10 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {t.results.noResults}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t.results.tryLarger}
        </p>
      </div>
    )
  }

  // No search yet
  if (!state.results.length) return null

  return (
    <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '60vh' }}>
      {state.results.map((result) => (
        <ResultCard
          key={result.id}
          result={result}
          isSelected={state.selectedPlaceId === result.id}
          isFavourite={favouriteIds.has(result.id)}
          onSelect={() => handleSelect(result.id)}
          onToggleFavourite={() => handleToggleFavourite(result)}
        />
      ))}
    </div>
  )
}
