'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { FUN_LOADING_MESSAGES } from './types'
import type { GeneratedVariation, SketchMode } from './types'

interface GenerationResultsProps {
  variations: GeneratedVariation[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  loading: boolean
  mode: SketchMode
}

export default function GenerationResults({
  variations,
  selectedIndex,
  onSelect,
  loading,
  mode,
}: GenerationResultsProps) {
  const isFun = mode === 'fun'
  const [funMessageIndex, setFunMessageIndex] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)

  // Rotate fun loading messages every 2 seconds
  useEffect(() => {
    if (!loading || !isFun) return
    const interval = setInterval(() => {
      setFunMessageIndex((prev) => (prev + 1) % FUN_LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [loading, isFun])

  // Reset active index when variations change
  useEffect(() => {
    setActiveIndex(0)
  }, [variations])

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, variations.length - 1))
      setActiveIndex(clamped)
    },
    [variations.length]
  )

  // Keyboard navigation
  useEffect(() => {
    if (loading || variations.length === 0) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(activeIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(activeIndex + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, variations.length, activeIndex, goTo])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) {
        goTo(activeIndex + 1)
      } else {
        goTo(activeIndex - 1)
      }
    }
  }

  if (loading) {
    if (isFun) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          {/* Animated sparkle */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-12 w-12 animate-spin text-[var(--tk-color-primary-500)]"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-lg font-medium text-[var(--tk-color-text-primary)] animate-pulse">
            {FUN_LOADING_MESSAGES[funMessageIndex]}
          </p>
        </div>
      )
    }

    // Pro loading: spinner
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-2 py-4">
          <svg
            className="h-5 w-5 animate-spin text-[var(--tk-color-primary-500)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-[var(--tk-color-text-secondary)]">Generating variations...</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-[var(--tk-color-surface-200)] dark:bg-[var(--tk-color-surface-700)]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (variations.length === 0) return null

  const total = variations.length

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Heading */}
      <p className="text-base font-semibold text-[var(--tk-color-text-primary)]">
        {isFun ? 'Pick your favourite!' : `Variation ${activeIndex + 1} of ${total}`}
      </p>

      {/* Carousel viewport */}
      <div
        className="relative w-full max-w-[480px] overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Variation carousel"
      >
        {/* Track */}
        <div
          className="flex"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: 'transform 300ms ease-out',
          }}
        >
          {variations.map((variation, index) => (
            <div key={index} className="relative aspect-square w-full shrink-0">
              <Image
                src={variation.imageUrl}
                alt={`Art variation ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 480px"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Prev arrow */}
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous variation"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full h-10 w-10 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {activeIndex < total - 1 && (
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next variation"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full h-10 w-10 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex items-center gap-2" role="tablist" aria-label="Variation indicators">
          {variations.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={`Go to variation ${index + 1}`}
              onClick={() => goTo(index)}
              className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] ${
                activeIndex === index
                  ? 'w-3 h-3 bg-[var(--tk-color-primary-500)]'
                  : 'w-2 h-2 bg-[var(--tk-color-surface-400)] dark:bg-[var(--tk-color-surface-600)]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Select button */}
      <button
        type="button"
        onClick={() => onSelect(activeIndex)}
        className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:ring-offset-2 ${
          selectedIndex === activeIndex
            ? 'bg-[var(--tk-color-primary-500)] text-white ring-2 ring-[var(--tk-color-primary-500)] ring-offset-2 dark:ring-offset-[var(--tk-color-surface-900)]'
            : 'bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-800)] text-[var(--tk-color-text-primary)] hover:bg-[var(--tk-color-primary-500)] hover:text-white'
        }`}
      >
        {selectedIndex === activeIndex
          ? isFun
            ? '✓ Selected!'
            : '✓ Selected'
          : isFun
          ? 'Use this one!'
          : 'Select this variation'}
      </button>
    </div>
  )
}
