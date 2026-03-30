'use client'

import { useState } from 'react'
import { useResume } from '../resume-provider'

export function ExportPanel() {
  const { state, t } = useResume()
  const { resume } = state
  const [exporting, setExporting] = useState(false)

  const generateFileName = () => {
    const name = resume.baseInfo.name || 'resume'
    const date = new Date().toISOString().slice(0, 10)
    return `${name}_${resume.title}_${date}`
  }

  const handlePrintPdf = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    setExporting(true)
    try {
      const el = document.getElementById('resume-print-target')
      if (!el) return

      // Dynamic imports to avoid bundling if unused
      const { toCanvas } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')

      const canvas = await toCanvas(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${generateFileName()}.pdf`)
    } catch (e) {
      console.error('PDF export error:', e)
      // Fallback to print
      window.print()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.export.title}
        </h2>

        {/* File name preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.export.fileName}
          </label>
          <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 font-mono truncate">
            {generateFileName()}.pdf
          </div>
        </div>

        {/* Print PDF (primary) */}
        <button
          onClick={handlePrintPdf}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <span aria-hidden="true">🖨️</span>
          Print / Save as PDF
        </button>

        {/* Download PDF (fallback) */}
        <button
          onClick={handleDownloadPdf}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span aria-hidden="true">📄</span>
          {exporting ? t.export.exporting : t.export.exportPdf}
        </button>

        {/* Tips */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Tip: &ldquo;Print / Save as PDF&rdquo; gives the best quality (vector text). Set margins to &ldquo;None&rdquo; in the print dialog for a clean output. Use &ldquo;Export as PDF&rdquo; as a one-click alternative.
          </p>
        </div>
      </div>
    </div>
  )
}
