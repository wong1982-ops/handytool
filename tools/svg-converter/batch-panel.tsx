'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import JSZip from 'jszip'
import type { VectorizationSettings } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

type FileStatus = 'pending' | 'processing' | 'done' | 'error'

interface BatchFileEntry {
  file: File
  status: FileStatus
  svgString?: string
  error?: string
  thumbnailUrl: string
}

interface BatchPanelProps {
  files: File[]
  settings: VectorizationSettings
  onRemoveFile: (index: number) => void
  onClearAll: () => void
  onBack: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BatchPanel({ files, settings, onRemoveFile, onClearAll, onBack }: BatchPanelProps) {
  const [entries, setEntries] = useState<BatchFileEntry[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const abortRef = useRef<AbortController | null>(null)
  const isConvertingRef = useRef(false)

  // Initialize entries when files change
  useEffect(() => {
    const newEntries = files.map((file) => ({
      file,
      status: 'pending' as FileStatus,
      thumbnailUrl: URL.createObjectURL(file),
    }))
    setEntries((prev) => {
      // Revoke old URLs
      prev.forEach((e) => URL.revokeObjectURL(e.thumbnailUrl))
      return newEntries
    })
    // Reset conversion state
    setIsConverting(false)
    setCurrentIndex(-1)

    return () => {
      newEntries.forEach((e) => URL.revokeObjectURL(e.thumbnailUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const doneCount = useMemo(() => entries.filter((e) => e.status === 'done').length, [entries])
  const errorCount = useMemo(() => entries.filter((e) => e.status === 'error').length, [entries])
  const allFinished = useMemo(
    () => entries.length > 0 && entries.every((e) => e.status === 'done' || e.status === 'error'),
    [entries],
  )

  const handleConvertAll = useCallback(async () => {
    if (isConvertingRef.current) return
    isConvertingRef.current = true
    setIsConverting(true)

    const controller = new AbortController()
    abortRef.current = controller

    const { liveProcessing, optimizeSvg, ...apiSettings } = settings

    for (let i = 0; i < entries.length; i++) {
      if (controller.signal.aborted) break
      if (entries[i].status === 'done') continue

      setCurrentIndex(i)
      setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, status: 'processing' } : e)))

      try {
        const formData = new FormData()
        formData.append('image', entries[i].file)
        formData.append('settings', JSON.stringify(apiSettings))

        const response = await fetch(`${API_BASE}/api/v1/svg/vectorize`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })

        if (!response.ok) {
          const body = await response.json().catch(() => null)
          throw new Error(body?.error || `Server error: ${response.status}`)
        }

        const { data } = await response.json()
        let svgString: string = data.svg

        // Optional SVGO post-processing
        if (optimizeSvg) {
          try {
            const { optimize } = await import('svgo/browser')
            const result = optimize(svgString, {
              multipass: true,
              plugins: ['preset-default'],
            })
            svgString = result.data
          } catch {
            // SVGO failure is non-fatal
          }
        }

        setEntries((prev) =>
          prev.map((e, idx) => (idx === i ? { ...e, status: 'done', svgString } : e)),
        )
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') break
        setEntries((prev) =>
          prev.map((e, idx) =>
            idx === i
              ? { ...e, status: 'error', error: err instanceof Error ? err.message : 'Conversion failed' }
              : e,
          ),
        )
      }
    }

    isConvertingRef.current = false
    setIsConverting(false)
    setCurrentIndex(-1)
  }, [entries, settings])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    isConvertingRef.current = false
    setIsConverting(false)
    setCurrentIndex(-1)
  }, [])

