'use client'

import { useCallback, useRef, useState } from 'react'
import { FaviconConfig, FaviconShape, SHAPE_LABELS } from './types'

interface UploadTabProps {
  config: FaviconConfig
  onConfigChange: (updates: Partial<FaviconConfig>) => void
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const SHAPES: FaviconShape[] = ['circle', 'square', 'rounded', 'hexagon']

const SHAPE_ICONS: Record<FaviconShape, React.ReactNode> = {
  circle: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  square: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  rounded: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  hexagon: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
}

export default function UploadTab({ config, onConfigChange }: UploadTabProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasImage = !!config.imageData

  const processFile = useCallback(
    (file: File) => {
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Unsupported file type. Use PNG, JPEG, SVG, or WebP.')
        return
      }

      if (file.size > MAX_SIZE) {
        setError('File too large. Maximum size is 10MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        onConfigChange({
          mode: 'upload',
          imageData: base64,
          cropZoom: 1,
          cropX: 0,
          cropY: 0,
        })
      }
      reader.onerror = () => {
        setError('Failed to read file. Please try again.')
      }
      reader.readAsDataURL(file)
    },
    [onConfigChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleClear = () => {
    onConfigChange({ imageData: undefined, cropZoom: 1, cropX: 0, cropY: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
    setError(null)
  }

  return (
    <div className="rounded-xl border border-[#1e2631] bg-[#131a23] p-5 space-y-5">
      {!hasImage ? (
        /* Drop zone */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all min-h-[160px] bg-[#090f16]/40 ${
            isDragging
              ? 'border-[#3D6AF2] bg-[#3D6AF2]/5'
              : 'border-[#2a3447] hover:border-[#3D6AF2] hover:bg-[#3D6AF2]/[0.04]'
          }`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#70767f]"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-[#a6abb5]">
              Drop image here or click to browse
            </p>
            <p className="text-xs text-[#70767f] mt-1">
              PNG, JPEG, SVG, WebP &middot; Max 10MB
            </p>
          </div>
        </div>
      ) : (
        /* Image preview + controls */
        <div className="space-y-4">
          <div className="relative flex items-center justify-center rounded-xl bg-[repeating-conic-gradient(#1e2631_0%_25%,transparent_0%_50%)_0_0/20px_20px] p-4 min-h-[140px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.imageData}
              alt="Uploaded favicon source"
              className="max-w-[120px] max-h-[120px] object-contain"
              style={{ transform: `scale(${config.cropZoom})` }}
            />
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 transition-colors min-h-[44px]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear image
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload image file"
      />

      {error && (
        <p className="text-xs text-[#EF4444] flex items-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </p>
      )}

      {/* Zoom slider */}
      {hasImage && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">
            Zoom
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={config.cropZoom}
              onChange={(e) =>
                onConfigChange({ mode: 'upload', cropZoom: Number(e.target.value) })
              }
              className="w-24 accent-[#3D6AF2]"
            />
            <span className="text-xs text-[#70767f] font-mono w-10 text-right">
              {config.cropZoom.toFixed(1)}x
            </span>
          </div>
        </div>
      )}

      {/* Background color (for transparent PNGs) */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">
          Background Color
        </span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md border border-[#1e2631] overflow-hidden flex-shrink-0" style={{ background: config.bgColor }}>
            <input
              type="color"
              value={config.bgColor}
              onChange={(e) => onConfigChange({ mode: 'upload', bgColor: e.target.value })}
              className="w-10 h-10 -m-1 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-[#70767f] font-mono w-16">
            {config.bgColor}
          </span>
        </div>
      </div>

      {/* Shape selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">
          Shape
        </span>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map((shape) => {
            const active = config.shape === shape
            return (
              <button
                key={shape}
                type="button"
                onClick={() => onConfigChange({ mode: 'upload', shape })}
                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all min-h-[56px] ${
                  active
                    ? 'bg-[#3D6AF2] text-white'
                    : 'bg-[#1e2631] text-[#a6abb5] hover:bg-[#1e2a3a]'
                }`}
                aria-pressed={active}
              >
                {SHAPE_ICONS[shape]}
                <span>{SHAPE_LABELS[shape]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
