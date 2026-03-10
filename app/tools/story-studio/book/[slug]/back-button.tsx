'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function BackButton() {
  const router = useRouter()
  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    // Check if user navigated here from within the app
    const sameOrigin = document.referrer.startsWith(window.location.origin)
    setHasHistory(sameOrigin && window.history.length > 1)
  }, [])

  const handleClick = () => {
    if (hasHistory) {
      router.back()
    } else {
      // No visit history — go to bookshelf as sensible default
      router.push('/tools/story-studio')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
      style={{ minHeight: '40px' }}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back
    </button>
  )
}
