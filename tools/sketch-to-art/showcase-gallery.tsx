'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ART_STYLES, type SketchMode } from './types'

const SHOWCASE_BASE = 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev/sketch-art/showcase'

interface ShowcaseGalleryProps {
  mode: SketchMode
}

// ─── Crosshair Before/After Splitter ─────────────────────────────────────────
// Drag the crosshair handle to reveal the sketch (before) from any corner.
// Before image clips to a rectangle from top-left to the handle position.

function BeforeAfterSlider({ beforeSrc, afterSrc, afterLabel }: {
  beforeSrc: string
  afterSrc: string
  afterLabel: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [posX, setPosX] = useState(50)
  const [posY, setPosY] = useState(50)
  const [dragging, setDragging] = useState(false)

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100))
    setPosX(x)
    setPosY(y)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true)
    updatePosition(e.clientX, e.clientY)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [updatePosition])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    updatePosition(e.clientX, e.clientY)
  }, [dragging, updatePosition])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-crosshair select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label="Before and after comparison — drag to reveal"
    >
      {/* After (full, behind) */}
      <div className="absolute inset-0">
        <Image src={afterSrc} alt="After" fill sizes="(max-width: 640px) 90vw, 500px" className="object-cover" />
      </div>

      {/* Before (clipped to rectangle from top-left to handle) */}
      <div
        className="absolute top-0 left-0 overflow-hidden"
        style={{ width: `${posX}%`, height: `${posY}%` }}
      >
        <div
          className="relative h-full"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw', height: containerRef.current ? `${containerRef.current.offsetHeight}px` : '100vh' }}
        >
          <Image src={beforeSrc} alt="Before" fill sizes="(max-width: 640px) 90vw, 500px" className="object-contain bg-white" />
        </div>
      </div>

      {/* Horizontal line */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none"
        style={{ top: `${posY}%`, transform: 'translateY(-50%)' }}
      >
        <div className="w-full h-[2px] bg-white/80 shadow-sm" />
      </div>

      {/* Vertical line */}
      <div
        className="absolute top-0 bottom-0 z-10 pointer-events-none"
        style={{ left: `${posX}%`, transform: 'translateX(-50%)' }}
      >
        <div className="h-full w-[2px] bg-white/80 shadow-sm" />
      </div>

      {/* Crosshair handle */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ left: `${posX}%`, top: `${posY}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className={`w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform ${dragging ? 'scale-110' : ''}`}>
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </div>
      </div>

      {/* Corner labels */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
        Sketch
      </div>
      <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
        {afterLabel}
      </div>
    </div>
  )
}

// ─── Bento Grid Tile ─────────────────────────────────────────────────────────

function BentoTile({
  style,
  index,
  onClick,
  size = 'normal',
}: {
  style: (typeof ART_STYLES)[number]
  index: number
  onClick: (index: number) => void
  size?: 'hero' | 'tall' | 'normal'
}) {
  const [hasError, setHasError] = useState(false)
  const imgUrl = `${SHOWCASE_BASE}/mermaid-${style.id}.png`

  const sizeClasses = {
    hero: 'col-span-2 row-span-2',
    tall: 'row-span-2',
    normal: '',
  }

  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-color-primary-500)] transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--tk-color-primary-500)]/10 ${sizeClasses[size]}`}
      aria-label={`View ${style.name} style`}
    >
      {hasError ? (
        <div className={`w-full h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center min-h-[160px]`}>
          <span className="text-white text-sm font-semibold text-center px-2 drop-shadow">{style.name}</span>
        </div>
      ) : (
        <div className="relative w-full h-full min-h-[160px]">
          <Image
            src={imgUrl}
            alt={`Mermaid in ${style.name} style`}
            fill
            sizes={size === 'hero' ? '(max-width: 640px) 90vw, 400px' : '(max-width: 640px) 45vw, 200px'}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <span className={`text-white font-bold drop-shadow-lg ${size === 'hero' ? 'text-lg' : 'text-sm'}`}>
          {style.funLabel}
        </span>
        {size === 'hero' && (
          <p className="text-white/70 text-xs mt-0.5">Tap to compare</p>
        )}
      </div>
    </button>
  )
}

// ─── Main Gallery ────────────────────────────────────────────────────────────

// Bento layout: which tiles get special sizes
const BENTO_LAYOUT: Record<string, 'hero' | 'tall'> = {
  'watercolor': 'hero',
  'anime': 'tall',
  'ghibli': 'tall',
  'cyberpunk': 'tall',
}

export function ShowcaseGallery({ mode: _mode }: ShowcaseGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
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

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) closeLightbox()
  }

  const selectedStyle = selectedIndex !== null ? ART_STYLES[selectedIndex] : null
  const selectedUrl = selectedIndex !== null ? `${SHOWCASE_BASE}/mermaid-${ART_STYLES[selectedIndex].id}.png` : ''

  const scrollToWizard = () => {
    document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="pb-10" aria-label="Showcase gallery">
      {/* Hero text */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tk-color-primary-500)]/10 text-[var(--tk-color-primary-500)] text-xs font-semibold mb-3">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
          </svg>
          AI-Powered Art
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
          One sketch. Every style.
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Drag the slider to see the magic
        </p>
      </div>

      {/* Before/After Slider — the hero comparison */}
      <div className="max-w-[500px] mx-auto mb-6">
        <BeforeAfterSlider
          beforeSrc={originalUrl}
          afterSrc={`${SHOWCASE_BASE}/mermaid-watercolor.png`}
          afterLabel="Watercolor"
        />
      </div>

      {/* CTA */}
      <div className="text-center mb-8">
        <button
          type="button"
          onClick={scrollToWizard}
          className="inline-flex items-center gap-2 min-h-[48px] px-7 py-3 rounded-full bg-gradient-to-r from-[var(--tk-color-primary-500)] to-violet-500 text-white font-semibold text-sm shadow-lg shadow-[var(--tk-color-primary-500)]/25 hover:shadow-xl hover:shadow-[var(--tk-color-primary-500)]/30 hover:scale-105 active:scale-100 transition-all duration-200"
        >
          Try with your sketch
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Bento grid — all 18 styles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 auto-rows-[160px] sm:auto-rows-[180px]">
        {ART_STYLES.map((style, index) => (
          <BentoTile
            key={style.id}
            style={style}
            index={index}
            onClick={openLightbox}
            size={BENTO_LAYOUT[style.id] || 'normal'}
          />
        ))}
      </div>

      {/* Lightbox with drag slider comparison */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        onClose={closeLightbox}
        className="fixed inset-0 z-50 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent backdrop:bg-black/85"
        aria-label={selectedStyle ? `${selectedStyle.name} style` : 'Style lightbox'}
      >
        {selectedStyle && (
          <div className="flex items-center justify-center min-h-full p-3 sm:p-6">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedStyle.funLabel}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 mr-2">
                    {selectedIndex !== null ? selectedIndex + 1 : 0}/{ART_STYLES.length}
                  </span>
                  <button
                    type="button"
                    onClick={closeLightbox}
                    aria-label="Close"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Drag slider comparison */}
              <div className="px-4 pb-4">
                <BeforeAfterSlider
                  beforeSrc={originalUrl}
                  afterSrc={selectedUrl}
                  afterLabel={selectedStyle.name}
                />
              </div>

              {/* Nav */}
              <div className="flex items-center gap-2 px-4 pb-4">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous style"
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next style"
                  className="min-h-[44px] flex-1 rounded-xl bg-[var(--tk-color-primary-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Next Style
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
