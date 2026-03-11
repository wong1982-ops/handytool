'use client'

import { useState, useCallback } from 'react'
import { usePushNotifications } from '@/lib/hooks/use-push-notifications'

const DISMISSED_KEY = 'toolk1t-push-prompt-dismissed'

/**
 * A subtle banner prompting the user to enable push notifications.
 * Shown when:
 * - Push is supported but not subscribed
 * - Not previously dismissed (within 7 days)
 * - User has active generating jobs
 */
export function PushPromptBanner({ hasActiveJobs }: { hasActiveJobs: boolean }) {
  const { state, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true
    const ts = localStorage.getItem(DISMISSED_KEY)
    if (!ts) return false
    // Re-show after 7 days
    return Date.now() - Number(ts) < 7 * 24 * 60 * 60 * 1000
  })
  const [subscribing, setSubscribing] = useState(false)

  const handleEnable = useCallback(async () => {
    setSubscribing(true)
    const ok = await subscribe()
    setSubscribing(false)
    if (ok) setDismissed(true)
  }, [subscribe])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setDismissed(true)
  }, [])

  // Only show when relevant
  if (state !== 'prompt' || dismissed || !hasActiveJobs) return null

  return (
    <div className="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-start gap-2.5">
        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
            Get notified when your book is ready
          </p>
          <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-0.5">
            Enable push notifications so you know the moment your story is complete.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleEnable}
              disabled={subscribing}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              style={{ minHeight: '32px' }}
            >
              {subscribing ? 'Enabling...' : 'Enable'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer px-1 py-1"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
