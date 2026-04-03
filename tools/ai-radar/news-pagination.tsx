'use client'

import type { PaginationInfo } from './types'

interface NewsPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

export function NewsPagination({ pagination, onPageChange }: NewsPaginationProps) {
  const { page, totalPages, total } = pagination

  if (totalPages <= 1) return null

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
    <nav aria-label="News pagination" className="flex flex-col items-center gap-3 mt-2">
      <p className="text-sm text-[#70767f]">
        {total} article{total !== 1 ? 's' : ''} found
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 h-10 text-sm rounded-lg border border-[#1e2631] text-[#a6abb5] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e2631] hover:text-white transition-colors cursor-pointer min-h-[44px]"
          aria-label="Previous page"
        >
          Prev
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[#70767f] text-sm">...</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                p === page
                  ? 'bg-[#3D6AF2] text-white font-medium'
                  : 'border border-[#1e2631] text-[#a6abb5] hover:bg-[#1e2631] hover:text-white'
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
          className="px-3 h-10 text-sm rounded-lg border border-[#1e2631] text-[#a6abb5] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1e2631] hover:text-white transition-colors cursor-pointer min-h-[44px]"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  )
}
