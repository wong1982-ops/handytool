# Story Studio Shell Layout Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current sidebar-based navigation with a 4-tab layout (Stories, Characters, Illustrations, Narration) plus a persistent book selector dropdown, supporting both desktop and mobile.

**Architecture:** The existing `StudioLayout`, `StudioMobileHeader`, and `StudioMobileSidebar` are replaced by a unified `StudioShell` component that renders: (1) a fantasy-themed header with book selector, (2) a horizontal tab bar, (3) active tab content. Routing changes from separate pages (`/bookshelf`, `/series`) to a single page with client-side tab state. Bookshelf and book reader remain separate routes.

**Tech Stack:** React 19, Next.js App Router, TypeScript, Tailwind CSS, Supabase (for book list queries)

**Design doc:** `docs/plans/2026-03-13-story-studio-modular-redesign.md`

**Depends on:** Plan 1 (Database & Migration) — but can be built in parallel using existing tables. The shell is purely UI/layout and doesn't depend on new DB tables.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `tools/story-studio/studio-shell.tsx` | Create | Main shell component: header + book selector + tab bar + content area |
| `tools/story-studio/tab-navigation.tsx` | Create | Horizontal tab bar component (desktop + mobile) |
| `tools/story-studio/book-selector.tsx` | Create | Book dropdown selector with search/filter |
| `tools/story-studio/use-book-context.tsx` | Create | React context for active book selection (shared across tabs) |
| `tools/story-studio/studio-layout.tsx` | Modify | Deprecate old sidebar layout → re-export `StudioShell` for backward compat |
| `tools/story-studio/mobile-sidebar.tsx` | Modify | Remove (replaced by tab navigation) |
| `tools/story-studio/mobile-header.tsx` | Modify | Replace with new header inside `StudioShell` |
| `app/tools/story-studio/layout.tsx` | Modify | Render `StudioShell` for all routes, remove mobile branching |
| `app/tools/story-studio/page.tsx` | Modify | Becomes the Stories tab content (default tab) |
| `app/tools/story-studio/characters/page.tsx` | Create | Characters tab route (placeholder — implemented in Plan 3) |
| `app/tools/story-studio/illustrations/page.tsx` | Create | Illustrations tab route (placeholder — implemented in Plan 5) |
| `app/tools/story-studio/narration/page.tsx` | Create | Narration tab route (placeholder — implemented in Plan 5) |

---

## Chunk 1: Book Context & Tab Navigation Components

### Task 1: Create the BookContext provider

**Files:**
- Create: `tools/story-studio/use-book-context.tsx`

- [ ] **Step 1: Create the context file**

