'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const FILTER_TAGS = [
  { value: null, label: 'All' },
  { value: 'Developer Tools', label: 'Developer' },
  { value: 'AI Tools', label: 'AI' },
  { value: 'Graphic Design', label: 'Design' },
  { value: 'Web Development', label: 'Web Dev' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'Photo Editor', label: 'Photo' },
] as const

export function BlogFilter({ activeCategory }: { activeCategory: string | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = useCallback(
    (tag: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tag) {
        params.set('tag', tag)
        params.delete('category')
      } else {
        params.delete('tag')
        params.delete('category')
      }
      const qs = params.toString()
      router.replace(`/blog${qs ? `?${qs}` : ''}`)
    },
    [router, searchParams]
  )

  // Support both old category param and new tag param
  const activeTag = searchParams.get('tag')
  const activeValue = activeTag || activeCategory

  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {FILTER_TAGS.map((item) => {
        const isActive = activeValue === item.value || (!activeValue && !item.value)
        return (
          <button
            key={item.label}
            onClick={() => handleClick(item.value)}
            className={`px-4 py-2 min-h-[44px] text-sm font-medium rounded-full transition-colors cursor-pointer ${
              isActive
                ? 'bg-[var(--tk-color-primary-500)] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
