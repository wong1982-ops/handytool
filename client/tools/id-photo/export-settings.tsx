'use client'

import type { PhotoFormat, Transform, Adjustments } from './types'

export type ExportMode = 'digital' | 'print'
export type PaperSize = '4x6' | 'a4' | '3.5x5'

interface ExportSettingsProps {
  exportMode: ExportMode
  paperSize: PaperSize
  onExportModeChange: (mode: ExportMode) => void
  onPaperSizeChange: (size: PaperSize) => void
  onDownload: () => void
  photoUrl: string | null
}

const PAPER_SIZES: { id: PaperSize; label: string; detail: string }[] = [
  { id: '4x6', label: '4 \u00d7 6 inches', detail: 'Standard' },
  { id: 'a4', label: 'A4 (210 \u00d7 297mm)', detail: 'International' },
  { id: '3.5x5', label: '3.5 \u00d7 5 inches', detail: 'Compact' },
]

export function ExportSettings({
  exportMode,
  paperSize,
  onExportModeChange,
  onPaperSizeChange,
  onDownload,
  photoUrl,
}: ExportSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Export Settings
      </h3>

      {/* Digital / Print toggle */}
      <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {(['digital', 'print'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onExportModeChange(mode)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition-all cursor-pointer capitalize ${
              exportMode === mode
                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {mode === 'digital' ? 'Digital ID Photo' : 'Printable Sheet'}
          </button>
        ))}
      </div>

      {/* Mode description */}
      <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
        <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--ht-color-secondary-500)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {exportMode === 'digital'
          ? 'Single JPEG, optimized for online uploads.'
          : '6 photos per sheet, ready to print.'}
      </div>

      {/* Paper size (print mode only) */}
      {exportMode === 'print' && (
        <div>
          <label htmlFor="paper-size" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
            Paper Size
          </label>
          <select
            id="paper-size"
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[var(--ht-color-secondary-500)] focus:border-[var(--ht-color-secondary-500)] cursor-pointer"
          >
            {PAPER_SIZES.map(({ id, label, detail }) => (
              <option key={id} value={id}>
                {label} ({detail})
              </option>
            ))}
          </select>

          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 flex items-start gap-1.5">
            <svg className="w-3 h-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ensure you use matte or glossy photo paper for official submissions.
          </p>
        </div>
      )}

      {/* Download button */}
      <button
        onClick={onDownload}
        disabled={!photoUrl}
        className="w-full bg-[var(--ht-color-secondary-500)] text-slate-900 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {exportMode === 'digital' ? 'Download High-Res' : 'Download Print Sheet'}
      </button>

      <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
        Secure processing. Photos are deleted automatically after 24 hours.
      </p>
    </div>
  )
}

// --- Export utilities ---

const DPI = 300
const PX_PER_MM = DPI / 25.4

interface ExportCanvasParams {
  photoUrl: string
  transform: Transform
  adjustments: Adjustments
  format: PhotoFormat
  bgColor: string
}

export function exportDigitalPhoto({ photoUrl, transform, adjustments, format, bgColor }: ExportCanvasParams): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = Math.round(format.widthMm * PX_PER_MM)
      const h = Math.round(format.heightMm * PX_PER_MM)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!

      // Background
      ctx.fillStyle = bgColor || '#FFFFFF'
      ctx.fillRect(0, 0, w, h)

      // Apply transforms
      ctx.save()
      ctx.translate(w / 2, h / 2)
      ctx.scale(transform.scale, transform.scale)
      ctx.rotate((transform.rotation * Math.PI) / 180)

      // Apply adjustments via filter
      const filters = []
      if (adjustments.brightness !== 0) filters.push(`brightness(${1 + adjustments.brightness / 100})`)
      if (adjustments.contrast !== 0) filters.push(`contrast(${1 + adjustments.contrast / 100})`)
      if (adjustments.sharpness !== 0) filters.push(`contrast(${1 + adjustments.sharpness / 200})`)
      if (filters.length) ctx.filter = filters.join(' ')

      // Draw image centered with offset
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const sw = img.naturalWidth * scale
      const sh = img.naturalHeight * scale
      ctx.drawImage(
        img,
        -sw / 2 + transform.x * (w / 450),
        -sh / 2 + transform.y * (h / 450),
        sw,
        sh
      )
      ctx.restore()

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
        'image/jpeg',
        0.95
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = photoUrl
  })
}

interface PrintSheetParams extends ExportCanvasParams {
  paperSize: PaperSize
}

const PAPER_DIMS: Record<PaperSize, { wMm: number; hMm: number }> = {
  '4x6': { wMm: 152.4, hMm: 101.6 },
  'a4': { wMm: 210, hMm: 297 },
  '3.5x5': { wMm: 127, hMm: 88.9 },
}

export async function exportPrintSheet({ photoUrl, transform, adjustments, format, bgColor, paperSize }: PrintSheetParams): Promise<Blob> {
  // First generate the single photo
  const photoBlob = await exportDigitalPhoto({ photoUrl, transform, adjustments, format, bgColor })
  const photoDataUrl = await blobToDataUrl(photoBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const paper = PAPER_DIMS[paperSize]
      const pw = Math.round(paper.wMm * PX_PER_MM)
      const ph = Math.round(paper.hMm * PX_PER_MM)

      const canvas = document.createElement('canvas')
      canvas.width = pw
      canvas.height = ph
      const ctx = canvas.getContext('2d')!

      // White paper background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, pw, ph)

      // Photo dimensions
      const photoW = Math.round(format.widthMm * PX_PER_MM)
      const photoH = Math.round(format.heightMm * PX_PER_MM)

      // Calculate grid — fit as many as possible with 5mm margins
      const marginPx = Math.round(5 * PX_PER_MM)
      const cols = Math.floor((pw - marginPx) / (photoW + marginPx))
      const rows = Math.floor((ph - marginPx) / (photoH + marginPx))

      // Center the grid
      const totalW = cols * photoW + (cols - 1) * marginPx
      const totalH = rows * photoH + (rows - 1) * marginPx
      const offsetX = Math.round((pw - totalW) / 2)
      const offsetY = Math.round((ph - totalH) / 2)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * (photoW + marginPx)
          const y = offsetY + r * (photoH + marginPx)
          ctx.drawImage(img, x, y, photoW, photoH)
        }
      }

      // Cut guide lines (thin dashed)
      ctx.setLineDash([8, 4])
      ctx.strokeStyle = '#ccc'
      ctx.lineWidth = 1

      for (let r = 0; r <= rows; r++) {
        const y = offsetY + r * (photoH + marginPx) - marginPx / 2
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(pw, y)
        ctx.stroke()
      }
      for (let c = 0; c <= cols; c++) {
        const x = offsetX + c * (photoW + marginPx) - marginPx / 2
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, ph)
        ctx.stroke()
      }

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Print sheet export failed'))),
        'image/jpeg',
        0.95
      )
    }
    img.onerror = () => reject(new Error('Failed to load photo for print sheet'))
    img.src = photoDataUrl
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
