'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ART_STYLES, type SketchMode } from './types'

const SHOWCASE_BASE = 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev/sketch-art/showcase'

interface ShowcaseGalleryProps {
  mode: SketchMode
}

function StyleTile({
  style,
  index,
  onClick,
}: {
  style: (typeof ART_STYLES)[number]
  index: number
  onClick: (index: number) => void
}) {
  const [hasError, setHasError] = useState(false)
  const imgUrl = `${SHOWCASE_BASE}/mermaid-${style.id}.png`

  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-color-primary-500)] transition-all hover:scale-105 hover:ring-2 hover:ring-[var(--tk-color-primary-500)]"
      aria-label={`View ${style.name} style`}
    >
      {hasError ? (
        <div
          className={`w-full h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center`}
        >
          <span className="text-white text-sm font-semibold text-center px-2 drop-shadow">
            {style.name}
          </span>
        </div>
      ) : (
        <Image
          src={imgUrl}
          alt={`Mermaid sketch in ${style.name} style`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      )}

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-2 pointer-events-none">
        <span className="text-white text-xs font-medium drop-shadow-sm">{style.name}</span>
      </div>
    </button>
  )
}

export function ShowcaseGallery({ mode: _mode }: ShowcaseGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [originalError, setOriginalError] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const originalUrl = `${SHOWCASE_BASE}/mermaid-original.png`

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index)
    dialogRef.current?.showModal()
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    dialogRef.current?.close()
    document.body.style.overflow = ''
    setSelectedIndex(null)
  }, [])

  const goNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % ART_STYLES.length))
  }, [])

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? ART_STYLES.length - 1 : (prev - 1 + ART_STYLES.length) % ART_STYLES.length,
    )
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, goNext, goPrev])

  // Close on backdrop click
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) closeLightbox()
  }

  const selectedStyle = selectedIndex !== null ? ART_STYLES[selectedIndex] : null
  const selectedUrl =
    selectedIndex !== null ? `${SHOWCASE_BASE}/mermaid-${ART_STYLES[selectedIndex].id}.png` : ''

  const scrollToWizard = () => {
    document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-16 px-4" aria-label="Showcase gallery">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--tk-color-text-primary)] dark:text-white mb-3">
          One sketch. Eighteen masterpieces.
        </h2>
        <p className="text-lg text-[var(--tk-color-text-secondary)] dark:text-gray-400 mb-6">
          See what AI can do with a single drawing
        </p>
        <button
          type="button"
          onClick={scrollToWizard}
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-xl bg-[var(--tk-color-primary-500)] text-white font-semibold hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--tk-color-primary-500)] focus-visible:ring-offset-2 transition-all"
        >
          Try it with your own sketch
        </button>
      </div>

      {/* Original sketch */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border border-[var(--tk-color-surface-border,#e2e8f0)] dark:border-gray-700 shadow-md bg-white dark:bg-gray-800">
          {originalError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <span className="text-gray-400 text-sm">Original Sketch</span>
            </div>
          ) : (
            <Image
              src={originalUrl}
              alt="Original mermaid sketch"
              fill
              sizes="(max-width: 640px) 160px, 208px"
              className="object-cover"
              loading="lazy"
              onError={() => setOriginalError(true)}
            />
          )}
        </div>
        <span className="mt-2 text-sm text-[var(--tk-color-text-secondary)] dark:text-gray-400 font-medium">
          Original Sketch
        </span>
      </div>

      {/* Masonry-style grid of 18 styles */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {ART_STYLES.map((style, index) => (
          <StyleTile key={style.id} style={style} index={index} onClick={openLightbox} />
        ))}
      </div>

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        onClose={closeLightbox}
        className="max-w-4xl w-full mx-auto rounded-2xl p-0 bg-[var(--tk-color-surface-primary,#fff)] dark:bg-gray-900 shadow-2xl backdrop:bg-black/70 open:animate-fade-in"
        aria-label={selectedStyle ? `${selectedStyle.name} style lightbox` : 'Style lightbox'}
      >
        {selectedStyle && (
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--tk-color-text-primary)] dark:text-white">
                {selectedStyle.name}
              </h3>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close lightbox"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)] dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Before / After */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Original */}
              <div className="flex-1 flex flex-col items-center">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[var(--tk-color-surface-border,#e2e8f0)] dark:border-gray-700 bg-white dark:bg-gray-800">
                  {originalError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <span className="text-gray-400 text-sm">Original Sketch</span>
                    </div>
                  ) : (
                    <Image
                      src={originalUrl}
                      alt="Original mermaid sketch"
                      fill
                      sizes="(max-width: 640px) 90vw, 45vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="mt-2 text-sm text-[var(--tk-color-text-secondary)] dark:text-gray-400">
                  Original Sketch
                </span>
              </div>

              {/* Styled */}
              <div className="flex-1 flex flex-col items-center">
                <LightboxStyleImage
                  key={selectedStyle.id}
                  url={selectedUrl}
                  style={selectedStyle}
                />
                <span className="mt-2 text-sm text-[var(--tk-color-text-secondary)] dark:text-gray-400">
                  {selectedStyle.name} Style
                </span>
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous style"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[var(--tk-color-surface-border,#e2e8f0)] dark:border-gray-700 text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)] dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <span className="text-sm text-[var(--tk-color-text-secondary)] dark:text-gray-400">
                {selectedIndex !== null ? selectedIndex + 1 : 0} / {ART_STYLES.length}
              </span>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next style"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[var(--tk-color-surface-border,#e2e8f0)] dark:border-gray-700 text-[var(--tk-color-text-secondary)] hover:text-[var(--tk-color-text-primary)] dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}

function LightboxStyleImage({
  url,
  style,
}: {
  url: string
  style: (typeof ART_STYLES)[number]
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-[var(--tk-color-surface-border,#e2e8f0)] dark:border-gray-700">
      {hasError ? (
        <div
          className={`w-full h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center`}
        >
          <span className="text-white text-base font-semibold text-center px-4 drop-shadow">
            {style.name}
          </span>
        </div>
      ) : (
        <Image
          src={url}
          alt={`Mermaid sketch in ${style.name} style`}
          fill
          sizes="(max-width: 640px) 90vw, 45vw"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}
