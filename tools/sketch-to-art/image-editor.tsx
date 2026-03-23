'use client'

import { useState, useCallback } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { getCroppedImage, resizeImage } from './image-utils'
import type { SketchMode } from './types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImageEditorProps {
  src: string
  onComplete: (editedDataUrl: string) => void
  onCancel?: () => void
  mode: SketchMode
  initialAspect?: number
  applyLabel?: string
}

interface AspectPreset {
  label: string
  value: number | undefined
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASPECT_PRESETS: AspectPreset[] = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:4', value: 3 / 4 },
]

const MIN_CROP_SIZE = 128

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function RotateLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function RotateRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageEditor({
  src,
  onComplete,
  onCancel,
  mode,
  initialAspect,
  applyLabel,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(initialAspect)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
    setError(null)
  }, [])

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setAspect(initialAspect)
    setError(null)
  }

  const handleRotateLeft = () => setRotation((r) => (r - 90 + 360) % 360)
  const handleRotateRight = () => setRotation((r) => (r + 90) % 360)

  const handleApply = async () => {
    if (!croppedAreaPixels) return

    // Validate minimum crop size
    if (croppedAreaPixels.width < MIN_CROP_SIZE || croppedAreaPixels.height < MIN_CROP_SIZE) {
      setError(`Crop area too small — minimum ${MIN_CROP_SIZE}×${MIN_CROP_SIZE}px required.`)
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const cropped = await getCroppedImage(src, croppedAreaPixels, rotation)
      const resized = await resizeImage(cropped)
      onComplete(resized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image.')
    } finally {
      setProcessing(false)
    }
  }

  const defaultApplyLabel = 'Use this sketch'
  const resolvedApplyLabel = applyLabel ?? defaultApplyLabel

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Aspect ratio pills */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Aspect ratio"
      >
        {ASPECT_PRESETS.map((preset) => {
          const isActive = aspect === preset.value
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => setAspect(preset.value)}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[44px]',
                'border',
                isActive
                  ? 'bg-[var(--tk-color-primary-500)] text-white border-[var(--tk-color-primary-500)]'
                  : 'bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)] hover:border-[var(--tk-color-primary-500)] hover:text-[var(--tk-color-primary-500)]',
              ].join(' ')}
              aria-pressed={isActive}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      {/* Cropper area */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-black w-full">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid
          style={{
            containerStyle: { borderRadius: '0.75rem' },
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--tk-color-text-secondary)] shrink-0 w-10">
          Zoom
        </span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-[var(--tk-color-primary-500)] min-h-[44px]"
          aria-label="Zoom level"
        />
        <span className="text-xs text-[var(--tk-color-text-secondary)] shrink-0 w-8 text-right">
          {zoom.toFixed(1)}×
        </span>
      </div>

      {/* Rotate + Reset row */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleRotateLeft}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)]"
          aria-label="Rotate 90° left"
        >
          <RotateLeftIcon />
          <span>Rotate Left</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)]"
          aria-label="Reset crop, zoom, and rotation"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleRotateRight}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)]"
          aria-label="Rotate 90° right"
        >
          <span>Rotate Right</span>
          <RotateRightIcon />
        </button>
      </div>

      {/* Validation error */}
      {error && (
        <p
          role="alert"
          className="text-sm text-red-500 dark:text-red-400 text-center px-2"
        >
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] text-[var(--tk-color-text-secondary)] hover:bg-[var(--tk-color-surface-200)] dark:hover:bg-[var(--tk-color-surface-600)] border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-600)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={handleApply}
          disabled={processing || !croppedAreaPixels}
          className={[
            'flex-1 px-4 py-2 rounded-xl text-sm font-semibold min-h-[44px] transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed',
            mode === 'fun'
              ? 'bg-gradient-to-r from-[var(--tk-color-primary-500)] to-[var(--tk-color-secondary-500)] hover:brightness-110'
              : 'bg-[var(--tk-color-primary-500)] hover:bg-[var(--tk-color-primary-600)]',
          ].join(' ')}
          aria-busy={processing}
        >
          {processing ? 'Processing…' : resolvedApplyLabel}
        </button>
      </div>
    </div>
  )
}
