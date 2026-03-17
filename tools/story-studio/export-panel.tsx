'use client'

import { useState } from 'react'
import type { StoryBook } from './types'
import { CREDIT_COSTS } from './types'

interface ExportPanelProps {
  book: StoryBook
}

export function ExportPanel({ book }: ExportPanelProps) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [imagesLoading, setImagesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/story/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          authors: book.authors,
          coverImageUrl: book.coverImageUrl,
          pages: book.pages
            .filter((p) => p.imageUrl)
            .map((p) => ({
              sequence: p.sequence,
              narrativeText: p.narrativeText,
              dialogue: p.dialogue,
              imageUrl: p.imageUrl,
            })),
        }),
      })

      if (!res.ok) {
        throw new Error(`Export failed (${res.status})`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book.title}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF export failed')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDownloadImages = async () => {
    setImagesLoading(true)
    setError(null)
    try {
      const pagesWithImages = book.pages.filter((p) => p.imageUrl)
      if (pagesWithImages.length === 0) {
        setError('No images to download')
        return
      }

      for (const page of pagesWithImages) {
        if (page.imageUrl) {
          window.open(page.imageUrl, '_blank')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image download failed')
    } finally {
      setImagesLoading(false)
    }
  }

  const pagesWithImages = book.pages.filter((p) => p.imageUrl).length

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Export
      </h3>

      {/* PDF download */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={pdfLoading || pagesWithImages === 0}
        className="w-full min-h-[44px] rounded-xl bg-[#3D6AF2] text-white text-sm font-medium
          hover:bg-[#3D6AF2]/90 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors flex items-center justify-center gap-2"
      >
        {pdfLoading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating PDF...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
            <span className="ml-1 text-xs opacity-75">
              ({CREDIT_COSTS.exportPdf} credits)
            </span>
          </>
        )}
      </button>

      {/* Images download */}
      <button
        type="button"
        onClick={handleDownloadImages}
        disabled={imagesLoading || pagesWithImages === 0}
        className="w-full min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600
          text-gray-700 dark:text-gray-300 text-sm font-medium
          hover:bg-gray-50 dark:hover:bg-gray-800
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors flex items-center justify-center gap-2"
      >
        {imagesLoading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Download Images ({pagesWithImages})
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* Info */}
      {pagesWithImages === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Generate illustrations first to enable exports.
        </p>
      )}
    </div>
  )
}
