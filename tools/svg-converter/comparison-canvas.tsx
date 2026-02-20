'use client'

import { useRef } from 'react'
import { ComparisonSlider } from './comparison-slider'
import type { ImageMeta, VectorResult, ConversionState } from './types'
import './svg-converter.scss'

interface ComparisonCanvasProps {
  imageMeta: ImageMeta | null
  vectorResult: VectorResult | null
  conversionState: ConversionState
  error: string | null
  sliderPosition: number
  onSliderChange: (pos: number) => void
  zoom: number
  showGrid: boolean
}

function formatFileSize(bytes: number): string {
  return (bytes / 1024).toFixed(1)
}

export function ComparisonCanvas({
  imageMeta,
  vectorResult,
  conversionState,
  error,
  sliderPosition,
  onSliderChange,
  zoom,
  showGrid,
}: ComparisonCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  if (!imageMeta) {
    return (
      <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-slate-950/40 rounded-xl">
        <p className="text-slate-500 text-sm">No image loaded</p>
      </div>
    )
  }

  const rasterSizeKB = formatFileSize(imageMeta.sizeBytes)
  const vectorSizeKB = vectorResult ? formatFileSize(vectorResult.estimatedSize) : '---'
  const pathCount = vectorResult?.pathCount ?? 0

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden select-none"
      style={{ minHeight: 0 }}
    >
      {/* --- Left layer: Original raster --- */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-slate-950/20"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={imageMeta.dataUrl}
          alt="Original raster"
          className="max-w-full max-h-full object-contain opacity-80"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          draggable={false}
        />
      </div>

      {/* --- Right layer: Vector SVG --- */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${showGrid ? 'checkerboard-bg' : 'bg-slate-950/10'}`}
        style={{
          clipPath: `inset(0 0 0 ${sliderPosition}%)`,
        }}
      >
        {vectorResult ? (
          <img
            src={vectorResult.svgBlobUrl}
            alt="Vectorized SVG"
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
            draggable={false}
          />
        ) : (
          <div className="text-slate-600 text-sm">Awaiting conversion</div>
        )}
      </div>

      {/* --- Error overlay on right pane --- */}
      {conversionState === 'error' && error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-20"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          <div className="flex flex-col items-center gap-3 max-w-xs text-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium text-red-400">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* --- Processing overlay on right pane --- */}
      {conversionState === 'processing' && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm z-20"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="var(--tk-color-secondary-500, #32A9D9)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="50 20"
                opacity="0.8"
              />
            </svg>
            <span
              className="text-xs font-medium tracking-wide"
              style={{ color: 'var(--tk-color-secondary-500, #32A9D9)' }}
            >
              Processing...
            </span>
          </div>
        </div>
      )}

      {/* --- Comparison slider --- */}
      <ComparisonSlider
        position={sliderPosition}
        onChange={onSliderChange}
        containerRef={containerRef}
      />

      {/* --- Top floating pill label --- */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Original Raster
          </span>
          <span className="w-px h-3 bg-white/20" />
          <span
            className="flex items-center gap-1.5"
            style={{ color: 'var(--tk-color-secondary-500, #32A9D9)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--tk-color-secondary-500, #32A9D9)' }}
            />
            Live Vector
          </span>
        </div>
      </div>

      {/* --- Bottom-left metadata --- */}
      <div className="absolute bottom-3 left-3 z-20">
        <span className="font-mono text-[10px] text-slate-500 bg-slate-900/70 backdrop-blur-sm rounded px-2 py-1">
          {imageMeta.width} x {imageMeta.height} px &middot; {rasterSizeKB} KB
        </span>
      </div>

      {/* --- Bottom-right metadata --- */}
      <div className="absolute bottom-3 right-3 z-20">
        <span
          className="font-mono text-[10px] bg-slate-900/70 backdrop-blur-sm rounded px-2 py-1"
          style={{ color: 'var(--tk-color-secondary-500, #32A9D9)' }}
        >
          {pathCount} Paths &middot; {vectorSizeKB} KB
        </span>
      </div>
    </div>
  )
}
