# Story Studio Mobile Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-optimized UI for Story Studio with chat-style creation, fullscreen swipe reader, and bottom-sheet editor — sharing the existing data/API layer with an unchanged desktop UI.

**Architecture:** New mobile components in `tools/story-studio/mobile/`, conditionally rendered via `useMobileShell()` (767px breakpoint). Desktop components untouched. All hooks, APIs, types, and i18n shared.

**Tech Stack:** React 19, Next.js 16 App Router, Tailwind CSS v4, framer-motion (existing), existing BottomSheet component, existing hooks/API layer.

---

## File Structure

```
tools/story-studio/mobile/           ← All new files
├── mobile-home.tsx                  — Home page: input bar + examples + bookshelf grid
├── mobile-reader.tsx                — Fullscreen swipe page reader
├── mobile-page-card.tsx             — Single page layout (image + text) used by reader
├── mobile-cover-grid.tsx            — 2-column bookshelf cover grid
├── mobile-progress.tsx              — Fullscreen generation progress screen
├── mobile-settings-panel.tsx        — Collapsible settings panel (style/language/pages)
├── mobile-edit-drawer.tsx           — Bottom sheet editor with 3 tabs (text/illustration/narration)
└── mobile-reader-controls.tsx       — Reader bottom bar (dots + play + share)

tools/story-studio/i18n/en.ts        ← Add mobile-specific i18n keys
tools/story-studio/i18n/zh.ts        ← Add mobile-specific i18n keys

app/tools/story-studio/page.tsx      ← Add isMobile branch
app/tools/story-studio/book/[slug]/
  └── book-reader-client.tsx         ← Add isMobile branch
```

---

### Task 1: Mobile Page Card Component

The atomic unit of the reader — renders one story page (image top + text bottom).

**Files:**
- Create: `tools/story-studio/mobile/mobile-page-card.tsx`

- [ ] **Step 1: Create mobile-page-card component**

```tsx
// tools/story-studio/mobile/mobile-page-card.tsx
'use client'

import Image from 'next/image'
import type { Page } from '@/tools/story-studio/types'

interface MobilePageCardProps {
  page: Page
  isCover?: boolean
  title?: string
  authors?: string[]
  premise?: string
  onImageTap?: () => void
  onTextLongPress?: () => void
}

export function MobilePageCard({
  page, isCover, title, authors, premise, onImageTap, onTextLongPress,
}: MobilePageCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onTextLongPress?.()
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  // Cover page: full-bleed image with overlay
  if (isCover) {
    return (
      <div className="h-full flex flex-col">
        <div className="relative flex-1 min-h-0">
          {page.imageUrl ? (
            <Image
              src={page.imageUrl}
              alt={title || ''}
              fill
              className="object-cover"
              priority
              onClick={onImageTap}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
              <svg className="w-16 h-16 text-indigo-200 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Title overlay */}
          <div className="absolute bottom-0 inset-x-0 p-6">
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}
            >
              {title}
            </h1>
            {authors && authors.length > 0 && (
              <p className="text-sm text-white/70 italic">{authors.join(' & ')}</p>
            )}
          </div>
        </div>
        {premise && (
          <div className="px-5 py-4 bg-white dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
              {premise}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Content page: image top 60% + text bottom 40%
  return (
    <div className="h-full flex flex-col">
      {page.imageUrl ? (
        <div className="relative h-[60%] shrink-0" onClick={onImageTap}>
          <Image
            src={page.imageUrl}
            alt={page.sceneDescription || ''}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-[20%] shrink-0" /> // spacer for text-only pages
      )}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 bg-white dark:bg-slate-900"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <p
          className="text-base text-slate-900 dark:text-slate-100 leading-[1.8]"
          style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}
        >
          {page.narrativeText}
        </p>
        {page.dialogue?.map((d, i) => (
          <div key={i} className="mt-3 pl-4 border-l-2 border-amber-400/50">
            <p className="text-base text-slate-800 dark:text-slate-200 italic leading-[1.7]" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
              &ldquo;{d.line}&rdquo;
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-amber-700/70 dark:text-amber-400/70">
              &mdash; {d.speaker}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-page-card.tsx
git commit -m "feat(mobile): add MobilePageCard component for reader pages"
```

---

### Task 2: Mobile Reader Controls (Bottom Bar)

The always-visible bottom bar with dot indicators, play button, and share.

