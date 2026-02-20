'use client'

import { useState, useEffect, useRef } from 'react'

interface SearchBarProps {
  placeholder?: string
  buttonLabel?: string
  defaultValue?: string
  onSearch: (query: string) => void
  /** Optional client-side validation. Return an error message string to block submit, or null/undefined to allow. */
  validate?: (query: string) => string | null | undefined
}

export function SearchBar({
  placeholder = 'Search...',
  buttonLabel = 'Search',
  defaultValue,
  onSearch,
  validate,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue ?? '')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (defaultValue && !query) setQuery(defaultValue)
  }, [defaultValue]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    if (validate) {
      const err = validate(trimmed)
      if (err) {
        setError(err)
        inputRef.current?.focus()
        return
      }
    }

    setError(null)
    onSearch(trimmed)
  }

  function handleChange(value: string) {
    setQuery(value)
    if (error) setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" role="search">
      <label htmlFor="search-input" className="sr-only">{placeholder}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'search-input-error' : undefined}
          className={`w-full h-[54px] pl-12 pr-36 bg-white dark:bg-slate-900 border rounded-xl focus:ring-2 focus:border-transparent transition-all shadow-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 ${
            error
              ? 'border-red-500 dark:border-red-400 focus:ring-red-500'
              : 'border-slate-200 dark:border-slate-800 focus:ring-[var(--tk-color-primary-500)]'
          }`}
          placeholder={placeholder}
        />
        {query && (
          <button
            type="button"
            onClick={() => handleChange('')}
            className="absolute right-[7.5rem] top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-6 bg-[var(--tk-color-primary-500)] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
        >
          {buttonLabel}
        </button>
      </div>
      {error && (
        <p id="search-input-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
