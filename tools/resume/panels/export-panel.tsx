'use client'

import { useState, useEffect } from 'react'
import { useResume } from '../resume-provider'

export function ExportPanel() {
  const { state, t } = useResume()
  const { resume } = state
  const [exporting, setExporting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(1)

  const generateFileName = () => {
    const name = resume.baseInfo.name || 'resume'
    const date = new Date().toISOString().slice(0, 10)
    return `${name}_${resume.title}_${date}`
  }

  // Generate preview thumbnail when panel opens or resume changes
  useEffect(() => {
    const generatePreview = async () => {
      const el = document.getElementById('resume-print-target')
      if (!el) return

      try {
        const { toCanvas } = await import('html-to-image')
        const canvas = await toCanvas(el, {
          backgroundColor: '#ffffff',
          pixelRatio: 1,
        })

        // Calculate page count based on A4 ratio
        const a4Ratio = 297 / 210
        const contentRatio = canvas.height / canvas.width
        const pages = Math.max(1, Math.ceil(contentRatio / a4Ratio))
        setPageCount(pages)

        setPreviewUrl(canvas.toDataURL('image/png'))
      } catch {
        // Preview generation failed
      }
    }

    const timer = setTimeout(generatePreview, 500)
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

      const canvas = await toCanvas(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210
      const pdfPageHeight = 297
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      // Multi-page: slice the full image into A4 pages
      if (imgHeight <= pdfPageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
      } else {
        let yOffset = 0
        let pageNum = 0
        while (yOffset < imgHeight) {
          if (pageNum > 0) pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, imgHeight)
          yOffset += pdfPageHeight
          pageNum++
        }
      }

      pdf.save(`${generateFileName()}.pdf`)
    } catch (e) {
      console.error('PDF export error:', e)
      window.print()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.export.title}
        </h2>

        {/* PDF Preview */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </span>
          </div>
          <div
            className="bg-white rounded-lg shadow-sm overflow-hidden mx-auto border border-gray-200"
            style={{ maxWidth: 280 }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Resume preview"
                className="w-full h-auto"
              />
            ) : (
              <div className="w-full flex items-center justify-center text-gray-400 text-xs py-20">
                Generating preview...
              </div>
            )}
          </div>
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
            <strong>Print / Save as PDF</strong> gives the best quality (vector text). Set margins to &ldquo;None&rdquo; in the print dialog.
            <br />
            <strong>Download PDF</strong> is a one-click image-based export that handles multi-page resumes automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
