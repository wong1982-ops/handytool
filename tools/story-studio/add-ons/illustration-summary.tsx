'use client'

const CREDIT_COST = { fast: 3, quality: 5 } as const

interface SummaryPage {
  sequence: number
  decision: 'generate' | 'skip'
  imageUrl?: string | null
  status?: 'pending' | 'generating' | 'done' | 'error'
}

interface IllustrationSummaryProps {
  pages: SummaryPage[]
  qualityMode: 'fast' | 'quality'
  generating: boolean
  onGenerate: () => void
  onRetryFailed: () => void
  onAddNarration: () => void
  onDone: () => void
}

export function IllustrationSummary({
  pages, qualityMode, generating, onGenerate, onRetryFailed, onAddNarration, onDone,
}: IllustrationSummaryProps) {
  const toGenerate = pages.filter(p => p.decision === 'generate')
  const skipped = pages.filter(p => p.decision === 'skip')
  const done = toGenerate.filter(p => p.status === 'done')
  const errors = toGenerate.filter(p => p.status === 'error')
  const inProgress = toGenerate.filter(p => p.status === 'generating')
  const totalCost = toGenerate.length * CREDIT_COST[qualityMode]

  const allComplete = generating && inProgress.length === 0 && toGenerate.every(p => p.status === 'done' || p.status === 'error')

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/50 dark:border-indigo-800/40">
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{toGenerate.length}</span>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 ml-1">to illustrate</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/40">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{skipped.length}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">skipped</span>
        </div>
        {generating && (
          <>
            <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{done.length}</span>
              <span className="text-xs text-emerald-500 dark:text-emerald-400 ml-1">completed</span>
            </div>
            {errors.length > 0 && (
              <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/40">
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">{errors.length}</span>
                <span className="text-xs text-red-500 dark:text-red-400 ml-1">failed</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Generate button (before batch submission) */}
      {!generating && toGenerate.length > 0 && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-900/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {toGenerate.length} page{toGenerate.length > 1 ? 's' : ''} x {CREDIT_COST[qualityMode]} credits ({qualityMode})
            </span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{totalCost} credits</span>
          </div>
          <button
            onClick={onGenerate}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Generate All Illustrations
          </button>
        </div>
      )}

      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {pages.map(page => (
          <div
            key={page.sequence}
            className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 ${
              page.decision === 'skip'
                ? 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30'
                : page.status === 'done'
                  ? 'border-emerald-400 dark:border-emerald-600'
                  : page.status === 'error'
                    ? 'border-red-400 dark:border-red-600'
                    : page.status === 'generating'
                      ? 'border-indigo-400 dark:border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            {page.status === 'done' && page.imageUrl ? (
              <img src={page.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : page.status === 'generating' ? (
              <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20">
                <svg className="w-5 h-5 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : page.decision === 'skip' ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Skip</span>
              </div>
            ) : page.status === 'error' ? (
              <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Queued</span>
              </div>
            )}
            <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white drop-shadow-md">
              {page.sequence}
            </span>
          </div>
        ))}
      </div>

      {/* Retry failed */}
      {errors.length > 0 && (
        <button
          onClick={onRetryFailed}
          className="w-full py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Retry Failed ({errors.length})
        </button>
      )}

      {/* Narration prompt (after completion) */}
      {allComplete && (
        <div className="rounded-xl border border-purple-200 dark:border-purple-800/50 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Illustrations complete!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Want to add narration too?</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onAddNarration}
              className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Yes, Add Narration
            </button>
            <button
              onClick={onDone}
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Done button when not generating or no pages to generate */}
      {(!generating || toGenerate.length === 0) && (
        <button
          onClick={onDone}
          className="w-full py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Back to Editor
        </button>
      )}
    </div>
  )
}
