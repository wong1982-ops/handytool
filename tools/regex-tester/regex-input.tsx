'use client'

interface RegexInputProps {
  value: string
  onChange: (value: string) => void
  flags: string
  onFlagsChange: (flags: string) => void
  error: string | null
}

const FLAG_OPTIONS = ['g', 'i', 'm', 's'] as const

export function RegexInput({ value, onChange, flags, onFlagsChange, error }: RegexInputProps) {
  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      onFlagsChange(flags.replace(flag, ''))
    } else {
      onFlagsChange(flags + flag)
    }
  }

  const hasError = !!error

  return (
    <div>
      <div
        className={`flex items-center rounded-xl border bg-white dark:bg-slate-900 transition-colors ${
          hasError
            ? 'border-red-400 dark:border-red-500 ring-2 ring-red-400/30'
            : 'border-slate-200 dark:border-slate-800 focus-within:border-[var(--tk-color-primary-500)] focus-within:ring-2 focus-within:ring-[var(--tk-color-primary-500)]/30'
        }`}
      >
        {/* Leading slash */}
        <span className="pl-4 pr-1 text-slate-400 font-mono text-lg select-none" aria-hidden="true">
          /
        </span>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter regex pattern..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 py-3 font-mono text-sm text-slate-900 dark:text-white bg-transparent placeholder-slate-400 focus:outline-none min-w-0"
          aria-label="Regular expression pattern"
          aria-invalid={hasError}
          aria-describedby={hasError ? 'regex-error' : undefined}
        />

        {/* Trailing slash */}
        <span className="pr-1 text-slate-400 font-mono text-lg select-none" aria-hidden="true">
          /
        </span>

        {/* Flag toggles */}
        <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-1 pr-2 gap-0.5">
          {FLAG_OPTIONS.map((flag) => {
            const active = flags.includes(flag)
            return (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={`w-8 h-8 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--tk-color-primary-500)] text-white'
                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                aria-label={`Toggle ${flag} flag`}
                aria-pressed={active}
                title={getFlagTitle(flag)}
              >
                {flag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <p id="regex-error" role="alert" className="mt-2 text-xs text-red-500 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}

function getFlagTitle(flag: string): string {
  switch (flag) {
    case 'g': return 'Global — find all matches'
    case 'i': return 'Case insensitive'
    case 'm': return 'Multiline — ^ and $ match line boundaries'
    case 's': return 'Dotall — . matches newline'
    default: return flag
  }
}
