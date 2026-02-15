'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const FLAG_MAP: Record<string, string> = {
  AUD: '\u{1F1E6}\u{1F1FA}', BGN: '\u{1F1E7}\u{1F1EC}', BRL: '\u{1F1E7}\u{1F1F7}',
  CAD: '\u{1F1E8}\u{1F1E6}', CHF: '\u{1F1E8}\u{1F1ED}', CNY: '\u{1F1E8}\u{1F1F3}',
  CZK: '\u{1F1E8}\u{1F1FF}', DKK: '\u{1F1E9}\u{1F1F0}', EUR: '\u{1F1EA}\u{1F1FA}',
  GBP: '\u{1F1EC}\u{1F1E7}', HKD: '\u{1F1ED}\u{1F1F0}', HUF: '\u{1F1ED}\u{1F1FA}',
  IDR: '\u{1F1EE}\u{1F1E9}', ILS: '\u{1F1EE}\u{1F1F1}', INR: '\u{1F1EE}\u{1F1F3}',
  ISK: '\u{1F1EE}\u{1F1F8}', JPY: '\u{1F1EF}\u{1F1F5}', KRW: '\u{1F1F0}\u{1F1F7}',
  MXN: '\u{1F1F2}\u{1F1FD}', MYR: '\u{1F1F2}\u{1F1FE}', NOK: '\u{1F1F3}\u{1F1F4}',
  NZD: '\u{1F1F3}\u{1F1FF}', PHP: '\u{1F1F5}\u{1F1ED}', PLN: '\u{1F1F5}\u{1F1F1}',
  RON: '\u{1F1F7}\u{1F1F4}', SEK: '\u{1F1F8}\u{1F1EA}', SGD: '\u{1F1F8}\u{1F1EC}',
  THB: '\u{1F1F9}\u{1F1ED}', TRY: '\u{1F1F9}\u{1F1F7}', USD: '\u{1F1FA}\u{1F1F8}',
  ZAR: '\u{1F1FF}\u{1F1E6}',
}

export function getFlag(code: string): string {
  return FLAG_MAP[code] || '\u{1F3F3}\u{FE0F}'
}

interface CurrencySelectProps {
  id: string
  value: string
  currencies: Record<string, string>
  onChange: (code: string) => void
}

export function CurrencySelect({ id, value, currencies, onChange }: CurrencySelectProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const sortedCodes = Object.keys(currencies).sort()

  const filtered = filter
    ? sortedCodes.filter((code) => {
        const q = filter.toLowerCase()
        return code.toLowerCase().includes(q) || (currencies[code] || '').toLowerCase().includes(q)
      })
    : sortedCodes

  const openDropdown = useCallback(() => {
    setOpen(true)
    setFilter('')
    setActiveIndex(-1)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const closeDropdown = useCallback(() => {
    setOpen(false)
    setFilter('')
    setActiveIndex(-1)
  }, [])

  const selectCode = useCallback((code: string) => {
    onChange(code)
    closeDropdown()
  }, [onChange, closeDropdown])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, closeDropdown])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll('[role="option"]')
    items[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        openDropdown()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectCode(filtered[activeIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        closeDropdown()
        break
    }
  }

  const selectedName = currencies[value] || value

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        className="w-full flex items-center gap-2.5 pl-3 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--ht-color-primary-500)] focus:border-[var(--ht-color-primary-500)] outline-none font-semibold cursor-pointer text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-lg" aria-hidden="true">{getFlag(value)}</span>
        <span className="flex-1 truncate text-slate-900 dark:text-white">{value}</span>
        <span className="text-xs text-slate-400 truncate hidden sm:inline">{selectedName}</span>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setActiveIndex(-1) }}
                placeholder="Search currency..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--ht-color-primary-500)] focus:border-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                aria-label="Filter currencies"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Currencies"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">No currencies found</li>
            ) : (
              filtered.map((code, index) => (
                <li
                  key={code}
                  role="option"
                  aria-selected={code === value}
                  onMouseDown={(e) => { e.preventDefault(); selectCode(code) }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    index === activeIndex
                      ? 'bg-[var(--ht-color-primary-500)]/10'
                      : code === value
                        ? 'bg-slate-50 dark:bg-slate-800/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{getFlag(code)}</span>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{code}</span>
                  <span className="text-xs text-slate-400 truncate">{currencies[code]}</span>
                  {code === value && (
                    <svg className="w-4 h-4 text-[var(--ht-color-primary-500)] ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
