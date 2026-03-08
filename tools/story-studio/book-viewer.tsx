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
        // Fallback to Speech API
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTTS}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
            aria-label={isPlaying ? 'Stop reading' : 'Read aloud'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {isPlaying ? 'Pause' : 'Read Aloud'}
          </button>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
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
      </div>

      {/* Book */}
      <div
        className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`transition-transform duration-300 ${slideClass}`}>
          {isCover ? (
            <div className="p-6 md:p-10 text-center">
              {book.pages[0]?.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={book.pages[0].imageUrl}
                    alt="Book cover"
                    className="w-full h-auto max-h-[400px] object-cover"
                  />
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {book.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {book.concept.tags.audience} &middot; {book.concept.tags.style}
              </p>
            </div>
          ) : page ? (
            <div>
              {page.imageUrl && (
                <div className="w-full">
                  <img
                    src={page.imageUrl}
                    alt={page.sceneDescription}
                    className="w-full h-auto max-h-[400px] object-cover"
                  />
                </div>
              )}
              <div className="p-5 md:p-8">
                <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
                  {page.narrativeText}
                </p>
                {page.dialogue?.map((d, i) => (
                  <p key={i} className="mt-3 text-base md:text-lg text-slate-700 dark:text-slate-300 italic">
                    &ldquo;{d.line}&rdquo; <span className="text-sm text-slate-500 not-italic">— {d.speaker}</span>
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Navigation arrows */}
        {currentPage > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 dark:hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        {currentPage < totalPages && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 dark:hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Page indicator */}
      <div className="text-center mt-3 text-sm text-slate-400 dark:text-slate-500">
        {isCover ? 'Cover' : `${currentPage} / ${totalPages}`}
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
