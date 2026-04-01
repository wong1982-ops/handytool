'use client'

import { useLocalServices } from '../local-services-provider'

export function LocationBar() {
  const { state, dispatch, t } = useLocalServices()

  const label = state.locationLoading
    ? t.locationBar.detecting
    : state.location?.label || t.locationBar.unknown

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:bg-white/5 dark:shadow-none">
      <div className="flex min-w-0 items-center gap-2">
        <svg
          className="h-5 w-5 shrink-0 text-[var(--tk-color-primary-500)]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="truncate text-sm text-slate-600 dark:text-slate-400">
          {label}
        </span>
        {state.locationLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--tk-color-primary-500)] border-t-transparent" />
        )}
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'TOGGLE_LOCATION_MODAL' })}
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--tk-color-primary-500)] transition-colors hover:text-[var(--tk-color-primary-400)]"
      >
        {t.locationBar.change}
      </button>
    </div>
  )
}
