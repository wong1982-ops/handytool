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
  const [isPlaying, setIsPlaying] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const touchStartX = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playingPageRef = useRef(0)

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

  // Stop all audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis.cancel()
    setIsPlaying(false)
  }, [])

  // Play a single page using MP3/WAV or Speech API fallback
  const playPage = useCallback((pageIndex: number) => {
    const p = book.pages[pageIndex - 1]
    if (!p) {
      setIsPlaying(false)
      return
    }

    playingPageRef.current = pageIndex

    const onEnded = () => {
      const nextPage = pageIndex + 1
      if (nextPage <= totalPages) {
        goTo(nextPage, 'right')
        setTimeout(() => playPage(nextPage), 400)
      } else {
        setIsPlaying(false)
      }
    }

    // Prefer stored audio
    if (p.audioUrl) {
      const audio = new Audio(p.audioUrl)
      audioRef.current = audio
      audio.onended = onEnded
      audio.onerror = () => {
        speakPageFallback(p.narrativeText, p.dialogue, onEnded)
      }
      audio.play().catch(() => {
        speakPageFallback(p.narrativeText, p.dialogue, onEnded)
      })
    } else {
      speakPageFallback(p.narrativeText, p.dialogue, onEnded)
    }
  }, [book.pages, totalPages, goTo])

  const speakPageFallback = (narrativeText: string, dialogue: { speaker: string; line: string }[] | undefined, onEnd: () => void) => {
    let text = narrativeText
    if (dialogue?.length) {
      text += '. ' + dialogue.map(d => `${d.speaker} says: ${d.line}`).join('. ')
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.onend = onEnd
    window.speechSynthesis.speak(utterance)
  }

  const toggleTTS = useCallback(() => {
    if (isPlaying) {
      stopAudio()
    } else {
      setIsPlaying(true)
      const startPage = currentPage === 0 ? 1 : currentPage
      if (currentPage === 0) {
        goTo(1, 'right')
      }
      setTimeout(() => playPage(startPage), currentPage === 0 ? 400 : 0)
    }
  }, [isPlaying, currentPage, stopAudio, playPage, goTo])

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.speechSynthesis.cancel()
    }
  }, [])

  // Stop audio when manually navigating during playback
  useEffect(() => {
    if (isPlaying && currentPage !== playingPageRef.current && currentPage !== 0) {
      stopAudio()
    }
  }, [currentPage, isPlaying, stopAudio])

  const slideClass = direction === 'right'
    ? 'animate-slide-left'
    : direction === 'left'
      ? 'animate-slide-right'
      : ''

  // Render drop cap for narrative text
  const renderNarrative = (text: string) => {
    if (!text || text.length < 2) return <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 leading-relaxed">{text}</p>
    const firstChar = text[0]
    const rest = text.slice(1)
    return (
      <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
        <span className="float-left text-5xl md:text-6xl font-bold leading-[0.8] mr-2 mt-1 text-purple-600 dark:text-purple-400">{firstChar}</span>
        {rest}
      </p>
    )
  }

  return (
    <div>
      {/* Top toolbar — readOnly hides edit actions, shows auto-play toggle style */}
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
        className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`transition-transform duration-300 ${slideClass}`}>
          {isCover ? (
            /* Cover page */
            <div className="p-6 md:p-10 text-center">
              {book.pages[0]?.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={book.pages[0].imageUrl}
                    alt="Book cover"
                    className="w-full h-auto max-h-[400px] object-cover"
                  />
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                {book.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {book.concept.tags.audience} &middot; {book.concept.tags.style}
              </p>
            </div>
          ) : page ? (
            /* Content page — split layout on desktop */
            <div className="flex flex-col md:flex-row">
              {page.imageUrl && (
                <div className="md:w-2/5 shrink-0">
                  <img
                    src={page.imageUrl}
                    alt={page.sceneDescription}
                    className="w-full h-56 md:h-full object-cover"
                  />
                </div>
              )}
              <div className={`flex-1 p-5 md:p-8 ${page.imageUrl ? '' : 'md:p-10'}`}>
                {renderNarrative(page.narrativeText)}
                {page.dialogue?.map((d, i) => (
                  <p key={i} className="mt-3 text-base md:text-lg text-slate-700 dark:text-slate-300 italic">
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

      {/* Narration bar — sticky bottom, like the design */}
      <div className="mt-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Narration
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (currentPage > 1) { goTo(currentPage - 1, 'left') } }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Previous track"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              onClick={toggleTTS}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
              aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => { if (currentPage < totalPages) { goTo(currentPage + 1, 'right') } }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Next track"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Read Aloud
          </span>
          <button
            onClick={toggleTTS}
            className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-purple-500'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={isPlaying}
            aria-label="Toggle read aloud"
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              isPlaying ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`} />
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
