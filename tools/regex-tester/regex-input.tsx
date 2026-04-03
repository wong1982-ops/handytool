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
        className={`flex items-center rounded-xl border bg-slate-50 dark:bg-[#131a23] transition-colors min-h-[52px] ${
          hasError
            ? 'border-[#EF4444] ring-2 ring-[rgba(239,68,68,0.3)]'
            : 'border-slate-200 dark:border-[#1e2631] focus-within:border-[#3D6AF2] focus-within:ring-2 focus-within:ring-[rgba(61,106,242,0.3)]'
        }`}
      >
        {/* Leading slash */}
        <span className="pl-4 pr-1 text-slate-400 dark:text-[#70767f] font-mono text-lg select-none" aria-hidden="true">
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
          className="flex-1 py-3 font-mono text-sm text-white bg-transparent placeholder-[#70767f] focus:outline-none min-w-0"
          style={{ fontSize: '13.5px' }}
          aria-label="Regular expression pattern"
          aria-invalid={hasError}
          aria-describedby={hasError ? 'regex-error' : undefined}
        />

        {/* Trailing slash */}
        <span className="pr-1 text-slate-400 dark:text-[#70767f] font-mono text-lg select-none" aria-hidden="true">
          /
        </span>

        {/* Flag toggles */}
        <div className="flex items-center border-l border-slate-200 dark:border-[#1e2631] pl-1 pr-2 gap-0.5 min-h-[52px]">
          {FLAG_OPTIONS.map((flag) => {
            const active = flags.includes(flag)
            return (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={`w-8 h-8 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center ${
                  active
                    ? 'bg-[#3D6AF2] text-white'
                    : 'text-slate-400 dark:text-[#70767f] hover:bg-slate-200 dark:hover:bg-[#1e2631] hover:text-slate-500 dark:hover:text-[#a6abb5]'
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
        <p id="regex-error" role="alert" className="mt-2 text-xs text-[#EF4444] font-medium">
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
