'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryBook } from './types'

interface BookViewerProps {
  book: StoryBook
  onEdit: () => void
  onStartOver: () => void
  readOnly?: boolean
}

export function BookViewer({ book, onEdit, onStartOver, readOnly }: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0) // 0 = cover
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const touchStartX = useRef(0)

  const totalPages = book.pages.length
  const isCover = currentPage === 0
  const page = isCover ? null : book.pages[currentPage - 1]

  const goTo = useCallback((target: number, dir: 'left' | 'right') => {
    if (target < 0 || target > totalPages) return
    setDirection(dir)
    setCurrentPage(target)
    setTimeout(() => setDirection(null), 300)
  }, [totalPages])

  const goNext = useCallback(() => goTo(currentPage + 1, 'right'), [currentPage, goTo])
  const goPrev = useCallback(() => goTo(currentPage - 1, 'left'), [currentPage, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  const slideClass = direction === 'right'
    ? 'animate-slide-left'
    : direction === 'left'
      ? 'animate-slide-right'
      : ''

  // Render drop cap for narrative text
  const renderNarrative = (text: string) => {
    if (!text || text.length < 2) return <p className="text-base md:text-lg lg:text-xl text-slate-800 dark:text-slate-200 leading-relaxed">{text}</p>
    const firstChar = text[0]
    const rest = text.slice(1)
    return (
      <p className="text-base md:text-lg lg:text-xl text-slate-800 dark:text-slate-200 leading-relaxed">
        <span className="float-left text-5xl md:text-6xl font-bold leading-[0.8] mr-2 mt-1 text-purple-600 dark:text-purple-400">{firstChar}</span>
        {rest}
      </p>
    )
  }

  return (
    <div>
      {/* Top toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Edit
          </button>
          <button
            onClick={onStartOver}
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Start Over
          </button>
        </div>
      )}

      {/* Book container — screen-height on desktop for hardcopy feel */}
      <div
        className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden min-h-[60vh] md:min-h-[75vh]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`transition-transform duration-300 h-full ${slideClass}`}>
          {isCover ? (
            /* Cover page — full height centered */
            <div className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[75vh] p-6 md:p-10 text-center">
              {book.pages[0]?.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden shadow-md w-full max-w-md">
                  <img
                    src={book.pages[0].imageUrl}
                    alt="Book cover"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <h2 className="text-2xl md:text-4xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                {book.title}
              </h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                {book.concept.tags.audience} &middot; {book.concept.tags.style}
              </p>
            </div>
          ) : page ? (
            /* Content page — split layout, image fills half height */
            <div className="flex flex-col md:flex-row min-h-[60vh] md:min-h-[75vh]">
              <div className="md:w-1/2 shrink-0">
                {page.imageUrl ? (
                  <img
                    src={page.imageUrl}
                    alt={page.sceneDescription}
                    className="w-full h-64 md:h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-64 md:h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-purple-300 dark:text-slate-600 mb-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <p className="text-xs text-purple-400 dark:text-slate-500">Illustration loading...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 md:p-8 lg:p-10 flex flex-col justify-center">
                {renderNarrative(page.narrativeText)}
                {page.dialogue?.map((d, i) => (
                  <p key={i} className="mt-3 text-base md:text-lg lg:text-xl text-slate-700 dark:text-slate-300 italic">
                    &ldquo;{d.line}&rdquo; <span className="text-sm text-slate-500 not-italic">&mdash; {d.speaker}</span>
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Page navigation bar */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-slate-400 dark:text-slate-500">
          {isCover ? 'Cover' : `Page ${currentPage} of ${totalPages}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            style={{ minHeight: '44px' }}
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Prev
          </button>
          <button
            onClick={goNext}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-default"
            style={{ minHeight: '44px' }}
            aria-label="Next page"
          >
            Flip Page
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* CSS for slide animations */}
      <style jsx>{`
        @keyframes slideLeft {
          from { transform: translateX(30px); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(-30px); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-left { animation: slideLeft 300ms ease-out; }
        .animate-slide-right { animation: slideRight 300ms ease-out; }
      `}</style>
    </div>
  )
}
