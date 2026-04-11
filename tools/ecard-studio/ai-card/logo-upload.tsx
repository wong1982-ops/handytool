'use client'

import { useRef, useState, useCallback } from 'react'
import type { BrandAnalysis } from '@/tools/ecard-studio/ai-card/types'
import { ActionGate } from '@/components/auth/action-gate'

interface LogoUploadProps {
  logoDataUrl: string | null
  onLogoChange: (dataUrl: string | null) => void
  brandAnalysis: BrandAnalysis | null
  onAnalyze: () => void
  onUpdateAnalysis: (analysis: BrandAnalysis) => void
  loading: boolean
  error: string | null
  onNext: () => void
  onSkip: () => void
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * Extract dominant colors from an image data URL by sampling pixels on a hidden canvas.
 * Returns up to 5 hex color strings bucketed from the image.
 */
async function extractDominantColors(dataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 100
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve([])
        return
      }

      ctx.drawImage(img, 0, 0, size, size)
      const imageData = ctx.getImageData(0, 0, size, size)
      const data = imageData.data

      // Simple color bucketing: divide each channel into 4 ranges (64 buckets total)
      const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {}

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]

        // Skip mostly-transparent pixels
        if (a < 128) continue

        const br = Math.floor(r / 64)
        const bg = Math.floor(g / 64)
        const bb = Math.floor(b / 64)
        const key = `${br}-${bg}-${bb}`

        if (!buckets[key]) {
          buckets[key] = { r: 0, g: 0, b: 0, count: 0 }
        }
        buckets[key].r += r
        buckets[key].g += g
        buckets[key].b += b
        buckets[key].count += 1
      }

      const sorted = Object.values(buckets)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const hexColors = sorted.map((bucket) => {
        const r = Math.round(bucket.r / bucket.count)
        const g = Math.round(bucket.g / bucket.count)
        const b = Math.round(bucket.b / bucket.count)
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      })

      resolve(hexColors)
    }
    img.onerror = () => resolve([])
    img.src = dataUrl
  })
}

export { extractDominantColors }

