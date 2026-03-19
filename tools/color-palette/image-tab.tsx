'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { suggestTextColor } from './color-utils'

interface ImageTabProps {
  onApply: (colors: string[]) => void
}

type ExtractionState = 'idle' | 'extracting' | 'done' | 'error'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function ImageTab({ onApply }: ImageTabProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [colorCount, setColorCount] = useState(5)
  const [extractedColors, setExtractedColors] = useState<string[]>([])
  const [state, setState] = useState<ExtractionState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const workerRef = useRef<Worker | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const processImage = useCallback(
    (file: File) => {
      // Validate type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMsg('Please upload a PNG, JPG, or WebP image.')
        setState('error')
        return
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg('Image must be under 10 MB.')
        setState('error')
        return
      }

      setErrorMsg('')
      setState('extracting')
      setExtractedColors([])

      const url = URL.createObjectURL(file)
      setImageUrl(url)

      const img = new Image()
      img.onload = () => {
        // Draw to canvas to get pixel data
        const canvas = canvasRef.current ?? document.createElement('canvas')
        canvasRef.current = canvas
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setErrorMsg('Canvas not supported.')
          setState('error')
          return
        }
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)

        // Terminate previous worker if any
        workerRef.current?.terminate()

        try {
          const worker = new Worker(
            new URL('./extraction-worker.ts', import.meta.url),
          )
          workerRef.current = worker

          worker.onmessage = (e: MessageEvent) => {
            if (e.data.error) {
              setErrorMsg(e.data.error)
              setState('error')
            } else {
              setExtractedColors(e.data.colors)
              setState('done')
            }
          }

          worker.onerror = () => {
            setErrorMsg('Worker failed to process image.')
            setState('error')
          }

          worker.postMessage({
            pixels: imageData.data,
            width: img.width,
            height: img.height,
            colorCount,
          })
        } catch {
          setErrorMsg('Failed to start color extraction worker.')
          setState('error')
        }
      }

      img.onerror = () => {
        setErrorMsg('Failed to load image.')
        setState('error')
      }

      img.src = url
    },
    [colorCount],
  )

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) {
      processImage(files[0])
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
  }

  function handleClear() {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setExtractedColors([])
    setState('idle')
    setErrorMsg('')
    workerRef.current?.terminate()
    workerRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleReExtract() {
    if (!imageUrl) return
    // Re-fetch the blob from the object URL by re-drawing the canvas
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    setState('extracting')
    setExtractedColors([])

    workerRef.current?.terminate()
    try {
      const worker = new Worker(
        new URL('./extraction-worker.ts', import.meta.url),
      )
      workerRef.current = worker

      worker.onmessage = (e: MessageEvent) => {
        if (e.data.error) {
          setErrorMsg(e.data.error)
          setState('error')
        } else {
          setExtractedColors(e.data.colors)
          setState('done')
        }
      }

      worker.onerror = () => {
        setErrorMsg('Worker failed to process image.')
        setState('error')
      }

      worker.postMessage({
        pixels: imageData.data,
        width: canvas.width,
        height: canvas.height,
        colorCount,
      })
    } catch {
      setErrorMsg('Failed to start color extraction worker.')
      setState('error')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Drop zone / image preview */}
      {!imageUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload an image to extract colors"
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[180px] ${
            dragActive
              ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/10'
              : 'border-[var(--tk-color-border)] hover:border-[var(--tk-color-text-muted)]'
          }`}
        >
          {/* Upload icon */}
          <svg
            className="w-10 h-10 text-[var(--tk-color-text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--tk-color-text)]">
              Drop an image here or click to upload
            </p>
            <p className="text-xs text-[var(--tk-color-text-muted)] mt-1">
              PNG, JPG, or WebP — max 10 MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Image thumbnail */}
          <div className="relative rounded-xl overflow-hidden border border-[var(--tk-color-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded image for color extraction"
              className="w-full max-h-48 object-contain bg-[var(--tk-color-hover)]"
            />
          </div>

          {/* Color count slider */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="color-count"
              className="text-sm font-medium text-[var(--tk-color-text)] shrink-0"
            >
              Colors: {colorCount}
            </label>
            <input
              id="color-count"
              type="range"
              min={3}
              max={8}
              value={colorCount}
              onChange={(e) => setColorCount(Number(e.target.value))}
              className="flex-1 h-6 appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[var(--tk-color-border)]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--tk-color-primary-500)] [&::-webkit-slider-thumb]:-mt-1.5
                [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--tk-color-border)]
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[var(--tk-color-primary-500)] [&::-moz-range-thumb]:border-0"
            />
            <button
              type="button"
              onClick={handleReExtract}
              disabled={state === 'extracting'}
              className="px-3 py-2 min-h-[44px] text-sm font-medium rounded-lg bg-[var(--tk-color-hover)] text-[var(--tk-color-text)] hover:bg-[var(--tk-color-border)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Re-extract
            </button>
          </div>
        </div>
      )}

      {/* Extracting spinner */}
      {state === 'extracting' && (
        <div className="flex items-center justify-center gap-2 py-4">
          <svg
            className="w-5 h-5 animate-spin text-[var(--tk-color-primary-500)]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-[var(--tk-color-text-muted)]">
            Extracting colors...
          </span>
        </div>
      )}

      {/* Error message */}
      {state === 'error' && errorMsg && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Extracted color swatches */}
      {state === 'done' && extractedColors.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--tk-color-text)]">
            Extracted Colors
          </h3>
          <div className="flex gap-2">
            {extractedColors.map((hex, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div
                  className="w-full aspect-square rounded-lg border border-[var(--tk-color-border)] flex items-center justify-center"
                  style={{ backgroundColor: hex }}
                >
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: suggestTextColor(hex) }}
                  >
                    {hex}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onApply(extractedColors)}
            className="w-full py-3 min-h-[44px] rounded-xl bg-[var(--tk-color-primary-500)] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Apply to Palette
          </button>
        </div>
      )}

      {/* Clear button */}
      {imageUrl && (
        <button
          type="button"
          onClick={handleClear}
          className="w-full py-3 min-h-[44px] rounded-xl border border-[var(--tk-color-border)] text-[var(--tk-color-text-muted)] font-medium text-sm hover:bg-[var(--tk-color-hover)] transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  )
}
