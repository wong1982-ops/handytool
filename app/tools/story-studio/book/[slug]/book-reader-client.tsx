'use client'

import { useMemo, useState, useCallback } from 'react'
import { BookViewer } from '@/tools/story-studio/book-viewer'
import type { StoryBook, Page } from '@/tools/story-studio/types'
import { PageEditor } from './page-editor'

interface BookReaderClientProps {
  bookData: Record<string, unknown>
  bookId?: string
  isOwner?: boolean
}

export function BookReaderClient({ bookData, bookId, isOwner }: BookReaderClientProps) {
  const [pages, setPages] = useState<Page[]>(() => (bookData.pages as Page[]) || [])
  const [editingPage, setEditingPage] = useState<number | null>(null)

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

  if (!book.pages.length) return null

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

  return (
    <BookViewer
      book={book}
      onEdit={() => {}}
      onStartOver={() => {}}
      readOnly
      isOwner={isOwner}
      onEditPage={isOwner && bookId ? (sequence) => setEditingPage(sequence) : undefined}
    />
  )
}
