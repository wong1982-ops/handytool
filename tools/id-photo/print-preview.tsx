'use client'

import type { PhotoFormat, Transform, Adjustments } from './types'
import type { PaperSize } from './export-settings'

interface PrintPreviewProps {
  photoUrl: string | null
  format: PhotoFormat
  transform: Transform
  adjustments: Adjustments
  bgColor: string
  paperSize: PaperSize
}

const PAPER_ASPECT: Record<PaperSize, number> = {
  '4x6': 152.4 / 101.6,  // landscape
  'a4': 210 / 297,
  '3.5x5': 127 / 88.9,   // landscape
}

export function PrintPreview({ photoUrl, format, transform, adjustments, bgColor, paperSize }: PrintPreviewProps) {
  const paperAspect = PAPER_ASPECT[paperSize]
  const photoAspect = format.widthMm / format.heightMm

  // Calculate grid — same logic as export
  const marginFrac = 0.03 // 3% margin
  const cols = paperSize === 'a4' ? Math.min(3, Math.floor(1 / (photoAspect * 0.35))) : 2
  const rows = paperSize === 'a4' ? 4 : 3

  // CSS filter
  const filterStyle = [
    adjustments.brightness !== 0 ? `brightness(${1 + adjustments.brightness / 100})` : '',
    adjustments.contrast !== 0 ? `contrast(${1 + adjustments.contrast / 100})` : '',
    adjustments.sharpness !== 0 ? `contrast(${1 + adjustments.sharpness / 200})` : '',
  ].filter(Boolean).join(' ') || 'none'

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Print Preview
      </h3>

      {/* Paper preview */}
      <div
        className="bg-white dark:bg-slate-100 rounded-lg shadow-md border border-slate-200 dark:border-slate-300 overflow-hidden p-2"
        style={{ aspectRatio: `${paperAspect}` }}
      >
        <div
          className="w-full h-full grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            padding: `${marginFrac * 100}%`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[2px] border border-slate-200"
              style={{
                aspectRatio: `${photoAspect}`,
                backgroundColor: bgColor || '#FFFFFF',
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: `translate(${transform.x * 0.3}px, ${transform.y * 0.3}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                    filter: filterStyle,
                    transformOrigin: 'center center',
                  }}
                  draggable={false}
                  aria-hidden="true"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
