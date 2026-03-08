'use client'

import { useMemo } from 'react'
import { BookViewer } from '@/tools/story-studio/book-viewer'
import type { StoryBook } from '@/tools/story-studio/types'

interface BookReaderClientProps {
  bookData: Record<string, unknown>
}

export function BookReaderClient({ bookData }: BookReaderClientProps) {
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
      pages: (bookData.pages as StoryBook['pages']) || [],
      status: 'complete',
      createdAt: (bookData.createdAt as string) || '',
      updatedAt: (bookData.updatedAt as string) || '',
    }
  }, [bookData])

  if (!book.pages.length) return null

  return (
    <BookViewer
      book={book}
      onEdit={() => {}}
      onStartOver={() => {}}
      readOnly
    />
  )
}
