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
