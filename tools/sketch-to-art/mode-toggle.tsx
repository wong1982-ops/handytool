'use client'

import type { SketchMode } from './types'

interface ModeToggleProps {
  mode: SketchMode
  onToggle: (mode: SketchMode) => void
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  return (
    <div
      className="inline-flex min-h-[44px] rounded-full border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-800)] p-1"
      role="radiogroup"
      aria-label="Mode selection"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'fun'}
        onClick={() => onToggle('fun')}
        className={`min-h-[36px] rounded-full px-5 py-2 text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
          mode === 'fun'
            ? 'bg-[var(--tk-color-primary-500)] text-white shadow-sm'
            : 'text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)]'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
        Fun
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'pro'}
        onClick={() => onToggle('pro')}
        className={`min-h-[36px] rounded-full px-5 py-2 text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
          mode === 'pro'
            ? 'bg-[var(--tk-color-primary-500)] text-white shadow-sm'
            : 'text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)]'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
        Pro
      </button>
    </div>
  )
}
