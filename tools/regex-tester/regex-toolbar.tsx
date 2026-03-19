'use client'

import { useState, useCallback } from 'react'
import type { RegexMode, RegexState } from './types'
import { copyShareUrl } from './url-sharing'

interface RegexToolbarProps {
  mode: RegexMode
  onModeChange: (mode: RegexMode) => void
  state: RegexState
  onHistoryOpen: () => void
  onClear: () => void
}

export function RegexToolbar({ mode, onModeChange, state, onHistoryOpen, onClear }: RegexToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    try {
      await copyShareUrl(state)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may fail
    }
  }, [state])

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {/* Mode toggle */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <button
          onClick={() => onModeChange('match')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
            mode === 'match'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Match
        </button>
        <button
          onClick={() => onModeChange('replace')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
            mode === 'replace'
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Replace
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* History */}
        <button
          onClick={onHistoryOpen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px]"
          aria-label="Open history"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">History</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px]"
          aria-label={copied ? 'Link copied' : 'Share regex'}
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          )}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer min-h-[44px]"
          aria-label="Clear all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  )
}
