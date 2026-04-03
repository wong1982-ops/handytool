'use client'

import { useState, useCallback, useRef } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import type { ImageMeta } from './types'

interface CropResizeEditorProps {
  imageMeta: ImageMeta
  onConfirm: (processedMeta: ImageMeta) => void
  onSkip: () => void
}

const PRESETS = [
  { label: '512 × 512', w: 512, h: 512 },
  { label: '1024 × 1024', w: 1024, h: 1024 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
] as const

const ZOOM_MIN = 25
const ZOOM_MAX = 400
const ZOOM_STEP = 25

function applyCanvasCrop(
  imgSrc: string,
  pixelCrop: PixelCrop,
  targetW: number,
  targetH: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D not supported'))

      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetW,
        targetH,
      )
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imgSrc
  })
}

/** Render crop region into a preview canvas (synchronous, uses loaded imgRef) */
function renderPreview(
  imgEl: HTMLImageElement,
  pixelCrop: PixelCrop,
  canvas: HTMLCanvasElement,
) {
  // The pixelCrop values are relative to the displayed <img> size,
  // so we need to scale them to the natural image dimensions
  const scaleX = imgEl.naturalWidth / imgEl.width
  const scaleY = imgEl.naturalHeight / imgEl.height

  const srcX = pixelCrop.x * scaleX
  const srcY = pixelCrop.y * scaleY
  const srcW = pixelCrop.width * scaleX
  const srcH = pixelCrop.height * scaleY

  // Fit into 160px max dimension
  const maxDim = 160
  const ratio = Math.min(maxDim / srcW, maxDim / srcH, 1)
  const drawW = Math.round(srcW * ratio)
  const drawH = Math.round(srcH * ratio)

  canvas.width = drawW
  canvas.height = drawH

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, drawW, drawH)
}

