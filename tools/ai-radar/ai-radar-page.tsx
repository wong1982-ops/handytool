'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { NewsCategory } from './types'
import { CATEGORY_TABS } from './types'
import { NewsFeed } from './news-feed'

function AiRadarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeCategory = (searchParams.get('category') as NewsCategory | 'all') || 'all'

  const switchTab = (value: NewsCategory | 'all') => {
    router.replace(`?category=${value}`, { scroll: false })
  }

  return (
    <>
      {/* Scrollable tabs */}
      <div className="overflow-x-auto -mx-4 px-4 pb-1">
        <div role="tablist" aria-label="AI news categories" className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              type="button"
              aria-selected={activeCategory === tab.value}
              onClick={() => switchTab(tab.value)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === tab.value
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <NewsFeed category={activeCategory} />
    </>
  )
}

export function AiRadarPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-11 w-full max-w-lg rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <AiRadarContent />
    </Suspense>
  )
}
