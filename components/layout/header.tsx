'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { tools, type Tool } from '@/lib/tools'

interface HeaderProps {
  brandName?: string
}

export function Header({
  brandName = 'HandyTool',
}: HeaderProps) {
  const router = useRouter()
  const [dark, setDark] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Tool[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ht-theme')
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('ht-theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev)
  }, [])

  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false)
    setActiveIndex(-1)
  }, [])

  const selectTool = useCallback((tool: Tool) => {
    setSearchQuery('')
    closeSuggestions()
    setMobileMenuOpen(false)
    router.push(tool.href)
  }, [router, closeSuggestions])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setActiveIndex(-1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      const q = value.toLowerCase().trim()
      const filtered = tools.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    }, 200)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') closeSuggestions()
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectTool(suggestions[activeIndex])
        }
        break
      case 'Escape':
        closeSuggestions()
        break
    }
  }, [showSuggestions, suggestions, activeIndex, selectTool, closeSuggestions])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(target)
      ) {
        closeSuggestions()
      }
      // Handle case where only one ref is mounted
      if (!mobileSearchRef.current && desktopSearchRef.current && !desktopSearchRef.current.contains(target)) {
        closeSuggestions()
      }
      if (!desktopSearchRef.current && mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        closeSuggestions()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeSuggestions])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <header className="w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <svg className="w-7 h-7 text-[var(--ht-color-primary-500)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <div className="hidden sm:block">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{brandName}</span>
            <p className="text-[11px] leading-tight text-slate-400 dark:text-slate-500">Free online tools</p>
          </div>
          <span className="sm:hidden text-xl font-bold tracking-tight text-slate-900 dark:text-white">{brandName}</span>
        </Link>

        {/* Search box — center (desktop) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4" ref={desktopSearchRef}>
          <div className="relative w-full" role="combobox" aria-expanded={showSuggestions} aria-haspopup="listbox" aria-owns="search-suggestions-desktop">
            <label htmlFor="tool-search" className="sr-only">Search tools</label>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="tool-search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              placeholder="Search tools..."
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="search-suggestions-desktop"
              aria-activedescendant={activeIndex >= 0 ? `suggestion-desktop-${activeIndex}` : undefined}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:ring-2 focus:ring-[var(--ht-color-primary-500)] focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {showSuggestions && (
              <SuggestionDropdown
                id="search-suggestions-desktop"
                idPrefix="suggestion-desktop"
                suggestions={suggestions}
                activeIndex={activeIndex}
                onSelect={selectTool}
              />
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {dark ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              )}
            </svg>
          </button>

          <Link
            href="/signin"
            className="hidden md:inline-flex bg-[var(--ht-color-primary-500)] text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--ht-color-primary-500)]/20"
          >
            Sign In
          </Link>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            {/* Mobile search */}
            <div ref={mobileSearchRef}>
              <div className="relative w-full" role="combobox" aria-expanded={showSuggestions} aria-haspopup="listbox" aria-owns="search-suggestions-mobile">
                <label htmlFor="tool-search-mobile" className="sr-only">Search tools</label>
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="tool-search-mobile"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                  placeholder="Search tools..."
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions-mobile"
                  aria-activedescendant={activeIndex >= 0 ? `suggestion-mobile-${activeIndex}` : undefined}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:ring-2 focus:ring-[var(--ht-color-primary-500)] focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                {showSuggestions && (
                  <SuggestionDropdown
                    id="search-suggestions-mobile"
                    idPrefix="suggestion-mobile"
                    suggestions={suggestions}
                    activeIndex={activeIndex}
                    onSelect={selectTool}
                  />
                )}
              </div>
            </div>
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex justify-center bg-[var(--ht-color-primary-500)] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all mt-1"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function SuggestionDropdown({
  id,
  idPrefix,
  suggestions,
  activeIndex,
  onSelect,
}: {
  id: string
  idPrefix: string
  suggestions: Tool[]
  activeIndex: number
  onSelect: (tool: Tool) => void
}) {
  if (suggestions.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50">
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center">No tools found</p>
      </div>
    )
  }

  return (
    <ul
      id={id}
      role="listbox"
      className="absolute top-full left-0 right-0 mt-1 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
    >
      {suggestions.map((tool, i) => (
        <li
          key={tool.href}
          id={`${idPrefix}-${i}`}
          role="option"
          aria-selected={i === activeIndex}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(tool)
          }}
          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
            i === activeIndex
              ? 'bg-slate-100 dark:bg-slate-800'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} shadow-sm flex items-center justify-center text-white shrink-0`}>
            <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{tool.icon}</div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tool.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.description}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
