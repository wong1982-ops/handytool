'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryBook } from './types'
import { ImageLightbox } from './image-lightbox'

interface BookViewerProps {
  book: StoryBook
  onEdit: () => void
  onStartOver: () => void
  readOnly?: boolean
}

export function BookViewer({ book, onEdit, onStartOver, readOnly }: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0) // 0 = cover
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null)
  const touchStartX = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoPlayRef = useRef(false)

  const totalPages = book.pages.length
  const isCover = currentPage === 0
  const page = isCover ? null : book.pages[currentPage - 1]
  // For the cover, reference page 1's audio for play controls
  const activePage = page || book.pages[0] || null
  const hasAudio = !!activePage?.audioUrl

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

  // --- Audio playback (server-generated only, no browser Speech Synthesis) ---

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  // Keep ref in sync so callbacks can read latest value
  useEffect(() => {
    autoPlayRef.current = autoPlay
  }, [autoPlay])

  const autoAdvance = useCallback(() => {
    setCurrentPage(prev => {
      const next = prev + 1
      if (next > totalPages) {
        setAutoPlay(false)
        return prev
      }
      setDirection('right')
      setTimeout(() => setDirection(null), 300)
      return next
    })
  }, [totalPages])

  const speakPage = useCallback((targetPage: typeof page) => {
    if (!targetPage?.audioUrl) {
      // No audio available — skip to next page if auto-playing
      if (autoPlayRef.current) {
        autoAdvance()
      }
      return
    }

    setIsSpeaking(true)

    const onEnded = () => {
      setIsSpeaking(false)
      if (autoPlayRef.current) {
        autoAdvance()
      }
    }

    const audio = new Audio(targetPage.audioUrl)
    audioRef.current = audio
    audio.onended = onEnded
    audio.onerror = () => {
      setIsSpeaking(false)
      if (autoPlayRef.current) {
        autoAdvance()
      }
    }
    audio.play().catch(() => {
      setIsSpeaking(false)
      if (autoPlayRef.current) {
        autoAdvance()
      }
    })
  }, [autoAdvance])

  // On page change: stop current audio, then auto-speak if autoPlay is on
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsSpeaking(false)

    if (autoPlayRef.current && currentPage > 0 && currentPage <= totalPages) {
      const newPage = book.pages[currentPage - 1]
      if (newPage) {
        const timer = setTimeout(() => speakPage(newPage), 400)
        return () => clearTimeout(timer)
      }
    }
  }, [currentPage, totalPages, book.pages, speakPage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

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
        <span className="float-left text-5xl md:text-6xl font-bold leading-[0.8] mr-2 mt-1 text-amber-600 dark:text-amber-400">{firstChar}</span>
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

      {/* Book container */}
      <div
        className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden aspect-[16/9] flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`transition-transform duration-300 flex-1 min-h-0 ${slideClass}`}>
          {isCover ? (
            <div className="relative flex flex-col md:flex-row h-full">
              {/* Cover image — left side on desktop, top on mobile */}
              <div className="md:w-[60%] shrink-0 relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                  {(book.coverImageUrl || book.pages[0]?.imageUrl) ? (
                    <>
                      <img
                        src={book.coverImageUrl || book.pages[0]?.imageUrl}
                        alt={`${book.title} cover`}
                        className="w-full h-full object-cover object-center"
                      />
                      <button
                        onClick={() => setZoomImage({ src: (book.coverImageUrl || book.pages[0]?.imageUrl)!, alt: `${book.title} cover` })}
                        className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
                        aria-label="Zoom image"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full min-h-[30vh] md:min-h-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <svg className="w-16 h-16 text-indigo-200 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  )}
              </div>
              {/* Cover text — right side */}
              <div className="flex-1 p-6 md:p-10 lg:p-14 flex flex-col justify-center">
                <h2 className="text-2xl md:text-4xl font-bold text-amber-600 dark:text-amber-400 mb-3 italic" style={{ fontFamily: 'Georgia, serif' }}>
                  {book.title}
                </h2>
                {book.authors && book.authors.length > 0 && (
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-4">
                    Written by {book.authors.join(' & ')}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {book.concept.tags.audience ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                      {book.concept.tags.audience}
                    </span>
                  ) : null}
                  {book.concept.tags.style ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                      {book.concept.tags.style}
                    </span>
                  ) : null}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                    {totalPages} pages
                  </span>
                </div>
                {book.concept.sections?.premise && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                    {book.concept.sections.premise}
                  </p>
                )}
              </div>
            </div>
          ) : page ? (
            page.imageUrl ? (
              /* Page with illustration — 70/30 image-to-text on desktop */
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-[60%] shrink-0 relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                  <img
                    src={page.imageUrl}
                    alt={page.sceneDescription}
                    className="w-full h-full object-cover object-center"
                  />
                  <button
                    onClick={() => setZoomImage({ src: page.imageUrl!, alt: page.sceneDescription })}
                    className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
                    aria-label="Zoom image"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                  {renderNarrative(page.narrativeText)}
                  {page.dialogue?.map((d, i) => (
                    <p key={i} className="mt-3 text-base md:text-lg lg:text-xl text-slate-700 dark:text-slate-300 italic">
                      &ldquo;{d.line}&rdquo; <span className="text-sm text-slate-500 not-italic">&mdash; {d.speaker}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              /* Text-only page — full width, book-like centered layout */
              <div className="h-full flex items-center justify-center px-6 py-10 md:px-16 lg:px-24">
                <div className="max-w-2xl w-full">
                  {/* Decorative page corner */}
                  <div className="text-center mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-300 dark:text-slate-600">
                      Page {page.sequence}
                    </span>
                  </div>
                  {renderNarrative(page.narrativeText)}
                  {page.dialogue?.map((d, i) => (
                    <p key={i} className="mt-3 text-base md:text-lg lg:text-xl text-slate-700 dark:text-slate-300 italic">
                      &ldquo;{d.line}&rdquo; <span className="text-sm text-slate-500 not-italic">&mdash; {d.speaker}</span>
                    </p>
                  ))}
                  {/* Bottom flourish */}
                  <div className="mt-8 flex justify-center">
                    <svg className="w-8 h-4 text-slate-200 dark:text-slate-700" viewBox="0 0 32 16" fill="currentColor">
                      <path d="M0 8 C8 0, 12 16, 16 8 C20 0, 24 16, 32 8" strokeWidth="1.5" stroke="currentColor" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          ) : null}
        </div>

      </div>

      {/* Bottom navigation bar */}
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
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            style={{ minHeight: '44px' }}
            aria-label="Next page"
          >
            Flip
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => {
              const next = !autoPlay
              setAutoPlay(next)
              if (next) {
                if (isCover) {
                  goNext()
                } else if (!isSpeaking && activePage?.audioUrl) {
                  speakPage(activePage)
                }
              } else {
                stopSpeaking()
              }
            }}
            disabled={!hasAudio}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default ${
              autoPlay
                ? 'bg-amber-500 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            style={{ minHeight: '44px' }}
            aria-label={autoPlay ? 'Stop auto-play' : 'Start auto-play'}
          >
            {autoPlay ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            Auto
          </button>
        </div>
      </div>

      {/* Image lightbox */}
      {zoomImage && (
        <ImageLightbox
          src={zoomImage.src}
          alt={zoomImage.alt}
          onClose={() => setZoomImage(null)}
        />
      )}

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
