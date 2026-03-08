// tools/story-studio/use-bookshelf.ts
'use client'

import { useState, useCallback, useEffect } from 'react'
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
function bookToItem(book: StoryBook): BookshelfItem {
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
  }
}

export function useBookshelf() {
  const [books, setBooks] = useState<BookshelfItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load on mount: merge localStorage + API results
  const fetchBooks = useCallback(async () => {
    setLoading(true)

    // Always start with local books
    const localBooks = loadLocalBooks()

    // Try API for server-persisted books (production with auth)
    try {
      const res = await fetch('/api/v1/story/books')
      if (res.ok) {
        const { data } = await res.json()
        const apiBooks: BookshelfItem[] = (data || []).map((b: Record<string, unknown>) => ({
          id: b.id,
          slug: b.slug,
          title: b.title || 'Untitled',
          authors: [],
          coverImageUrl: b.coverImageUrl || null,
          audience: b.audience || '',
          style: b.style || '',
          pageCount: b.pageCount || 0,
          isPublic: b.isPublic || false,
          createdAt: b.createdAt || '',
        }))

        // Merge: API books override local ones with same id, then add local-only books
        const apiIds = new Set(apiBooks.map(b => b.id))
        const localOnly = localBooks.filter(b => !apiIds.has(b.id))
        const merged = [...apiBooks, ...localOnly]
        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setBooks(merged)
      } else {
        // API failed (e.g. no auth in dev) — use local books only
        setBooks(localBooks)
      }
    } catch {
      // Network error — use local books only
      setBooks(localBooks)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  /** Add a completed book to the bookshelf */
  const addBook = useCallback((book: StoryBook) => {
    const item = bookToItem(book)
    setBooks(prev => {
      // Don't add duplicates
      const filtered = prev.filter(b => b.id !== item.id)
      const updated = [item, ...filtered]
      // Persist to localStorage
      const localBooks = loadLocalBooks().filter(b => b.id !== item.id)
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

  return { books, loading, fetchBooks, addBook, removeBook, toggleShare }
}