```tsx
'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface BookSummary {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  pageCount: number
  createdAt: string
  /** Optional — not returned by current API, will be added in Plan 1 migration */
  isPublic?: boolean
}

interface BookContextValue {
  /** Currently selected book (null = none selected) */
  activeBook: BookSummary | null
  /** Set the active book by ID — pass null to clear */
  setActiveBookId: (id: string | null) => void
  /** All user's books for the selector dropdown */
  books: BookSummary[]
  /** Whether books are loading */
  loading: boolean
  /** Refresh the book list */
  refreshBooks: () => void
}

const BookContext = createContext<BookContextValue | null>(null)

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BookSummary[]>([])
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/story/books')
      if (!res.ok) return
      const { data } = await res.json()
      setBooks(data ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  // Persist active book in sessionStorage
  useEffect(() => {
    if (activeBookId) {
      sessionStorage.setItem('story-studio-active-book', activeBookId)
    } else {
      sessionStorage.removeItem('story-studio-active-book')
    }
  }, [activeBookId])

  // Restore from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('story-studio-active-book')
    if (stored) setActiveBookId(stored)
  }, [])

  const activeBook = books.find(b => b.id === activeBookId) ?? null

  return (
    <BookContext.Provider value={{
      activeBook,
      setActiveBookId,
      books,
      loading,
      refreshBooks: fetchBooks,
    }}>
      {children}
    </BookContext.Provider>
  )
}

export function useBookContext(): BookContextValue {
  const ctx = useContext(BookContext)
  if (!ctx) throw new Error('useBookContext must be used within BookProvider')
  return ctx
}
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la tools/story-studio/use-book-context.tsx`
Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/use-book-context.tsx
git commit -m "feat(story-studio): add BookContext provider for active book selection"
```

---

### Task 2: Create the TabNavigation component

**Files:**
- Create: `tools/story-studio/tab-navigation.tsx`

- [ ] **Step 1: Create the tab navigation component**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface TabItem {
  label: string
  href: string
  icon: React.ReactNode
  /** If true, tab requires an active book to be enabled */
  requiresBook?: boolean
}

const TABS: TabItem[] = [
  {
    label: 'Stories',
    href: '/tools/story-studio',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    label: 'Characters',
    href: '/tools/story-studio/characters',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    label: 'Illustrations',
    href: '/tools/story-studio/illustrations',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v14.25a1.5 1.5 0 0 0 1.5 1.5Z" />
      </svg>
    ),
    requiresBook: true,
  },
  {
    label: 'Narration',
    href: '/tools/story-studio/narration',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
      </svg>
    ),
    requiresBook: true,
  },
]

interface TabNavigationProps {
  hasActiveBook: boolean
}

export function TabNavigation({ hasActiveBook }: TabNavigationProps) {
  const pathname = usePathname()

  function getActiveTab(): string {
    if (pathname.startsWith('/tools/story-studio/characters')) return '/tools/story-studio/characters'
    if (pathname.startsWith('/tools/story-studio/illustrations')) return '/tools/story-studio/illustrations'
    if (pathname.startsWith('/tools/story-studio/narration')) return '/tools/story-studio/narration'
    // Default: Stories tab (covers /tools/story-studio, /tools/story-studio/bookshelf, etc.)
    return '/tools/story-studio'
  }

  const activeHref = getActiveTab()

  return (
    <nav
      className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      aria-label="Story Studio navigation"
    >
      {TABS.map((tab) => {
        const isActive = activeHref === tab.href
        const isDisabled = tab.requiresBook && !hasActiveBook

        if (isDisabled) {
          return (
            <span
              key={tab.href}
              aria-disabled={true}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                text-slate-300 dark:text-slate-600 cursor-not-allowed
                border-b-2 border-transparent"
              style={{ minHeight: '44px' }}
              title="Select a book first"
            >
              {tab.icon}
              {tab.label}
            </span>
          )
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
              border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            style={{ minHeight: '44px' }}
          >
            {tab.icon}
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la tools/story-studio/tab-navigation.tsx`
Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/tab-navigation.tsx
git commit -m "feat(story-studio): add horizontal TabNavigation component"
```

---

### Task 3: Create the BookSelector dropdown

**Files:**
- Create: `tools/story-studio/book-selector.tsx`

- [ ] **Step 1: Create the book selector component**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'

export function BookSelector() {
  const { activeBook, setActiveBookId, books, loading } = useBookContext()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-800/30 text-purple-300 text-sm">
        <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <span className="text-purple-300/60 text-sm italic">
        No books yet
      </span>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-800/40 hover:bg-indigo-800/60
          text-white text-sm font-medium transition-colors cursor-pointer
          border border-indigo-700/50 max-w-[240px]"
        style={{ minHeight: '36px' }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        <span className="truncate">
          {activeBook ? activeBook.title : 'Select a book...'}
        </span>
        <svg className={`w-4 h-4 text-purple-300 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-72 max-h-64 overflow-y-auto
            rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          role="listbox"
        >
          {/* Clear selection option */}
          {activeBook && (
            <button
              onClick={() => { setActiveBookId(null); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-400 dark:text-slate-500
                hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer
                border-b border-slate-100 dark:border-slate-700"
            >
              Clear selection
            </button>
          )}

          {books.map((book) => {
            const isSelected = activeBook?.id === book.id
            return (
              <button
                key={book.id}
                onClick={() => { setActiveBookId(book.id); setOpen(false) }}
                role="option"
                aria-selected={isSelected}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
                style={{ minHeight: '44px' }}
              >
                {/* Cover thumbnail */}
                <div className="w-8 h-10 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-4 h-4 text-slate-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{book.title}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {book.pageCount} pages
                  </div>
                </div>

                {isSelected && (
                  <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la tools/story-studio/book-selector.tsx`
Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/book-selector.tsx
git commit -m "feat(story-studio): add BookSelector dropdown component"
```

---

## Chunk 2: Studio Shell & Layout Integration

### Task 4: Create the StudioShell component

**Files:**
- Create: `tools/story-studio/studio-shell.tsx`

This is the main layout wrapper that combines the header, book selector, and tab bar.

- [ ] **Step 1: Create the shell component**

```tsx
'use client'

import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import { TabNavigation } from '@/tools/story-studio/tab-navigation'
import { BookSelector } from '@/tools/story-studio/book-selector'
import { BookProvider, useBookContext } from '@/tools/story-studio/use-book-context'
import Link from 'next/link'

function ShellInner({ children }: { children: React.ReactNode }) {
  const { activeBook } = useBookContext()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Fantasy header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950">
        {/* Starfield background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 20%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 25% 60%, #c4b5fd, transparent),
              radial-gradient(1px 1px at 40% 15%, #fff, transparent),
              radial-gradient(2px 2px at 55% 45%, #fbbf24, transparent),
              radial-gradient(1px 1px at 70% 75%, #c4b5fd, transparent),
              radial-gradient(1.5px 1.5px at 85% 30%, #fff, transparent),
              radial-gradient(1px 1px at 95% 80%, #fbbf24, transparent),
              radial-gradient(2px 2px at 15% 85%, #a78bfa, transparent),
              radial-gradient(1px 1px at 50% 90%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 75% 10%, #fbbf24, transparent)
            `,
            animation: 'starfield-drift 12s ease-in-out infinite alternate',
          }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 5% 50%, #fff, transparent),
              radial-gradient(2px 2px at 30% 35%, #a78bfa, transparent),
              radial-gradient(1px 1px at 60% 65%, #fbbf24, transparent),
              radial-gradient(1.5px 1.5px at 80% 50%, #c4b5fd, transparent),
              radial-gradient(1px 1px at 45% 25%, #fff, transparent)
            `,
            animation: 'starfield-drift 16s ease-in-out 3s infinite alternate-reverse',
          }} />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-24 bg-gradient-to-t from-amber-500/10 via-purple-500/5 to-transparent blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pt-5 md:pb-5">
          {/* Top row: breadcrumb */}
          <div className="hidden md:block">
            <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />
          </div>

          {/* Header row: title + book selector */}
          <div className="mt-2 md:mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile: home link */}
              <Link
                href="/"
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-purple-300 hover:text-white transition-colors"
                aria-label="Home"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </Link>

              <div className="relative">
                <svg className="w-8 h-8 md:w-9 md:h-9 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
              </div>
              <h1
                className="text-xl md:text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}
              >
                Story Studio
              </h1>
            </div>

            {/* Book selector */}
            <BookSelector />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-0 z-20">
        <TabNavigation hasActiveBook={!!activeBook} />
      </div>

      {/* Tab content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <BookProvider>
      <ShellInner>{children}</ShellInner>
    </BookProvider>
  )
}
```

- [ ] **Step 2: Verify file was created**

Run: `ls -la tools/story-studio/studio-shell.tsx`
Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add tools/story-studio/studio-shell.tsx
git commit -m "feat(story-studio): add StudioShell layout with header, tabs, and book selector"
```

---

### Task 5: Update layout.tsx to use StudioShell

**Files:**
- Modify: `app/tools/story-studio/layout.tsx`

The layout currently has mobile/desktop branching with `StudioMobileHeader` and `StudioMobileSidebar`. Replace it with `StudioShell` for all tab routes, but skip the shell for standalone routes like `/book/[slug]` and `/jobs/[id]`.

- [ ] **Step 1: Rewrite layout.tsx**

Replace the entire content of `app/tools/story-studio/layout.tsx` with:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { StudioShell } from '@/tools/story-studio/studio-shell'

/** Routes that use their own layout (no tab shell) */
const STANDALONE_ROUTES = ['/tools/story-studio/book/', '/tools/story-studio/jobs/']

export default function StoryStudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Book reader and job detail pages have their own layouts
  const isStandalone = STANDALONE_ROUTES.some(prefix => pathname.startsWith(prefix))

  if (isStandalone) {
    return <>{children}</>
  }

  return <StudioShell>{children}</StudioShell>
}
```

- [ ] **Step 2: Verify the layout compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors in layout.tsx (other files may have pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/layout.tsx
git commit -m "feat(story-studio): switch layout to StudioShell with tab navigation"
```

---

### Task 6: Create placeholder tab pages

**Files:**
- Create: `app/tools/story-studio/characters/page.tsx`
- Create: `app/tools/story-studio/illustrations/page.tsx`
- Create: `app/tools/story-studio/narration/page.tsx`

These are placeholder pages that will be implemented in Plans 3 and 5.

- [ ] **Step 1: Create characters placeholder page**

```tsx
'use client'

export default function CharactersPage() {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 mb-4">
        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Characters</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        Create and manage characters with personalities, reference images, and voices.
        Group them into series for consistent storytelling.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create illustrations placeholder page**

```tsx
'use client'

import { useBookContext } from '@/tools/story-studio/use-book-context'

export default function IllustrationsPage() {
  const { activeBook } = useBookContext()

  if (!activeBook) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
          <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v14.25a1.5 1.5 0 0 0 1.5 1.5Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Illustrations</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Select a book from the dropdown above to start illustrating pages.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 mb-4">
        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v14.25a1.5 1.5 0 0 0 1.5 1.5Z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Illustrate: {activeBook.title}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        Illustration tools coming soon. You&apos;ll be able to generate cover art and page illustrations with character consistency.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create narration placeholder page**

```tsx
'use client'

import { useBookContext } from '@/tools/story-studio/use-book-context'

export default function NarrationPage() {
  const { activeBook } = useBookContext()

  if (!activeBook) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
          <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Narration</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Select a book from the dropdown above to start generating narration.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 mb-4">
        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Narrate: {activeBook.title}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        Narration tools coming soon. You&apos;ll be able to generate multi-voice audio with character-specific voices.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Verify all three pages exist**

Run: `ls -la app/tools/story-studio/characters/page.tsx app/tools/story-studio/illustrations/page.tsx app/tools/story-studio/narration/page.tsx`
Expected: all three files listed

- [ ] **Step 5: Commit**

```bash
git add app/tools/story-studio/characters/page.tsx app/tools/story-studio/illustrations/page.tsx app/tools/story-studio/narration/page.tsx
git commit -m "feat(story-studio): add placeholder pages for Characters, Illustrations, and Narration tabs"
```

---

### Task 7: Update main page to remove old layout chrome

**Files:**
- Modify: `app/tools/story-studio/page.tsx`

The main page currently renders its own fantasy header, sidebar toggle, and `ToolBreadcrumb`. Since `StudioShell` now handles all of that, remove the duplicate chrome from the page. The page becomes pure tab content.

- [ ] **Step 1: Remove header/sidebar from main page**

In `app/tools/story-studio/page.tsx`, find and remove:

1. The fantasy header `<div>` (the gradient background with starfield, title "Story Studio", sparkle icon)
2. The sidebar toggle FAB button (fixed bottom-left, toggles `sidebarOpen`)
3. The sidebar backdrop overlay
4. The `<aside>` sidebar with nav links (Build, Bookshelf, Series, Scan)
5. The `<ToolBreadcrumb>` component (now in `StudioShell`)
6. The `sidebarOpen` / `setSidebarOpen` state
7. The `activeView` / `setActiveView` state and bookshelf view toggling

The remaining content should be the story creation flow: `PlotInput` → `RefinementChat` → `GenerationProgress` → `BookViewer`/`BookEditor`.

**Important**: Keep all creation flow logic (`phase`, `plot`, `selectedConcept`, `book`, etc.) — only strip the layout wrapper.

The page's return should become just the creation flow content, wrapped in a simple container:

```tsx
return (
  <div>
    {/* Series picker (if applicable) */}
    {/* ... existing series picker UI ... */}

    {/* Story creation flow */}
    {phase === 'input' && (
      <PlotInput ... />
    )}
    {phase === 'refine' && (
      <RefinementChat ... />
    )}
    {phase === 'generating' && (
      <GenerationProgress ... />
    )}
    {(phase === 'viewer') && (
      <>
        <BookViewer ... />
        {editorOpen && <BookEditor ... />}
      </>
    )}
  </div>
)
```

**Note:** This is a simplification — preserve the exact existing JSX for each phase section, just remove the outer layout wrapper (header, sidebar, main container `<div className="max-w-7xl mx-auto flex">`).

- [ ] **Step 2: Remove unused imports**

Remove these imports from the page if they are no longer used:
- `ToolBreadcrumb` (now in `StudioShell`)
- `useBookshelf` (moved to bookshelf page, or kept if stories tab shows recent books)
- `Link` (if only used in sidebar nav links)

- [ ] **Step 3: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "story-studio/page" | head -10`
Expected: No errors referencing the main page

- [ ] **Step 4: Commit**

```bash
git add app/tools/story-studio/page.tsx
git commit -m "refactor(story-studio): strip old layout chrome from main page, now rendered by StudioShell"
```

---

## Chunk 3: Cleanup & Backward Compatibility

### Task 8: Update bookshelf page to remove layout chrome

**Files:**
- Modify: `app/tools/story-studio/bookshelf/page.tsx`

The bookshelf page does NOT use `StudioLayout` — it has its own inline layout with `<div className="min-h-screen bg-slate-50 dark:bg-slate-950">`, its own `<ToolBreadcrumb>`, and a fantasy header. Since `StudioShell` now provides all of this, strip the duplicate chrome.

- [ ] **Step 1: Remove layout chrome from bookshelf page**

In `app/tools/story-studio/bookshelf/page.tsx`:
- Remove the outer `<div className="min-h-screen bg-slate-50 dark:bg-slate-950">` wrapper (keep its children)
- Remove the `<ToolBreadcrumb>` component (now in `StudioShell`)
- Remove the fantasy header `<div>` with gradient/starfield background (now in `StudioShell`)
- Remove `import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'` if no longer used
- Keep all bookshelf grid content, book cards, delete dialog, job tracking, etc.
- The page's return should start directly with the bookshelf grid content

- [ ] **Step 2: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "bookshelf" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/bookshelf/page.tsx
git commit -m "refactor(story-studio): remove StudioLayout wrapper from bookshelf page"
```

---

### Task 9: Update series page to remove StudioLayout wrapper

**Files:**
- Modify: `app/tools/story-studio/series/page.tsx`

Same as bookshelf — remove `StudioLayout` wrapper.

- [ ] **Step 1: Remove StudioLayout wrapper from series page**

In `app/tools/story-studio/series/page.tsx`:
- Remove the `import { StudioLayout } from '@/tools/story-studio/studio-layout'` line
- Remove the `<StudioLayout>...</StudioLayout>` wrapper, keeping only its children
- Remove the `<ToolBreadcrumb>` if present

- [ ] **Step 2: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "series/page" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/series/page.tsx
git commit -m "refactor(story-studio): remove StudioLayout wrapper from series page"
```

---

### Task 9b: Update series detail page to remove StudioLayout wrapper

**Files:**
- Modify: `app/tools/story-studio/series/[id]/page.tsx`

The series detail page (`series/[id]/page.tsx`) also imports and wraps in `<StudioLayout>`. Without this fix, the page will be double-wrapped: once by `layout.tsx` → `StudioShell`, and again by the page's own `<StudioLayout>` → `StudioShell`.

- [ ] **Step 1: Remove StudioLayout wrapper from series detail page**

In `app/tools/story-studio/series/[id]/page.tsx`:
- Remove the `import { StudioLayout } from '@/tools/story-studio/studio-layout'` line
- Remove the `<StudioLayout>...</StudioLayout>` wrapper, keeping only its children
- Remove the `<ToolBreadcrumb>` if present
- **Important**: The page may have early-return auth checks that render before the `StudioLayout` wrapper — make sure those still render properly without the wrapper (they should, since `StudioShell` wraps at the layout level)

- [ ] **Step 2: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "series/\[id\]" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/series/\[id\]/page.tsx
git commit -m "refactor(story-studio): remove StudioLayout wrapper from series detail page"
```

---

### Task 10: Update scan page to remove StudioLayout wrapper

**Files:**
- Modify: `app/tools/story-studio/scan/page.tsx`

The scan page imports and wraps in `<StudioLayout>`. Same double-wrap problem — must strip it.

- [ ] **Step 1: Remove StudioLayout wrapper from scan page**

In `app/tools/story-studio/scan/page.tsx`:
- Remove the `import { StudioLayout } from '@/tools/story-studio/studio-layout'` line
- Remove the `<StudioLayout>...</StudioLayout>` wrapper, keeping only its children
- Remove the `<ToolBreadcrumb>` if present

- [ ] **Step 2: Verify the page compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit --pretty 2>&1 | grep "scan/page" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/tools/story-studio/scan/page.tsx
git commit -m "refactor(story-studio): remove StudioLayout wrapper from scan page"
```

---

### Task 11: Deprecate old layout components

**Files:**
- Modify: `tools/story-studio/studio-layout.tsx`

Mark the old `StudioLayout` as deprecated. Don't delete yet — other code may still reference it.

- [ ] **Step 1: Add deprecation notice**

Replace the content of `tools/story-studio/studio-layout.tsx` with a re-export pointing to the new shell:

```tsx
'use client'

/**
 * @deprecated Use StudioShell from './studio-shell' instead.
 * This file is kept for backward compatibility during the modular redesign migration.
 * Will be removed after all references are updated.
 */

import { StudioShell } from '@/tools/story-studio/studio-shell'

interface StudioLayoutProps {
  children: React.ReactNode
  bookCount?: number
  seriesCount?: number
}

export function StudioLayout({ children }: StudioLayoutProps) {
  // StudioShell handles everything now — bookCount/seriesCount are ignored
  return <StudioShell>{children}</StudioShell>
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/story-studio/studio-layout.tsx
git commit -m "refactor(story-studio): deprecate StudioLayout in favor of StudioShell"
```

---

### Task 12: Hide old Bookshelf/Series/Scan sidebar routes from tab navigation

**Files:**
- No new files — this is a verification step

The old sidebar links (Build, Bookshelf, Series, Scan) are gone from the navigation. The new tabs are Stories, Characters, Illustrations, Narration.

The existing pages at `/bookshelf`, `/series`, `/scan` still exist and are accessible via direct URL. They will render inside the `StudioShell` with the Stories tab visually active (since they don't match any specific tab). This is acceptable for backward compatibility — those pages will be refactored or moved in Plans 3-5.

- [ ] **Step 1: Verify the tab routes work**

Run the dev server and verify:
1. `/tools/story-studio` renders with tab bar, Stories tab active
2. `/tools/story-studio/characters` renders placeholder, Characters tab active
3. `/tools/story-studio/illustrations` renders placeholder (with "Select a book" message), Illustrations tab active
4. `/tools/story-studio/narration` renders placeholder (with "Select a book" message), Narration tab active
5. `/tools/story-studio/book/[slug]` renders without tab bar (standalone)
6. `/tools/story-studio/jobs/[id]` renders without tab bar (standalone)

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev`

- [ ] **Step 2: Verify book selector**

1. Open `/tools/story-studio`
2. Click the book selector dropdown in the header
3. Select a book — Illustrations and Narration tabs should become clickable
4. Navigate to Illustrations tab — should show the selected book title
5. Clear selection — Illustrations and Narration tabs should grey out

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(story-studio): complete shell layout with tab navigation and book selector"
```

---

## Prerequisites & Dependencies

- **`starfield-drift` CSS keyframes**: The `StudioShell` header uses `animation: 'starfield-drift ...'` in inline styles. This CSS animation is defined in the existing global styles. Verify it remains available after layout changes — if the keyframes were defined in a component-specific stylesheet that gets removed, add them to the global CSS.
- **`/api/v1/story/books` endpoint**: The `BookProvider` fetches books from this existing API. The response shape maps to `BookSummary` (minus `status` which is not yet returned — will be added after Plan 1 migration is applied).

---

## Notes for Subsequent Plans

- **Plan 3 (Characters)** will fully implement `app/tools/story-studio/characters/page.tsx` with CRUD UI, series management, voice picker
- **Plan 4 (Stories)** will refactor `app/tools/story-studio/page.tsx` to be a story list + create/edit flow, incorporating bookshelf functionality
- **Plan 5 (Media)** will implement `illustrations/page.tsx` and `narration/page.tsx` with single-task job generation
- The old `/bookshelf` and `/series` pages can be removed or redirected once their functionality is absorbed into the new tabs
- The `mobile-sidebar.tsx` and `mobile-header.tsx` files can be deleted once no other code references them
