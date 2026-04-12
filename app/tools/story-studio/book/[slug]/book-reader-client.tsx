'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { BookViewer } from '@/tools/story-studio/book-viewer'
import { BulkGenerateActions } from '@/tools/story-studio/bulk-generate-actions'
import { LanguageProvider } from '@/tools/story-studio/use-language-context'
import type { StoryBook, Page } from '@/tools/story-studio/types'
import { PageEditor } from './page-editor'

interface BookReaderClientProps {
  bookData: Record<string, unknown>
  bookId?: string
  isOwner?: boolean
  /** Initial pages loaded server-side (first batch) */
  initialPages?: Record<string, unknown>[]
  /** Total page count from shell RPC */
  pageCount?: number
  /** Book creation mode */
  bookMode?: 'speed' | 'professional'
}

const PAGE_BATCH_SIZE = 4
const PREFETCH_AHEAD = 2 // start fetching when user is within N pages of loaded boundary

export function BookReaderClient({ bookData, bookId, isOwner, initialPages, pageCount, bookMode }: BookReaderClientProps) {
  // If initialPages provided (lazy-load mode), use them; otherwise fall back to bookData.pages (full load)
  const isLazyMode = initialPages !== undefined && pageCount !== undefined
  const allPagesFromData = (bookData.pages as Page[]) || []

  const [pages, setPages] = useState<Page[]>(() => {
    if (isLazyMode) {
      return (initialPages || []) as unknown as Page[]
    }
    return allPagesFromData
  })

  const [editingPage, setEditingPage] = useState<number | null>(null)
  const [loadedCount, setLoadedCount] = useState(() => isLazyMode ? (initialPages?.length || 0) : allPagesFromData.length)
  const loadingRef = useRef(false)
  const totalPages = isLazyMode ? pageCount! : allPagesFromData.length

  /** Fetch the next batch of pages from the API */
  const fetchMorePages = useCallback(async () => {
    if (!bookId || !isLazyMode || loadingRef.current || loadedCount >= totalPages) return

    loadingRef.current = true
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/pages?offset=${loadedCount}&limit=${PAGE_BATCH_SIZE}`)
      if (!res.ok) {
        console.error('[BookReader] Failed to fetch pages:', res.status)
        return
      }
      const { data: newPages } = await res.json()
      if (newPages?.length) {
        setPages(prev => [...prev, ...(newPages as Page[])])
        setLoadedCount(prev => prev + newPages.length)
      }
    } catch (err) {
      console.error('[BookReader] Error fetching pages:', err)
    } finally {
      loadingRef.current = false
    }
  }, [bookId, isLazyMode, loadedCount, totalPages])

  /** Pre-fetch pages when user approaches the loaded boundary */
  const handlePageChange = useCallback((currentPage: number) => {
    if (!isLazyMode) return
    // currentPage is 0-indexed (0 = cover). Pages start at index 1.
    // Prefetch when within PREFETCH_AHEAD of loaded boundary
    if (currentPage >= loadedCount - PREFETCH_AHEAD && loadedCount < totalPages) {
      fetchMorePages()
    }
  }, [isLazyMode, loadedCount, totalPages, fetchMorePages])

  // Eagerly load all remaining pages in background after initial render
  useEffect(() => {
    if (!isLazyMode || loadedCount >= totalPages) return

    // Small delay to prioritize initial render
    const timer = setTimeout(() => {
      fetchMorePages()
    }, 500)
    return () => clearTimeout(timer)
  }, [isLazyMode, loadedCount, totalPages, fetchMorePages])

  const book = useMemo<StoryBook>(() => {
    return {
      id: (bookData.id as string) || '',
      slug: (bookData.slug as string) || '',
      title: (bookData.title as string) || 'Untitled',
      authors: (bookData.authors as string[]) || ['AI'],
      coverImageUrl: (bookData.coverImageUrl as string) || undefined,
      concept: bookData.concept as StoryBook['concept'],
      theme: (bookData.theme as string) || '',
      setting: (bookData.setting as string) || '',
      characters: (bookData.characters as StoryBook['characters']) || [],
      pages,
      status: 'complete',
      createdAt: (bookData.createdAt as string) || '',
      updatedAt: (bookData.updatedAt as string) || '',
    }
  }, [bookData, pages])

  const handlePageUpdate = useCallback((sequence: number, updates: Partial<Page>) => {
    setPages(prev => prev.map(p => p.sequence === sequence ? { ...p, ...updates } : p))
  }, [])

  if (!pages.length && totalPages === 0) return null

  // Show page editor overlay when editing
  if (editingPage !== null && bookId && isOwner) {
    const page = pages.find(p => p.sequence === editingPage)
    if (page) {
      return (
        <PageEditor
          bookId={bookId}
          page={page}
          characters={book.characters}
          onSave={(updates) => {
            handlePageUpdate(editingPage, updates)
            setEditingPage(null)
          }}
          onCancel={() => setEditingPage(null)}
        />
      )
    }
  }

  // Detect whether pages already have illustrations/narration
  const hasIllustrations = pages.length > 0 && pages.some(p => !!p.imageUrl)
  const hasNarration = pages.length > 0 && pages.some(p => !!p.audioUrl)
  const showBulkActions = isOwner && bookId && bookMode === 'speed'

  return (
    <LanguageProvider>
      {showBulkActions && (
        <BulkGenerateActions
          bookId={bookId}
          pageCount={totalPages}
          hasIllustrations={hasIllustrations}
          hasNarration={hasNarration}
        />
      )}
      <BookViewer
        book={book}
        onEdit={() => {}}
        onStartOver={() => {}}
        readOnly
        isOwner={isOwner}
        onEditPage={isOwner && bookId ? (sequence) => setEditingPage(sequence) : undefined}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        pagesLoaded={loadedCount}
      />
    </LanguageProvider>
  )
}
