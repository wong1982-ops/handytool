'use client'

import { Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

export default function NewStoryPage() {
  return (
    <Suspense>
      <NewStoryContent />
    </Suspense>
  )
}

function NewStoryContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const seriesId = searchParams.get('seriesId')

  const handleSelectMode = useCallback((mode: 'speed' | 'professional') => {
    const params = new URLSearchParams()
    params.set('mode', mode)
    if (seriesId) params.set('seriesId', seriesId)
    router.push(`/tools/story-studio?${params.toString()}`)
  }, [router, seriesId])

  const handleWriteFromScratch = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/story/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Story',
          status: 'draft',
          seriesId: seriesId || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      const { data } = await res.json()
      router.push(`/tools/story-studio/edit/${data.id}`)
    } catch {
      // TODO: show error
    }
  }, [seriesId, router])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to create stories</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Your magical stories await.</p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <button
        onClick={() => router.push('/tools/story-studio')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600
          dark:hover:text-white transition-colors cursor-pointer mb-6"
        aria-label="Back to stories"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Create a New Story
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Pick how you want to make your story!
      </p>

      <div className="space-y-3">
        {/* Speed Mode */}
        <button
          onClick={() => handleSelectMode('speed')}
          className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
            hover:border-amber-300 dark:hover:border-amber-600 transition-colors cursor-pointer group"
          style={{ minHeight: '44px' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30
              flex items-center justify-center shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50">
              <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.836A.75.75 0 002.75 12h6.572l-1.305 10.093a.75.75 0 001.292.657l8.5-9.836A.75.75 0 0017.25 12h-6.572l1.305-10.093z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-sm text-slate-900 dark:text-white">Quick Story</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Get your story written fast! Add pictures and audio later.
              </p>
              <p className="text-xs text-amber-500 mt-1.5">10 credits</p>
            </div>
          </div>
        </button>

        {/* Professional Mode */}
        <button
          onClick={() => handleSelectMode('professional')}
          className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
            hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
          style={{ minHeight: '44px' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30
              flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-sm text-slate-900 dark:text-white">Full Story</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Make a complete book with pictures and sound on every page.
              </p>
              <p className="text-xs text-indigo-500 mt-1.5">50 credits</p>
            </div>
          </div>
        </button>

        {/* Write from scratch */}
        <button
          onClick={handleWriteFromScratch}
          className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
            hover:border-slate-300 dark:hover:border-slate-500 transition-colors cursor-pointer group"
          style={{ minHeight: '44px' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700
              flex items-center justify-center shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-600">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-sm text-slate-900 dark:text-white">Write Your Own</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Start with a blank book and write your own story.
              </p>
              <p className="text-xs text-green-500 mt-1.5">Free</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
