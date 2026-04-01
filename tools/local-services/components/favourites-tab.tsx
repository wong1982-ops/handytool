'use client'

import { useLocalServices } from '../local-services-provider'
import { ResultCard } from './result-card'

export function FavouritesTab() {
  const { state, dispatch, t } = useLocalServices()

  function handleSelect(id: string) {
    dispatch({
      type: 'SET_SELECTED_PLACE',
      payload: state.selectedPlaceId === id ? null : id,
    })
  }

  function handleRemove(id: string) {
    dispatch({ type: 'REMOVE_FAVOURITE', payload: id })
  }

  if (!state.favourites.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <svg
          className="h-12 w-12 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {t.favourites.empty}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {t.favourites.emptyHint}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {t.favourites.title}
      </h2>

      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {state.favourites.map((fav) => (
          <div key={fav.id} className="relative">
            <ResultCard
              result={fav}
              isSelected={state.selectedPlaceId === fav.id}
              isFavourite
              onSelect={() => handleSelect(fav.id)}
              onToggleFavourite={() => handleRemove(fav.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
