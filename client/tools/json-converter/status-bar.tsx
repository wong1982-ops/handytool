interface StatusBarProps {
  format: string
  lineCount: number
  charCount: number
  isValid: boolean | null
  validationLabel?: string
}

export function StatusBar({ format, lineCount, charCount, isValid, validationLabel }: StatusBarProps) {
  return (
    <div className="h-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {isValid !== null && (
          <>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${isValid ? 'text-emerald-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isValid ? (
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                ) : (
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                )}
              </svg>
              <span className="uppercase tracking-wide">{validationLabel || (isValid ? 'Valid' : 'Invalid')}</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          </>
        )}
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex gap-3">
          <span>{format}</span>
          <span>UTF-8</span>
        </div>
      </div>
      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex gap-3">
        <span>Chars: {charCount}</span>
        <span>Lines: {lineCount}</span>
      </div>
    </div>
  )
}
