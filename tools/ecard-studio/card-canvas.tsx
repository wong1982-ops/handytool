'use client'

import { useState } from 'react'
import type { ECardData } from '@/tools/ecard-studio/types'
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

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8l6 3.5L14 8" />
      <path d="M2 11l6 3.5L14 11" />
      <path d="M2 5l6 3.5L14 5 8 1.5 2 5z" />
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
}

export function CardCanvas({ cardData, cardRef, zoom, onZoomChange, onLogoMove }: CardCanvasProps) {
  const [showBanner, setShowBanner] = useState(true)

  const handleZoomOut = () => {
    onZoomChange(Math.max(50, zoom - 10))
  }

  const handleZoomIn = () => {
    onZoomChange(Math.min(200, zoom + 10))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Toolbar */}
      <div className="flex justify-center px-4 pt-3">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 inline-flex items-center gap-2">
          {/* Undo */}
          <button
            type="button"
            disabled
            className="text-slate-400 p-2 rounded-lg opacity-50 cursor-not-allowed"
            aria-label="Undo"
          >
            <UndoIcon />
          </button>

          {/* Redo */}
          <button
            type="button"
            disabled
            className="text-slate-400 p-2 rounded-lg opacity-50 cursor-not-allowed"
            aria-label="Redo"
          >
            <RedoIcon />
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-slate-700" aria-hidden="true" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
            aria-label="Zoom out"
          >
            <MinusIcon />
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
            aria-label="Zoom in"
          >
            <PlusIcon />
          </button>

          {/* Zoom Display */}
          <span className="text-sm text-slate-300 min-w-[3rem] text-center">
            {zoom}%
          </span>

          {/* Separator */}
          <div className="w-px h-5 bg-slate-700" aria-hidden="true" />

          {/* Layers */}
          <button
            type="button"
            disabled
            className="text-slate-400 p-2 rounded-lg opacity-50 cursor-not-allowed"
            aria-label="Layers"
          >
            <LayersIcon />
          </button>
        </div>
      </div>

      {/* Smart Recommendation Banner */}
      {showBanner && (
        <div className="mx-4 mt-3">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-3">
            {/* Badge */}
            <span className="shrink-0 text-xs font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              Smart Recommendation
            </span>

            {/* Suggestion pills */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-slate-400 shrink-0">Suggested for:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  Real Estate
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Tech Startup
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                  Holiday Greeting
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 shrink-0"
              aria-label="Dismiss recommendation"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Card Preview Area */}
      <div className="flex-1 flex items-center justify-center overflow-auto bg-slate-950/30 mx-4 mt-3 rounded-xl">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          <CardPreview data={cardData} ref={cardRef} onLogoMove={onLogoMove} />
        </div>
      </div>

      {/* Autosave Indicator */}
      <div className="flex justify-center py-3">
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
          Changes autosaved 2m ago
        </span>
      </div>
    </div>
  )
}
