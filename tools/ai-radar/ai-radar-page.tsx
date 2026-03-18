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
      {/* Mobile: dropdown select (avoids swipe-back gesture conflict) */}
      <div className="sm:hidden">
        <select
          value={activeCategory}
          onChange={(e) => switchTab(e.target.value as NewsCategory | 'all')}
          aria-label="Select AI news category"
          className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat"
        >
          {CATEGORY_TABS.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop/Tablet: tab buttons */}
      <div className="hidden sm:block">
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
