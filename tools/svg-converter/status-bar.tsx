'use client'

import type { ConversionState, ImageMeta, VectorResult } from '@/tools/svg-converter/types'

interface StatusBarProps {
  conversionState: ConversionState
  imageMeta: ImageMeta | null
  vectorResult: VectorResult | null
  editorPhase?: 'upload' | 'crop' | 'vectorize'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const STATE_CONFIG: Record<ConversionState, { label: string; dotColor: string }> = {
  idle: {
    label: 'Ready',
    dotColor: 'bg-slate-500',
  },
  processing: {
    label: 'Converting...',
    dotColor: 'bg-amber-400 animate-pulse',
  },
  ready: {
    label: 'Conversion complete',
    dotColor: 'bg-emerald-400',
  },
  error: {
    label: 'Conversion failed',
    dotColor: 'bg-red-400',
  },
}

export function StatusBar({ conversionState, imageMeta, vectorResult, editorPhase }: StatusBarProps) {
  if (editorPhase === 'crop') {
    return (
      <footer className="h-7 border-t border-slate-700 bg-[#101622] flex items-center justify-between px-4 shrink-0 select-none">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
          <span>Crop &amp; Resize</span>
          {imageMeta && (
            <>
              <span className="w-px h-3 bg-slate-700 mx-2" aria-hidden="true" />
              <span>{imageMeta.width} &times; {imageMeta.height} px</span>
            </>
          )}
        </div>
      </footer>
    )
  }

  const stateInfo = STATE_CONFIG[conversionState]

  return (
    <footer className="h-7 border-t border-slate-700 bg-[#101622] flex items-center justify-between px-4 shrink-0 select-none">
      {/* Left side */}
      <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 min-w-0">
        {/* Status dot + label */}
        <span className="flex items-center gap-1.5 shrink-0">
          <span
            className={`w-1.5 h-1.5 rounded-full ${stateInfo.dotColor}`}
            aria-hidden="true"
          />
          <span aria-live="polite">{stateInfo.label}</span>
        </span>

        {/* Image dimensions */}
        {imageMeta && (
          <>
            <span className="w-px h-3 bg-slate-700" aria-hidden="true" />
            <span className="flex items-center gap-1 truncate">
              <svg
                className="w-3 h-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {imageMeta.width} &times; {imageMeta.height} px
            </span>

            <span className="hidden sm:inline truncate">
              {formatBytes(imageMeta.sizeBytes)}
            </span>
          </>
        )}

        {/* SVG result info */}
        {vectorResult && conversionState === 'ready' && (
          <>
            <span className="w-px h-3 bg-slate-700 hidden md:block" aria-hidden="true" />
            <span className="hidden md:inline text-[var(--tk-color-secondary-500)]">
              {vectorResult.pathCount} paths &middot; {formatBytes(vectorResult.estimatedSize)}
            </span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500 shrink-0">
        {/* Processing time */}
        {vectorResult && vectorResult.processingTimeMs > 0 && (
          <span className="hidden sm:inline">
            {formatTime(vectorResult.processingTimeMs)}
          </span>
        )}

        {/* Server-side indicator */}
        <span className="flex items-center gap-1">
          <svg
            className="w-3 h-3 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
          <span className="hidden sm:inline">Server-side conversion</span>
        </span>
      </div>
    </footer>
  )
}
