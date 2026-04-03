'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import type { GeneratedVariation, SketchMode } from './types'

const ImageEditor = dynamic(() => import('./image-editor'), { ssr: false })

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
  const [editedUrl, setEditedUrl] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const activeUrl = editedUrl || finalImage.imageUrl
  const [galleryTitle, setGalleryTitle] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(activeUrl)
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
  }, [activeUrl])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activeUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }, [activeUrl])

  const handleShareX = useCallback(() => {
    const text = encodeURIComponent(
      'Check out this art I made from a sketch! Made with Sketch to Art on Toolk1t',
    )
    const url = encodeURIComponent(activeUrl)
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener',
    )
  }, [activeUrl])

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
          resultImageUrl: activeUrl,
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
  }, [galleryTitle, publishing, originalSketch, activeUrl, style])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Final image */}
      <div className="mx-auto w-full max-w-[480px]">
        {editing ? (
          <ImageEditor
            src={finalImage.imageUrl}
            onComplete={(edited) => { setEditedUrl(edited); setEditing(false) }}
            onCancel={() => setEditing(false)}
            mode={mode}
            applyLabel="Apply"
          />
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
            <Image
              src={activeUrl}
              alt="Final artwork"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 480px"
              priority
            />
          </div>
        )}
      </div>

      {/* Metadata card */}
      <div className="w-full max-w-[480px] bg-[#131a23] rounded-2xl p-5 flex flex-col gap-3.5">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#70767f] mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={galleryTitle}
            onChange={(e) => setGalleryTitle(e.target.value)}
            placeholder="Give your art a title..."
            className="w-full min-h-[44px] rounded-[10px] border border-[#1e2631] bg-[#090f16] text-white text-sm px-3.5 py-2.5 placeholder:text-[#70767f] focus:outline-none focus:border-[#3D6AF2] transition-colors"
          />
        </div>
        <div className="flex gap-4 text-[13px] text-[#a6abb5]">
          <span>Style: <strong className="text-white">{style || 'Custom'}</strong></span>
          <span>·</span>
          <span>{new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-[480px] flex flex-col gap-2.5">
        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="min-h-[44px] w-full rounded-xl bg-[#3D6AF2] px-6 py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:ring-offset-2 inline-flex items-center justify-center gap-2"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PNG
        </button>

        {/* Share row */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[44px] flex-1 rounded-xl bg-[#131a23] border border-[#1e2631] px-4 py-3 text-sm font-semibold text-[#a6abb5] transition-colors hover:bg-[#1e2631] hover:text-white inline-flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.482a4.5 4.5 0 00-6.364-6.364L4.5 8.625a4.5 4.5 0 001.242 7.244" />
            </svg>
            {linkCopied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            type="button"
            onClick={handleShareX}
            className="min-h-[44px] flex-1 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 inline-flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share
          </button>
        </div>

        {/* Edit / Reset (inline) */}
        {!editing && (
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="min-h-[44px] flex-1 rounded-xl bg-[#131a23] border border-[#1e2631] px-4 py-3 text-sm font-medium text-[#a6abb5] transition-colors hover:bg-[#1e2631] hover:text-white"
            >
              {isFun ? 'Crop / Rotate' : 'Edit'}
            </button>
            {editedUrl && (
              <button
                type="button"
                onClick={() => setEditedUrl(null)}
                className="min-h-[44px] flex-1 rounded-xl bg-[#131a23] border border-[#1e2631] px-4 py-3 text-sm font-medium text-[#a6abb5] transition-colors hover:bg-[#1e2631] hover:text-white"
              >
                Reset to original
              </button>
            )}
          </div>
        )}

        {/* Publish to gallery */}
        {published ? (
          <p className="text-center text-sm font-medium text-[#10B981] py-2">
            {isFun ? 'Published to the gallery!' : 'Published to gallery.'}
          </p>
        ) : galleryTitle.trim() ? (
          <div className="flex flex-col gap-2">
            {publishError && (
              <p className="text-xs text-red-400">{publishError}</p>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={!galleryTitle.trim() || publishing}
              className="min-h-[44px] w-full rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? 'Publishing...' : 'Publish to Gallery'}
            </button>
          </div>
        ) : null}

        {/* Start over */}
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] w-full rounded-xl text-sm text-[#70767f] transition-colors hover:text-white"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}
