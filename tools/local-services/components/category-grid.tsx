'use client'

import { useLocalServices } from '../local-services-provider'
import { CATEGORIES } from '../local-services-categories'

export function CategoryGrid() {
  const { state, searchServices, t } = useLocalServices()

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {t.categories.title}
      </h2>

      <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
        {CATEGORIES.map((cat) => {
          const isActive = state.activeCategory === cat.foursquareId

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => searchServices(cat.foursquareId)}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-all ${
                isActive
                  ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30 dark:ring-blue-400'
                  : 'bg-white/80 hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10'
              }`}
            >
              <span className="text-2xl" role="img" aria-label={cat.name}>
                {cat.icon}
              </span>
              <span
                className={`text-center text-xs font-medium leading-tight ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
