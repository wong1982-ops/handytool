export interface ValidationError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
  path?: string
}

interface ProblemsPanelProps {
  errors: ValidationError[]
  onGoToLine: (line: number) => void
}

export function ProblemsPanel({ errors, onGoToLine }: ProblemsPanelProps) {
  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warningCount = errors.filter((e) => e.severity === 'warning').length

  return (
    <div className="flex flex-col h-full overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-3 py-1.5 bg-white dark:bg-slate-900 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Problems</span>
        <div className="flex items-center gap-2">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path fill="white" d="M15.59 7L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
              </svg>
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
              </svg>
              {warningCount}
            </span>
          )}
          {errors.length === 0 && (
            <span className="text-[10px] font-bold text-emerald-500">No problems</span>
          )}
        </div>
      </div>

      {/* Error list */}
      <div className="flex-1 min-h-0 overflow-y-auto border-t border-slate-100 dark:border-slate-800">
        {errors.length > 0 ? (
          errors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-2 w-full px-3 py-1.5 text-[11px] border-b border-slate-50 dark:border-slate-900 last:border-b-0"
            >
              {err.severity === 'error' ? (
                <svg className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path fill="white" d="M15.59 7L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              )}
              <span className="text-slate-600 dark:text-slate-300">{err.message}</span>
              <button
                onClick={() => onGoToLine(err.line)}
                className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-500)]/10 transition-colors cursor-pointer"
                title={`Jump to line ${err.line}`}
              >
                Ln {err.line}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-3 text-[11px] text-slate-400">
            No problems detected
          </div>
        )}
      </div>
    </div>
  )
}
