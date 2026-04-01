'use client'

import { useState, type FormEvent } from 'react'
import { useLocalServices } from '../local-services-provider'

export function SearchBar() {
  const { state, dispatch, searchServices, t } = useLocalServices()
  const [query, setQuery] = useState(state.searchQuery)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    dispatch({ type: 'SET_SEARCH_QUERY', payload: trimmed })
    dispatch({ type: 'SET_CATEGORY', payload: null })
    searchServices(undefined, trimmed)
  }

  function handleClear() {
    setQuery('')
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Search icon */}
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search.placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-20 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500"
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-40"
          disabled={!query.trim()}
        >
          Search
        </button>
      </div>
    </form>
  )
}
