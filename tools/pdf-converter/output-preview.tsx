'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type OutputType = 'pdf' | 'image' | 'zip' | 'office'

function getOutputType(filename: string): OutputType {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image'
  if (lower.endsWith('.zip')) return 'zip'
  if (lower.endsWith('.docx') || lower.endsWith('.xlsx')) return 'office'
  return 'office'
}

interface OutputPreviewProps {
  downloadUrl: string
  downloadFilename: string
}

export function OutputPreview({ downloadUrl, downloadFilename }: OutputPreviewProps) {
  const outputType = getOutputType(downloadFilename)

  if (outputType !== 'pdf' && outputType !== 'image') return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Preview</h4>
      </div>
      <div className="p-5">
        {outputType === 'pdf' && <PdfPreview downloadUrl={downloadUrl} />}
        {outputType === 'image' && <ImagePreview downloadUrl={downloadUrl} filename={downloadFilename} />}
      </div>
    </div>
  )
}

interface PdfDoc {
  numPages: number
  getPage(num: number): Promise<PdfPage>
  destroy(): void
}

interface PdfPage {
  getViewport(params: { scale: number }): { width: number; height: number }
  render(params: { canvas: HTMLCanvasElement; viewport: { width: number; height: number } }): { promise: Promise<void> }
}

const PREVIEW_SCALE = 1.5

function PdfPreview({ downloadUrl }: { downloadUrl: string }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDocRef = useRef<PdfDoc | null>(null)
  const renderingRef = useRef(false)

  // Load PDF document once
  useEffect(() => {
    let cancelled = false

    async function loadPdf() {
      try {
        setStatus('loading')
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const response = await fetch(downloadUrl)
        const arrayBuffer = await response.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        if (cancelled) {
          pdf.destroy()
          return
        }

        pdfDocRef.current = pdf as unknown as PdfDoc
        setTotalPages(pdf.numPages)
        setCurrentPage(1)
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    loadPdf()
    return () => {
      cancelled = true
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy()
        pdfDocRef.current = null
      }
    }
  }, [downloadUrl])

  // Render current page
  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfDocRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas || renderingRef.current) return

    renderingRef.current = true
    setStatus('loading')

    try {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: PREVIEW_SCALE })

      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.getContext('2d')

      await page.render({ canvas, viewport }).promise
      setStatus('ready')
    } catch {
      setStatus('error')
    } finally {
      renderingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (totalPages > 0) {
      renderPage(currentPage)
    }
  }, [currentPage, totalPages, renderPage])

  return (
    <div className="space-y-4">
      {/* Canvas container */}
      <div className="flex justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 min-h-[200px] items-center">
        {status === 'loading' && !canvasRef.current?.width && (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs">Loading preview...</span>
          </div>
        )}
        {status === 'error' && totalPages === 0 && (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Could not load preview</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm ${totalPages === 0 ? 'hidden' : ''}`}
        />
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-2.5 rounded-lg text-slate-500 hover:text-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-500)]/10 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 tabular-nums min-w-[100px] text-center" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2.5 rounded-lg text-slate-500 hover:text-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-500)]/10 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function ImagePreview({ downloadUrl, filename }: { downloadUrl: string; filename: string }) {
  return (
    <div className="flex justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
      <img
        src={downloadUrl}
        alt={filename}
        className="max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
      />
    </div>
  )
}

