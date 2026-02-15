'use client'

interface CanvasControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onRotateLeft: () => void
  onRotateRight: () => void
  onReset: () => void
  scale: number
}

export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onReset,
  scale,
}: CanvasControlsProps) {
  const buttonBase =
    'w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[var(--ht-color-secondary-500)] hover:border-[var(--ht-color-secondary-500)] transition-all cursor-pointer'

  return (
    <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20">
      {/* Zoom in */}
      <button onClick={onZoomIn} className={buttonBase} aria-label="Zoom in" title="Zoom in (+)">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>

      {/* Zoom out */}
      <button onClick={onZoomOut} className={buttonBase} aria-label="Zoom out" title="Zoom out (-)">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>

      {/* Scale indicator */}
      <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
        {Math.round(scale * 100)}%
      </div>

      {/* Rotate left */}
      <button onClick={onRotateLeft} className={buttonBase} aria-label="Rotate left" title="Rotate left">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4a1 1 0 001-1V5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10A8 8 0 1121 12" />
        </svg>
      </button>

      {/* Rotate right */}
      <button onClick={onRotateRight} className={buttonBase} aria-label="Rotate right" title="Rotate right">
        <svg className="w-4 h-4 -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4a1 1 0 001-1V5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10A8 8 0 1121 12" />
        </svg>
      </button>

      {/* Reset */}
      <button onClick={onReset} className={buttonBase} aria-label="Reset position" title="Reset (R)">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  )
}
