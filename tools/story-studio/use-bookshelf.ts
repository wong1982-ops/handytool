// tools/story-studio/use-bookshelf.ts
'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { StoryBook } from './types'

const BOOKSHELF_KEY = 'toolk1t-story-bookshelf'

export interface BookshelfItem {
  id: string
  slug: string
  title: string
  authors: string[]
  coverImageUrl: string | null
  audience: string
  style: string
  pageCount: number
  isPublic: boolean
  createdAt: string
  seriesId: string | null
  seriesTitle: string | null
}

export interface BookshelfGroup {
  key: string          // seriesId or '__standalone__'
  label: string        // series title or 'Other Stories'
  seriesId: string | null
  books: BookshelfItem[]
}

/** Load bookshelf from localStorage */
function loadLocalBooks(): BookshelfItem[] {
  try {
    const stored = localStorage.getItem(BOOKSHELF_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/** Save bookshelf to localStorage */
function saveLocalBooks(books: BookshelfItem[]) {
  try {
    localStorage.setItem(BOOKSHELF_KEY, JSON.stringify(books))
  } catch {
    // localStorage full — silently fail
  }
}

/** Convert a full StoryBook into a lightweight BookshelfItem */
function bookToItem(book: StoryBook, seriesId?: string | null, seriesTitle?: string | null): BookshelfItem {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    authors: book.authors || ['AI'],
    coverImageUrl: book.coverImageUrl || book.pages[0]?.imageUrl || null,
    audience: book.concept?.tags?.audience || '',
    style: book.concept?.tags?.style || '',
    pageCount: book.pages.length,
    isPublic: false,
    createdAt: book.createdAt,
    seriesId: seriesId ?? null,
    seriesTitle: seriesTitle ?? null,
  }
}

export function useBookshelf() {
  const [books, setBooks] = useState<BookshelfItem[]>([])
  const [loading, setLoading] = useState(true)

  // Group books by series
  const groups = useMemo<BookshelfGroup[]>(() => {
    const seriesMap = new Map<string, { title: string; books: BookshelfItem[] }>()
    const standalone: BookshelfItem[] = []

    for (const book of books) {
      if (book.seriesId && book.seriesTitle) {
        const existing = seriesMap.get(book.seriesId)
        if (existing) {
          existing.books.push(book)
        } else {
          seriesMap.set(book.seriesId, { title: book.seriesTitle, books: [book] })
        }
      } else {
        standalone.push(book)
      }
    }

    const result: BookshelfGroup[] = []

    // Series groups first (sorted by most recent book)
    const seriesEntries = [...seriesMap.entries()].sort((a, b) => {
      const aLatest = Math.max(...a[1].books.map(bk => new Date(bk.createdAt).getTime()))
      const bLatest = Math.max(...b[1].books.map(bk => new Date(bk.createdAt).getTime()))
      return bLatest - aLatest
    })

    for (const [id, { title, books: seriesBooks }] of seriesEntries) {
      seriesBooks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      result.push({ key: id, label: title, seriesId: id, books: seriesBooks })
    }

    // Standalone books last
    if (standalone.length > 0) {
      standalone.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      result.push({ key: '__standalone__', label: 'Other Stories', seriesId: null, books: standalone })
    }

    return result
  }, [books])

  // Load on mount: show local books immediately, then merge API results
  const fetchBooks = useCallback(async () => {
    // Show local books immediately so UI is never stuck
    const localBooks = loadLocalBooks()
    setBooks(localBooks)
    setLoading(localBooks.length === 0) // only show skeleton if shelf is empty

    // Try API for server-persisted books (with 8s timeout to avoid hanging)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const res = await fetch('/api/v1/story/books', { signal: controller.signal })
      clearTimeout(timeout)

      if (res.ok) {
        const { data } = await res.json()
        const rawList = Array.isArray(data) ? data : (data?.items ?? [])
        const apiBooks: BookshelfItem[] = (rawList || []).map((b: Record<string, unknown>) => ({
          id: b.id,
          slug: b.slug,
          title: b.title || 'Untitled',
          authors: (b.authors as string[]) || [],
          coverImageUrl: b.coverImageUrl || null,
          audience: b.audience || '',
          style: b.style || '',
          pageCount: b.pageCount || 0,
          isPublic: b.isPublic || false,
          createdAt: b.createdAt || '',
          seriesId: (b.seriesId as string) || null,
          seriesTitle: (b.seriesTitle as string) || null,
        }))

        // Merge: API books override local ones with same id or slug, then add local-only books
        const apiIds = new Set(apiBooks.map(b => b.id))
        const apiSlugs = new Set(apiBooks.map(b => b.slug))
        const localOnly = localBooks.filter(b => !apiIds.has(b.id) && !apiSlugs.has(b.slug))
        const merged = [...apiBooks, ...localOnly]
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setBooks(merged)
      }
    } catch {
      // Network/timeout error — local books already shown
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  /** Add a completed book to the bookshelf */
  const addBook = useCallback((book: StoryBook, seriesId?: string | null, seriesTitle?: string | null) => {
    const item = bookToItem(book, seriesId, seriesTitle)
    setBooks(prev => {
      // Don't add duplicates
      const filtered = prev.filter(b => b.id !== item.id && b.slug !== item.slug)
      const updated = [item, ...filtered]
      // Persist to localStorage
      const localBooks = loadLocalBooks().filter(b => b.id !== item.id && b.slug !== item.slug)
      saveLocalBooks([item, ...localBooks])
      return updated
    })
  }, [])

  /** Remove a book from the bookshelf */
  const removeBook = useCallback(async (id: string) => {
    // Try API delete
    try {
      await fetch(`/api/v1/story/books/${id}`, { method: 'DELETE' })
    } catch { /* silently fail */ }

    // Always remove from local
    setBooks(prev => {
      const updated = prev.filter(b => b.id !== id)
      const localBooks = loadLocalBooks().filter(b => b.id !== id)
      saveLocalBooks(localBooks)
      return updated
    })
  }, [])

  /** Toggle share status */
  const toggleShare = useCallback(async (item: BookshelfItem) => {
    try {
      const res = await fetch('/api/v1/story/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: item.id, isPublic: !item.isPublic }),
      })
      if (res.ok) {
        setBooks(prev => prev.map(b => b.id === item.id ? { ...b, isPublic: !b.isPublic } : b))
        if (!item.isPublic) {
          const url = `${window.location.origin}/tools/story-studio/book/${item.slug}`
          await navigator.clipboard.writeText(url)
        }
      }
    } catch { /* silently fail */ }
  }, [])

  return { books, groups, loading, fetchBooks, addBook, removeBook, toggleShare }
}
