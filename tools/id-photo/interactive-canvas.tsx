'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { FaceGuides } from './face-guides'
import { CanvasControls } from './canvas-controls'
import type { Transform, Adjustments, PhotoFormat } from './types'

interface InteractiveCanvasProps {
  photoUrl: string | null
  transform: Transform
  adjustments: Adjustments
  selectedFormat: PhotoFormat
  showGuides: boolean
  bgColor: string
  faceDetected: boolean
  analysisState: 'idle' | 'analyzing' | 'done' | 'error'
  faceBox: { x: number; y: number; width: number; height: number } | null
  onTransformChange: (t: Transform) => void
  onFileSelect: (file: File) => void
}

export function InteractiveCanvas({
  photoUrl,
  transform,
  adjustments,
  selectedFormat,
  showGuides,
  bgColor,
  faceDetected,
  analysisState,
  faceBox,
  onTransformChange,
  onFileSelect,
}: InteractiveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag state kept in refs for performance (no re-renders during drag)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const transformAtDragStart = useRef({ x: 0, y: 0 })

  // Pinch state
  const lastPinchDistance = useRef(0)
  const scaleAtPinchStart = useRef(1)

  // Aspect ratio from format
  const aspectRatio = selectedFormat.widthMm / selectedFormat.heightMm

  // CSS filter from adjustments
  const filterStyle = [
    adjustments.brightness !== 0 ? `brightness(${1 + adjustments.brightness / 100})` : '',
    adjustments.contrast !== 0 ? `contrast(${1 + adjustments.contrast / 100})` : '',
    adjustments.sharpness !== 0 ? `contrast(${1 + adjustments.sharpness / 200})` : '',
  ].filter(Boolean).join(' ') || 'none'

  // --- Mouse drag ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // left click only
    e.preventDefault()
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    transformAtDragStart.current = { x: transform.x, y: transform.y }
  }, [transform.x, transform.y])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    onTransformChange({
      ...transform,
      x: transformAtDragStart.current.x + dx,
      y: transformAtDragStart.current.y + dy,
    })
  }, [transform, onTransformChange])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // --- Wheel zoom ---
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    const newScale = Math.min(3, Math.max(0.3, transform.scale + delta))
    onTransformChange({ ...transform, scale: newScale })
  }, [transform, onTransformChange])

  // --- Touch drag + pinch ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      transformAtDragStart.current = { x: transform.x, y: transform.y }
    } else if (e.touches.length === 2) {
      isDragging.current = false
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      lastPinchDistance.current = Math.hypot(dx, dy)
      scaleAtPinchStart.current = transform.scale
    }
  }, [transform.x, transform.y, transform.scale])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - dragStart.current.x
      const dy = e.touches[0].clientY - dragStart.current.y
      onTransformChange({
        ...transform,
        x: transformAtDragStart.current.x + dx,
        y: transformAtDragStart.current.y + dy,
      })
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      const dist = Math.hypot(dx, dy)
      if (lastPinchDistance.current > 0) {
        const ratio = dist / lastPinchDistance.current
        const newScale = Math.min(3, Math.max(0.3, scaleAtPinchStart.current * ratio))
        onTransformChange({ ...transform, scale: newScale })
      }
    }
  }, [transform, onTransformChange])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    lastPinchDistance.current = 0
  }, [])

  // Global mouse listeners for drag
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Wheel listener on container (passive: false to allow preventDefault)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // --- File handling ---
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  const [dragOverState, setDragOver] = useState(false)

  // --- Controls ---
  const handleZoomIn = useCallback(() => {
    onTransformChange({ ...transform, scale: Math.min(3, transform.scale + 0.1) })
  }, [transform, onTransformChange])

  const handleZoomOut = useCallback(() => {
    onTransformChange({ ...transform, scale: Math.max(0.3, transform.scale - 0.1) })
  }, [transform, onTransformChange])

  const handleRotateLeft = useCallback(() => {
    onTransformChange({ ...transform, rotation: transform.rotation - 90 })
  }, [transform, onTransformChange])

  const handleRotateRight = useCallback(() => {
    onTransformChange({ ...transform, rotation: transform.rotation + 90 })
  }, [transform, onTransformChange])

  const handleReset = useCallback(() => {
    onTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 })
  }, [onTransformChange])

  return (
    <section className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-6 overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden="true"
      />

      {photoUrl ? (
        <>
          {/* Crop frame container */}
          <div
            ref={containerRef}
            className="relative w-full max-w-[450px] bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800 select-none"
            style={{
              aspectRatio: `${aspectRatio}`,
              backgroundColor: bgColor || undefined,
              cursor: isDragging.current ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="application"
            aria-label="Photo positioning canvas. Drag to reposition, scroll to zoom."
            tabIndex={0}
          >
            {/* Photo with transforms */}
            <img
              src={photoUrl}
              alt="Uploaded photo for ID"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                filter: filterStyle,
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
              draggable={false}
            />

            {/* Face guides overlay */}
            <FaceGuides visible={showGuides} />

            {/* Face bounding box overlay */}
            {faceBox && faceDetected && (
              <div
                className="absolute border-2 border-green-400 rounded-sm pointer-events-none z-10 transition-all duration-300"
                style={{
                  left: `${faceBox.x * 100}%`,
                  top: `${faceBox.y * 100}%`,
                  width: `${faceBox.width * 100}%`,
                  height: `${faceBox.height * 100}%`,
                }}
                aria-hidden="true"
              >
                <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-green-400" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-green-400" />
                <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-green-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-green-400" />
              </div>
            )}

            {/* Analyzing spinner */}
            {analysisState === 'analyzing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white text-xs font-bold">Analyzing face...</span>
                </div>
              </div>
            )}

            {/* Analysis status badge */}
            {analysisState === 'done' && faceDetected && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-green-500/90 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                FACE DETECTED
              </div>
            )}
            {analysisState === 'error' && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-red-500/90 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg backdrop-blur-sm" role="alert">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                </svg>
                NO FACE FOUND
              </div>
            )}
          </div>

          {/* Floating canvas controls */}
          <CanvasControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotateLeft={handleRotateLeft}
            onRotateRight={handleRotateRight}
            onReset={handleReset}
            scale={transform.scale}
          />
        </>
      ) : (
        /* Upload drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          role="button"
          tabIndex={0}
          aria-label="Upload photo"
          className={`relative w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-6 cursor-pointer transition-all ${
            dragOverState
              ? 'border-[var(--tk-color-secondary-500)] bg-[var(--tk-color-secondary-500)]/5 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-[var(--tk-color-secondary-500)] hover:bg-[var(--tk-color-secondary-500)]/5'
          }`}
          style={{ aspectRatio: `${aspectRatio}` }}
        >
          {/* Ghost guides on empty state */}
          <FaceGuides visible />

          <div className="relative z-20 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--tk-color-secondary-500)]/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--tk-color-secondary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">Ready to Start?</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Align your face with the turquoise guides.
                Use a neutral background and ensure even lighting for best results.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="bg-[var(--tk-color-secondary-500)] text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg">
                Pick File
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />
    </section>
  )
}
