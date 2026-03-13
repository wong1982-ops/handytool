'use client'

interface IllustrationControlsProps {
  selectedCount: number
  qualityMode: 'fast' | 'quality'
  onQualityChange: (mode: 'fast' | 'quality') => void
  onGenerateSelected: () => void
  generating: boolean
}

const CREDIT_COST = { fast: 3, quality: 5 } as const

export function IllustrationControls({
  selectedCount, qualityMode, onQualityChange,
  onGenerateSelected, generating,
}: IllustrationControlsProps) {
  const costPerPage = CREDIT_COST[qualityMode]
  const totalCost = selectedCount * costPerPage

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl
      border border-slate-200 dark:border-slate-800">
      {/* Quality toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Quality:</span>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {(['quality', 'fast'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onQualityChange(mode)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                qualityMode === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {mode === 'quality' ? 'Quality' : 'Fast'}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {costPerPage} credits/page
        </span>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerateSelected}
        disabled={selectedCount === 0 || generating}
        className="ml-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
          disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
        style={{ minHeight: '44px' }}
      >
        {generating
          ? 'Generating...'
          : selectedCount > 0
            ? `Generate Selected (${selectedCount}) — ${totalCost} credits`
            : 'Select pages to generate'}
      </button>
    </div>
  )
}
