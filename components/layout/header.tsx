'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { tools, type Tool } from '@/lib/tools'
import { useAuth } from '@/lib/hooks/use-auth'
import { SignInModal } from '@/components/auth/sign-in-modal'
import { UserMenu } from '@/components/auth/user-menu'
import { CreditBadge } from '@/components/ui/credit-badge'
import { PricingDrawer } from '@/components/ui/pricing-drawer'

interface HeaderProps {
  brandName?: string
}

export function Header({
  brandName = 'Toolk1t',
}: HeaderProps) {
  const router = useRouter()
  const [dark, setDark] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Tool[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [scrolled, setScrolled] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)

  const { user, loading } = useAuth()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const megaMenuPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ht-theme')
    if (stored === 'light') {
      setDark(false)
      document.documentElement.classList.remove('dark')
    } else {
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
    setMegaMenuOpen(false)
  }, [])

  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false)
    setActiveIndex(-1)
  }, [])

  const toggleMegaMenu = useCallback(() => {
    setMegaMenuOpen((prev) => !prev)
    closeSuggestions()
  }, [closeSuggestions])

  const closeMegaMenu = useCallback(() => {
    setMegaMenuOpen(false)
  }, [])

  const selectTool = useCallback((tool: Tool) => {
    setSearchQuery('')
    closeSuggestions()
    setMobileMenuOpen(false)
    setMegaMenuOpen(false)
    router.push(tool.href)
  }, [router, closeSuggestions])

  const showAllTools = useCallback(() => {
    setSuggestions(tools)
    setShowSuggestions(true)
    setActiveIndex(-1)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setActiveIndex(-1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value) {
      // Empty query → show all tools
      setSuggestions(tools)
      setShowSuggestions(true)
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
      // Close mega menu on click outside (check both trigger and panel)
      if (
        megaMenuRef.current && !megaMenuRef.current.contains(target) &&
        (!megaMenuPanelRef.current || !megaMenuPanelRef.current.contains(target))
      ) {
        closeMegaMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeSuggestions, closeMegaMenu])

  // Close mega menu on Escape
  useEffect(() => {
    if (!megaMenuOpen) return
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMegaMenu()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [megaMenuOpen, closeMegaMenu])

  // Compact header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll() // check initial position
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <header className={`w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-[0_2px_16px_rgba(61,106,242,0.10)] dark:shadow-[0_2px_16px_rgba(50,169,217,0.12)] ${scrolled ? 'shadow-[0_4px_24px_rgba(61,106,242,0.15)] dark:shadow-[0_4px_24px_rgba(50,169,217,0.18)]' : ''}`}>
      <div className={`max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-3 transition-all duration-300 ${scrolled ? 'py-1 md:h-[80px]' : 'py-2 md:h-[100px]'}`}>
        {/* Brand */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt={brandName}
            width={708}
            height={304}
            className={`w-auto rounded transition-all duration-300 ${scrolled ? 'h-10 md:h-[56px]' : 'h-14 md:h-[80px]'}`}
            priority
          />
        </Link>

        {/* Search box — center (desktop) */}
        <div className="hidden md:flex flex-1 mx-4" ref={desktopSearchRef}>
          <div className="relative w-full" role="combobox" aria-expanded={showSuggestions} aria-haspopup="listbox" aria-owns="search-suggestions-desktop">
            <label htmlFor="tool-search" className="sr-only">Search tools</label>
            <button
              type="button"
              onClick={showAllTools}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-0 bg-transparent border-0 cursor-pointer text-slate-400 hover:text-[var(--tk-color-primary-500)] transition-colors"
              aria-label="Show all tools"
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <input
              id="tool-search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={showAllTools}
              placeholder="Search tools..."
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="search-suggestions-desktop"
              aria-activedescendant={activeIndex >= 0 ? `suggestion-desktop-${activeIndex}` : undefined}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { handleSearchChange(''); closeSuggestions() }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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
          {/* Tools mega menu trigger (desktop) */}
          <div className="hidden md:block" ref={megaMenuRef}>
            <button
              onClick={toggleMegaMenu}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-expanded={megaMenuOpen}
              aria-controls="mega-menu"
            >
              Tools
              <svg
                className={`w-4 h-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Blog link (desktop) */}
          <Link
            href="/blog"
            className="hidden md:flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
          >
            Blog
          </Link>

          {/* Pricing button (desktop) */}
          <button
            onClick={() => setPricingOpen(true)}
            className="hidden md:flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            Pricing
          </button>

          <div className="hidden md:block">
            <CreditBadge />
          </div>

          <button
            onClick={toggleTheme}
            className="relative flex items-center w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors cursor-pointer"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={dark}
          >
            {/* Sun icon (left) */}
            <svg className="absolute left-1.5 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {/* Moon icon (right) */}
            <svg className="absolute right-1.5 w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            {/* Sliding knob */}
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${dark ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>

          {loading ? (
            <div className="hidden md:block w-20 h-9 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
          ) : user ? (
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <button
              onClick={() => setSignInOpen(true)}
              className="hidden md:inline-flex bg-[var(--tk-color-primary-500)] text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--tk-color-primary-500)]/20 cursor-pointer"
            >
              Sign In
            </button>
          )}

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

      {/* Desktop mega menu popover */}
      {megaMenuOpen && (
        <div
          ref={megaMenuPanelRef}
          id="mega-menu"
          className="hidden md:block absolute top-full left-0 right-0 z-50 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-4 gap-3">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={closeMegaMenu}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} shadow-sm flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform`}>
                    <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{tool.icon}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tool.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <button
                  type="button"
                  onClick={showAllTools}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-0 bg-transparent border-0 cursor-pointer text-slate-400 hover:text-[var(--tk-color-primary-500)] transition-colors"
                  aria-label="Show all tools"
                  tabIndex={-1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <input
                  id="tool-search-mobile"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={showAllTools}
                  placeholder="Search tools..."
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions-mobile"
                  aria-activedescendant={activeIndex >= 0 ? `suggestion-mobile-${activeIndex}` : undefined}
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { handleSearchChange(''); closeSuggestions() }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
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
            {/* Blog link (mobile) */}
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm flex items-center justify-center text-white shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Blog</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Tips, guides & updates</p>
              </div>
            </Link>
            {/* Credits + Pricing (mobile) */}
            <button
              onClick={() => { setMobileMenuOpen(false); setPricingOpen(true) }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors w-full text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm flex items-center justify-center text-white shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Credits & Pricing</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Buy credits & manage plans</p>
              </div>
            </button>
            {/* Mobile tools grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} shadow-sm flex items-center justify-center text-white shrink-0`}>
                    <div className="w-4.5 h-4.5 [&>svg]:w-4.5 [&>svg]:h-4.5">{tool.icon}</div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tool.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            {!loading && !user && (
              <button
                onClick={() => { setSignInOpen(true); setMobileMenuOpen(false) }}
                className="inline-flex justify-center bg-[var(--tk-color-primary-500)] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all mt-1 cursor-pointer"
              >
                Sign In
              </button>
            )}
            {!loading && user && (
              <div className="flex items-center gap-3 mt-1 p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/50">
                <UserMenu user={user} />
                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <PricingDrawer open={pricingOpen} onClose={() => setPricingOpen(false)} />
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
