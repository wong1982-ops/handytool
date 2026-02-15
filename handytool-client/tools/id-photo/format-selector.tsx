'use client'

import { useState, useMemo } from 'react'
import { PHOTO_FORMATS, type PhotoFormat } from './types'

interface FormatSelectorProps {
  selectedFormatId: string
  onSelect: (format: PhotoFormat) => void
}

const FORMAT_ICONS: Record<string, string> = {
  'United States': '\uD83C\uDDFA\uD83C\uDDF8',
  'United Kingdom': '\uD83C\uDDEC\uD83C\uDDE7',
  'Europe': '\uD83C\uDDEA\uD83C\uDDFA',
  'International': '\uD83C\uDF10',
  'Canada': '\uD83C\uDDE8\uD83C\uDDE6',
  'Australia': '\uD83C\uDDE6\uD83C\uDDFA',
  'China': '\uD83C\uDDE8\uD83C\uDDF3',
  'India': '\uD83C\uDDEE\uD83C\uDDF3',
  'Japan': '\uD83C\uDDEF\uD83C\uDDF5',
  'South Korea': '\uD83C\uDDF0\uD83C\uDDF7',
}

export function FormatSelector({ selectedFormatId, onSelect }: FormatSelectorProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return PHOTO_FORMATS
    const q = search.toLowerCase()
    return PHOTO_FORMATS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.country.toLowerCase().includes(q) || f.dimensions.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Required Dimensions
        </h2>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--ht-color-secondary-500)] focus:border-[var(--ht-color-secondary-500)]"
          />
        </div>
      </div>

      {/* Format list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="space-y-1">
          {filtered.map((format) => {
            const isSelected = format.id === selectedFormatId
            return (
              <button
                key={format.id}
                onClick={() => onSelect(format)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-3 group ${
                  isSelected
                    ? 'bg-[var(--ht-color-secondary-500)]/10 border border-[var(--ht-color-secondary-500)]/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
                aria-pressed={isSelected}
              >
                {/* Flag/icon */}
                <span className="text-base shrink-0" aria-hidden="true">
                  {FORMAT_ICONS[format.country] || '\uD83D\uDCCB'}
                </span>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${
                    isSelected ? 'text-[var(--ht-color-secondary-500)]' : 'text-slate-900 dark:text-white'
                  }`}>
                    {format.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {format.dimensions}
                  </div>
                </div>

                {/* Check */}
                {isSelected && (
                  <svg className="w-4 h-4 text-[var(--ht-color-secondary-500)] shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </button>
            )
          })}

          {filtered.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
              No formats match &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
