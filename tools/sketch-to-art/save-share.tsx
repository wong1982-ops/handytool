'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import type { GeneratedVariation, SketchMode } from './types'

interface SaveShareProps {
  finalImage: GeneratedVariation
  originalSketch: string
  style: string
  mode: SketchMode
  onStartOver: () => void
}

export default function SaveShare({
  finalImage,
  originalSketch,
  style,
  mode,
  onStartOver,
}: SaveShareProps) {
  const isFun = mode === 'fun'
  const [linkCopied, setLinkCopied] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [galleryTitle, setGalleryTitle] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(finalImage.imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sketch-art.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }, [finalImage.imageUrl])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(finalImage.imageUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }, [finalImage.imageUrl])

  const handleShareX = useCallback(() => {
    const text = encodeURIComponent(
      'Check out this art I made from a sketch! Made with Sketch to Art on Toolk1t',
    )
    const url = encodeURIComponent(finalImage.imageUrl)
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener',
    )
  }, [finalImage.imageUrl])

  const handleShareLinkedIn = useCallback(() => {
    const url = encodeURIComponent(finalImage.imageUrl)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener',
    )
  }, [finalImage.imageUrl])

  const handlePublish = useCallback(async () => {
    if (!galleryTitle.trim() || publishing) return
    setPublishing(true)
    setPublishError(null)

    try {
      // Upload original sketch to R2 via the gallery API route (server-side)
      const uploadResponse = await fetch('/api/v1/sketch-to-art/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: galleryTitle.trim(),
          originalSketchDataUrl: originalSketch,
          resultImageUrl: finalImage.imageUrl,
          style,
        }),
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to publish')
      }

      setPublished(true)
    } catch (err) {
      console.error('Publish failed:', err)
      setPublishError(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }, [galleryTitle, publishing, originalSketch, finalImage.imageUrl, style])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Heading */}
      <h2 className="text-center text-xl font-bold text-[var(--tk-color-text-primary)]">
        {isFun ? '\u{1F389} Your masterpiece is ready!' : 'Your art is ready'}
      </h2>

      {/* Final image */}
      <div className="mx-auto w-full max-w-lg">
        <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={finalImage.imageUrl}
            alt="Final artwork"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
            priority
          />
        </div>
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="min-h-[44px] w-full max-w-sm rounded-xl bg-[var(--tk-color-primary-500)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--tk-color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:ring-offset-2"
      >
        {isFun ? '\u{1F4E5} Download PNG' : 'Download PNG'}
      </button>

      {/* Share buttons */}
      <div className="flex w-full max-w-sm gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] px-4 py-3 text-sm font-medium text-[var(--tk-color-text-primary)] transition-colors hover:bg-[var(--tk-color-surface-100)] dark:hover:bg-[var(--tk-color-surface-700)]"
        >
          {linkCopied ? 'Copied!' : 'Copy Link'}
        </button>
        <button
          type="button"
          onClick={handleShareX}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] px-4 py-3 text-sm font-medium text-[var(--tk-color-text-primary)] transition-colors hover:bg-[var(--tk-color-surface-100)] dark:hover:bg-[var(--tk-color-surface-700)]"
        >
          Share on X
        </button>
        <button
          type="button"
          onClick={handleShareLinkedIn}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] px-4 py-3 text-sm font-medium text-[var(--tk-color-text-primary)] transition-colors hover:bg-[var(--tk-color-surface-100)] dark:hover:bg-[var(--tk-color-surface-700)]"
        >
          LinkedIn
        </button>
      </div>

      {/* Gallery submit */}
      <div className="w-full max-w-sm rounded-xl border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-700)] p-4">
        {published ? (
          <p className="text-center text-sm font-medium text-[var(--tk-color-success-500)]">
            {isFun ? '\u{1F31F} Published to the gallery!' : 'Published to gallery.'}
          </p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <label
                htmlFor="gallery-toggle"
                className="text-sm font-medium text-[var(--tk-color-text-primary)]"
              >
                Share to gallery?
              </label>
              <button
                id="gallery-toggle"
                type="button"
                role="switch"
                aria-checked={showGallery}
                onClick={() => setShowGallery(!showGallery)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showGallery
                    ? 'bg-[var(--tk-color-primary-500)]'
                    : 'bg-[var(--tk-color-surface-300)] dark:bg-[var(--tk-color-surface-600)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    showGallery ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {showGallery && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="Give your art a title..."
                  className="min-h-[44px] w-full rounded-xl border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] bg-[var(--tk-color-surface-50)] dark:bg-[var(--tk-color-surface-800)] px-4 py-3 text-sm text-[var(--tk-color-text-primary)] placeholder:text-[var(--tk-color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]"
                />
                {publishError && (
                  <p className="text-xs text-[var(--tk-color-error-500)]">{publishError}</p>
                )}
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!galleryTitle.trim() || publishing}
                  className="min-h-[44px] w-full rounded-xl bg-[var(--tk-color-primary-500)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--tk-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Start over */}
      <button
        type="button"
        onClick={onStartOver}
        className="min-h-[44px] w-full max-w-sm rounded-xl border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] px-6 py-3 text-sm font-medium text-[var(--tk-color-text-primary)] transition-colors hover:bg-[var(--tk-color-surface-100)] dark:hover:bg-[var(--tk-color-surface-700)]"
      >
        {isFun ? '\u{1F504} Start Over' : 'Start Over'}
      </button>
    </div>
  )
}
