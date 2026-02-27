'use client'

import { useState, useEffect, useCallback } from 'react'

const EXPORT_PRESETS = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'Facebook Cover', width: 820, height: 312 },
  { name: 'Print A4', width: 2480, height: 3508 },
  { name: 'Custom', width: 0, height: 0 },
] as const

type ExportFormat = 'png' | 'jpeg' | 'webp'

export interface ExportOptions {
  width: number
  height: number
  format: ExportFormat
  quality: number // 0.1 - 1.0
}

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => void
  currentSize: { width: number; height: number } | null
}

export function ExportDialog({ isOpen, onClose, onExport, currentSize }: ExportDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [width, setWidth] = useState(currentSize?.width ?? 1920)
  const [height, setHeight] = useState(currentSize?.height ?? 1080)
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(90)

  // Sync dimensions when currentSize changes or dialog opens
  useEffect(() => {
    if (isOpen && currentSize) {
      setWidth(currentSize.width)
      setHeight(currentSize.height)
      setSelectedPreset(null)
    }
  }, [isOpen, currentSize])

  const handlePresetSelect = useCallback((preset: typeof EXPORT_PRESETS[number]) => {
    setSelectedPreset(preset.name)
    if (preset.width > 0 && preset.height > 0) {
      setWidth(preset.width)
      setHeight(preset.height)
    }
  }, [])

  const handleExport = useCallback(() => {
    onExport({
      width,
      height,
      format,
      quality: quality / 100,
    })
  }, [width, height, format, quality, onExport])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isCustom = selectedPreset === 'Custom'
  const showQuality = format === 'jpeg' || format === 'webp'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Export Image"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold text-base">Export Image</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Current dimensions */}
          {currentSize && !selectedPreset && (
            <div className="text-xs text-slate-400">
              Current dimensions: <span className="text-slate-300 font-medium">{currentSize.width} x {currentSize.height} px</span>
            </div>
          )}

          {/* Preset grid */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Size Preset</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-2.5 rounded-lg text-sm text-left transition-colors cursor-pointer border ${
                    selectedPreset === preset.name
                      ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/10 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className="block font-medium">{preset.name}</span>
                  {preset.width > 0 && (
                    <span className="block text-[10px] text-slate-500 mt-0.5">{preset.width} x {preset.height}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom size inputs */}
          {isCustom && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="export-width" className="text-xs text-slate-400 mb-1 block">Width (px)</label>
                <input
                  id="export-width"
                  type="number"
                  min={1}
                  max={10000}
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--tk-color-primary-500)] transition-colors"
                />
              </div>
              <span className="text-slate-500 mt-5">x</span>
              <div className="flex-1">
                <label htmlFor="export-height" className="text-xs text-slate-400 mb-1 block">Height (px)</label>
                <input
                  id="export-height"
                  type="number"
                  min={1}
                  max={10000}
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--tk-color-primary-500)] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Format selection */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Format</label>
            <div className="flex gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <label
                  key={fmt}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors border ${
                    format === fmt
                      ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/10 text-white'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="export-format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={() => setFormat(fmt)}
                    className="sr-only"
                  />
                  <span className="font-medium uppercase">{fmt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {showQuality && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="export-quality" className="text-xs font-medium text-slate-400 uppercase tracking-wider">Quality</label>
                <span className="text-xs text-slate-300 font-medium">{quality}%</span>
              </div>
              <input
                id="export-quality"
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full accent-[var(--tk-color-primary-500)] h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Dimensions summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Output</span>
            <span className="text-sm text-white font-medium">
              {width} x {height} &middot; {format.toUpperCase()}
              {showQuality && <span className="text-slate-400"> @ {quality}%</span>}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600,#2d5ad2)] text-white font-bold py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
