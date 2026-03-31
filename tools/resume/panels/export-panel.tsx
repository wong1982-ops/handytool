'use client'

import { useState, useEffect } from 'react'
import { useResume } from '../resume-provider'

const A4_HEIGHT = 842
const A4_WIDTH = 595

export function ExportPanel() {
  const { state, t } = useResume()
  const { resume } = state
  const [exporting, setExporting] = useState(false)
  const [pageImages, setPageImages] = useState<string[]>([])

  const generateFileName = () => {
    const name = resume.baseInfo.name || 'resume'
    const date = new Date().toISOString().slice(0, 10)
    return `${name}_${resume.title}_${date}`
  }

  // Generate per-page preview thumbnails
  useEffect(() => {
    const generatePreviews = async () => {
      const el = document.getElementById('resume-print-target')
      if (!el) return

      try {
        const { toCanvas } = await import('html-to-image')
        const fullCanvas = await toCanvas(el, {
          backgroundColor: '#ffffff',
          pixelRatio: 1,
          width: A4_WIDTH,
        })

        const contentHeight = fullCanvas.height
        const pageCount = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT))
        const pages: string[] = []

        for (let i = 0; i < pageCount; i++) {
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = A4_WIDTH
          pageCanvas.height = A4_HEIGHT
          const ctx = pageCanvas.getContext('2d')
          if (!ctx) continue

          // Fill white background
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

          // Draw the relevant slice of the full canvas
          ctx.drawImage(
            fullCanvas,
            0, i * A4_HEIGHT,                    // source x, y
            A4_WIDTH, A4_HEIGHT,                  // source width, height
            0, 0,                                  // dest x, y
            A4_WIDTH, A4_HEIGHT                    // dest width, height
          )

          pages.push(pageCanvas.toDataURL('image/png'))
        }

        setPageImages(pages)
      } catch {
        // Preview generation failed
      }
    }

    const timer = setTimeout(generatePreviews, 600)
    return () => clearTimeout(timer)
  }, [resume.updatedAt, resume.theme.templateId, resume.enabledModules.length])

  const handlePrintPdf = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    setExporting(true)
    try {
      const el = document.getElementById('resume-print-target')
      if (!el) return

      const { toCanvas } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')

      const fullCanvas = await toCanvas(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: A4_WIDTH,
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210
      const pdfPageHeight = 297

      const contentHeight = fullCanvas.height
      const pageCount = Math.max(1, Math.ceil(contentHeight / (A4_HEIGHT * 2))) // *2 for pixelRatio

      for (let i = 0; i < pageCount; i++) {
        if (i > 0) pdf.addPage()

        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = A4_WIDTH * 2
        pageCanvas.height = A4_HEIGHT * 2
        const ctx = pageCanvas.getContext('2d')
        if (!ctx) continue

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        ctx.drawImage(
          fullCanvas,
          0, i * A4_HEIGHT * 2,
          A4_WIDTH * 2, A4_HEIGHT * 2,
          0, 0,
          A4_WIDTH * 2, A4_HEIGHT * 2
        )

        const imgData = pageCanvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfPageHeight)
      }

      pdf.save(`${generateFileName()}.pdf`)
    } catch (e) {
      console.error('PDF export error:', e)
      window.print()
    } finally {
      setExporting(false)
    }
  }

  const pageCount = pageImages.length || 1

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.export.title}
        </h2>

        {/* PDF Page Previews */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </span>
          </div>

          {pageImages.length > 0 ? (
            <div className="flex flex-col gap-3 items-center">
              {pageImages.map((imgUrl, idx) => (
                <div key={idx} className="relative">
                  {/* Page number */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center z-10">
                    {idx + 1}
                  </div>
                  <div
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                    style={{ width: 240, height: Math.round(240 * (297 / 210)) }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-400 text-xs py-16">
              Generating preview...
            </div>
          )}
        </div>

        {/* File name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.export.fileName}
          </label>
          <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
            {generateFileName()}.pdf
          </div>
        </div>

        {/* Export buttons */}
        <div className="space-y-2">
          <button
            onClick={handlePrintPdf}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Print / Save as PDF
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? t.export.exporting : `Download PDF (${pageCount} page${pageCount > 1 ? 's' : ''})`}
          </button>
        </div>

        {/* Tip */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Print / Save as PDF</strong> gives the best quality (vector text). Set margins to &ldquo;None&rdquo;.
            <br />
            <strong>Download PDF</strong> is a one-click image-based export with automatic page splitting.
          </p>
        </div>
      </div>
    </div>
  )
}
