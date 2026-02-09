'use client'

import { useState, type FormEvent } from 'react'

interface SearchBarProps {
  placeholder?: string
  buttonLabel?: string
  onSearch: (query: string) => void
}

export function SearchBar({
  placeholder = 'Search...',
  buttonLabel = 'Search',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl relative" role="search">
      <label htmlFor="search-input" className="sr-only">{placeholder}</label>
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-12 pr-32 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--ht-color-primary-500)] focus:border-transparent transition-all shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="absolute right-2 top-2 bottom-2 px-6 bg-[var(--ht-color-primary-500)] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
      >
        {buttonLabel}
      </button>
    </form>
  )
}
