'use client'

import { useCallback } from 'react'

interface ZoomControlsProps {
  zoom: number
  showGrid: boolean
  onZoomChange: (z: number) => void
  onFitScreen: () => void
  onToggleGrid: () => void
}

const ZOOM_MIN = 25
const ZOOM_MAX = 400
const ZOOM_STEP = 25

export function ZoomControls({ zoom, showGrid, onZoomChange, onFitScreen, onToggleGrid }: ZoomControlsProps) {
  const handleZoomOut = useCallback(() => {
    const next = Math.max(ZOOM_MIN, zoom - ZOOM_STEP)
    onZoomChange(next)
  }, [zoom, onZoomChange])

  const handleZoomIn = useCallback(() => {
    const next = Math.min(ZOOM_MAX, zoom + ZOOM_STEP)
    onZoomChange(next)
  }, [zoom, onZoomChange])

  return (
    <div
      className="
        absolute bottom-8 left-1/2 -translate-x-1/2 z-20
        flex items-center gap-0.5 px-2 py-1.5
        rounded-full backdrop-blur-xl
        bg-slate-900/80 border border-slate-600
        shadow-xl
      "
      role="toolbar"
      aria-label="Zoom controls"
    >
      {/* Zoom out */}
      <button
        onClick={handleZoomOut}
        disabled={zoom <= ZOOM_MIN}
        title="Zoom out"
        aria-label="Zoom out"
        className="
          w-11 h-11 flex items-center justify-center rounded-full
          text-slate-400 hover:text-white hover:bg-slate-700/60
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors cursor-pointer
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* Zoom level display */}
      <span
        className="
          min-w-[52px] text-center text-xs font-bold text-slate-300
          select-none tabular-nums
        "
        aria-live="polite"
        aria-atomic="true"
      >
        {zoom}%
      </span>

      {/* Zoom in */}
      <button
        onClick={handleZoomIn}
        disabled={zoom >= ZOOM_MAX}
        title="Zoom in"
        aria-label="Zoom in"
        className="
          w-11 h-11 flex items-center justify-center rounded-full
          text-slate-400 hover:text-white hover:bg-slate-700/60
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors cursor-pointer
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-600 mx-1" aria-hidden="true" />

      {/* Fit screen */}
      <button
        onClick={onFitScreen}
        title="Fit to screen"
        aria-label="Fit to screen"
        className="
          w-11 h-11 flex items-center justify-center rounded-full
          text-slate-400 hover:text-white hover:bg-slate-700/60
          transition-colors cursor-pointer
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>

      {/* Grid toggle */}
      <button
        onClick={onToggleGrid}
        title={showGrid ? 'Hide grid' : 'Show grid'}
        aria-label={showGrid ? 'Hide grid' : 'Show grid'}
        aria-pressed={showGrid}
        className={`
          w-11 h-11 flex items-center justify-center rounded-full
          transition-colors cursor-pointer
          ${
            showGrid
              ? 'text-[var(--ht-color-primary-500)] bg-[var(--ht-color-primary-500)]/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4h16v16H4V4zm0 4h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16"
          />
        </svg>
      </button>
    </div>
  )
}
