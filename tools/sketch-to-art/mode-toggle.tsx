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
        className={`min-h-[36px] rounded-full px-5 py-2 text-sm font-medium transition-all ${
          mode === 'fun'
            ? 'bg-[var(--tk-color-primary-500)] text-white shadow-sm'
            : 'text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)]'
        }`}
      >
        {'\u{1F3A8}'} Fun
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'pro'}
        onClick={() => onToggle('pro')}
        className={`min-h-[36px] rounded-full px-5 py-2 text-sm font-medium transition-all ${
          mode === 'pro'
            ? 'bg-[var(--tk-color-primary-500)] text-white shadow-sm'
            : 'text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)]'
        }`}
      >
        {'\u26A1'} Pro
      </button>
    </div>
  )
}
