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
    <div className="relative h-full">
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
      {showBanner && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[90%]">
          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-3">
            <span className="shrink-0 text-xs font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              Smart Recommendation
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-slate-400 shrink-0">Suggested for:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">Real Estate</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Tech Startup</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">Holiday Greeting</span>
              </div>
            </div>
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
    </div>
  )
}
