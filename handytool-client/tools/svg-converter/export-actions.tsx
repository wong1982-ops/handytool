'use client'

import type { VectorResult, ConversionState } from './types'

interface ExportActionsProps {
  vectorResult: VectorResult | null
  conversionState: ConversionState
  onDownloadSvg: () => void
  onExportEps: () => void
  onExportPdf: () => void
}

function formatFileSize(bytes: number): string {
  return (bytes / 1024).toFixed(1)
}

export function ExportActions({
  vectorResult,
  conversionState,
  onDownloadSvg,
  onExportEps,
  onExportPdf,
}: ExportActionsProps) {
  const disabled = !vectorResult
  const estimatedSizeKB = vectorResult ? formatFileSize(vectorResult.estimatedSize) : '---'
  const isProcessing = conversionState === 'processing'
  const isReady = conversionState === 'ready'

  return (
    <div className="border-t border-white/10 bg-slate-950/60 px-4 py-4 flex flex-col gap-3">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wide">
          Est. File Size: {estimatedSizeKB} KB
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: isReady
              ? 'var(--ht-color-secondary-500, #32A9D9)'
              : isProcessing
                ? 'var(--ht-color-secondary-500, #32A9D9)'
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
            : 'var(--ht-color-secondary-500, #32A9D9)',
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
      <div className="grid grid-cols-2 gap-2">
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
          EPS Export
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
          PDF Export
        </button>
      </div>
    </div>
  )
}
