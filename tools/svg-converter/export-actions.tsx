'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { VectorResult, ConversionState } from './types'

interface ExportActionsProps {
  vectorResult: VectorResult | null
  conversionState: ConversionState
  onDownloadSvg: () => void
  onExportEps: () => void
  onExportPdf: () => void
  onExportPng: (targetWidth: number) => void
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / 1024).toFixed(1)} KB`
}

const PNG_PRESETS = [
  { label: '1x', multiplier: 1 },
  { label: '2x', multiplier: 2 },
  { label: '4x', multiplier: 4 },
]

export function ExportActions({
  vectorResult,
  conversionState,
  onDownloadSvg,
  onExportEps,
  onExportPdf,
  onExportPng,
}: ExportActionsProps) {
  const disabled = !vectorResult
  const isProcessing = conversionState === 'processing'
  const isReady = conversionState === 'ready'

  // PNG popover state
  const [showPngPopover, setShowPngPopover] = useState(false)
  const [customWidth, setCustomWidth] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover on click outside
  useEffect(() => {
    if (!showPngPopover) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPngPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPngPopover])

  // Get original SVG width for multiplier calculations
  const getSvgWidth = useCallback((): number => {
    if (!vectorResult) return 300
    const parser = new DOMParser()
    const doc = parser.parseFromString(vectorResult.svgString, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl) return 300
    const viewBox = svgEl.getAttribute('viewBox')
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number)
      if (parts.length >= 4) return parts[2]
    }
    return parseFloat(svgEl.getAttribute('width') || '300') || 300
  }, [vectorResult])

  const handlePresetPng = (multiplier: number) => {
    const baseWidth = getSvgWidth()
    onExportPng(Math.round(baseWidth * multiplier))
    setShowPngPopover(false)
  }

  const handleCustomPng = () => {
    const w = parseInt(customWidth, 10)
    if (w > 0 && w <= 8192) {
      onExportPng(w)
      setShowPngPopover(false)
      setCustomWidth('')
    }
  }

  return (
    <div className="border-t border-white/10 bg-slate-950/60 px-4 py-4 flex flex-col gap-3">
      {/* Optimization stats */}
      {vectorResult && (
        <div className="text-xs text-slate-400">
          {vectorResult.pathCount} paths &middot; {formatFileSize(vectorResult.estimatedSize)}
        </div>
      )}

      {/* Status row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wide">
          Est. File Size: {vectorResult ? formatFileSize(vectorResult.estimatedSize) : '---'}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: isReady
              ? 'var(--tk-color-secondary-500, #32A9D9)'
              : isProcessing
                ? 'var(--tk-color-secondary-500, #32A9D9)'
                : 'rgba(148, 163, 184, 0.5)',
          }}
        >
          {isProcessing && (
            <span className="inline-flex items-center gap-1.5">
              <svg
                className="animate-spin"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="50 20"
                  strokeLinecap="round"
                />
              </svg>
              Processing
            </span>
          )}
          {isReady && 'Ready'}
          {!isProcessing && !isReady && 'Idle'}
        </span>
      </div>

      {/* Primary download button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onDownloadSvg}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        style={{
          backgroundColor: disabled
            ? 'rgba(50, 169, 217, 0.3)'
            : 'var(--tk-color-secondary-500, #32A9D9)',
          boxShadow: disabled
            ? 'none'
            : '0 4px 14px rgba(50, 169, 217, 0.3)',
        }}
      >
        {/* Download icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3V15M12 15L7 10M12 15L17 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Download SVG
      </button>

      {/* Secondary export buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onExportEps}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 transition-colors duration-150 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-slate-400"
          >
            <path
              d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          EPS
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onExportPdf}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 transition-colors duration-150 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-slate-400"
          >
            <path
              d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          PDF
        </button>

        {/* PNG Export with resolution popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPngPopover(!showPngPopover)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 transition-colors duration-150 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-400"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path
                d="M21 15L16 10L5 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            PNG
          </button>

          {/* Resolution popover */}
          {showPngPopover && (
            <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-700">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Resolution
                </span>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                {PNG_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetPng(preset.multiplier)}
                    className="text-left px-2.5 py-1.5 rounded text-xs text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {preset.label}
                    <span className="text-slate-500 ml-1">
                      ({Math.round(getSvgWidth() * preset.multiplier)}px)
                    </span>
                  </button>
                ))}
              </div>
              <div className="px-2.5 py-2 border-t border-slate-700">
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    placeholder="Width"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustomPng() }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-[var(--tk-color-secondary-500)]"
                    min={1}
                    max={8192}
                    aria-label="Custom PNG width"
                  />
                  <button
                    type="button"
                    onClick={handleCustomPng}
                    className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--tk-color-secondary-500, #32A9D9) 20%, transparent)',
                      color: 'var(--tk-color-secondary-500, #32A9D9)',
                    }}
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
