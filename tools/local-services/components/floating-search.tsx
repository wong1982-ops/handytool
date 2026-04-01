'use client'

import { useState } from 'react'
import { useLocalServices } from '../local-services-provider'
import { CATEGORIES } from '../local-services-categories'
import Link from 'next/link'

export function FloatingSearch() {
  const { state, dispatch, searchServices } = useLocalServices()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) searchServices(undefined, query.trim())
  }

  return (
    <div className="px-4 pt-3 pb-2 safe-area-pt">
      {/* Search row */}
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center shrink-0 text-slate-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Service Finder..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white shadow-lg text-sm text-slate-900 placeholder:text-slate-400 border-0 focus:ring-2 focus:ring-[var(--tk-color-primary-500)] outline-none"
            />
          </div>
        </form>

        {/* Action buttons */}
        <button
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'favourites' })}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center shrink-0 text-slate-500 hover:text-red-500"
          aria-label="Favourites"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <button
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'recent' })}
          className="hidden sm:flex w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center shrink-0 text-slate-500"
          aria-label="Recent"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Category chips — wrap into multiple rows */}
      <div className="mt-2 max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-1.5 pb-1">
          <button
            onClick={() => { dispatch({ type: 'SET_CATEGORY', payload: null }); dispatch({ type: 'SET_RESULTS', payload: [] }) }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-sm transition-colors ${
              !state.activeCategory
                ? 'bg-[var(--tk-color-primary-500)] text-white'
                : 'bg-white text-slate-600'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => searchServices(cat.foursquareId)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-sm transition-colors whitespace-nowrap ${
                state.activeCategory === cat.foursquareId
                  ? 'bg-[var(--tk-color-primary-500)] text-white'
                  : 'bg-white text-slate-600'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
