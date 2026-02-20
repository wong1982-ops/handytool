'use client'

import type { ConversionMode } from './converter-nav'
import type { CompressionQuality } from './processors/compress-pdf'
import type { ExtractionMode } from './processors/pdf-to-excel'

interface ModeOptionsProps {
  mode: ConversionMode
  scale: number
  onScaleChange: (scale: number) => void
  quality: CompressionQuality
  onQualityChange: (quality: CompressionQuality) => void
  pageRanges: string
  onPageRangesChange: (ranges: string) => void
  totalPages: number | null
  preserveLayout: boolean
  onPreserveLayoutChange: (value: boolean) => void
  extractionMode: ExtractionMode
  onExtractionModeChange: (mode: ExtractionMode) => void
}

export function ModeOptions({
  mode,
  scale,
  onScaleChange,
  quality,
  onQualityChange,
  pageRanges,
  onPageRangesChange,
  totalPages,
  preserveLayout,
  onPreserveLayoutChange,
  extractionMode,
  onExtractionModeChange,
}: ModeOptionsProps) {
  if (mode === 'pdf-to-images') {
    return (
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Scale:</label>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => onScaleChange(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                scale === s
                  ? 'bg-[var(--tk-color-secondary-500)] text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">Higher = better quality, larger files</span>
      </div>
    )
  }

  if (mode === 'split-pdf') {
    return (
      <div className="space-y-2">
        <label htmlFor="page-ranges" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Page ranges{totalPages !== null && <span className="text-slate-400 font-normal"> (1-{totalPages})</span>}:
        </label>
        <input
          id="page-ranges"
          type="text"
          value={pageRanges}
          onChange={(e) => onPageRangesChange(e.target.value)}
          placeholder="e.g. 1-3, 5, 8-10"
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--tk-color-secondary-500)] focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
        <p className="text-xs text-slate-400">Separate ranges with commas. Use dashes for page spans.</p>
      </div>
    )
  }

  if (mode === 'compress-pdf') {
    return (
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quality:</label>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as CompressionQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => onQualityChange(q)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize cursor-pointer ${
                quality === q
                  ? 'bg-[var(--tk-color-secondary-500)] text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">Lower = smaller file, reduced quality</span>
      </div>
    )
  }

  if (mode === 'pdf-to-word') {
    return (
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Layout:</label>
        <div className="flex gap-2">
          {([false, true] as const).map((val) => (
            <button
              key={String(val)}
              onClick={() => onPreserveLayoutChange(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                preserveLayout === val
                  ? 'bg-[var(--tk-color-secondary-500)] text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {val ? 'Preserve Layout' : 'Simple Text'}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">Preserve Layout keeps spatial positioning</span>
      </div>
    )
  }

  if (mode === 'pdf-to-excel') {
    return (
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Extraction:</label>
        <div className="flex gap-2">
          {(['auto', 'table-only'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onExtractionModeChange(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize cursor-pointer ${
                extractionMode === m
                  ? 'bg-[var(--tk-color-secondary-500)] text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {m === 'auto' ? 'Auto' : 'Table Only'}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">Table Only detects grid-aligned data more aggressively</span>
      </div>
    )
  }

  return null
}
