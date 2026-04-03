'use client'

import type { PageIllustration, BookCover } from '@/tools/story-studio/use-illustrations'

interface PageGridProps {
  pages: PageIllustration[]
  cover: BookCover | null
  selectedIds: Set<string>
  onToggleSelect: (pageId: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onPageClick: (pageId: string | null) => void
}

export function PageGrid({
  pages, cover, selectedIds,
  onToggleSelect, onSelectAll, onDeselectAll, onPageClick,
}: PageGridProps) {
  const allSelected = pages.length > 0 && pages.every(p => selectedIds.has(p.id))

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-sm text-[#3D6AF2] dark:text-[#93aaff] hover:underline cursor-pointer"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
        {selectedIds.size > 0 && (
          <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Cover card */}
        <div
          className="relative bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed
            border-amber-300 dark:border-amber-700 overflow-hidden cursor-pointer
            hover:shadow-md transition-shadow"
          onClick={() => onPageClick(null)}
        >
          <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {cover?.imageUrl ? (
              <img src={cover.imageUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-400">
                <svg className="w-10 h-10 mx-auto mb-1" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <p className="text-xs">Cover</p>
              </div>
            )}
          </div>
          <StatusBadge status={cover?.status ?? 'pending'} label="Cover" />
        </div>

        {/* Page cards */}
        {pages.map(page => {
          const isSelected = selectedIds.has(page.id)
          const ill = page.illustration

          return (
            <div
              key={page.id}
              className={`relative bg-white dark:bg-slate-900 rounded-xl border overflow-hidden
                cursor-pointer hover:shadow-md transition-all ${
                  isSelected
                    ? 'border-[#3D6AF2] dark:border-[#3D6AF2] ring-2 ring-[#3D6AF2]/30 dark:ring-[#1e2631]'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              onClick={() => onPageClick(page.id)}
            >
              {/* Checkbox */}
              <div
                className="absolute top-2 left-2 z-10"
                onClick={e => { e.stopPropagation(); onToggleSelect(page.id) }}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer
                  ${isSelected
                    ? 'bg-[#3D6AF2] border-[#3D6AF2]'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {ill?.imageUrl ? (
                  <img src={ill.imageUrl} alt={`Page ${page.sequence}`} className="w-full h-full object-cover" />
                ) : ill?.status === 'generating' ? (
                  <div className="text-center text-slate-400">
                    <div className="w-8 h-8 mx-auto border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs mt-2">Generating...</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Page {page.sequence}</p>
                )}
              </div>

              <StatusBadge status={ill?.status ?? 'pending'} label={`Page ${page.sequence}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    done: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    generating: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    pending: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  }

  return (
    <div className="p-2 flex items-center justify-between">
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors[status] || colors.pending}`}>
        {status === 'done' ? 'Done' : status === 'generating' ? 'Generating' : status === 'error' ? 'Error' : 'Pending'}
      </span>
    </div>
  )
}
