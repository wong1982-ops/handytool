'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageProvider, useLanguage } from '@/tools/story-studio/use-language-context'
import { ImageLightbox } from '@/tools/story-studio/image-lightbox'
import MobilePageCard from '@/tools/story-studio/mobile/mobile-page-card'
import MobileReaderControls from '@/tools/story-studio/mobile/mobile-reader-controls'
import type { StoryBook, Page } from '@/tools/story-studio/types'

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

export interface MobileReaderProps {
  book: StoryBook
  isOwner?: boolean
  onEditPage?: (sequence: number) => void
  totalPages?: number
  onPageChange?: (page: number) => void
}

// ---------------------------------------------------------------------------
// Outer shell — provides language context
// ---------------------------------------------------------------------------

export function MobileReader(props: MobileReaderProps) {
  return (
    <LanguageProvider>
      <ReaderInner {...props} />
    </LanguageProvider>
  )
}

// ---------------------------------------------------------------------------
// Inner reader — actual logic
// ---------------------------------------------------------------------------

function ReaderInner({
  book,
  isOwner = false,
  onEditPage,
  onPageChange,
}: MobileReaderProps) {
  const router = useRouter()
  const { t } = useLanguage()

  // ------------------------------------------------------------------
  // Page state (0 = cover, 1..N = content pages)
  // ------------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(0)

  const contentPages = book.pages
  const totalContentPages = contentPages.length

  // Synthetic cover Page object
  const coverPage: Page = {
    sequence: 0,
    imageUrl: book.coverImageUrl ?? book.pages[0]?.imageUrl,
    sceneDescription: book.title,
    narrativeText: '',
    mood: '',
    imagePrompt: '',
    imageStatus: book.coverImageUrl ? 'done' : (book.pages[0]?.imageStatus ?? 'pending'),
  }

  // Currently displayed Page object
  const activePage: Page =
    currentPage === 0 ? coverPage : contentPages[currentPage - 1] ?? coverPage

  // ------------------------------------------------------------------
  // Navigation helpers
  // ------------------------------------------------------------------
  const goNext = useCallback(() => {
    setCurrentPage((prev) => {
      const next = Math.min(prev + 1, totalContentPages)
      onPageChange?.(next)
      return next
    })
  }, [totalContentPages, onPageChange])

  const goPrev = useCallback(() => {
    setCurrentPage((prev) => {
      const next = Math.max(prev - 1, 0)
      onPageChange?.(next)
      return next
    })
  }, [onPageChange])

  // ------------------------------------------------------------------
  // Top-bar auto-hide
  // ------------------------------------------------------------------
  const [topBarVisible, setTopBarVisible] = useState(true)

  const handleCenterTap = useCallback(() => {
    setTopBarVisible((v) => !v)
  }, [])

  // ------------------------------------------------------------------
  // Swipe handling
  // ------------------------------------------------------------------
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current
      const dy = e.changedTouches[0].clientY - touchStartY.current
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      // Must be horizontal, > 50px, and more horizontal than vertical * 1.5
      if (absDx > 50 && absDx > absDy * 1.5) {
        if (dx < 0) {
          goNext()
        } else {
          goPrev()
        }
      }
    },
    [goNext, goPrev],
  )

  // ------------------------------------------------------------------
  // Keyboard navigation (desktop testing)
  // ------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  // ------------------------------------------------------------------
  // Audio playback
  // ------------------------------------------------------------------
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  const playCurrentPage = useCallback(() => {
    stopAudio()
    const page = currentPage === 0 ? null : contentPages[currentPage - 1]
    if (!page?.audioUrl) return

    const audio = new Audio(page.audioUrl)
    audioRef.current = audio
    audio.play().catch(() => {
      setIsPlaying(false)
      setAutoPlay(false)
    })
    audio.addEventListener('ended', () => {
      if (autoPlay) {
        goNext()
      } else {
        setIsPlaying(false)
      }
    })
  }, [currentPage, contentPages, autoPlay, stopAudio, goNext])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      stopAudio()
      setIsPlaying(false)
      setAutoPlay(false)
    } else {
      // Start
      setAutoPlay(true)
      setIsPlaying(true)
      // If on cover, advance to page 1 first
      if (currentPage === 0) {
        setCurrentPage(1)
        onPageChange?.(1)
      } else {
        playCurrentPage()
      }
    }
  }, [isPlaying, currentPage, stopAudio, playCurrentPage, onPageChange])

  // When autoPlay is on and page changes (> 0), play after 400ms
  useEffect(() => {
    if (!autoPlay || currentPage === 0) return
    const timer = setTimeout(() => {
      playCurrentPage()
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, currentPage])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [stopAudio])

  // Check if current page has audio
  const hasAudio =
    currentPage > 0
      ? Boolean(contentPages[currentPage - 1]?.audioUrl)
      : false

  // ------------------------------------------------------------------
  // Lightbox
  // ------------------------------------------------------------------
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const openLightbox = useCallback(() => {
    if (activePage.imageUrl) setLightboxSrc(activePage.imageUrl)
  }, [activePage.imageUrl])

  const closeLightbox = useCallback(() => setLightboxSrc(null), [])

  // ------------------------------------------------------------------
  // Long-press edit
  // ------------------------------------------------------------------
  const handleTextLongPress = useCallback(() => {
    if (isOwner && currentPage > 0) {
      onEditPage?.(activePage.sequence)
    }
  }, [isOwner, currentPage, onEditPage, activePage.sequence])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const truncatedTitle =
    book.title.length > 28 ? book.title.slice(0, 26) + '…' : book.title

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col">

      {/* ----------------------------------------------------------------
          Top bar (auto-hiding)
      ---------------------------------------------------------------- */}
      <div
        className={[
          'absolute inset-x-0 top-0 z-20',
          'transition-transform duration-300',
          topBarVisible ? 'translate-y-0' : '-translate-y-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] pb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex items-center justify-center w-11 h-11 -ml-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Book title */}
          <h1 className="flex-1 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 truncate px-2">
            {truncatedTitle}
          </h1>

          {/* More (⋯) menu button */}
          <button
            type="button"
            aria-label="More options"
            className="flex items-center justify-center w-11 h-11 -mr-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------
          Page content area (swipeable)
      ---------------------------------------------------------------- */}
      <div
        className="flex-1 min-h-0 pb-16"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleCenterTap}
        role="main"
        aria-label={t.viewer.cover}
      >
        <MobilePageCard
          page={activePage}
          isCover={currentPage === 0}
          title={currentPage === 0 ? book.title : undefined}
          authors={currentPage === 0 ? book.authors : undefined}
          premise={currentPage === 0 ? book.concept.sections.premise : undefined}
          onImageTap={activePage.imageUrl ? openLightbox : undefined}
          onTextLongPress={isOwner && currentPage > 0 ? handleTextLongPress : undefined}
        />
      </div>

      {/* ----------------------------------------------------------------
          Bottom controls bar
      ---------------------------------------------------------------- */}
      <MobileReaderControls
        currentPage={currentPage}
        totalPages={totalContentPages}
        hasAudio={hasAudio}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onShare={() => {/* handled inside MobileReaderControls */}}
      />

      {/* ----------------------------------------------------------------
          Image lightbox
      ---------------------------------------------------------------- */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={activePage.sceneDescription}
          onClose={closeLightbox}
        />
      )}
    </div>
  )
}
