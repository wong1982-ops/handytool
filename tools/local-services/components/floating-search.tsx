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
    <div
      className="backdrop-blur-xl px-4 pt-3 pb-2 safe-area-pt"
      style={{ background: 'rgba(19,26,35,0.97)', borderBottom: '1px solid #1e2631' }}
    >
      {/* Search row */}
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <Link
          href="/"
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ background: '#1e2631', color: '#a6abb5' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>

        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: '#70767f' }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Service Finder..."
              className="w-full pl-11 pr-4 h-11 rounded-full text-sm outline-none"
              style={{ background: '#0d1420', border: '1px solid #1e2631', color: '#ffffff' }}
            />
          </div>
        </form>

        <button
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'favourites' })}
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ background: '#1e2631', color: '#a6abb5' }}
          aria-label="Favourites"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* Category chips — horizontally scrollable */}
      <div className="mt-2 max-w-3xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => { dispatch({ type: 'SET_CATEGORY', payload: null }); dispatch({ type: 'SET_RESULTS', payload: [] }) }}
            className="h-9 px-3 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors"
            style={{
              background: !state.activeCategory ? '#3D6AF2' : '#1e2631',
              color: !state.activeCategory ? '#ffffff' : '#a6abb5',
            }}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => searchServices(cat.foursquareId)}
              className="h-9 px-3 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors"
              style={{
                background: state.activeCategory === cat.foursquareId ? '#3D6AF2' : '#1e2631',
                color: state.activeCategory === cat.foursquareId ? '#ffffff' : '#a6abb5',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
