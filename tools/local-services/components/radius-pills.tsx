'use client'

import { useLocalServices } from '../local-services-provider'
import { RADIUS_OPTIONS, RADIUS_LABELS, type RadiusOption } from '../local-services-types'

export function RadiusPills() {
  const { state, dispatch, searchServices, t } = useLocalServices()

  function handleSelect(r: RadiusOption) {
    dispatch({ type: 'SET_RADIUS', payload: r })
    // Re-run the current search with the new radius
    if (state.activeCategory) {
      // We need to wait for the dispatch to settle, so call with the category directly
      searchServices(state.activeCategory)
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {t.radius.label}
      </span>
      <div className="flex flex-wrap gap-2">
        {RADIUS_OPTIONS.map((r) => {
          const isActive = state.radius === r

          return (
            <button
              key={r}
              type="button"
              onClick={() => handleSelect(r)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-white/20 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400'
              }`}
            >
              {RADIUS_LABELS[r]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
