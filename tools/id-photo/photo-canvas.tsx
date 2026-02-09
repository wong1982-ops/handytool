'use client'

import { useRef, useCallback } from 'react'

interface PhotoCanvasProps {
  photoUrl: string | null
  brightness: number
  contrast: number
  zoom: number
  onZoomChange: (zoom: number) => void
  onFileSelect: (file: File) => void
  onReset: () => void
  onDownload: () => void
  formatName: string
}

export function PhotoCanvas({
  photoUrl,
  brightness,
  contrast,
  zoom,
  onZoomChange,
  onFileSelect,
  onReset,
  onDownload,
  formatName,
}: PhotoCanvasProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        onFileSelect(file)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileSelect(file)
    },
    [onFileSelect]
  )

  const filterStyle = {
    filter: `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`,
    transform: `scale(${zoom / 100})`,
  }

  return (
    <section
      className="flex-1 p-4 md:p-8 flex flex-col relative overflow-hidden bg-slate-50 dark:bg-slate-950 canvas-dots"
    >
      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center relative">
        {photoUrl ? (
          <>
            {/* Photo container with guides */}
            <div className="relative w-full max-w-[450px] aspect-[4/5] bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800">
              {/* The photo */}
              <img
                src={photoUrl}
                alt="Uploaded photo for ID"
                className="w-full h-full object-cover transition-all duration-200"
                style={filterStyle}
              />

              {/* Guide overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top of head guide */}
                <div className="absolute top-[15%] w-full border-t border-dashed border-[var(--ht-color-secondary-500)]/60 flex justify-center">
                  <span className="bg-[var(--ht-color-secondary-500)] text-[9px] text-white px-1.5 py-0.5 rounded-full -mt-2.5 font-bold">
                    TOP OF HEAD
                  </span>
                </div>

                {/* Eye line guide */}
                <div className="absolute top-[40%] w-full border-t border-dashed border-[var(--ht-color-secondary-500)]/60 flex justify-center">
                  <span className="bg-[var(--ht-color-secondary-500)] text-[9px] text-white px-1.5 py-0.5 rounded-full -mt-2.5 font-bold">
                    EYE LINE
                  </span>
                </div>

                {/* Chin level guide */}
                <div className="absolute bottom-[25%] w-full border-t border-dashed border-[var(--ht-color-secondary-500)]/60 flex justify-center">
                  <span className="bg-[var(--ht-color-secondary-500)] text-[9px] text-white px-1.5 py-0.5 rounded-full -mt-2.5 font-bold">
                    CHIN LEVEL
                  </span>
                </div>

                {/* Center vertical line */}
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-[var(--ht-color-secondary-500)]/20 -translate-x-1/2" />

                {/* Oval face mask */}
                <div
                  className="absolute top-[15%] left-[15%] right-[15%] bottom-[25%] border-2 border-[var(--ht-color-secondary-500)]/40 rounded-[100%] border-dashed"
                  style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)' }}
                />
              </div>
            </div>

            {/* Floating zoom controls */}
            <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <button
                onClick={() => onZoomChange(Math.min(zoom + 10, 150))}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:text-[var(--ht-color-secondary-500)] transition-all cursor-pointer"
                aria-label="Zoom in"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
              <button
                onClick={() => onZoomChange(Math.max(zoom - 10, 50))}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:text-[var(--ht-color-secondary-500)] transition-all cursor-pointer"
                aria-label="Zoom out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <button
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:text-[var(--ht-color-secondary-500)] transition-all cursor-pointer"
                aria-label="Rotate photo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          /* Upload drop zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full max-w-[500px] aspect-[4/5] bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-[var(--ht-color-secondary-500)] hover:bg-[var(--ht-color-secondary-500)]/5 transition-all"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload photo"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          >
            {/* Guide overlay on empty state */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute top-[15%] w-full border-t border-dashed border-[var(--ht-color-secondary-500)]/40 flex justify-center">
                <span className="bg-[var(--ht-color-secondary-500)]/50 text-[8px] text-white px-1 py-0.5 rounded-full -mt-2">TOP OF HEAD</span>
              </div>
              <div className="absolute top-[40%] w-full border-t border-dashed border-[var(--ht-color-secondary-500)]/40 flex justify-center">
                <span className="bg-[var(--ht-color-secondary-500)]/50 text-[8px] text-white px-1 py-0.5 rounded-full -mt-2">EYE LINE</span>
              </div>
              <div className="absolute bottom-[25%] w-full border-t border-dashed border-[var(--ht-color-secondary-500)]/40 flex justify-center">
                <span className="bg-[var(--ht-color-secondary-500)]/50 text-[8px] text-white px-1 py-0.5 rounded-full -mt-2">CHIN LEVEL</span>
              </div>
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-[var(--ht-color-secondary-500)]/15 -translate-x-1/2" />
              <div className="absolute top-[15%] left-[15%] right-[15%] bottom-[25%] border-2 border-[var(--ht-color-secondary-500)]/20 rounded-[100%] border-dashed" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[var(--ht-color-secondary-500)]/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--ht-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">Ready to Start?</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Drag & drop your photo here, or click to browse.
                  Use a neutral background for best results.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="bg-[var(--ht-color-secondary-500)] text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold">
                  Pick File
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />

      {/* Bottom action bar */}
      <div className="mt-4 flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <>
              <div className="flex items-center gap-2 text-green-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-tight">Face Detected</span>
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="text-xs font-medium">Head size: 32mm (OK)</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Upload a photo to begin — {formatName}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            disabled={!photoUrl}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={onDownload}
            disabled={!photoUrl}
            className="bg-[var(--ht-color-secondary-500)] text-slate-900 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download High-Res</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </div>
    </section>
  )
}
