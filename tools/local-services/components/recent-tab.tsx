'use client'

import { useLocalServices } from '../local-services-provider'
import { getCategoryById } from '../local-services-categories'

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentTab() {
  const { state, dispatch, searchServices, t } = useLocalServices()

  function handleRerun(index: number) {
    const recent = state.recentSearches[index]
    if (!recent) return

    if (recent.categoryId) {
      searchServices(recent.categoryId)
    } else if (recent.query) {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: recent.query })
      searchServices(undefined, recent.query)
    }
  }

  function handleClearAll() {
    dispatch({ type: 'CLEAR_RECENT' })
  }

  if (!state.recentSearches.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <svg
          className="h-12 w-12 text-gray-300 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {t.recent.empty}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.recent.title}
        </h2>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs font-medium text-red-500 transition-colors hover:text-red-600 dark:text-red-400"
        >
          {t.recent.clearAll}
        </button>
      </div>

      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {state.recentSearches.map((item, i) => {
          const category = item.categoryId ? getCategoryById(item.categoryId) : null
          const displayName = category?.name || item.query || 'Search'

          return (
            <button
              key={`${item.timestamp}-${i}`}
              type="button"
              onClick={() => handleRerun(i)}
              className="flex w-full items-center gap-3 rounded-xl bg-white/80 p-3 text-left transition-colors hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {/* Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg dark:bg-white/10">
                {category?.icon || (
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                  {displayName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{item.locationLabel}</span>
                  <span>·</span>
                  <span>{t.recent.results.replace('{n}', String(item.resultCount))}</span>
                </div>
              </div>

              {/* Timestamp */}
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {timeAgo(item.timestamp)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