**Files:**
- Create: `tools/story-studio/mobile/mobile-reader-controls.tsx`

- [ ] **Step 1: Create reader controls component**

```tsx
// tools/story-studio/mobile/mobile-reader-controls.tsx
'use client'

import { useState, useCallback } from 'react'
import { useLanguage } from '@/tools/story-studio/use-language-context'

interface MobileReaderControlsProps {
  currentPage: number     // 0 = cover
  totalPages: number
  hasAudio: boolean
  isPlaying: boolean
  onTogglePlay: () => void
  onShare: () => void
}

export function MobileReaderControls({
  currentPage, totalPages, hasAudio, isPlaying, onTogglePlay, onShare,
}: MobileReaderControlsProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
    onShare()
  }, [onShare])

  // Show max 7 dots, collapse middle ones for long books
  const maxDots = 7
  const dots = totalPages + 1 // +1 for cover
  const showCollapsed = dots > maxDots

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200/60 dark:border-slate-800/60 px-4 py-3 safe-area-bottom">
      <div className="flex items-center justify-between">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {showCollapsed ? (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tabular-nums">
              {currentPage === 0 ? t.viewer.cover : `${currentPage} / ${totalPages}`}
            </span>
          ) : (
            Array.from({ length: dots }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === currentPage
                    ? 'w-2.5 h-2.5 bg-[#3D6AF2]'
                    : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            disabled={!hasAudio}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default bg-[#3D6AF2] text-white"
            style={{ minHeight: '44px' }}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
            {isPlaying ? '暂停' : '播放'}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-reader-controls.tsx
git commit -m "feat(mobile): add MobileReaderControls bottom bar"
```

---

### Task 3: Mobile Reader (Fullscreen Swipe)

The core reading experience — fullscreen left/right swipe page reader.

**Files:**
- Create: `tools/story-studio/mobile/mobile-reader.tsx`

- [ ] **Step 1: Create mobile reader component**

