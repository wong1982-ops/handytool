'use client'

interface ProcessingOverlayProps {
  isProcessing: boolean
  progress: { percent: number; label: string }
  onCancel: () => void
}

export function ProcessingOverlay({ isProcessing, progress, onCancel }: ProcessingOverlayProps) {
  if (!isProcessing) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        {/* Animated spinner or pulse */}
        <div className="flex flex-col items-center gap-4">
          {/* Animated dots/spinner */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-[var(--tk-color-primary-500)] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-[var(--tk-color-primary-500)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          {/* Label */}
          <p className="text-sm text-slate-600 dark:text-slate-400">{progress.label || 'Processing...'}</p>
          <p className="text-xs text-slate-400">{progress.percent}%</p>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
