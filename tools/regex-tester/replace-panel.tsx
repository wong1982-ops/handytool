'use client'

interface ReplacePanelProps {
  replaceInput: string
  onReplaceInputChange: (value: string) => void
  replaceResult: string | null
}

export function ReplacePanel({ replaceInput, onReplaceInputChange, replaceResult }: ReplacePanelProps) {
  return (
    <div className="space-y-4">
      {/* Replace input */}
      <div>
        <label
          htmlFor="replace-input"
          className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2"
        >
          Replace With
        </label>
        <input
          id="replace-input"
          type="text"
          value={replaceInput}
          onChange={(e) => onReplaceInputChange(e.target.value)}
          placeholder="Replacement string ($1, $2, $&, etc.)"
          spellCheck={false}
          autoComplete="off"
          className="w-full h-12 px-4 font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[var(--tk-color-primary-500)] focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/30 transition-colors"
        />
      </div>

      {/* Result preview */}
      {replaceResult !== null && (
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Result Preview
          </label>
          <div className="max-h-[200px] overflow-y-auto p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white whitespace-pre-wrap break-words">
            {replaceResult || <span className="text-slate-400 italic">Empty result</span>}
          </div>
        </div>
      )}
    </div>
  )
}
