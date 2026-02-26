'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ProcessingState } from './file-list'

interface PageState {
  pageNum: number
  rotation: number
  deleted: boolean
  selected: boolean
}

interface PageManagerProps {
  file: File
  onExport: (blob: Blob, filename: string) => void
  onBack: () => void
}

export function PageManager({ file, onExport, onBack }: PageManagerProps) {
  const [pages, setPages] = useState<PageState[]>([])
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle', progress: 0, statusText: '' })
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const pdfDocRef = useRef<unknown>(null)

  // Load PDF and generate thumbnails
  useEffect(() => {
    let cancelled = false

    async function loadPdf() {
      try {
        setLoading(true)
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        if (cancelled) {
          pdf.destroy()
          return
        }

        pdfDocRef.current = pdf
        const totalPages = pdf.numPages
        const pageStates: PageState[] = Array.from({ length: totalPages }, (_, i) => ({
          pageNum: i + 1,
          rotation: 0,
          deleted: false,
          selected: false,
        }))
        setPages(pageStates)

        // Generate thumbnails
        const thumbMap = new Map<number, string>()
        for (let i = 1; i <= totalPages; i++) {
          if (cancelled) break
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 0.5 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.getContext('2d')
          await page.render({ canvas, viewport }).promise
          thumbMap.set(i, canvas.toDataURL('image/jpeg', 0.7))
        }

        if (!cancelled) {
          setThumbnails(thumbMap)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load PDF:', err)
          setLoading(false)
        }
      }
    }

    loadPdf()
    return () => { cancelled = true }
  }, [file])

  const activePages = pages.filter((p) => !p.deleted)
  const selectedCount = activePages.filter((p) => p.selected).length

  const handleToggleSelect = useCallback((pageNum: number) => {
    setPages((prev) => prev.map((p) =>
      p.pageNum === pageNum ? { ...p, selected: !p.selected } : p
    ))
  }, [])

  const handleSelectAll = useCallback(() => {
    const allSelected = activePages.every((p) => p.selected)
    setPages((prev) => prev.map((p) =>
      p.deleted ? p : { ...p, selected: !allSelected }
    ))
  }, [activePages])

  const handleRotatePage = useCallback((pageNum: number) => {
    setPages((prev) => prev.map((p) =>
      p.pageNum === pageNum ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ))
  }, [])

  const handleDeletePage = useCallback((pageNum: number) => {
    setPages((prev) => prev.map((p) =>
      p.pageNum === pageNum ? { ...p, deleted: true, selected: false } : p
    ))
  }, [])

  const handleRotateSelected = useCallback(() => {
    setPages((prev) => prev.map((p) =>
      p.selected && !p.deleted ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ))
  }, [])

  const handleDeleteSelected = useCallback(() => {
    setPages((prev) => prev.map((p) =>
      p.selected && !p.deleted ? { ...p, deleted: true, selected: false } : p
    ))
  }, [])

  const handleUndoDelete = useCallback((pageNum: number) => {
    setPages((prev) => prev.map((p) =>
      p.pageNum === pageNum ? { ...p, deleted: false } : p
    ))
  }, [])

  // Drag and drop reorder
  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    setPages((prev) => {
      // Work only with non-deleted pages for reordering
      const arr = [...prev]
      const activeIndices = arr.map((p, i) => ({ page: p, idx: i })).filter((x) => !x.page.deleted)

      if (dragIndex >= activeIndices.length || dropIndex >= activeIndices.length) return prev

      const sourceIdx = activeIndices[dragIndex].idx
      const targetIdx = activeIndices[dropIndex].idx

      const [removed] = arr.splice(sourceIdx, 1)
      arr.splice(targetIdx, 0, removed)
      return arr
    })

    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  // Export / save PDF
  const handleSave = useCallback(async () => {
    try {
      setProcessing({ status: 'processing', progress: 0, statusText: 'Rebuilding PDF...' })

      const { PDFDocument } = await import('pdf-lib')
      const bytes = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(bytes)

      const finalPages = pages.filter((p) => !p.deleted)
      if (finalPages.length === 0) {
        setProcessing({ status: 'error', progress: 0, statusText: '', error: 'No pages remaining. Undo deletions first.' })
        return
      }

      const newDoc = await PDFDocument.create()
      const indices = finalPages.map((p) => p.pageNum - 1)
      const copiedPages = await newDoc.copyPages(srcDoc, indices)

      for (let i = 0; i < copiedPages.length; i++) {
        const page = copiedPages[i]
        const rotation = finalPages[i].rotation
        if (rotation !== 0) {
          page.setRotation(await import('pdf-lib').then((m) => m.degrees(rotation)))
        }
        newDoc.addPage(page)
        setProcessing({
          status: 'processing',
          progress: Math.round(((i + 1) / copiedPages.length) * 90),
          statusText: `Processing page ${i + 1} of ${copiedPages.length}...`,
        })
      }

      setProcessing({ status: 'processing', progress: 93, statusText: 'Saving PDF...' })
      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const baseName = file.name.replace(/\.pdf$/i, '')

      setProcessing({ status: 'completed', progress: 100, statusText: 'Done!' })
      onExport(blob, `${baseName}_managed.pdf`)
    } catch (err) {
      setProcessing({
        status: 'error',
        progress: 0,
        statusText: '',
        error: err instanceof Error ? err.message : 'Failed to save PDF.',
      })
    }
  }, [file, pages, onExport])

  const deletedPages = pages.filter((p) => p.deleted)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <svg className="w-8 h-8 animate-spin text-[var(--tk-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p className="text-sm text-slate-500">Loading PDF pages...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        <button
          onClick={handleSelectAll}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {activePages.every((p) => p.selected) ? 'Deselect All' : 'Select All'}
        </button>

        {selectedCount > 0 && (
          <>
            <button
              onClick={handleRotateSelected}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rotate {selectedCount}
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selectedCount}
            </button>
          </>
        )}

        <div className="flex-1" />

        <button
          onClick={handleSave}
          disabled={activePages.length === 0 || processing.status === 'processing'}
          className="bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[var(--tk-color-primary-500)]/20 cursor-pointer flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save PDF
        </button>
      </div>

      {/* Processing state */}
      {processing.status === 'processing' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Saving...</span>
            <span className="text-sm font-bold text-[var(--tk-color-secondary-500)]">{processing.progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--tk-color-secondary-500)] rounded-full transition-all duration-300" style={{ width: `${processing.progress}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{processing.statusText}</p>
        </div>
      )}

      {processing.status === 'error' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-red-200 dark:border-red-900/50" role="alert">
          <p className="text-sm font-bold text-red-600 dark:text-red-400">Error</p>
          <p className="text-xs text-slate-500">{processing.error}</p>
        </div>
      )}

      {/* Page info */}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {activePages.length} page{activePages.length !== 1 ? 's' : ''} active
        {deletedPages.length > 0 && <span className="text-red-400"> ({deletedPages.length} deleted)</span>}
        {' '}&mdash; Drag to reorder, click to select
      </p>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.filter((p) => !p.deleted).map((page, idx) => {
          const thumb = thumbnails.get(page.pageNum)
          const isDragging = dragIndex === idx
          const isDragOver = dragOverIndex === idx

          return (
            <div
              key={page.pageNum}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`group relative rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${
                page.selected
                  ? 'border-[var(--tk-color-secondary-500)] bg-[var(--tk-color-secondary-500)]/5'
                  : isDragOver
                    ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              } ${isDragging ? 'opacity-40 scale-95' : ''}`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={page.selected}
                  onChange={() => handleToggleSelect(page.pageNum)}
                  className="w-4 h-4 rounded border-slate-300 text-[var(--tk-color-secondary-500)] focus:ring-[var(--tk-color-secondary-500)] cursor-pointer"
                  aria-label={`Select page ${page.pageNum}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleRotatePage(page.pageNum) }}
                  className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                  aria-label={`Rotate page ${page.pageNum}`}
                  title="Rotate 90°"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePage(page.pageNum) }}
                  className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                  aria-label={`Delete page ${page.pageNum}`}
                  title="Delete page"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Thumbnail */}
              <div
                className="p-3 pb-0 flex items-center justify-center overflow-hidden"
                onClick={() => handleToggleSelect(page.pageNum)}
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={`Page ${page.pageNum}`}
                    className="w-full h-auto rounded-lg shadow-sm"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-slate-400">Loading...</span>
                  </div>
                )}
              </div>

              {/* Page number and rotation indicator */}
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Page {page.pageNum}</span>
                {page.rotation !== 0 && (
                  <span className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{page.rotation}&deg;</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Deleted pages recovery */}
      {deletedPages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Deleted Pages</h4>
          <div className="flex flex-wrap gap-2">
            {deletedPages.map((page) => (
              <button
                key={page.pageNum}
                onClick={() => handleUndoDelete(page.pageNum)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Restore Page {page.pageNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