export function CropResizeEditor({ imageMeta, onConfirm, onSkip }: CropResizeEditorProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)

  // Crop state
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  // Zoom state
  const [zoom, setZoom] = useState(100)

  // Preview visibility
  const [showPreview, setShowPreview] = useState(true)

  // Resize state
  const [resizeW, setResizeW] = useState(imageMeta.width)
  const [resizeH, setResizeH] = useState(imageMeta.height)
  const [lockAspect, setLockAspect] = useState(true)
  const aspectRatio = imageMeta.width / imageMeta.height

  const handleCropComplete = useCallback((c: PixelCrop) => {
    setCompletedCrop(c)
    if (c.width > 0 && c.height > 0) {
      setResizeW(Math.round(c.width))
      setResizeH(Math.round(c.height))

      // Update preview canvas
      if (imgRef.current && previewCanvasRef.current) {
        renderPreview(imgRef.current, c, previewCanvasRef.current)
      }
    }
  }, [])

  const handleResizeW = useCallback(
    (w: number) => {
      setResizeW(w)
      if (lockAspect) {
        const cropAspect = completedCrop
          ? completedCrop.width / completedCrop.height
          : aspectRatio
        setResizeH(Math.round(w / cropAspect))
      }
    },
    [lockAspect, completedCrop, aspectRatio],
  )

  const handleResizeH = useCallback(
    (h: number) => {
      setResizeH(h)
      if (lockAspect) {
        const cropAspect = completedCrop
          ? completedCrop.width / completedCrop.height
          : aspectRatio
        setResizeW(Math.round(h * cropAspect))
      }
    },
    [lockAspect, completedCrop, aspectRatio],
  )

  const handlePreset = useCallback(
    (w: number, h: number) => {
      setResizeW(w)
      setResizeH(h)
      setLockAspect(false)
    },
    [],
  )

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
  }, [])

  const handleFitScreen = useCallback(() => {
    setZoom(100)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom((z) => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
        return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z + delta))
      })
    }
  }, [])

  const handleConfirm = useCallback(async () => {
    const imgEl = imgRef.current
    // If no crop set, use full image dimensions
    let pixelCrop: PixelCrop
    if (completedCrop && completedCrop.width > 0) {
      pixelCrop = completedCrop
    } else {
      pixelCrop = { x: 0, y: 0, width: imageMeta.width, height: imageMeta.height, unit: 'px' }
    }

    // Scale pixel crop from displayed size to natural size if we have the img element
    let finalCrop = pixelCrop
    if (imgEl && completedCrop && completedCrop.width > 0) {
      const scaleX = imgEl.naturalWidth / imgEl.width
      const scaleY = imgEl.naturalHeight / imgEl.height
      finalCrop = {
        x: Math.round(pixelCrop.x * scaleX),
        y: Math.round(pixelCrop.y * scaleY),
        width: Math.round(pixelCrop.width * scaleX),
        height: Math.round(pixelCrop.height * scaleY),
        unit: 'px',
      }
    }

    const dataUrl = await applyCanvasCrop(imageMeta.dataUrl, finalCrop, resizeW, resizeH)

    // Estimate file size from base64
    const base64Len = dataUrl.length - dataUrl.indexOf(',') - 1
    const sizeBytes = Math.round((base64Len * 3) / 4)

    onConfirm({
      name: imageMeta.name,
      width: resizeW,
      height: resizeH,
      sizeBytes,
      type: 'image/png',
      dataUrl,
    })
  }, [completedCrop, imageMeta, resizeW, resizeH, onConfirm])

  const hasActiveCrop = completedCrop && completedCrop.width > 0 && completedCrop.height > 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar — sticky at top */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-[#1a2333] shrink-0 gap-3 flex-wrap sticky top-0 z-30">
        {/* Resize controls */}
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <label className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs">W</span>
            <input
              type="number"
              min={1}
              max={8192}
              value={resizeW}
              onChange={(e) => handleResizeW(Number(e.target.value) || 1)}
              className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white text-center"
            />
          </label>

          <button
            onClick={() => setLockAspect(!lockAspect)}
            className={`p-1 rounded transition-colors cursor-pointer ${lockAspect ? 'text-[var(--tk-color-secondary-500)]' : 'text-slate-500'}`}
            title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
            aria-label={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {lockAspect ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              )}
            </svg>
          </button>

          <label className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs">H</span>
            <input
              type="number"
              min={1}
              max={8192}
              value={resizeH}
              onChange={(e) => handleResizeH(Number(e.target.value) || 1)}
              className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white text-center"
            />
          </label>

          {/* Presets */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p.w, p.h)}
                className="px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[var(--tk-color-secondary-500)] hover:bg-[var(--tk-color-secondary-500)]/80 rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            Continue to Vectorize
          </button>
        </div>
      </div>

      {/* Crop canvas area — relative wrapper for fixed overlays */}
      <div className="flex-1 relative overflow-hidden">
        {/* Scrollable crop area */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 overflow-auto p-4 bg-slate-950/40"
          onWheel={handleWheel}
        >
          <div
            className="flex items-center justify-center min-h-full"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={handleCropComplete}
            >
              <img
                ref={imgRef}
                src={imageMeta.dataUrl}
                alt="Crop preview"
                className="max-w-none"
                style={{
                  maxHeight: zoom === 100 ? '70vh' : 'none',
                  maxWidth: zoom === 100 ? '100%' : 'none',
                }}
                draggable={false}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Zoom controls — fixed at bottom center of viewport */}
        <div
          className="
            absolute bottom-4 left-1/2 -translate-x-1/2 z-20
            flex items-center gap-0.5 px-2 py-1.5
            rounded-full backdrop-blur-xl
            bg-slate-900/80 border border-slate-600
            shadow-xl pointer-events-auto
          "
          role="toolbar"
          aria-label="Zoom controls"
        >
          {/* Zoom out */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_MIN}
            title="Zoom out"
            aria-label="Zoom out"
            className="
              w-9 h-9 flex items-center justify-center rounded-full
              text-slate-400 hover:text-white hover:bg-slate-700/60
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors cursor-pointer
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {/* Zoom level */}
          <span
            className="min-w-[44px] text-center text-xs font-bold text-slate-300 select-none tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {zoom}%
          </span>

          {/* Zoom in */}
          <button
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_MAX}
            title="Zoom in"
            aria-label="Zoom in"
            className="
              w-9 h-9 flex items-center justify-center rounded-full
              text-slate-400 hover:text-white hover:bg-slate-700/60
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors cursor-pointer
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-600 mx-0.5" aria-hidden="true" />

          {/* Fit screen */}
          <button
            onClick={handleFitScreen}
            title="Fit to screen (reset zoom)"
            aria-label="Fit to screen"
            className="
              w-9 h-9 flex items-center justify-center rounded-full
              text-slate-400 hover:text-white hover:bg-slate-700/60
              transition-colors cursor-pointer
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

        {/* Live crop preview thumbnail — fixed at bottom right */}
        {showPreview && hasActiveCrop && (
          <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex flex-col items-end gap-1.5">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-600 rounded-xl shadow-xl p-2 flex flex-col items-center gap-1.5">
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preview</span>
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
                  aria-label="Hide preview"
                  title="Hide preview"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <canvas
                ref={previewCanvasRef}
                className="rounded border border-slate-700 bg-slate-950"
                style={{ maxWidth: 160, maxHeight: 160 }}
              />
              <span className="text-[9px] text-slate-500 tabular-nums">
                {resizeW} &times; {resizeH} px
              </span>
            </div>
          </div>
        )}

        {/* Show preview button (when hidden) */}
        {!showPreview && hasActiveCrop && (
          <button
            onClick={() => setShowPreview(true)}
            className="
              absolute bottom-4 right-4 z-20 pointer-events-auto
              w-9 h-9 flex items-center justify-center rounded-full
              bg-slate-900/80 backdrop-blur-xl border border-slate-600
              text-slate-400 hover:text-white shadow-xl
              transition-colors cursor-pointer
            "
            aria-label="Show crop preview"
            title="Show crop preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
      </div>

      {/* Hint bar — compact */}
      <div className="h-5 border-t border-slate-700 bg-[#101622] flex items-center px-4 shrink-0">
        <span className="text-[9px] text-slate-500 truncate">
          Drag to crop · Ctrl+Scroll to zoom · Set dimensions above
        </span>
      </div>
    </div>
  )
}
