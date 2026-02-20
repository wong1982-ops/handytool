'use client'

import { useRef } from 'react'

interface BackgroundPickerProps {
  bgColor: string
  onChange: (color: string) => void
}

const PRESETS = [
  { color: '#FFFFFF', label: 'White' },
  { color: '#3B82F6', label: 'Blue' },
  { color: '#9CA3AF', label: 'Grey' },
]

export function BackgroundPicker({ bgColor, onChange }: BackgroundPickerProps) {
  const customInputRef = useRef<HTMLInputElement>(null)

  const isCustom = Boolean(bgColor) && !PRESETS.some((p) => p.color === bgColor)

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Background Color
      </h3>

      <div className="flex items-center gap-3">
        {PRESETS.map(({ color, label }) => {
          const isSelected = bgColor === color
          return (
            <button
              key={color}
              onClick={() => onChange(color)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
              aria-label={`${label} background`}
              aria-pressed={isSelected}
            >
              <div
                className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${
                  isSelected
                    ? 'border-[var(--tk-color-secondary-500)] ring-2 ring-[var(--tk-color-secondary-500)]/30 scale-110'
                    : 'border-slate-200 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                }`}
                style={{ backgroundColor: color }}
              />
              <span className={`text-[9px] font-bold ${
                isSelected ? 'text-[var(--tk-color-secondary-500)]' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {label}
              </span>
            </button>
          )
        })}

        {/* Custom color */}
        <button
          onClick={() => customInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 cursor-pointer group"
          aria-label="Custom background color"
          aria-pressed={isCustom || undefined}
        >
          <div
            className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm flex items-center justify-center ${
              isCustom
                ? 'border-[var(--tk-color-secondary-500)] ring-2 ring-[var(--tk-color-secondary-500)]/30 scale-110'
                : 'border-slate-200 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'
            }`}
            style={isCustom ? { backgroundColor: bgColor } : undefined}
          >
            {!isCustom && (
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <span className={`text-[9px] font-bold ${
            isCustom ? 'text-[var(--tk-color-secondary-500)]' : 'text-slate-500 dark:text-slate-400'
          }`}>
            Custom
          </span>
        </button>

        {/* Hidden native color input */}
        <input
          ref={customInputRef}
          type="color"
          value={isCustom ? bgColor : '#FFFFFF'}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </div>
  )
}
