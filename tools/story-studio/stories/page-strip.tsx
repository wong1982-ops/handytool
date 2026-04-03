'use client'

interface PageStripProps {
  totalPages: number
  activePage: number
  onSelectPage: (page: number) => void
  onAddPage: () => void
  showCover?: boolean
}

export function PageStrip({ totalPages, activePage, onSelectPage, onAddPage, showCover }: PageStripProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2
      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Cover button (page 0) */}
      {showCover && (
        <button
          onClick={() => onSelectPage(0)}
          className={`shrink-0 h-9 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            activePage === 0
              ? 'bg-amber-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25c0 .828.672 1.5 1.5 1.5z" />
          </svg>
          Cover
        </button>
      )}
      {showCover && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />}
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1
        const isActive = page === activePage
        return (
          <button
            key={page}
            onClick={() => onSelectPage(page)}
            className={`shrink-0 w-9 h-9 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#3D6AF2] text-white'
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
          text-slate-400 hover:text-[#3D6AF2] hover:bg-slate-100 dark:hover:bg-slate-700
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
