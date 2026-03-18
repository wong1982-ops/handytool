'use client'

import type { PaginationInfo } from './types'

interface JobPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function JobPagination({ pagination, onPageChange }: JobPaginationProps) {
  const { page, totalPages, total } = pagination

  if (totalPages <= 1) return null

  // Generate page numbers to show
  const pages: (number | 'ellipsis')[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)

    if (start > 2) pages.push('ellipsis')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push('ellipsis')
    pages.push(totalPages)
  }

  return (
    <nav aria-label="Job results pagination" className="flex flex-col items-center gap-3 mt-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {total} job{total !== 1 ? 's' : ''} found
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Previous page"
        >
          Prev
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">...</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-[40px] h-[40px] flex items-center justify-center text-sm rounded-lg border transition-colors ${
                p === page
                  ? 'bg-[var(--tk-color-primary-500)] text-white border-transparent'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  )
}
