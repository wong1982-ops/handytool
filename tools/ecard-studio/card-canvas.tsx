'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import type { ECardData, TemplateId } from '@/tools/ecard-studio/types'
import { ALL_TEMPLATES } from '@/tools/ecard-studio/templates'
import CardPreview from '@/tools/ecard-studio/card-preview'

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h7a4 4 0 0 1 0 8H6" />
      <path d="M6 3 3 6l3 3" />
    </svg>
  )
}

function RedoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 6H6a4 4 0 0 0 0 8h4" />
      <path d="M10 3l3 3-3 3" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 8h8" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 4v8M4 8h8" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Card Canvas Component                                              */
/* ------------------------------------------------------------------ */

export interface CardCanvasProps {
  cardData: ECardData
  cardRef: React.RefObject<HTMLDivElement | null>
  zoom: number
  onZoomChange: (zoom: number) => void
  onLogoMove?: (logoX: number, logoY: number) => void
  onSelectTemplate?: (templateId: TemplateId) => void
}

export function CardCanvas({ cardData, cardRef, zoom, onZoomChange, onLogoMove, onSelectTemplate }: CardCanvasProps) {
  const [showBanner, setShowBanner] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoFitted, setAutoFitted] = useState(false)

  // Auto-fit card to container on mount and resize (mobile portrait fix)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const fitToContainer = () => {
      const rect = container.getBoundingClientRect()
      const isBusinessCard = cardData.cardType === 'business-card'
      const cardW = isBusinessCard ? 630 : 600
      const cardH = isBusinessCard ? 360 : 400
      // Add padding (24px each side)
      const availW = rect.width - 48
      const availH = rect.height - 48
      if (availW < cardW || availH < cardH) {
        const fitZoom = Math.floor(Math.min(availW / cardW, availH / cardH) * 100)
        onZoomChange(Math.max(30, Math.min(100, fitZoom)))
      }
      setAutoFitted(true)
    }

    // Only auto-fit once on first render
    if (!autoFitted) fitToContainer()

    const observer = new ResizeObserver(() => {
      // Re-fit only if zoom hasn't been manually changed from auto-fit value
      if (!autoFitted) fitToContainer()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [cardData.cardType, onZoomChange, autoFitted])

  const handleZoomOut = () => {
    onZoomChange(Math.max(30, zoom - 10))
  }

  const handleZoomIn = () => {
    onZoomChange(Math.min(200, zoom + 10))
  }

  // Get contextual suggestions based on current template's category, fallback to same cardType
  const suggestions = useMemo(() => {
    const current = ALL_TEMPLATES.find((t) => t.id === cardData.template)
    if (!current) return []
    // Try same category first
    const sameCategory = ALL_TEMPLATES.filter((t) => t.id !== current.id && t.category === current.category)
    if (sameCategory.length >= 2) return sameCategory.slice(0, 3)
    // Fallback: same card type
    return ALL_TEMPLATES
      .filter((t) => t.id !== current.id && t.cardType === current.cardType)
      .slice(0, 3)
  }, [cardData.template])

  return (
    <div className="relative h-full" ref={containerRef}>
      {/* Card Preview Area — fills entire canvas */}
      <div className="absolute inset-0 flex items-center justify-center overflow-auto bg-slate-950/30">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          <CardPreview data={cardData} ref={cardRef} onLogoMove={onLogoMove} />
        </div>
      </div>

      {/* Floating Toolbar — top-left */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl px-2 py-1.5 inline-flex items-center gap-1">
          {/* Undo */}
          <button
            type="button"
            disabled
            className="text-slate-400 p-1.5 rounded-lg opacity-50 cursor-not-allowed"
            aria-label="Undo"
          >
            <UndoIcon />
          </button>

          {/* Redo */}
          <button
            type="button"
            disabled
            className="text-slate-400 p-1.5 rounded-lg opacity-50 cursor-not-allowed"
            aria-label="Redo"
          >
            <RedoIcon />
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-slate-700" aria-hidden="true" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700"
            aria-label="Zoom out"
          >
            <MinusIcon />
          </button>

          {/* Zoom Display */}
          <span className="text-xs text-slate-300 min-w-[2.5rem] text-center tabular-nums">
            {zoom}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700"
            aria-label="Zoom in"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      {/* Smart Recommendation Banner — bottom-center */}
      {showBanner && suggestions.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20 sm:max-w-[90%]">
          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2.5 sm:px-4 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 2a6 6 0 00-2 11.66V16a2 2 0 104 0v-2.34A6 6 0 0010 2zM8 17a1 1 0 001 1h2a1 1 0 001-1v-.08a6.06 6.06 0 01-4 0V17z" />
              </svg>
              <span className="text-[10px] sm:text-xs text-slate-400">Similar templates you might like</span>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="ml-auto text-slate-500 hover:text-white p-0.5 rounded-md hover:bg-slate-700 shrink-0 transition-colors"
                aria-label="Dismiss recommendation"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {suggestions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTemplate?.(t.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-600/80 border border-slate-600/50 hover:border-slate-500 text-[10px] sm:text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.defaults.accentColor }}
                    aria-hidden="true"
                  />
                  <span className="truncate max-w-[100px] sm:max-w-[140px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