```tsx
// tools/story-studio/mobile/mobile-reader.tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MobilePageCard } from './mobile-page-card'
import { MobileReaderControls } from './mobile-reader-controls'
import { LanguageProvider, useLanguage } from '@/tools/story-studio/use-language-context'
import { ImageLightbox } from '@/tools/story-studio/image-lightbox'
import type { StoryBook, Page } from '@/tools/story-studio/types'

interface MobileReaderProps {
  book: StoryBook
  isOwner?: boolean
  onEditPage?: (sequence: number) => void
  /** Total page count (when pages are lazy-loaded) */
  totalPages?: number
  /** Called when user navigates to a new page */
  onPageChange?: (page: number) => void
}

function ReaderInner({
  book, isOwner, onEditPage, totalPages: totalPagesProp, onPageChange,
}: MobileReaderProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const totalPages = totalPagesProp ?? book.pages.length
  const [currentPage, setCurrentPage] = useState(0) // 0 = cover
  const [topBarVisible, setTopBarVisible] = useState(true)
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const page = currentPage === 0 ? null : book.pages[currentPage - 1]
  const hasAudio = !!(page?.audioUrl || book.pages.some(p => p.audioUrl))

  // Swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    // Only horizontal swipe (ignore vertical scrolling)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0 && currentPage < totalPages) {
        // Swipe left → next page
        setCurrentPage(p => p + 1)
        onPageChange?.(currentPage + 1)
      } else if (dx < 0 && currentPage > 0) {
        // Swipe right → prev page
        setCurrentPage(p => p - 1)
        onPageChange?.(currentPage - 1)
      }
    }
  }, [currentPage, totalPages, onPageChange])

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage(p => p + 1)
        onPageChange?.(currentPage + 1)
      }
      if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage(p => p - 1)
        onPageChange?.(currentPage - 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentPage, totalPages, onPageChange])

  // Audio playback
  const playCurrentPage = useCallback(() => {
    const p = currentPage > 0 ? book.pages[currentPage - 1] : null
    if (!p?.audioUrl) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setIsPlaying(true)
    const audio = new Audio(p.audioUrl)
    audioRef.current = audio
    audio.onended = () => {
      setIsPlaying(false)
      if (autoPlay && currentPage < totalPages) {
        setCurrentPage(prev => prev + 1)
        onPageChange?.(currentPage + 1)
      }
    }
    audio.onerror = () => setIsPlaying(false)
    audio.play().catch(() => setIsPlaying(false))
  }, [currentPage, book.pages, autoPlay, totalPages, onPageChange])

  // Auto-play: play audio when page changes
  useEffect(() => {
    if (autoPlay && currentPage > 0) {
      const timer = setTimeout(() => playCurrentPage(), 400)
      return () => clearTimeout(timer)
    }
  }, [currentPage, autoPlay, playCurrentPage])

  // Cleanup
  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null } }
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlaying(false)
      setAutoPlay(false)
    } else {
      setAutoPlay(true)
      if (currentPage === 0) {
        setCurrentPage(1)
        onPageChange?.(1)
      } else {
        playCurrentPage()
      }
    }
  }, [isPlaying, currentPage, playCurrentPage, onPageChange])

  // Toggle top bar on center tap
  const handleCenterTap = useCallback(() => {
    setTopBarVisible(v => !v)
  }, [])

  // Build page data for cover
  const coverPage: Page = {
    sequence: 0,
    sceneDescription: '',
    narrativeText: '',
    mood: '',
    imagePrompt: '',
    imageUrl: book.coverImageUrl || book.pages[0]?.imageUrl,
    imageStatus: 'done' as const,
  }

  const activePage = currentPage === 0 ? coverPage : book.pages[currentPage - 1]
  if (!activePage) return null

  return (
    <div
      className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Auto-hiding top bar */}
      <div className={`absolute top-0 inset-x-0 z-40 transition-transform duration-300 ${topBarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm safe-area-top">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[60%]">
            {book.title}
          </h1>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full text-slate-500 dark:text-slate-400 cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Page content — tappable center toggles top bar */}
      <div className="flex-1 min-h-0" onClick={handleCenterTap}>
        <MobilePageCard
          page={activePage}
          isCover={currentPage === 0}
          title={book.title}
          authors={book.authors}
          premise={book.concept?.sections?.premise}
          onImageTap={() => {
            if (activePage.imageUrl) setZoomImage({ src: activePage.imageUrl, alt: activePage.sceneDescription || book.title })
          }}
          onTextLongPress={() => {
            if (isOwner && onEditPage && currentPage > 0) onEditPage(activePage.sequence)
          }}
        />
      </div>

      {/* Bottom controls */}
      <MobileReaderControls
        currentPage={currentPage}
        totalPages={totalPages}
        hasAudio={hasAudio}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onShare={() => {}}
      />

      {/* Lightbox */}
      {zoomImage && <ImageLightbox src={zoomImage.src} alt={zoomImage.alt} onClose={() => setZoomImage(null)} />}
    </div>
  )
}

