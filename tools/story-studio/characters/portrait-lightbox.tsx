'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface PortraitLightboxProps {
  src: string
  alt: string
}

export function PortraitLightbox({ src, alt }: PortraitLightboxProps) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })

  const MIN_SCALE = 0.5
  const MAX_SCALE = 4
  const SCALE_STEP = 0.3

  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleOpen = () => {
    resetView()
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const zoomIn = () => setScale(s => Math.min(s + SCALE_STEP, MAX_SCALE))
  const zoomOut = () => setScale(s => Math.max(s - SCALE_STEP, MIN_SCALE))

  // Keyboard: Escape to close, +/- to zoom
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      else if (e.key === '=' || e.key === '+') zoomIn()
      else if (e.key === '-') zoomOut()
      else if (e.key === '0') resetView()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, resetView])

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => {
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP
      return Math.min(Math.max(s + delta, MIN_SCALE), MAX_SCALE)
    })
  }, [])

  // Drag to pan
  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...position }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    setPosition({
      x: posStart.current.x + (e.clientX - dragStart.current.x),
      y: posStart.current.y + (e.clientY - dragStart.current.y),
    })
  }

  const handlePointerUp = () => setDragging(false)

  return (
    <>
      {/* Thumbnail — clickable */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full h-full cursor-zoom-in group relative"
        aria-label="View portrait full size"
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors
          flex items-center justify-center opacity-0 group-hover:opacity-100">
          <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
          </svg>
        </span>
      </button>

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          {/* Toolbar */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={zoomOut}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20
                text-white transition-colors cursor-pointer"
              aria-label="Zoom out"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="text-sm text-white/70 font-mono min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20
                text-white transition-colors cursor-pointer"
              aria-label="Zoom in"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              onClick={resetView}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20
                text-white transition-colors cursor-pointer ml-1"
              aria-label="Reset zoom"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20
                text-white transition-colors cursor-pointer ml-1"
              aria-label="Close"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image container */}
          <div
            className="overflow-hidden w-full h-full flex items-center justify-center"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default', touchAction: 'none' }}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-[90vw] max-h-[90vh] object-contain select-none transition-transform duration-150"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  )
}
