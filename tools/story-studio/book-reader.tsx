'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Page } from './types'

interface BookReaderProps {
  pages: Page[]
  title: string
  currentPage?: number
  onPageChange?: (page: number) => void
}

export function BookReader({ pages, title, currentPage, onPageChange }: BookReaderProps) {
  const [internalPage, setInternalPage] = useState(0)
  const activePage = currentPage ?? internalPage
  const setActivePage = onPageChange ?? setInternalPage

  // Total pages = cover + content pages
  const totalPages = pages.length + 1
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback(
    (next: number, dir: 'left' | 'right') => {
      if (next < 0 || next >= totalPages || isTransitioning) return
      setDirection(dir)
      setIsTransitioning(true)
      setTimeout(() => {
        setActivePage(next)
        setIsTransitioning(false)
      }, 250)
    },
    [totalPages, isTransitioning, setActivePage],
  )

  const goPrev = useCallback(() => goTo(activePage - 1, 'left'), [activePage, goTo])
  const goNext = useCallback(() => goTo(activePage + 1, 'right'), [activePage, goTo])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goPrev, goNext])

  const isCover = activePage === 0
  const contentPage = isCover ? null : pages[activePage - 1]

  const transitionClass = isTransitioning
    ? direction === 'right'
      ? 'opacity-0 translate-x-4'
      : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0'

  return (
    <div className="flex flex-col h-full">
      {/* Page content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div
          className={`transition-all duration-250 ease-in-out ${transitionClass}`}
        >
          {isCover ? (
            /* Cover page */
            <div className="flex items-center justify-center min-h-[400px] p-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-[#3D6AF2]/10 dark:bg-[#3D6AF2]/20 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-[#3D6AF2]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.472.89 6.074 2.356M12 6.042a8.968 8.968 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.356M12 6.042V20.356"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {pages.length} pages
                </p>
              </div>
            </div>
          ) : contentPage ? (
            /* Content page */
            <div className="space-y-4 p-4">
              {/* Illustration */}
              {contentPage.imageUrl && (
                <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={contentPage.imageUrl}
                    alt={contentPage.sceneDescription}
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
              )}

              {/* Narrative text */}
              {contentPage.narrativeText && (
                <p className="text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200">
                  {contentPage.narrativeText}
                </p>
              )}

              {/* Dialogue */}
              {contentPage.dialogue && contentPage.dialogue.length > 0 && (
                <div className="space-y-2 mt-3">
                  {contentPage.dialogue.map((d, i) => (
                    <div
                      key={i}
                      className="pl-4 border-l-2 border-[#3D6AF2]/40"
                    >
                      <span className="font-semibold text-[#3D6AF2] dark:text-[#6B8FF7]">
                        {d.speaker}:
                      </span>{' '}
                      <span className="text-gray-700 dark:text-gray-300 italic">
                        &ldquo;{d.line}&rdquo;
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <button
          type="button"
          onClick={goPrev}
          disabled={activePage === 0 || isTransitioning}
          className="flex items-center justify-center w-11 h-11 rounded-xl
            bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
            hover:bg-[#3D6AF2]/10 hover:text-[#3D6AF2]
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm text-gray-500 dark:text-gray-400 select-none">
          {isCover ? 'Cover' : `Page ${activePage} of ${pages.length}`}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={activePage >= totalPages - 1 || isTransitioning}
          className="flex items-center justify-center w-11 h-11 rounded-xl
            bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
            hover:bg-[#3D6AF2]/10 hover:text-[#3D6AF2]
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors"
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
