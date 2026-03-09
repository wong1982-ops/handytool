'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryBook, Page } from './types'
import { ImageLightbox } from './image-lightbox'
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'

interface BookViewerProps {
  book: StoryBook
  onEdit: () => void
  onStartOver: () => void
  readOnly?: boolean
  isOwner?: boolean
  onEditPage?: (sequence: number) => void
}

export function BookViewer({ book, onEdit, onStartOver, readOnly, isOwner, onEditPage }: BookViewerProps) {
  const isMobile = useMobileShell()
  const [currentPage, setCurrentPage] = useState(0) // 0 = cover
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const touchStartX = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoPlayRef = useRef(false)
  const noAudioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  const totalPages = book.pages.length
  const isCover = currentPage === 0
  const page = isCover ? null : book.pages[currentPage - 1]
  const activePage = page || book.pages[0] || null
  const hasAudio = !!activePage?.audioUrl

  // --- Navigation (desktop flip mode) ---

  const goTo = useCallback((target: number, dir: 'left' | 'right') => {
    if (target < 0 || target > totalPages) return
    setDirection(dir)
    setCurrentPage(target)
    setTimeout(() => setDirection(null), 300)
  }, [totalPages])

  const goNext = useCallback(() => goTo(currentPage + 1, 'right'), [currentPage, goTo])
  const goPrev = useCallback(() => goTo(currentPage - 1, 'left'), [currentPage, goTo])

  // Keyboard nav (desktop only)
  useEffect(() => {
    if (isMobile) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, isMobile])

  // Touch swipe (desktop flip mode only)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev() }
  }

  // --- Audio playback ---

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (noAudioTimerRef.current) { clearTimeout(noAudioTimerRef.current); noAudioTimerRef.current = null }
    setIsSpeaking(false)
  }, [])

  useEffect(() => { autoPlayRef.current = autoPlay }, [autoPlay])

  const autoAdvance = useCallback(() => {
    setCurrentPage(prev => {
      const next = prev + 1
      if (next > totalPages) { setAutoPlay(false); return prev }
      if (!isMobile) {
        setDirection('right')
        setTimeout(() => setDirection(null), 300)
      }
      // Mobile: scroll to next page
      if (isMobile) {
        setTimeout(() => {
          pageRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
      return next
    })
  }, [totalPages, isMobile])

  const speakPage = useCallback((targetPage: typeof page) => {
    // Clear any pending no-audio timer
    if (noAudioTimerRef.current) { clearTimeout(noAudioTimerRef.current); noAudioTimerRef.current = null }

    if (!targetPage?.audioUrl) {
      // No audio: pause for reading time (~5s) before advancing, don't instant-skip
      if (autoPlayRef.current) {
        noAudioTimerRef.current = setTimeout(() => {
          noAudioTimerRef.current = null
          if (autoPlayRef.current) autoAdvance()
        }, 5000)
      }
      return
    }
    setIsSpeaking(true)
    const onEnded = () => { setIsSpeaking(false); if (autoPlayRef.current) autoAdvance() }
    const audio = new Audio(targetPage.audioUrl)
    audioRef.current = audio
    audio.onended = onEnded
    audio.onerror = () => { setIsSpeaking(false); if (autoPlayRef.current) autoAdvance() }
    audio.play().catch(() => { setIsSpeaking(false); if (autoPlayRef.current) autoAdvance() })
  }, [autoAdvance])

  // On page change: stop current audio, auto-speak if autoPlay
  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
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
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
      if (noAudioTimerRef.current) { clearTimeout(noAudioTimerRef.current); noAudioTimerRef.current = null }
    }
  }, [])

  // --- Share ---
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }, [])

  // --- Auto-play toggle ---
  const toggleAutoPlay = useCallback(() => {
    const next = !autoPlay
    setAutoPlay(next)
    if (next) {
      if (isCover) {
        // Start from page 1
        setCurrentPage(1)
        if (isMobile) {
          setTimeout(() => pageRefs.current[1]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
        } else {
          setDirection('right')
          setTimeout(() => setDirection(null), 300)
        }
      } else if (!isSpeaking && activePage?.audioUrl) {
        speakPage(activePage)
      }
    } else {
      stopSpeaking()
    }
  }, [autoPlay, isCover, isSpeaking, activePage, speakPage, stopSpeaking, isMobile])

  const slideClass = direction === 'right' ? 'animate-slide-left' : direction === 'left' ? 'animate-slide-right' : ''

  // --- Rendering helpers ---

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

  const renderDialogue = (dialogue?: { speaker: string; line: string }[]) =>
    dialogue?.map((d, i) => (
      <p key={i} className="mt-3 text-base md:text-lg lg:text-xl text-slate-700 dark:text-slate-300 italic">
        &ldquo;{d.line}&rdquo; <span className="text-sm text-slate-500 not-italic">&mdash; {d.speaker}</span>
      </p>
    ))

  const renderCoverImage = () => {
    const src = book.coverImageUrl || book.pages[0]?.imageUrl
    if (src) {
      return (
        <>
          <img src={src} alt={`${book.title} cover`} className="w-full h-full object-cover object-center" />
          <button
            onClick={() => setZoomImage({ src, alt: `${book.title} cover` })}
            className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Zoom image"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
            </svg>
          </button>
        </>
      )
    }
    return (
      <div className="w-full h-full min-h-[30vh] md:min-h-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
        <svg className="w-16 h-16 text-indigo-200 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
    )
  }

  const renderCoverText = () => (
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
        {book.concept.tags.audience && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">{book.concept.tags.audience}</span>
        )}
        {book.concept.tags.style && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">{book.concept.tags.style}</span>
        )}
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">{totalPages} pages</span>
      </div>
      {book.concept.sections?.premise && (
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">{book.concept.sections.premise}</p>
      )}
    </div>
  )

  const renderPageImage = (p: Page) => {
    if (!p.imageUrl) return null
    return (
      <div className="relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
        <img src={p.imageUrl} alt={p.sceneDescription} className="w-full object-cover object-center" />
        <button
          onClick={() => setZoomImage({ src: p.imageUrl!, alt: p.sceneDescription })}
          className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Zoom image"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
          </svg>
        </button>
      </div>
    )
  }

  // --- Controls bar (shared between mobile & desktop) ---

  const renderControls = () => (
    <div className={`flex items-center justify-between ${isMobile ? 'sticky bottom-0 z-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-3 -mx-4' : 'mt-4'}`}>
      <span className="text-sm text-slate-400 dark:text-slate-500">
        {isMobile
          ? (isSpeaking ? `Playing page ${currentPage} of ${totalPages}` : `${totalPages} pages`)
          : (isCover ? 'Cover' : `Page ${currentPage} of ${totalPages}`)}
      </span>
      <div className="flex items-center gap-2">
        {/* Prev / Flip — desktop only */}
        {!isMobile && (
          <>
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
          </>
        )}

        {/* Auto-play */}
        <button
          onClick={toggleAutoPlay}
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
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
          Auto
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

        {/* Share / copy link */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
          aria-label="Copy share link"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374" />
              </svg>
              Share
            </>
          )}
        </button>
      </div>
    </div>
  )

  // =============================================
  // MOBILE: Scroll layout
  // =============================================
  if (isMobile) {
    return (
      <div>
        {/* Top toolbar */}
        {!readOnly && (
          <div className="flex items-center justify-end gap-2 mb-4">
            <button onClick={onEdit} className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" style={{ minHeight: '44px' }}>Edit</button>
            <button onClick={onStartOver} className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" style={{ minHeight: '44px' }}>Start Over</button>
          </div>
        )}

        {/* Scrollable pages */}
        <div className="space-y-5 pb-20">
          {/* Cover */}
          <div ref={el => { pageRefs.current[0] = el }} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className="relative bg-slate-100 dark:bg-slate-800/50">
              {renderCoverImage()}
            </div>
            {renderCoverText()}
          </div>

          {/* Pages */}
          {book.pages.map((p, i) => (
            <div key={p.sequence}>
              {/* Page break divider */}
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Page {i + 1} of {totalPages}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Page card */}
              <div
                ref={el => { pageRefs.current[i + 1] = el }}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden scroll-mt-16"
              >
                {renderPageImage(p)}
                <div className="p-5">
                  {renderNarrative(p.narrativeText)}
                  {renderDialogue(p.dialogue)}
                  {isOwner && onEditPage && (
                    <button
                      onClick={() => onEditPage(p.sequence)}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      style={{ minHeight: '44px' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Edit Page
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky bottom controls */}
        {renderControls()}

        {/* Image lightbox */}
        {zoomImage && <ImageLightbox src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)} />}
      </div>
    )
  }

  // =============================================
  // DESKTOP: Flip-page layout
  // =============================================
  return (
    <div>
      {/* Top toolbar */}
      {!readOnly && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <button onClick={onEdit} className="px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" style={{ minHeight: '44px' }}>Edit</button>
          <button onClick={onStartOver} className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" style={{ minHeight: '44px' }}>Start Over</button>
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
              <div className="md:w-[60%] shrink-0 relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                {renderCoverImage()}
              </div>
              {renderCoverText()}
            </div>
          ) : page ? (
            page.imageUrl ? (
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-[60%] shrink-0 relative bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                  <img src={page.imageUrl} alt={page.sceneDescription} className="w-full h-full object-cover object-center" />
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
                  {renderDialogue(page.dialogue)}
                  {isOwner && onEditPage && (
                    <button
                      onClick={() => onEditPage(page.sequence)}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      style={{ minHeight: '44px' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Edit Page
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center px-6 py-10 md:px-16 lg:px-24">
                <div className="max-w-2xl w-full">
                  <div className="text-center mb-6">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-300 dark:text-slate-600">Page {page.sequence}</span>
                  </div>
                  {renderNarrative(page.narrativeText)}
                  {renderDialogue(page.dialogue)}
                  {isOwner && onEditPage && (
                    <button
                      onClick={() => onEditPage(page.sequence)}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      style={{ minHeight: '44px' }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Edit Page
                    </button>
                  )}
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
      {renderControls()}

      {/* Image lightbox */}
      {zoomImage && <ImageLightbox src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)} />}

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
