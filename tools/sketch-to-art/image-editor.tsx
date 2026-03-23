'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { resizeImage } from './image-utils'
import type { SketchMode } from './types'

interface ImageEditorProps {
  src: string
  onComplete: (editedDataUrl: string) => void
  onCancel?: () => void
  mode: SketchMode
  initialAspect?: number
  applyLabel?: string
}

const ASPECT_PRESETS: { label: string; value: number | undefined }[] = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
]

const MIN_CROP_SIZE = 128

function RotateLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function RotateRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  )
}

/**
 * Extract cropped region from an image using canvas.
 * Applies rotation, then extracts the crop area.
 */
function cropImageToCanvas(
  imgEl: HTMLImageElement,
  crop: PixelCrop,
  rotation: number,
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // If rotated 90 or 270, swap source dimensions
  const rotated = rotation % 180 !== 0
  const srcW = rotated ? imgEl.naturalHeight : imgEl.naturalWidth
  const srcH = rotated ? imgEl.naturalWidth : imgEl.naturalHeight

  // Scale factor: displayed size vs natural size
  const scaleX = srcW / imgEl.width
  const scaleY = srcH / imgEl.height

  canvas.width = crop.width * scaleX
  canvas.height = crop.height * scaleY

  ctx.save()
  // Move origin to center of the crop output
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)

  // Calculate where to draw the source image so the crop aligns
  const drawW = rotation % 180 !== 0 ? imgEl.naturalHeight : imgEl.naturalWidth
  const drawH = rotation % 180 !== 0 ? imgEl.naturalWidth : imgEl.naturalHeight

  ctx.drawImage(
    imgEl,
    -(crop.x * scaleX) - canvas.width / 2 + (rotation % 180 !== 0 ? (drawW - canvas.width) / 2 : 0),
    -(crop.y * scaleY) - canvas.height / 2 + (rotation % 180 !== 0 ? (drawH - canvas.height) / 2 : 0),
    drawW,
    drawH,
  )
  ctx.restore()

  // Simpler approach for 0 rotation (most common)
  if (rotation === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      imgEl,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    )
  }

  return canvas.toDataURL('image/jpeg', 0.85)
}

export default function ImageEditor({
  src,
  onComplete,
  onCancel,
  mode,
  initialAspect,
  applyLabel,
}: ImageEditorProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect, setAspect] = useState<number | undefined>(initialAspect)
  const [rotation, setRotation] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAspectChange = useCallback((value: number | undefined) => {
    setAspect(value)
    // Reset crop when aspect changes
    setCrop(undefined)
    setCompletedCrop(undefined)
  }, [])

  const handleReset = useCallback(() => {
    setCrop(undefined)
    setCompletedCrop(undefined)
    setAspect(initialAspect)
    setRotation(0)
    setError(null)
  }, [initialAspect])

  const handleApply = useCallback(async () => {
    const img = imgRef.current
    if (!img) return

    setProcessing(true)
    setError(null)

    try {
      let dataUrl: string

      if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
        // Validate minimum size
        const scaleX = img.naturalWidth / img.width
        const realW = completedCrop.width * scaleX
        const realH = completedCrop.height * (img.naturalHeight / img.height)
        if (realW < MIN_CROP_SIZE || realH < MIN_CROP_SIZE) {
          setError(`Crop area too small — minimum ${MIN_CROP_SIZE}x${MIN_CROP_SIZE}px`)
          setProcessing(false)
          return
        }
        dataUrl = cropImageToCanvas(img, completedCrop, rotation)
      } else {
        // No crop — use full image with rotation only
        if (rotation === 0) {
          dataUrl = src
        } else {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          const rotated = rotation % 180 !== 0
          canvas.width = rotated ? img.naturalHeight : img.naturalWidth
          canvas.height = rotated ? img.naturalWidth : img.naturalHeight
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate((rotation * Math.PI) / 180)
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
          dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        }
      }

      const resized = await resizeImage(dataUrl)
      onComplete(resized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image')
    } finally {
      setProcessing(false)
    }
  }, [completedCrop, rotation, src, onComplete])

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Aspect ratio pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Aspect ratio">
        {ASPECT_PRESETS.map((preset) => {
          const isActive = aspect === preset.value
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleAspectChange(preset.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[44px] border ${
                isActive
                  ? 'bg-[var(--tk-color-primary-500)] text-white border-[var(--tk-color-primary-500)]'
                  : 'bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)] hover:border-[var(--tk-color-primary-500)]'
              }`}
              aria-pressed={isActive}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Crop area — drag edges and corners to resize */}
      <div
        className="relative rounded-xl overflow-hidden bg-black"
        style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}
      >
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
          minWidth={30}
          minHeight={30}
          className="max-h-[500px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="Edit image"
            className="max-w-full max-h-[500px] object-contain mx-auto"
            crossOrigin="anonymous"
          />
        </ReactCrop>
      </div>

      {/* Hint */}
      <p className="text-xs text-center text-slate-400 dark:text-slate-500">
        Drag edges or corners to crop. Select an aspect ratio to lock proportions.
      </p>

      {/* Rotate + Reset row */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)]"
          aria-label="Rotate 90 degrees left"
        >
          <RotateLeftIcon />
          Rotate
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)]"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)]"
          aria-label="Rotate 90 degrees right"
        >
          Rotate
          <RotateRightIcon />
        </button>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400 text-center">
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)] disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleApply}
          disabled={processing}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] transition-colors text-white disabled:opacity-50 ${
            mode === 'fun'
              ? 'bg-gradient-to-r from-[var(--tk-color-primary-500)] to-[var(--tk-color-secondary-500)] hover:brightness-110'
              : 'bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)]'
          }`}
        >
          {processing ? 'Processing...' : applyLabel || 'Use this sketch'}
        </button>
      </div>
    </div>
  )
}
