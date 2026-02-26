'use client'

import { useRef } from 'react'
import type { ConversionMode } from './converter-nav'
import type { CompressionQuality } from './processors/compress-pdf'
import type { ExtractionMode } from './processors/pdf-to-excel'
import type { WatermarkType, WatermarkPosition, WatermarkOptions } from './processors/watermark'

export type ImageToPdfPageSize = 'a4' | 'letter' | 'legal' | 'original'
export type ImageToPdfOrientation = 'portrait' | 'landscape' | 'auto'
export type ImageToPdfMargin = 'none' | 'small' | 'medium' | 'large'
export type ImageToPdfFit = 'fit' | 'fill' | 'stretch'

export interface ImageToPdfOptions {
  pageSize: ImageToPdfPageSize
  orientation: ImageToPdfOrientation
  margin: ImageToPdfMargin
  fit: ImageToPdfFit
}

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
  // Watermark options
  watermarkOptions: WatermarkOptions
  onWatermarkOptionsChange: (options: WatermarkOptions) => void
  // Image-to-PDF options
  imageToPdfOptions: ImageToPdfOptions
  onImageToPdfOptionsChange: (options: ImageToPdfOptions) => void
}

const POSITION_LABELS: Record<WatermarkPosition, string> = {
  'top-left': 'TL',
  'top-center': 'TC',
  'top-right': 'TR',
  'center-left': 'CL',
  'center': 'C',
  'center-right': 'CR',
  'bottom-left': 'BL',
  'bottom-center': 'BC',
  'bottom-right': 'BR',
  'diagonal': 'D',
}

const PRESET_COLORS = ['#FF0000', '#0000FF', '#808080', '#000000', '#FF6600', '#009900']

const btnActive = 'bg-[var(--tk-color-secondary-500)] text-slate-900'
const btnInactive = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'

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
  watermarkOptions,
  onWatermarkOptionsChange,
  imageToPdfOptions,
  onImageToPdfOptionsChange,
}: ModeOptionsProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)

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
                scale === s ? btnActive : btnInactive
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
                quality === q ? btnActive : btnInactive
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
                preserveLayout === val ? btnActive : btnInactive
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
                extractionMode === m ? btnActive : btnInactive
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

  if (mode === 'watermark') {
    const wm = watermarkOptions
    const update = (partial: Partial<WatermarkOptions>) => onWatermarkOptionsChange({ ...wm, ...partial })

    const gridPositions: WatermarkPosition[] = [
      'top-left', 'top-center', 'top-right',
      'center-left', 'center', 'center-right',
      'bottom-left', 'bottom-center', 'bottom-right',
    ]

    return (
      <div className="space-y-5 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
        {/* Type toggle */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0">Type:</label>
          <div className="flex gap-2">
            {(['text', 'image'] as WatermarkType[]).map((t) => (
              <button
                key={t}
                onClick={() => update({ type: t })}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize cursor-pointer ${
                  wm.type === t ? btnActive : btnInactive
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {wm.type === 'text' ? (
          <>
            {/* Text input */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0">Text:</label>
              <input
                type="text"
                value={wm.text}
                onChange={(e) => update({ text: e.target.value })}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[var(--tk-color-secondary-500)] focus:border-transparent transition-all text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Font size */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0">Size:</label>
              <input
                type="range"
                min={12}
                max={120}
                value={wm.fontSize}
                onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
                className="flex-1 accent-[var(--tk-color-secondary-500)]"
              />
              <span className="text-sm font-bold text-slate-500 w-12 text-right">{wm.fontSize}px</span>
            </div>

            {/* Color */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0">Color:</label>
              <div className="flex gap-2 items-center">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update({ color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      wm.color === c ? 'border-[var(--tk-color-secondary-500)] scale-110' : 'border-slate-200 dark:border-slate-600'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
                <input
                  type="color"
                  value={wm.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                  aria-label="Custom color"
                />
              </div>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0">Rotation:</label>
              <input
                type="range"
                min={0}
                max={360}
                value={wm.rotation}
                onChange={(e) => update({ rotation: parseInt(e.target.value) })}
                className="flex-1 accent-[var(--tk-color-secondary-500)]"
              />
              <span className="text-sm font-bold text-slate-500 w-12 text-right">{wm.rotation}&deg;</span>
            </div>
          </>
        ) : (
          <>
            {/* Image file picker */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0">Image:</label>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {wm.imageFile ? wm.imageFile.name : 'Choose image...'}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files?.[0]) update({ imageFile: e.target.files[0] })
                }}
                className="hidden"
              />
            </div>
          </>
        )}

        {/* Opacity */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0">Opacity:</label>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round(wm.opacity * 100)}
            onChange={(e) => update({ opacity: parseInt(e.target.value) / 100 })}
            className="flex-1 accent-[var(--tk-color-secondary-500)]"
          />
          <span className="text-sm font-bold text-slate-500 w-12 text-right">{Math.round(wm.opacity * 100)}%</span>
        </div>

        {/* Position */}
        <div className="flex items-start gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-20 shrink-0 pt-1">Position:</label>
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-1">
              {gridPositions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => update({ position: pos })}
                  className={`w-9 h-9 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    wm.position === pos ? btnActive : btnInactive
                  }`}
                  title={pos}
                >
                  {POSITION_LABELS[pos]}
                </button>
              ))}
            </div>
            <button
              onClick={() => update({ position: 'diagonal' })}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                wm.position === 'diagonal' ? btnActive : btnInactive
              }`}
            >
              Diagonal
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'images-to-pdf') {
    const opts = imageToPdfOptions
    const update = (partial: Partial<ImageToPdfOptions>) => onImageToPdfOptionsChange({ ...opts, ...partial })

    return (
      <div className="space-y-4 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
        {/* Page size */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">Page size:</label>
          <div className="flex gap-2 flex-wrap">
            {(['a4', 'letter', 'legal', 'original'] as ImageToPdfPageSize[]).map((s) => (
              <button
                key={s}
                onClick={() => update({ pageSize: s })}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors uppercase cursor-pointer ${
                  opts.pageSize === s ? btnActive : btnInactive
                }`}
              >
                {s === 'original' ? 'Original' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation (only if not original) */}
        {opts.pageSize !== 'original' && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">Orientation:</label>
            <div className="flex gap-2">
              {(['portrait', 'landscape', 'auto'] as ImageToPdfOrientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => update({ orientation: o })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize cursor-pointer ${
                    opts.orientation === o ? btnActive : btnInactive
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Margins (only if not original) */}
        {opts.pageSize !== 'original' && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">Margins:</label>
            <div className="flex gap-2 flex-wrap">
              {([
                { id: 'none', label: 'None' },
                { id: 'small', label: 'Small (10mm)' },
                { id: 'medium', label: 'Medium (20mm)' },
                { id: 'large', label: 'Large (30mm)' },
              ] as { id: ImageToPdfMargin; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => update({ margin: m.id })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    opts.margin === m.id ? btnActive : btnInactive
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fit mode (only if not original) */}
        {opts.pageSize !== 'original' && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">Fit:</label>
            <div className="flex gap-2">
              {(['fit', 'fill', 'stretch'] as ImageToPdfFit[]).map((f) => (
                <button
                  key={f}
                  onClick={() => update({ fit: f })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize cursor-pointer ${
                    opts.fit === f ? btnActive : btnInactive
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">
              {opts.fit === 'fit' ? 'Image fits within margins' : opts.fit === 'fill' ? 'Image fills page, may crop' : 'Image stretches to fill'}
            </span>
          </div>
        )}
      </div>
    )
  }

  return null
}
