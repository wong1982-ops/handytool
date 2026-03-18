'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { JobCategory } from './types'
import { JobGallery } from './job-gallery'

const TABS: { label: string; value: JobCategory }[] = [
  { label: 'IT / Tech', value: 'it' },
  { label: 'French Language', value: 'french' },
]

function JobRadarContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeCategory = (searchParams.get('category') as JobCategory) || 'it'

  const switchTab = (category: JobCategory) => {
    // Reset all filters when switching tabs
    router.replace(`?category=${category}`, { scroll: false })
  }

  return (
    <>
      {/* Tabs */}
      <div role="tablist" aria-label="Job categories" className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={activeCategory === tab.value}
            onClick={() => switchTab(tab.value)}
            className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeCategory === tab.value
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery */}
      <JobGallery category={activeCategory} />
    </>
  )
}

export function JobRadarPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-11 w-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <JobRadarContent />
    </Suspense>
  )
}
