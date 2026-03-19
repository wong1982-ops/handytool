'use client'

import { useState } from 'react'
import { FaviconConfig } from './types'

interface AiTabProps {
  config: FaviconConfig
  onConfigChange: (updates: Partial<FaviconConfig>) => void
}

const STYLES = ['Flat', '3D', 'Pixel Art', 'Minimal', 'Gradient'] as const

export default function AiTab({ config: _config, onConfigChange: _onConfigChange }: AiTabProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('Flat')
  const [isAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      // Check for Supabase auth token in localStorage
      const keys = Object.keys(localStorage)
      return keys.some(
        (k) => k.startsWith('sb-') && k.endsWith('-auth-token'),
      )
    } catch {
      return false
    }
  })

  return (
    <div className="space-y-5">
      {/* Auth gate */}
      {!isAuthenticated && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-2 text-amber-600 dark:text-amber-400"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Sign in to use AI generation
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Create an account to get free credits
          </p>
        </div>
      )}

      {/* Prompt */}
      <div className="space-y-1.5">
        <label
          htmlFor="ai-prompt"
          className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
        >
          Describe your favicon
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A minimalist rocket icon with clean lines..."
          rows={3}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[var(--tk-color-primary-500,#3D6AF2)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500,#3D6AF2)]/20 resize-none"
        />
      </div>

      {/* Style selector */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Style
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((style) => {
            const active = selectedStyle === style
            return (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] ${
                  active
                    ? 'bg-[var(--tk-color-primary-500,#3D6AF2)] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-pressed={active}
              >
                {style}
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate button */}
      <button
        type="button"
        disabled={!prompt.trim() || !isAuthenticated}
        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-[var(--tk-color-primary-500,#3D6AF2)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity min-h-[48px]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        Generate
        <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
          1 credit
        </span>
      </button>

      {/* Placeholder result area */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 p-8 text-center min-h-[120px]">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 dark:text-gray-600 mb-2"
        >
          <path d="M12 3l1.912 5.813h6.112l-4.968 3.587 1.912 5.813L12 14.626l-4.968 3.587 1.912-5.813L4 8.813h6.112z" />
        </svg>
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
          AI favicon generation coming soon
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          Describe your idea above and we&apos;ll create a unique favicon
        </p>
      </div>
    </div>
  )
}
