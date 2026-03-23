'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ART_STYLES, STYLE_CATEGORIES, type SketchMode } from './types'

const SHOWCASE_BASE = 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev/sketch-art/showcase'

interface ShowcaseGalleryProps {
  mode: SketchMode
}

// Pick 3 featured styles to highlight
const FEATURED_IDS = ['watercolor', 'anime', 'ghibli']

function StyleCard({
  style,
  index,
  onClick,
  featured,
}: {
  style: (typeof ART_STYLES)[number]
  index: number
  onClick: (index: number) => void
  featured?: boolean
}) {
  const [hasError, setHasError] = useState(false)
  const imgUrl = `${SHOWCASE_BASE}/mermaid-${style.id}.png`

  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      className={`relative overflow-hidden cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tk-color-primary-500)] transition-all duration-300 ${
        featured
          ? 'rounded-2xl aspect-[3/4] min-w-[260px] sm:min-w-0 snap-center'
          : 'rounded-xl w-full h-full'
      } hover:scale-[1.03] hover:shadow-xl`}
      aria-label={`View ${style.name} style`}
    >
      {hasError ? (
        <div className={`w-full h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
          <span className="text-white text-sm font-semibold text-center px-2 drop-shadow">{style.name}</span>
        </div>
      ) : (
        <Image
          src={imgUrl}
          alt={`Mermaid in ${style.name} style`}
          fill
          sizes={featured ? '260px' : '(max-width: 640px) 140px, (max-width: 1024px) 25vw, 16vw'}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className={`text-white font-semibold drop-shadow-lg ${featured ? 'text-base' : 'text-xs'}`}>
          {style.funLabel}
        </span>
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

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) closeLightbox()
  }

  const selectedStyle = selectedIndex !== null ? ART_STYLES[selectedIndex] : null
  const selectedUrl = selectedIndex !== null ? `${SHOWCASE_BASE}/mermaid-${ART_STYLES[selectedIndex].id}.png` : ''

  const scrollToWizard = () => {
    document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' })
  }

  const featuredStyles = ART_STYLES.filter((s) => FEATURED_IDS.includes(s.id))
  const featuredIndexes = FEATURED_IDS.map((id) => ART_STYLES.findIndex((s) => s.id === id))

  return (
    <section className="pb-12" aria-label="Showcase gallery">
      {/* Hero — compact, punchy */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--tk-color-primary-500)] mb-2">
          AI-Powered Art
        </p>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--tk-color-text-primary)] dark:text-white mb-2 leading-tight">
          One sketch.<br className="sm:hidden" /> Eighteen styles.
        </h2>
        <p className="text-sm sm:text-base text-[var(--tk-color-text-secondary)] dark:text-slate-400 mb-5 max-w-md mx-auto">
          Watch AI transform a simple drawing into stunning artwork
        </p>
      </div>

      {/* Before → After hero strip */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 mb-8 px-4">
        {/* Original */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shrink-0">
          {originalError ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-slate-400 text-xs">Sketch</span>
            </div>
          ) : (
            <Image
              src={originalUrl}
              alt="Original mermaid sketch"
              fill
              sizes="128px"
              className="object-contain p-1"
              onError={() => setOriginalError(true)}
            />
          )}
          <div className="absolute -bottom-0.5 left-0 right-0 text-center">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-t-md">
              Sketch
            </span>
          </div>
        </div>

        {/* Arrow */}
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--tk-color-primary-500)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>

        {/* Featured results — horizontal scroll on mobile */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 -mr-4 pr-4">
          {featuredStyles.map((style, i) => (
            <StyleCard
              key={style.id}
              style={style}
              index={featuredIndexes[i]}
              onClick={openLightbox}
              featured
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mb-10">
        <button
          type="button"
          onClick={scrollToWizard}
          className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--tk-color-primary-500)] to-violet-500 text-white font-semibold text-sm shadow-lg shadow-[var(--tk-color-primary-500)]/25 hover:shadow-xl hover:shadow-[var(--tk-color-primary-500)]/30 hover:scale-105 active:scale-100 transition-all duration-200"
        >
          Try it with your own sketch
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* All styles by category */}
      {STYLE_CATEGORIES.map((cat) => {
        const styles = ART_STYLES.filter((s) => s.category === cat.id)
        return (
          <div key={cat.id} className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
              {cat.label}
            </h3>
            {/* Mobile: horizontal scroll strip. Desktop: grid row */}
            <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible" style={{ scrollbarWidth: 'none' }}>
              {styles.map((style) => {
                const globalIndex = ART_STYLES.findIndex((s) => s.id === style.id)
                return (
                  <div key={style.id} className="w-[140px] h-[140px] shrink-0 snap-center sm:w-auto sm:h-auto sm:aspect-square">
                    <StyleCard style={style} index={globalIndex} onClick={openLightbox} />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        onClose={closeLightbox}
        className="fixed inset-0 z-50 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent backdrop:bg-black/80"
        aria-label={selectedStyle ? `${selectedStyle.name} style` : 'Style lightbox'}
      >
        {selectedStyle && (
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedStyle.funLabel}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedIndex !== null ? selectedIndex + 1 : 0} of {ART_STYLES.length} styles
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Close"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Before / After */}
              <div className="flex flex-col sm:flex-row">
                {/* Original */}
                <div className="flex-1 p-3 sm:p-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {originalError ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-slate-400 text-sm">Original</span>
                      </div>
                    ) : (
                      <Image src={originalUrl} alt="Original sketch" fill sizes="(max-width: 640px) 90vw, 45vw" className="object-contain p-2" />
                    )}
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-2 font-medium">Before</p>
                </div>

                {/* Styled */}
                <div className="flex-1 p-3 sm:p-4">
                  <LightboxStyleImage key={selectedStyle.id} url={selectedUrl} style={selectedStyle} />
                  <p className="text-center text-xs text-slate-400 mt-2 font-medium">After</p>
                </div>
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous style"
                  className="min-h-[44px] px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next style"
                  className="min-h-[44px] px-4 rounded-lg bg-[var(--tk-color-primary-500)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
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

function LightboxStyleImage({
  url,
  style,
}: {
  url: string
  style: (typeof ART_STYLES)[number]
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      {hasError ? (
        <div className={`w-full h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
          <span className="text-white text-base font-semibold text-center px-4 drop-shadow">{style.name}</span>
        </div>
      ) : (
        <Image src={url} alt={`Mermaid in ${style.name} style`} fill sizes="(max-width: 640px) 90vw, 45vw" className="object-cover" onError={() => setHasError(true)} />
      )}
    </div>
  )
}