  const handleDownloadSingle = useCallback((entry: BatchFileEntry) => {
    if (!entry.svgString) return
    const blob = new Blob([entry.svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = entry.file.name.replace(/\.[^.]+$/, '.svg')
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleDownloadAllZip = useCallback(async () => {
    const zip = new JSZip()
    entries
      .filter((e) => e.status === 'done' && e.svgString)
      .forEach((e) => {
        const svgName = e.file.name.replace(/\.[^.]+$/, '.svg')
        zip.file(svgName, e.svgString!)
      })

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `svg-batch-${Date.now()}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  const handleRemove = useCallback(
    (index: number) => {
      if (isConverting) return
      onRemoveFile(index)
    },
    [isConverting, onRemoveFile],
  )

  const progressPercent = entries.length > 0 ? ((doneCount + errorCount) / entries.length) * 100 : 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-[#1a2333]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            disabled={isConverting}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-slate-400 disabled:opacity-40 cursor-pointer"
            aria-label="Back to upload"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-white text-sm font-semibold">
            Batch Conversion
            <span className="text-slate-400 font-normal ml-2">({entries.length} files)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {!isConverting && !allFinished && (
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer px-2 py-1"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Progress bar (visible during/after conversion) */}
      {(isConverting || allFinished) && (
        <div className="shrink-0 px-4 py-2 border-b border-slate-700/50 bg-[#101622]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>
              {isConverting
                ? `Converting ${currentIndex + 1} of ${entries.length}...`
                : `Done: ${doneCount} completed${errorCount > 0 ? `, ${errorCount} failed` : ''}`}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                allFinished && errorCount === 0
                  ? 'bg-emerald-500'
                  : allFinished && errorCount > 0
                    ? 'bg-amber-500'
                    : 'bg-[var(--tk-color-secondary-500)]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {entries.map((entry, index) => (
          <div
            key={`${entry.file.name}-${index}`}
            className={`
              flex items-center gap-3 p-2.5 rounded-lg border transition-colors
              ${
                entry.status === 'processing'
                  ? 'border-[var(--tk-color-secondary-500)]/40 bg-[var(--tk-color-secondary-500)]/5'
                  : entry.status === 'done'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : entry.status === 'error'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-slate-700/50 bg-slate-800/30'
              }
            `}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.thumbnailUrl}
                alt={entry.file.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{entry.file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(entry.file.size)}</p>
              {entry.status === 'error' && entry.error && (
                <p className="text-xs text-red-400 truncate mt-0.5">{entry.error}</p>
              )}
            </div>

            {/* Status / Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {entry.status === 'pending' && (
                <span className="text-xs text-slate-500">Pending</span>
              )}
              {entry.status === 'processing' && (
                <svg
                  className="w-4 h-4 text-[var(--tk-color-secondary-500)] animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Converting"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {entry.status === 'done' && (
                <button
                  onClick={() => handleDownloadSingle(entry)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-emerald-500/10"
                  title="Download SVG"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
              {entry.status === 'error' && (
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}

              {/* Remove button (only when not converting) */}
              {!isConverting && (
                <button
                  onClick={() => handleRemove(index)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer rounded hover:bg-slate-700/50"
                  title="Remove file"
                  aria-label={`Remove ${entry.file.name}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 p-4 border-t border-slate-700 bg-[#1a2333] space-y-2">
        {!isConverting && !allFinished && (
          <button
            onClick={handleConvertAll}
            disabled={entries.length === 0}
            className="
              w-full bg-[var(--tk-color-secondary-500)] hover:bg-[var(--tk-color-secondary-500)]/80
              text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all
              cursor-pointer min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            Convert All ({entries.length} files)
          </button>
        )}

        {isConverting && (
          <button
            onClick={handleCancel}
            className="
              w-full bg-red-600 hover:bg-red-700
              text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all
              cursor-pointer min-h-[44px]
            "
          >
            Cancel
          </button>
        )}

        {allFinished && doneCount > 0 && (
          <button
            onClick={handleDownloadAllZip}
            className="
              w-full bg-emerald-600 hover:bg-emerald-700
              text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all
              cursor-pointer min-h-[44px] flex items-center justify-center gap-2
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download All as ZIP ({doneCount} files)
          </button>
        )}

        {allFinished && (
          <button
            onClick={onBack}
            className="
              w-full border border-slate-600 hover:border-slate-500
              text-slate-300 font-medium py-2 px-4 rounded-lg text-sm transition-all
              cursor-pointer min-h-[44px]
            "
          >
            Convert More Files
          </button>
        )}
      </div>
    </div>
  )
}
