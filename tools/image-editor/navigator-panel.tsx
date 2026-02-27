'use client'

import { useEffect, useRef, useState } from 'react'

interface NavigatorPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null> | null
  imageSize: { width: number; height: number } | null
  zoom: number
}

export function NavigatorPanel({ canvasRef, imageSize, zoom }: NavigatorPanelProps) {
  const [collapsed, setCollapsed] = useState(true)
  const thumbCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Thumb dimensions
  const THUMB_WIDTH = 150
  const thumbHeight = imageSize
    ? Math.round((imageSize.height / imageSize.width) * THUMB_WIDTH)
    : 100

  // Draw thumbnail from main canvas
  useEffect(() => {
    if (collapsed || !imageSize || !canvasRef?.current || !thumbCanvasRef.current) return

    const srcCanvas = canvasRef.current
    const thumbCanvas = thumbCanvasRef.current
    const ctx = thumbCanvas.getContext('2d')
    if (!ctx) return

    thumbCanvas.width = THUMB_WIDTH
    thumbCanvas.height = thumbHeight

    // Small delay to ensure the source canvas has rendered
    const timer = setTimeout(() => {
      ctx.clearRect(0, 0, THUMB_WIDTH, thumbHeight)
      ctx.drawImage(srcCanvas, 0, 0, THUMB_WIDTH, thumbHeight)
    }, 100)

    return () => clearTimeout(timer)
  }, [collapsed, imageSize, canvasRef, zoom, thumbHeight])

  if (!imageSize) return null

  // Calculate viewport rectangle on the minimap
  // The viewport shows (100/zoom) fraction of the full image
  const viewportFraction = 100 / zoom
  const vpWidth = Math.min(THUMB_WIDTH * viewportFraction, THUMB_WIDTH)
  const vpHeight = Math.min(thumbHeight * viewportFraction, thumbHeight)
  // Center the viewport indicator
  const vpLeft = (THUMB_WIDTH - vpWidth) / 2
  const vpTop = (thumbHeight - vpHeight) / 2

  return (
    <div className="border-b border-slate-700">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Navigator
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="px-4 pb-4" ref={containerRef}>
          <div
            className="relative mx-auto bg-slate-800 rounded overflow-hidden"
            style={{ width: THUMB_WIDTH, height: thumbHeight }}
          >
            {/* Thumbnail canvas */}
            <canvas
              ref={thumbCanvasRef}
              width={THUMB_WIDTH}
              height={thumbHeight}
              className="block w-full h-full"
            />

            {/* Viewport indicator */}
            {zoom > 100 && (
              <div
                className="absolute border-2 border-[var(--tk-color-primary-500)] rounded-sm pointer-events-none"
                style={{
                  left: vpLeft,
                  top: vpTop,
                  width: vpWidth,
                  height: vpHeight,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
                }}
              />
            )}

            {/* Zoom label */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-[9px] text-slate-300 px-1.5 py-0.5 rounded">
              {zoom}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
