'use client'

import { useState } from 'react'

interface AddOnsBannerProps {
  bookId: string
  illustrationCount: number
  onAddIllustrations: () => void
}

export function AddOnsBanner({ bookId, illustrationCount, onAddIllustrations }: AddOnsBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(`addons-banner-${bookId}`) === '1' } catch { return false }
  })

  if (dismissed || illustrationCount > 0) return null

  const handleDismiss = () => {
    setDismissed(true)
    try { sessionStorage.setItem(`addons-banner-${bookId}`, '1') } catch {}
  }

  return (
    <div className="relative rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 mb-6">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-center gap-3 pr-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Your story is ready!</p>
          <p className="text-slate-500 dark:text-slate-400">Add illustrations to bring it to life.</p>
        </div>
        <button
          onClick={onAddIllustrations}
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Add Illustrations
        </button>
      </div>
    </div>
  )
}
