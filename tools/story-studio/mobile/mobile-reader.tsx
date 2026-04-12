'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageProvider, useLanguage } from '@/tools/story-studio/use-language-context'
import { ImageLightbox } from '@/tools/story-studio/image-lightbox'
import MobilePageCard from '@/tools/story-studio/mobile/mobile-page-card'
import MobileReaderControls from '@/tools/story-studio/mobile/mobile-reader-controls'
import MobileEditDrawer from '@/tools/story-studio/mobile/mobile-edit-drawer'
import type { StoryBook, Page } from '@/tools/story-studio/types'

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------

export interface MobileReaderProps {
  book: StoryBook
  bookId?: string
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
  bookId,
  isOwner = false,
  onEditPage,
  totalPages: totalPagesProp,
  onPageChange,
}: MobileReaderProps) {
  const router = useRouter()
  const { t, language } = useLanguage()

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
  const [menuOpen, setMenuOpen] = useState(false)

  const handleCenterTap = useCallback(() => {
    if (menuOpen) { setMenuOpen(false); return }
    setTopBarVisible((v) => !v)
  }, [menuOpen])

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
  const autoPlayRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)

  // Keep ref in sync for use inside audio event handlers
  useEffect(() => { autoPlayRef.current = autoPlay }, [autoPlay])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const playCurrentPage = useCallback(() => {
    stopAudio()
    const page = currentPage === 0 ? null : contentPages[currentPage - 1]
    if (!page?.audioUrl) {
      // No audio: if auto-playing, advance after 3s pause
      if (autoPlayRef.current && currentPage < totalContentPages) {
        setTimeout(() => {
          if (autoPlayRef.current) goNext()
        }, 3000)
      }
      return
    }

    setIsPlaying(true)
    const audio = new Audio(page.audioUrl)
    audioRef.current = audio
    audio.play().catch(() => {
      setIsPlaying(false)
      setAutoPlay(false)
    })
    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      if (autoPlayRef.current && currentPage < totalContentPages) {
        goNext()
      }
    })
  }, [currentPage, contentPages, totalContentPages, stopAudio, goNext])

  const togglePlay = useCallback(() => {
    if (isPlaying || autoPlay) {
      // Pause
      stopAudio()
      setAutoPlay(false)
    } else {
      // Start
      setAutoPlay(true)
      // If on cover, advance to page 1 first
      if (currentPage === 0) {
        setCurrentPage(1)
        onPageChange?.(1)
      } else {
        playCurrentPage()
      }
    }
  }, [isPlaying, autoPlay, currentPage, stopAudio, playCurrentPage, onPageChange])

  // When autoPlay is on and page changes (> 0), play after 400ms
  useEffect(() => {
    if (!autoPlay || currentPage === 0) return
    const timer = setTimeout(() => {
      playCurrentPage()
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, currentPage])

  // Lock body scroll while reader is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [stopAudio])

  // Check if any page has audio (for enabling play button)
  const hasAnyAudio = contentPages.some((p) => Boolean(p.audioUrl))
  const hasAudio = hasAnyAudio
  // Check if book has illustrations/narration (for ⋯ menu)
  const hasIllustrations = contentPages.some((p) => Boolean(p.imageUrl))
  const hasNarration = hasAnyAudio

  // ------------------------------------------------------------------
  // Lightbox
  // ------------------------------------------------------------------
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [editingSequence, setEditingSequence] = useState<number | null>(null)

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
    <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col">

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
          <div className="relative">
            <button
              type="button"
              aria-label="More options"
              aria-expanded={menuOpen}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
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

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-10">
                <a
                  href="/tools/story-studio"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  <svg className="w-4 h-4 text-[#3D6AF2]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {language === 'zh' ? '创建新故事' : 'Create Your Own Story'}
                </a>
                {isOwner && bookId && currentPage > 0 && (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setEditingSequence(activePage!.sequence) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                    </svg>
                    {language === 'zh' ? '编辑此页' : 'Edit This Page'}
                  </button>
                )}
                {/* Bulk generate options for owners */}
                {isOwner && bookId && !hasIllustrations && (
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false)
                      await fetch(`/api/v1/story/books/${bookId}/bulk-illustrate`, { method: 'POST' })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4 text-[#3D6AF2]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                    {language === 'zh' ? '添加插画' : 'Add Illustrations'}
                  </button>
                )}
                {isOwner && bookId && !hasNarration && (
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false)
                      await fetch(`/api/v1/story/books/${bookId}/bulk-narrate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ narrationLanguage: language }),
                      })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                    {language === 'zh' ? '添加配音' : 'Add Narration'}
                  </button>
                )}
              </div>
            )}
          </div>
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
        onPrev={goPrev}
        onNext={goNext}
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

      {/* Edit drawer */}
      {editingSequence !== null && bookId && (() => {
        const editPage = contentPages.find(p => p.sequence === editingSequence)
        if (!editPage) return null
        return (
          <MobileEditDrawer
            open={true}
            onClose={() => setEditingSequence(null)}
            page={editPage}
            pageNumber={editingSequence}
            totalPages={totalContentPages}
            bookId={bookId}
            onSave={() => setEditingSequence(null)}
          />
        )
      })()}
    </div>
  )
}
