interface SpeedFooterProps {
  globalRank: string
  networkType: string
  onShare?: () => void
  onExport?: () => void
}

export function SpeedFooter({ globalRank, networkType, onShare, onExport }: SpeedFooterProps) {
  return (
    <footer className="w-full mt-10 py-8 border-t border-slate-200 dark:border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Stats */}
        <div className="flex items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Global Rank</p>
            <p className="text-lg font-bold text-[var(--ht-color-secondary-500)]">{globalRank}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Network Type</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{networkType}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onShare}
            className="px-6 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-900 dark:text-white"
            aria-label="Share speed test results"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Results
          </button>
          <button
            onClick={onExport}
            className="px-6 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-900 dark:text-white"
            aria-label="Export speed test results as PDF"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>

        {/* Copyright */}
        <div className="text-slate-500 text-xs">
          Data provided by HandyTool Performance Analytics.
        </div>
      </div>
    </footer>
  )
}
