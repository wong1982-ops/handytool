'use client'

import { useProfilePrompt } from '@/lib/hooks/use-profile-prompt'
import { useRouter } from 'next/navigation'

export function ProfilePrompt() {
  const { showPrompt, dismiss } = useProfilePrompt()
  const router = useRouter()

  if (!showPrompt) return null

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[480px] animate-slide-up"
    >
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-4 flex items-center gap-3">
        <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">
          Help us recommend better tools — complete your profile
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="shrink-0 rounded-lg bg-[var(--ht-color-primary-500,#3D6AF2)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          Complete Profile
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss profile prompt"
          className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
