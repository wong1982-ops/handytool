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
      {/* Tabs — sticky on mobile with solid bg */}
      <div className="sticky top-0 z-40 -mx-4 px-4 py-2 bg-white dark:bg-[#090f16] lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:z-auto">
      <div
        role="tablist"
        aria-label="Job categories"
        className="flex gap-1 p-1 rounded-xl w-fit border border-slate-200 dark:border-[#1e2631] bg-slate-50 dark:bg-[#131a23]"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={activeCategory === tab.value}
            onClick={() => switchTab(tab.value)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
              activeCategory === tab.value
                ? 'bg-white dark:bg-[#090f16] text-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]'
                : 'text-slate-400 dark:text-[#70767f] hover:text-slate-500 dark:hover:text-[#a6abb5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
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
        <div className="h-11 w-64 rounded-xl bg-slate-50 dark:bg-[#131a23] animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-50 dark:bg-[#131a23] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-50 dark:bg-[#131a23] animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <JobRadarContent />
    </Suspense>
  )
}
