'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const CATEGORIES = [
  { value: null, label: 'All' },
  { value: 'tool-announcement', label: 'New Tools' },
  { value: 'how-to-guide', label: 'How-To Guides' },
  { value: 'weekly-roundup', label: 'Weekly Roundups' },
] as const

export function BlogFilter({ activeCategory }: { activeCategory: string | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = useCallback(
    (category: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (category) {
        params.set('category', category)
      } else {
        params.delete('category')
      }
      const qs = params.toString()
      router.replace(`/blog${qs ? `?${qs}` : ''}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.value
        return (
          <button
            key={cat.label}
            onClick={() => handleClick(cat.value)}
            className={`px-4 py-2 min-h-[44px] text-sm font-medium rounded-full transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
