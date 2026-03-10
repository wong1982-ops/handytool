'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookReaderClient } from './book-reader-client'

interface FallbackProps {
  slug: string
}

export function BookReaderFallback({ slug }: FallbackProps) {
  const [bookData, setBookData] = useState<Record<string, unknown> | null>(null)
  const [bookId, setBookId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    fetch(`/api/v1/story/books/by-slug/${slug}`, { signal: controller.signal })
      .then(async (res) => {
        clearTimeout(timeout)
        if (res.ok) {
          const { data } = await res.json()
          if (data) {
            // RPC returns full book row — extract the inner data object
            setBookData(data.data as Record<string, unknown>)
            setBookId(data.id as string)
            return
          }
        }
        setError(true)
      })
      .catch((err) => {
        clearTimeout(timeout)
        console.error('[BookReaderFallback] Failed to load book:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex flex-col md:flex-row" style={{ aspectRatio: '16/9' }}>
            <div className="md:w-[60%] bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 p-8 space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !bookData) {
    return (
      <div className="text-center py-16">
        {/* Animated workers scene */}
        <div className="relative w-64 h-40 mx-auto mb-6">
          <style>{`
            @keyframes worker-walk {
              0%, 100% { transform: translateX(-8px); }
              50% { transform: translateX(8px); }
            }
            @keyframes worker-bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            @keyframes hammer-swing {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-30deg); }
            }
            @keyframes gear-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes sparkle {
              0%, 100% { opacity: 0; transform: scale(0); }
              50% { opacity: 1; transform: scale(1); }
            }
            @keyframes crane-swing {
              0%, 100% { transform: rotate(-5deg); }
              50% { transform: rotate(5deg); }
            }
          `}</style>

          {/* Ground line */}
          <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />

          {/* Worker 1 — walking with toolbox */}
          <div className="absolute bottom-4 left-8" style={{ animation: 'worker-walk 2s ease-in-out infinite' }}>
            {/* Body */}
            <div className="relative">
              {/* Hard hat */}
              <div className="w-7 h-3 bg-amber-400 rounded-t-full mx-auto" />
              {/* Head */}
              <div className="w-5 h-5 bg-amber-200 dark:bg-amber-300 rounded-full mx-auto -mt-1" />
              {/* Body */}
              <div className="w-6 h-8 bg-blue-500 rounded-md mx-auto mt-0.5" />
              {/* Legs with walk animation */}
              <div className="flex justify-center gap-1 mt-0.5">
                <div className="w-2 h-5 bg-slate-600 dark:bg-slate-400 rounded-b" style={{ animation: 'worker-bounce 0.6s ease-in-out infinite' }} />
                <div className="w-2 h-5 bg-slate-600 dark:bg-slate-400 rounded-b" style={{ animation: 'worker-bounce 0.6s ease-in-out infinite 0.3s' }} />
              </div>
              {/* Toolbox */}
              <div className="absolute -right-4 top-10 w-5 h-3 bg-red-400 rounded-sm border border-red-500" />
            </div>
          </div>

          {/* Worker 2 — hammering */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="relative">
              {/* Hard hat */}
              <div className="w-7 h-3 bg-orange-400 rounded-t-full mx-auto" />
              {/* Head */}
              <div className="w-5 h-5 bg-amber-200 dark:bg-amber-300 rounded-full mx-auto -mt-1" />
              {/* Body */}
              <div className="w-6 h-8 bg-green-500 rounded-md mx-auto mt-0.5" />
              {/* Legs */}
              <div className="flex justify-center gap-1 mt-0.5">
                <div className="w-2 h-5 bg-slate-600 dark:bg-slate-400 rounded-b" />
                <div className="w-2 h-5 bg-slate-600 dark:bg-slate-400 rounded-b" />
              </div>
              {/* Hammer arm */}
              <div
                className="absolute -right-5 top-6 origin-bottom-left"
                style={{ animation: 'hammer-swing 0.8s ease-in-out infinite' }}
              >
                <div className="w-1.5 h-7 bg-amber-700 rounded" />
                <div className="w-3 h-2.5 bg-slate-500 rounded-sm -mt-0.5 -ml-0.5" />
              </div>
            </div>
          </div>

          {/* Worker 3 — carrying beam */}
          <div className="absolute bottom-4 right-8" style={{ animation: 'worker-walk 2.5s ease-in-out infinite 0.5s' }}>
            <div className="relative">
              {/* Hard hat */}
              <div className="w-7 h-3 bg-yellow-400 rounded-t-full mx-auto" />
              {/* Head */}
              <div className="w-5 h-5 bg-amber-200 dark:bg-amber-300 rounded-full mx-auto -mt-1" />
              {/* Body */}
              <div className="w-6 h-8 bg-purple-500 rounded-md mx-auto mt-0.5" />
              {/* Legs */}
              <div className="flex justify-center gap-1 mt-0.5">
                <div className="w-2 h-5 bg-slate-600 dark:bg-slate-400 rounded-b" style={{ animation: 'worker-bounce 0.7s ease-in-out infinite' }} />
                <div className="w-2 h-5 bg-slate-600 dark:bg-slate-400 rounded-b" style={{ animation: 'worker-bounce 0.7s ease-in-out infinite 0.35s' }} />
              </div>
              {/* Beam on shoulder */}
              <div className="absolute -left-6 top-2 w-16 h-2 bg-amber-600 rounded-sm" style={{ transform: 'rotate(-5deg)' }} />
            </div>
          </div>

          {/* Spinning gear */}
          <div className="absolute top-2 right-12" style={{ animation: 'gear-spin 3s linear infinite' }}>
            <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0-8.5c.5 0 .97.07 1.42.2l.9-1.55a.75.75 0 0 1 1.3.75l-.9 1.55c.7.5 1.27 1.17 1.65 1.95l1.78-.03a.75.75 0 0 1 .02 1.5l-1.78.03c.08.38.12.77.12 1.18s-.04.8-.12 1.18l1.78.03a.75.75 0 0 1-.02 1.5l-1.78-.03a5.5 5.5 0 0 1-1.65 1.95l.9 1.55a.75.75 0 0 1-1.3.75l-.9-1.55c-.45.13-.92.2-1.42.2s-.97-.07-1.42-.2l-.9 1.55a.75.75 0 0 1-1.3-.75l.9-1.55a5.5 5.5 0 0 1-1.65-1.95l-1.78.03a.75.75 0 0 1-.02-1.5l1.78-.03A5.5 5.5 0 0 1 6.5 12c0-.41.04-.8.12-1.18l-1.78-.03a.75.75 0 0 1 .02-1.5l1.78.03c.38-.78.95-1.45 1.65-1.95l-.9-1.55a.75.75 0 0 1 1.3-.75l.9 1.55c.45-.13.92-.2 1.42-.2Z" />
            </svg>
          </div>

          {/* Sparkles */}
          <div className="absolute top-8 left-1/2" style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
          <div className="absolute top-4 left-1/3" style={{ animation: 'sparkle 1.5s ease-in-out infinite 0.5s' }}>
            <div className="w-1 h-1 bg-amber-300 rounded-full" />
          </div>
          <div className="absolute top-12 right-1/4" style={{ animation: 'sparkle 1.5s ease-in-out infinite 1s' }}>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          </div>

          {/* Crane hook swinging */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 origin-top" style={{ animation: 'crane-swing 3s ease-in-out infinite' }}>
            <div className="w-0.5 h-10 bg-slate-400 dark:bg-slate-500 mx-auto" />
            <div className="w-4 h-3 border-2 border-slate-400 dark:border-slate-500 border-t-0 rounded-b-lg mx-auto" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Our Workers Are Busy!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Please try again later.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Retry
          </button>
          <Link
            href="/tools/story-studio"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--tk-color-primary-500,#3D6AF2)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ minHeight: '44px' }}
          >
            Back to Story Studio
          </Link>
        </div>
      </div>
    )
  }

  return <BookReaderClient bookData={bookData} bookId={bookId} isOwner />
}