export function LogoUpload({
  logoDataUrl,
  onLogoChange,
  brandAnalysis,
  onAnalyze,
  onUpdateAnalysis,
  loading,
  error,
  onNext,
  onSkip,
}: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const validateAndLoad = useCallback(
    (file: File) => {
      setFileError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError('Invalid file type. Please upload PNG, JPG, SVG, or WebP.')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileError('File is too large. Maximum size is 5 MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onLogoChange(reader.result)
        }
      }
      reader.readAsDataURL(file)
    },
    [onLogoChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndLoad(file)
    },
    [validateAndLoad],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragActive(false)
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validateAndLoad(file)
    },
    [validateAndLoad],
  )

  function updateAnalysisColor(
    key: 'primary' | 'secondary' | 'accent',
    color: string,
  ) {
    if (!brandAnalysis) return
    onUpdateAnalysis({
      ...brandAnalysis,
      suggestedColors: { ...brandAnalysis.suggestedColors, [key]: color },
    })
  }

  function updateAnalysisTagline(tagline: string) {
    if (!brandAnalysis) return
    onUpdateAnalysis({ ...brandAnalysis, suggestedTagline: tagline })
  }

  const displayError = fileError || error

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--tk-color-text-primary)]">
          Logo &amp; Brand Analysis
        </h2>
        <p className="mt-1 text-sm text-[var(--tk-color-text-secondary)]">
          Upload your logo to extract brand colors and style suggestions.
        </p>
      </div>

      {/* Upload zone */}
      {!logoDataUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex min-h-[160px] w-full flex-col items-center justify-center gap-3
            rounded-xl border-2 border-dashed transition-colors cursor-pointer
            ${
              dragActive
                ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/10'
                : 'border-[var(--tk-color-border)] bg-[var(--tk-color-bg-secondary)] hover:border-[var(--tk-color-primary-500)]/50'
            }`}
        >
          {/* Upload icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-[var(--tk-color-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="text-sm font-medium text-[var(--tk-color-text-secondary)]">
            Drop logo here or click to browse
          </span>
          <span className="text-xs text-[var(--tk-color-text-muted)]">
            PNG, JPG, SVG, or WebP (max 5 MB)
          </span>
        </button>
      ) : (
        /* Logo preview */
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-bg-secondary)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDataUrl}
              alt="Uploaded logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onLogoChange(null)
                setFileError(null)
              }}
              className="min-h-[44px] rounded-lg border border-red-300 px-4 py-2 text-sm
                font-medium text-red-600 transition-colors hover:bg-red-50
                dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Remove
            </button>
            <ActionGate cost={1}>{() => (
              <button
                type="button"
                onClick={onAnalyze}
                disabled={loading}
                className="min-h-[44px] rounded-lg bg-[var(--tk-color-primary-500)] px-4 py-2
                  text-sm font-medium text-white transition-colors
                  hover:bg-[var(--tk-color-primary-600)] disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Brand'}
              </button>
            )}</ActionGate>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error display */}
      {displayError && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {displayError}
        </p>
      )}

      {/* Brand analysis results */}
      {brandAnalysis && (
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-bg-secondary)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--tk-color-text-primary)]">
              Brand Profile
            </h3>
            <button
              type="button"
              onClick={onAnalyze}
              disabled={loading}
              className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium
                text-[var(--tk-color-primary-500)] transition-colors
                hover:bg-[var(--tk-color-primary-500)]/10 disabled:opacity-50"
            >
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>

          {/* Color palette */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--tk-color-text-muted)]">
              Color Palette
            </span>
            <div className="flex gap-3">
              {(
                ['primary', 'secondary', 'accent'] as const
              ).map((key) => (
                <label key={key} className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={brandAnalysis.suggestedColors[key]}
                    onChange={(e) => updateAnalysisColor(key, e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-[var(--tk-color-border)] bg-transparent p-0"
                  />
                  <span className="text-[10px] capitalize text-[var(--tk-color-text-muted)]">
                    {key}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Style badge */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--tk-color-text-muted)]">
              Style
            </span>
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--tk-color-primary-500)]/15 px-3 py-1 text-xs font-semibold capitalize text-[var(--tk-color-primary-500)]">
              {brandAnalysis.suggestedStyle}
            </span>
          </div>

          {/* Suggested tagline (editable) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--tk-color-text-muted)]">
              Suggested Tagline
            </span>
            <input
              type="text"
              value={brandAnalysis.suggestedTagline}
              onChange={(e) => updateAnalysisTagline(e.target.value)}
              className="min-h-[44px] w-full rounded-xl border border-[var(--tk-color-border)]
                bg-[var(--tk-color-bg-primary)] px-4 py-2.5 text-sm
                text-[var(--tk-color-text-primary)]
                focus:border-[var(--tk-color-primary-500)] focus:outline-none focus:ring-2
                focus:ring-[var(--tk-color-primary-500)]/20 transition-colors"
            />
          </div>

          {/* Brand personality */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--tk-color-text-muted)]">
              Brand Personality
            </span>
            <p className="text-sm text-[var(--tk-color-text-secondary)]">
              {brandAnalysis.brandPersonality}
            </p>
          </div>

          {/* Font suggestions */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--tk-color-text-muted)]">
              Font Suggestions
            </span>
            <p className="text-sm text-[var(--tk-color-text-secondary)]">
              {brandAnalysis.suggestedFonts.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--tk-color-border)]
            bg-[var(--tk-color-bg-secondary)] px-6 py-3 text-sm font-semibold
            text-[var(--tk-color-text-primary)] transition-colors
            hover:bg-[var(--tk-color-bg-tertiary)]"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={onNext}
          className="min-h-[44px] flex-1 rounded-xl bg-gradient-to-r
            from-[var(--tk-color-primary-500)] to-[var(--tk-color-primary-600)]
            px-6 py-3 text-sm font-semibold text-white shadow-md
            transition-all hover:shadow-lg hover:brightness-110"
        >
          Next
        </button>
      </div>
    </div>
  )
}
