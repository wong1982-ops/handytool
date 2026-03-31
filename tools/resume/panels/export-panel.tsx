'use client'

import { useState } from 'react'
import { useResume } from '../resume-provider'
import { ClassicLayout } from '../themes/classic-layout'
import { BlueMinimalLayout } from '../themes/blue-minimal-layout'
import { YellowMinimalLayout } from '../themes/yellow-minimal-layout'

const THEME_LAYOUTS = {
  classic: ClassicLayout,
  'blue-minimal': BlueMinimalLayout,
  'yellow-minimal': YellowMinimalLayout,
} as const

const A4_HEIGHT = 842
const PREVIEW_WIDTH = 240
const PREVIEW_SCALE = PREVIEW_WIDTH / 595

export function ExportPanel() {
  const { state, t } = useResume()
  const { resume } = state
  const { theme } = resume
  const [exporting, setExporting] = useState(false)

  const Layout = THEME_LAYOUTS[theme.templateId]
  const hasContent = resume.baseInfo.name || resume.baseInfo.email || resume.baseInfo.phone

  const fontStyle = {
    fontFamily:
      theme.fontFamily === 'serif'
        ? 'Georgia, "Times New Roman", serif'
        : theme.fontFamily === 'mono'
          ? 'ui-monospace, SFMono-Regular, monospace'
          : 'system-ui, -apple-system, sans-serif',
    fontSize: theme.fontSize === 'sm' ? '12px' : theme.fontSize === 'lg' ? '16px' : '14px',
  }

  // Estimate page count (same logic as preview)
  const el = typeof document !== 'undefined' ? document.getElementById('resume-print-target') : null
  const contentHeight = el?.scrollHeight || A4_HEIGHT
  const pageCount = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT))

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
      const target = document.getElementById('resume-print-target')
      if (!target) return

      // Temporarily make it visible for capture
      const prevVis = target.style.visibility
      const prevLeft = target.style.left
      target.style.visibility = 'visible'
      target.style.left = '0px'

      const { toCanvas } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')

      const fullCanvas = await toCanvas(target, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: 595,
      })

      // Restore hidden
      target.style.visibility = prevVis
      target.style.left = prevLeft

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = 210
      const pdfPageHeight = 297
      const scaledHeight = (fullCanvas.height * pdfWidth) / fullCanvas.width

      if (scaledHeight <= pdfPageHeight) {
        pdf.addImage(fullCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, scaledHeight)
      } else {
        let yOffset = 0
        let pageNum = 0
        while (yOffset < scaledHeight) {
          if (pageNum > 0) pdf.addPage()

          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = fullCanvas.width
          pageCanvas.height = (pdfPageHeight / pdfWidth) * fullCanvas.width
          const ctx = pageCanvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
            const srcY = pageNum * pageCanvas.height
            const srcH = Math.min(pageCanvas.height, fullCanvas.height - srcY)
            if (srcH > 0) {
              ctx.drawImage(fullCanvas, 0, srcY, fullCanvas.width, srcH, 0, 0, fullCanvas.width, srcH)
            }
            pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfPageHeight)
          }

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

  const previewPageHeight = Math.round(A4_HEIGHT * PREVIEW_SCALE)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.export.title}
        </h2>

        {/* Page Previews — miniature versions of the actual pages */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Preview</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {pageCount} {pageCount === 1 ? 'page' : 'pages'}
            </span>
          </div>

          {hasContent ? (
            <div className="flex flex-col gap-3 items-center">
              {Array.from({ length: pageCount }, (_, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center z-10">
                    {idx + 1}
                  </div>
                  <div
                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                    style={{ width: PREVIEW_WIDTH, height: previewPageHeight }}
                  >
                    {/* Scale down the full-width layout to fit the thumbnail */}
                    <div
                      style={{
                        ...fontStyle,
                        width: 595,
                        position: 'relative',
                        top: -idx * A4_HEIGHT * PREVIEW_SCALE,
                        transform: `scale(${PREVIEW_SCALE})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      <Layout resume={resume} t={t} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-xs py-16">No content</div>
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

        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Print / Save as PDF</strong> — best quality (vector text). Set margins to &ldquo;None&rdquo;.
            <br />
            <strong>Download PDF</strong> — one-click image-based export with automatic page splitting.
          </p>
        </div>
      </div>
    </div>
  )
}
