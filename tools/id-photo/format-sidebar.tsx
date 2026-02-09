'use client'

import { useState } from 'react'

export interface PhotoFormat {
  id: string
  name: string
  dimensions: string
  widthMm: number
  heightMm: number
  icon: 'flag' | 'card'
}

export const PHOTO_FORMATS: PhotoFormat[] = [
  { id: 'us-passport', name: 'US Passport', dimensions: '2 × 2 inches (51 × 51 mm)', widthMm: 51, heightMm: 51, icon: 'flag' },
  { id: 'uk-visa', name: 'UK Visa', dimensions: '35 × 45 mm', widthMm: 35, heightMm: 45, icon: 'flag' },
  { id: 'schengen-visa', name: 'Schengen Visa', dimensions: '35 × 45 mm', widthMm: 35, heightMm: 45, icon: 'flag' },
  { id: 'driving-license', name: 'Driving License', dimensions: 'Standard Card (ID-1)', widthMm: 35, heightMm: 45, icon: 'card' },
]

interface FormatSidebarProps {
  selectedFormat: string
  onSelectFormat: (id: string) => void
  brightness: number
  onBrightnessChange: (val: number) => void
  contrast: number
  onContrastChange: (val: number) => void
  hasPhoto: boolean
  onGeneratePrint: () => void
}

export function FormatSidebar({
  selectedFormat,
  onSelectFormat,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  hasPhoto,
  onGeneratePrint,
}: FormatSidebarProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? PHOTO_FORMATS.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.dimensions.toLowerCase().includes(search.toLowerCase())
      )
    : PHOTO_FORMATS

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col hidden lg:flex">
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Required Dimensions */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Required Dimensions</h3>
          <div className="relative mb-3">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-[var(--ht-color-secondary-500)] focus:border-transparent outline-none transition-all"
              aria-label="Search photo format"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((format) => {
              const isSelected = selectedFormat === format.id
              return (
                <button
                  key={format.id}
                  onClick={() => onSelectFormat(format.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl w-full text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--ht-color-secondary-500)]/10 border border-[var(--ht-color-secondary-500)]/20'
                      : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <svg className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[var(--ht-color-secondary-500)]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    {format.icon === 'flag' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                    )}
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight truncate ${isSelected ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {format.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{format.dimensions}</p>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-[var(--ht-color-secondary-500)] shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Adjustments */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Adjustments</h3>
          <div className="space-y-4">
            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                <span>BRIGHTNESS</span>
                <span>{brightness > 0 ? '+' : ''}{brightness}%</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={brightness}
                onChange={(e) => onBrightnessChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--ht-color-secondary-500)]"
                aria-label="Brightness adjustment"
              />
            </div>
            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                <span>CONTRAST</span>
                <span>{contrast > 0 ? '+' : ''}{contrast}%</span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={contrast}
                onChange={(e) => onContrastChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--ht-color-secondary-500)]"
                aria-label="Contrast adjustment"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onGeneratePrint}
          disabled={!hasPhoto}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-3 rounded-lg font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Generate Print Layout
        </button>
      </div>
    </aside>
  )
}
