'use client'

interface PageStripProps {
  totalPages: number
  activePage: number
  onSelectPage: (page: number) => void
  onAddPage: () => void
}

export function PageStrip({ totalPages, activePage, onSelectPage, onAddPage }: PageStripProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2
      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1
        const isActive = page === activePage
        return (
          <button
            key={page}
            onClick={() => onSelectPage(page)}
            className={`shrink-0 w-9 h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {page}
          </button>
        )
      })}
      <button
        onClick={onAddPage}
        className="shrink-0 w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800/50
          text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700
          transition-colors cursor-pointer flex items-center justify-center"
        title="Add page (2 credits)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  )
}
