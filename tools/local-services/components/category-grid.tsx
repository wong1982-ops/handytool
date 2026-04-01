'use client'

import { useLocalServices } from '../local-services-provider'
import { CATEGORIES } from '../local-services-categories'

export function CategoryGrid() {
  const { state, searchServices, t } = useLocalServices()

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
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
              className={`flex min-h-[80px] flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all ${
                isActive
                  ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/10 ring-2 ring-[var(--tk-color-primary-500)]/30'
                  : 'border-slate-200 bg-white hover:border-[var(--tk-color-primary-400)] hover:bg-[var(--tk-color-primary-500)]/5 dark:border-slate-800 dark:bg-white/5'
              }`}
            >
              <span className="text-2xl" role="img" aria-label={cat.name}>
                {cat.icon}
              </span>
              <span
                className={`text-center text-xs font-medium leading-tight ${
                  isActive
                    ? 'text-[var(--tk-color-primary-500)]'
                    : 'text-slate-700 dark:text-slate-300'
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
