'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useRef, useEffect } from 'react'
import { tools, type Tool } from '@/lib/tools'

interface MobileHeaderProps {
  brandName?: string
  dark: boolean
  onToggleTheme: () => void
}

export function MobileHeader({ brandName = 'Toolk1t', dark, onToggleTheme }: MobileHeaderProps) {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Tool[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const openSearch = useCallback(() => {
    setSearchOpen(true)
    setSuggestions(tools)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery('')
    setSuggestions([])
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (!value) {
      setSuggestions(tools)
      return
    }
    const q = value.toLowerCase()
    setSuggestions(tools.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    ))
  }, [])

  const selectTool = useCallback((tool: Tool) => {
    closeSearch()
    router.push(tool.href)
  }, [router, closeSearch])

  // Close on Escape
  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen, closeSearch])

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt={brandName}
            width={708}
            height={304}
            className="h-8 w-auto rounded"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Search tools"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {dark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Full-screen search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg flex flex-col">
          <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-200/50 dark:border-slate-800/50">
            <svg className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search tools..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white text-base outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              autoComplete="off"
            />
            <button
              onClick={closeSearch}
              className="text-sm text-[#3D6AF2] font-semibold cursor-pointer px-2 py-1"
              style={{ minHeight: '44px' }}
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {suggestions.map((tool) => (
              <button
                key={tool.href}
                onClick={() => selectTool(tool)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shrink-0`}>
                  <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{tool.icon}</div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tool.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.description}</p>
                </div>
              </button>
            ))}
            {suggestions.length === 0 && (
              <p className="text-center text-slate-500 py-8">No tools found</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
