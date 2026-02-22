'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { ECardData } from '@/tools/ecard-studio/types'
import CardPreview from '@/tools/ecard-studio/card-preview'
import { exportCardAsPng } from '@/tools/ecard-studio/export'

interface PreviewModalProps {
  cardData: ECardData
  onClose: () => void
}

export function PreviewModal({ cardData, onClose }: PreviewModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleExport = useCallback(async () => {
    if (!cardRef.current) return
    await exportCardAsPng(cardRef.current, cardData.template)
  }, [cardData.template])

  /* Close on Escape key */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Card preview"
    >
      {/* Close button */}
      <button
        type="button"
        className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
        onClick={onClose}
        aria-label="Close preview"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Card — stop propagation so clicking the card doesn't close */}
      <div onClick={(e) => e.stopPropagation()}>
        <CardPreview ref={cardRef} data={cardData} scale={1} />
      </div>

      {/* Download button */}
      <button
        type="button"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--tk-color-primary-500,#3D6AF2)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--tk-color-primary-600,#3558d4)] transition-colors cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          handleExport()
        }}
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Download PNG
      </button>
    </div>
  )
}