export function MobileReader(props: MobileReaderProps) {
  return (
    <LanguageProvider>
      <ReaderInner {...props} />
    </LanguageProvider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-reader.tsx
git commit -m "feat(mobile): add MobileReader fullscreen swipe reader"
```

---

### Task 4: Wire Mobile Reader into Book Page

Connect the mobile reader to the existing book page route.

**Files:**
- Modify: `app/tools/story-studio/book/[slug]/book-reader-client.tsx`

- [ ] **Step 1: Add mobile branch to BookReaderClient**

At the top of the file, add the import:

```tsx
import { MobileReader } from '@/tools/story-studio/mobile/mobile-reader'
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'
```

Inside the `BookReaderClient` function, right before the existing `return (` statement (around line 134), add the mobile branch:

```tsx
  const isMobile = useMobileShell()

  if (isMobile) {
    return (
      <LanguageProvider>
        <MobileReader
          book={book}
          isOwner={isOwner}
          onEditPage={isOwner && bookId ? (sequence) => setEditingPage(sequence) : undefined}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      </LanguageProvider>
    )
  }
```

The existing desktop `return (...)` stays as-is after this block.

- [ ] **Step 2: Test on mobile viewport**

Open `http://localhost:3000/tools/story-studio/book/three-monks-one-happy-temple-ffl4w5` with mobile viewport (390x844). Verify:
- Fullscreen reader appears (not desktop scroll layout)
- Swipe left/right works
- Cover page shows title overlay
- Bottom controls bar visible

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/book/[slug]/book-reader-client.tsx
git commit -m "feat(mobile): wire MobileReader into book page route"
```

---

### Task 5: Mobile Cover Grid

The 2-column bookshelf grid showing book covers with long-press actions.

**Files:**
- Create: `tools/story-studio/mobile/mobile-cover-grid.tsx`

- [ ] **Step 1: Create cover grid component**

```tsx
// tools/story-studio/mobile/mobile-cover-grid.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { StoryItem } from '@/tools/story-studio/use-stories-list'
import type { JobProgress } from '@/tools/story-studio/use-job-progress'
import { useLanguage } from '@/tools/story-studio/use-language-context'

interface MobileCoverGridProps {
  stories: StoryItem[]
  activeJobs?: JobProgress[]
  onDelete?: (id: string) => void
  onToggleShare?: (id: string, isPublic: boolean) => void
}

export function MobileCoverGrid({ stories, activeJobs, onDelete, onToggleShare }: MobileCoverGridProps) {
  const { t } = useLanguage()
  const [menuId, setMenuId] = useState<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const handleTouchStart = useCallback((id: string) => {
    longPressTimer.current = setTimeout(() => setMenuId(id), 500)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }, [])

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {/* In-progress jobs */}
        {activeJobs?.map(({ job, percent }) => (
          <div key={job.id} className="relative aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Circular progress */}
              <svg className="w-12 h-12" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
                  className="text-[#3D6AF2]"
                  strokeDasharray={`${percent * 1.256} 125.6`}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <span className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{percent}%</span>
              <span className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[80%] text-center">{job.title}</span>
            </div>
          </div>
        ))}

        {/* Completed stories */}
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/tools/story-studio/book/${story.slug}`}
            className="relative aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden group"
            onTouchStart={() => handleTouchStart(story.id)}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {story.coverImageUrl ? (
              <Image
                src={story.coverImageUrl}
                alt={story.title}
                fill
                sizes="50vw"
                className="object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            )}
            {/* Title overlay at bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-2 pt-6">
              <p className="text-xs font-medium text-white truncate">{story.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Long-press action menu */}
      {menuId && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setMenuId(null)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-slate-800 rounded-t-2xl p-4 pb-8 safe-area-bottom">
            <div className="w-9 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-4" />
            <button
              onClick={() => { onToggleShare?.(menuId, true); setMenuId(null) }}
              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              {t.storyCard.makePublic}
            </button>
            <button
              onClick={() => { onDelete?.(menuId); setMenuId(null) }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              {t.common.delete}
            </button>
          </div>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-cover-grid.tsx
git commit -m "feat(mobile): add MobileCoverGrid bookshelf component"
```

---

### Task 6: Mobile Settings Panel

Collapsible settings (art style, language, page count) that expands above the input bar.

**Files:**
- Create: `tools/story-studio/mobile/mobile-settings-panel.tsx`

- [ ] **Step 1: Create settings panel component**

```tsx
// tools/story-studio/mobile/mobile-settings-panel.tsx
'use client'

import { ART_STYLES } from '@/tools/story-studio/use-characters'
import { useLanguage } from '@/tools/story-studio/use-language-context'

interface MobileSettingsPanelProps {
  open: boolean
  artStyle: string | null
  onArtStyleChange: (style: string | null) => void
  pageCount: number
  onPageCountChange: (count: number) => void
}

const PAGE_OPTIONS = [4, 6, 8, 10]

export function MobileSettingsPanel({
  open, artStyle, onArtStyleChange, pageCount, onPageCountChange,
}: MobileSettingsPanelProps) {
  const { t } = useLanguage()

  if (!open) return null

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-3 animate-in slide-in-from-bottom duration-200">
      {/* Art Style */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{t.plotInput.artStyle}</p>
        <div className="flex flex-wrap gap-1.5">
          {ART_STYLES.map(style => (
            <button
              key={style.value}
              onClick={() => onArtStyleChange(artStyle === style.value ? null : style.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                artStyle === style.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              style={{ minHeight: '32px' }}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Count */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
          {t.common.pages}
        </p>
        <div className="flex gap-2">
          {PAGE_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => onPageCountChange(n)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                pageCount === n
                  ? 'bg-[#3D6AF2] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              style={{ minHeight: '32px' }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-settings-panel.tsx
git commit -m "feat(mobile): add MobileSettingsPanel collapsible settings"
```

---

### Task 7: Mobile Progress Screen

Fullscreen generation progress with magic animation, progress bar, and step breakdown.

**Files:**
- Create: `tools/story-studio/mobile/mobile-progress.tsx`

- [ ] **Step 1: Create progress screen component**

```tsx
// tools/story-studio/mobile/mobile-progress.tsx
'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/tools/story-studio/use-language-context'
import type { JobProgress } from '@/tools/story-studio/use-job-progress'

interface MobileProgressProps {
  jobProgress: JobProgress | null
  onBackground: () => void
}

const STEP_ICONS: Record<string, string> = {
  story_bible: '📖',
  story_draft: '📖',
  validate: '📖',
  character_ref: '🎨',
  cover: '🎨',
  illustrate_page: '🎨',
  tts_page: '🎙',
  save: '💾',
}

const STEPS = [
  { key: 'story', label: '写故事', labelEn: 'Write Story', match: ['story_bible', 'story_draft', 'validate'] },
  { key: 'illustrate', label: '画插画', labelEn: 'Illustrate', match: ['character_ref', 'cover', 'illustrate_page'] },
  { key: 'narrate', label: '录配音', labelEn: 'Narrate', match: ['tts_page'] },
]

export function MobileProgress({ jobProgress, onBackground }: MobileProgressProps) {
  const { t, language } = useLanguage()
  const [tipIndex, setTipIndex] = useState(0)
  const tips = t.progress.funTips

  useEffect(() => {
    const timer = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 3000)
    return () => clearInterval(timer)
  }, [tips.length])

  const percent = jobProgress?.percent ?? 5
  const currentStep = jobProgress?.job.current_step ?? 'story_bible'
  const failed = jobProgress?.job.status === 'failed'

  const getStepStatus = (matchSteps: string[]) => {
    const allStepOrder = ['story_bible', 'story_draft', 'validate', 'character_ref', 'cover', 'illustrate_page', 'tts_page', 'save', 'done']
    const currentIdx = allStepOrder.indexOf(currentStep)
    const lastMatchIdx = Math.max(...matchSteps.map(s => allStepOrder.indexOf(s)))
    const firstMatchIdx = Math.min(...matchSteps.map(s => allStepOrder.indexOf(s)))
    if (currentIdx > lastMatchIdx) return 'done'
    if (currentIdx >= firstMatchIdx) return 'active'
    return 'pending'
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col items-center justify-center px-6">
      {/* Magic animation */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full animate-pulse" style={{
          background: 'conic-gradient(from 0deg, #fbbf24, #a78bfa, #3D6AF2, #fbbf24)',
          filter: 'blur(12px)',
          opacity: 0.4,
        }} />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-300 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        {failed ? t.progress.generationFailed : t.progress.castingASpell}
      </h2>
      <p className="text-sm text-amber-600 dark:text-amber-400 mb-1 h-5">{tips[tipIndex]}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">{t.progress.storyReadyInMoment}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-400">{jobProgress?.label || t.progress.starting}</span>
          <span className="text-xs font-semibold text-[#3D6AF2]">{percent}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${failed ? 'bg-red-500' : 'bg-gradient-to-r from-[#3D6AF2] to-purple-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Step breakdown */}
      <div className="w-full max-w-xs space-y-2 mb-8">
        {STEPS.map(step => {
          const status = getStepStatus(step.match)
          return (
            <div key={step.key} className="flex items-center gap-2.5">
              <span className="text-sm">{status === 'done' ? '✅' : status === 'active' ? '⏳' : '○'}</span>
              <span className={`text-sm ${status === 'done' ? 'text-slate-400 line-through' : status === 'active' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}`}>
                {language === 'zh' ? step.label : step.labelEn}
                {status === 'active' && currentStep === 'illustrate_page' && jobProgress?.job.pages_completed !== undefined && (
                  <span className="ml-1 text-xs text-slate-400">
                    {jobProgress.job.pages_completed}/{jobProgress.job.total_pages}
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* Background button */}
      <button
        onClick={onBackground}
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
        style={{ minHeight: '44px' }}
      >
        {language === 'zh' ? '在后台继续' : 'Continue in background'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-progress.tsx
git commit -m "feat(mobile): add MobileProgress fullscreen generation screen"
```

---

### Task 8: Mobile Home Page

The main mobile landing page with chat-style input, example prompts, and bookshelf grid.

**Files:**
- Create: `tools/story-studio/mobile/mobile-home.tsx`

- [ ] **Step 1: Create mobile home component**

```tsx
// tools/story-studio/mobile/mobile-home.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoriesList } from '@/tools/story-studio/use-stories-list'
import { useJobProgress } from '@/tools/story-studio/use-job-progress'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { LanguageProvider, useLanguage } from '@/tools/story-studio/use-language-context'
import { MobileCoverGrid } from './mobile-cover-grid'
import { MobileSettingsPanel } from './mobile-settings-panel'
import { MobileProgress } from './mobile-progress'
import { signInWithOAuth } from '@/lib/supabase/auth'

const EXAMPLE_PROMPTS_ZH = [
  '两只小猫发现了一扇魔法门，通向一个由糖果组成的世界',
  '一个小男孩和他的机器人朋友一起去太空探险',
  '森林里的小动物们一起准备新年晚会',
  '一条小鱼想要看看大海以外的世界',
]

const EXAMPLE_PROMPTS_EN = [
  'Two kittens discover a magic door leading to a candy world',
  'A boy and his robot friend go on a space adventure',
  'Forest animals prepare a New Year party together',
  'A little fish wants to see the world beyond the ocean',
]

function HomeInner() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { t, language, toggleLanguage } = useLanguage()
  const storiesList = useStoriesList()
  const { jobs: activeJobs, completedJobId, clearCompletion } = useJobProgress(user?.id)
  const storyBook = useStoryBook()

  const [input, setInput] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [artStyle, setArtStyle] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(6)

  const examples = language === 'zh' ? EXAMPLE_PROMPTS_ZH : EXAMPLE_PROMPTS_EN
  const generating = storyBook.phase === 'generating'

  // When job completes, navigate to book
  useEffect(() => {
    if (!completedJobId) return
    let cancelled = false
    async function redirect() {
      try {
        const res = await fetch(`/api/v1/story/jobs/${completedJobId}`)
        if (!res.ok || cancelled) return
        const { job } = await res.json()
        if (cancelled) return
        const slug = job?.state?.slug
        clearCompletion()
        router.push(slug ? `/tools/story-studio/book/${slug}` : '/tools/story-studio/bookshelf')
      } catch {
        if (!cancelled) clearCompletion()
      }
    }
    redirect()
    return () => { cancelled = true }
  }, [completedJobId, clearCompletion, router])

  // Poll for speed job completion
  useEffect(() => {
    if (!storyBook.activeJobId || storyBook.phase !== 'generating') return
    let cancelled = false
    const interval = setInterval(async () => {
      if (cancelled) return
      try {
        const res = await fetch(`/api/v1/story/jobs/${storyBook.activeJobId}`, { signal: AbortSignal.timeout(5000) })
        if (!res.ok || cancelled) return
        const { job } = await res.json()
        if (cancelled) return
        if (job?.status === 'completed' || job?.book_id) {
          clearInterval(interval)
          const slug = job?.state?.slug
          router.push(slug ? `/tools/story-studio/book/${slug}` : '/tools/story-studio/bookshelf')
        } else if (job?.status === 'failed') {
          clearInterval(interval)
          storyBook.setError(job?.error_message || 'Generation failed')
          storyBook.setPhase('input')
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [storyBook.activeJobId, storyBook.phase, router]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || input.trim().length < 10) return
    if (!user) { await signInWithOAuth('google'); return }

    // Fetch concept then auto-generate
    await storyBook.fetchConcepts(input.trim())
    if (storyBook.selectedConcept) {
      await storyBook.startGeneration(input.trim(), storyBook.selectedConcept, {
        skipIllustration: true, skipAudio: true, skipValidation: true,
      })
    }
  }, [input, user, storyBook])

  // Get active job progress for the progress screen
  const currentJobProgress = storyBook.activeJobId
    ? activeJobs.find(j => j.job.id === storyBook.activeJobId) ?? null
    : null

  // Show progress screen when generating
  if (generating) {
    return (
      <MobileProgress
        jobProgress={currentJobProgress}
        onBackground={() => {
          storyBook.setPhase('input')
          storyBook.setActiveJobId(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
          {t.studioTitle}
        </h1>
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-pointer"
          style={{ minHeight: '32px' }}
        >
          {language === 'en' ? t.langToggle.zh : t.langToggle.en}
        </button>
      </div>

      {/* Hero */}
      <div className="px-5 pt-6 pb-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          {language === 'zh' ? '想要什么故事？' : 'What story do you want?'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {language === 'zh' ? '描述一下，AI帮你画' : 'Describe it, AI will illustrate'}
        </p>
      </div>

      {/* Example prompts */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-2">
          {examples.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInput(prompt)}
              className="text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer hover:border-[#3D6AF2] transition-colors"
              style={{ minHeight: '44px' }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Bookshelf */}
      {storiesList.allStories.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {language === 'zh' ? `我的绘本 (${storiesList.allStories.length})` : `My Books (${storiesList.allStories.length})`}
            </h3>
          </div>
          <MobileCoverGrid
            stories={storiesList.allStories}
            activeJobs={activeJobs}
            onDelete={storiesList.deleteStory}
            onToggleShare={storiesList.toggleShare}
          />
        </div>
      )}

      {/* Error */}
      {storyBook.error && (
        <div className="mx-4 mt-4 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {storyBook.error}
        </div>
      )}

      {/* Fixed bottom input bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 safe-area-bottom">
        <MobileSettingsPanel
          open={settingsOpen}
          artStyle={artStyle}
          onArtStyleChange={setArtStyle}
          pageCount={pageCount}
          onPageCountChange={setPageCount}
        />
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-end gap-2">
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors ${settingsOpen ? 'bg-[#3D6AF2] text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={language === 'zh' ? '描述你的故事...' : 'Describe your story...'}
            className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] max-h-24"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 96) + 'px'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || input.trim().length < 10 || storyBook.loading}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#3D6AF2] text-white cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            {storyBook.loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MobileHome() {
  return (
    <LanguageProvider>
      <HomeInner />
    </LanguageProvider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-home.tsx
git commit -m "feat(mobile): add MobileHome chat-style landing page"
```

---

### Task 9: Wire Mobile Home into Stories Page

Connect the mobile home to the existing stories page route.

**Files:**
- Modify: `app/tools/story-studio/page.tsx`

- [ ] **Step 1: Add mobile branch to StoriesPage**

At the top of the file, add imports:

```tsx
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'
import { MobileHome } from '@/tools/story-studio/mobile/mobile-home'
```

Inside the `StoriesContent` function, right after the hooks and before the auth gate, add:

```tsx
  const isMobile = useMobileShell()

  if (isMobile) {
    return <MobileHome />
  }
```

The rest of the desktop code stays unchanged after this block.

- [ ] **Step 2: Test on mobile viewport**

Open `http://localhost:3000/tools/story-studio` at 390x844 viewport. Verify:
- Chat-style home appears (not desktop tab layout)
- Example prompts visible
- Bottom input bar fixed
- Bookshelf grid shows existing books

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/page.tsx
git commit -m "feat(mobile): wire MobileHome into stories page route"
```

---

### Task 10: Mobile Edit Drawer

Bottom sheet editor with 3 tabs (text, illustration, narration) for per-page editing.

**Files:**
- Create: `tools/story-studio/mobile/mobile-edit-drawer.tsx`

- [ ] **Step 1: Create edit drawer component**

```tsx
// tools/story-studio/mobile/mobile-edit-drawer.tsx
'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/mobile/bottom-sheet'
import { useLanguage } from '@/tools/story-studio/use-language-context'
import type { Page } from '@/tools/story-studio/types'

interface MobileEditDrawerProps {
  open: boolean
  onClose: () => void
  page: Page
  pageNumber: number
  totalPages: number
  bookId: string
  onSave: (updates: Partial<Page>) => void
}

type TabId = 'text' | 'illustration' | 'narration'

export function MobileEditDrawer({
  open, onClose, page, pageNumber, totalPages, bookId, onSave,
}: MobileEditDrawerProps) {
  const { t, language } = useLanguage()
  const [tab, setTab] = useState<TabId>('text')
  const [narrativeText, setNarrativeText] = useState(page.narrativeText)
  const [refining, setRefining] = useState(false)
  const [regeneratingImage, setRegeneratingImage] = useState(false)

  const tabs: { id: TabId; label: string }[] = [
    { id: 'text', label: language === 'zh' ? '文字' : 'Text' },
    { id: 'illustration', label: language === 'zh' ? '插画' : 'Illustration' },
    { id: 'narration', label: language === 'zh' ? '配音' : 'Narration' },
  ]

  const handleSave = () => {
    onSave({ narrativeText })
    onClose()
  }

  const handleAiRefine = async () => {
    setRefining(true)
    try {
      const res = await fetch('/api/v1/story/rephrase-plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: narrativeText }),
      })
      if (res.ok) {
        const { data } = await res.json()
        if (data?.rephrasedPlot) setNarrativeText(data.rephrasedPlot)
      }
    } catch { /* silent */ }
    finally { setRefining(false) }
  }

  return (
    <BottomSheet open={open} onClose={onClose} snapPoint="full">
      {/* Page indicator */}
      <div className="text-center mb-3">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {language === 'zh' ? `第 ${pageNumber} 页 / 共 ${totalPages} 页` : `Page ${pageNumber} of ${totalPages}`}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 ${
              tab === t.id
                ? 'border-[#3D6AF2] text-[#3D6AF2]'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'text' && (
        <div className="space-y-3">
          <textarea
            value={narrativeText}
            onChange={e => setNarrativeText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
            rows={6}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAiRefine}
              disabled={refining}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 cursor-pointer disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              {refining ? '✨ ...' : `✨ ${language === 'zh' ? 'AI润色' : 'AI Refine'}`}
            </button>
          </div>
          {/* Dialogue editing */}
          {page.dialogue?.map((d, i) => (
            <div key={i} className="flex items-start gap-2 pl-3 border-l-2 border-amber-400/50">
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">{d.speaker}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">&ldquo;{d.line}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'illustration' && (
        <div className="space-y-3">
          {page.imageUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img src={page.imageUrl} alt="" className="w-full h-full object-cover" />
              {regeneratingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              {language === 'zh' ? '暂无插画' : 'No illustration'}
            </div>
          )}
          <button
            onClick={() => setRegeneratingImage(true)}
            disabled={regeneratingImage}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-[#3D6AF2] text-white cursor-pointer disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {regeneratingImage
              ? (language === 'zh' ? '生成中...' : 'Generating...')
              : (language === 'zh' ? '重新生成' : 'Regenerate')}
          </button>
        </div>
      )}

      {tab === 'narration' && (
        <div className="space-y-3">
          {page.audioUrl ? (
            <audio controls className="w-full" src={page.audioUrl} />
          ) : (
            <div className="px-4 py-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-center text-sm text-slate-400">
              {language === 'zh' ? '暂无配音' : 'No narration'}
            </div>
          )}
          <button
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-purple-600 text-white cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {language === 'zh' ? '重新生成配音' : 'Regenerate Narration'}
          </button>
        </div>
      )}

      {/* Save button (text tab only) */}
      {tab === 'text' && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#3D6AF2] text-white cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {language === 'zh' ? '保存修改' : 'Save Changes'}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/mobile/mobile-edit-drawer.tsx
git commit -m "feat(mobile): add MobileEditDrawer bottom sheet editor"
```

---

### Task 11: E2E Testing — Mobile Reader

Verify the mobile reader works correctly on mobile viewport.

**Files:**
- No new files (uses Playwright MCP)

- [ ] **Step 1: Test mobile reader rendering**

Using Playwright browser tools:
1. Resize to 390x844
2. Navigate to `http://localhost:3000/tools/story-studio/book/three-monks-one-happy-temple-ffl4w5`
3. Verify mobile reader renders (fullscreen layout, no desktop scroll)
4. Take screenshot

- [ ] **Step 2: Test swipe navigation**

1. Press ArrowRight to advance page
2. Verify page content changes
3. Press ArrowLeft to go back
4. Verify cover page

- [ ] **Step 3: Test mobile home rendering**

1. Navigate to `http://localhost:3000/tools/story-studio`
2. Verify chat-style home renders (input bar, example prompts, bookshelf)
3. Take screenshot

- [ ] **Step 4: Test no horizontal overflow**

Run JavaScript evaluation:
```js
() => ({ docWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth, overflow: document.documentElement.scrollWidth > window.innerWidth })
```
Expected: `overflow: false`

- [ ] **Step 5: Commit any fixes**

If any fixes were needed during testing, commit them.

---

### Task 12: Final Integration and Deploy

Wire everything together, verify TypeScript, build, and deploy.

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS"`
Expected: `0`

- [ ] **Step 2: Build check**

Run: `NEXT_TELEMETRY_DISABLED=1 npx next build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(mobile): Story Studio mobile redesign - complete implementation"
```

- [ ] **Step 4: Push and deploy**

```bash
git push origin main
vercel --prod --yes --archive=tgz
```

Verify deployment at https://toolk1t.com/tools/story-studio on mobile device.
