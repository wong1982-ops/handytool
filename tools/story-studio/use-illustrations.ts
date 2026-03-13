'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'

export interface PageIllustration {
  id: string
  sequence: number
  sceneDescription: string
  narrativeText: string
  imagePrompt: string | null
  dialogue: { speaker: string; line: string }[] | null
  mood: string | null
  illustration: {
    id: string
    imageUrl: string | null
    status: 'pending' | 'generating' | 'done' | 'error'
    qualityMode: 'fast' | 'quality'
    generationConfig: Record<string, unknown> | null
    createdAt: string
    updatedAt: string
  } | null
}

export interface BookCover {
  id: string
  imageUrl: string | null
  status: 'pending' | 'generating' | 'done' | 'error'
  prompt: string | null
  createdAt: string
}

export function useIllustrations() {
  const { activeBook } = useBookContext()
  const activeBookId = activeBook?.id ?? null
  const [pages, setPages] = useState<PageIllustration[]>([])
  const [cover, setCover] = useState<BookCover | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIllustrations = useCallback(async () => {
    if (!activeBookId) { setPages([]); setCover(null); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/story/books/${activeBookId}/illustrations`)
      if (!res.ok) throw new Error('Failed to load illustrations')
      const { data } = await res.json()
      setPages(data.pages ?? [])
      setCover(data.cover ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [activeBookId])

  useEffect(() => { fetchIllustrations() }, [fetchIllustrations])

  const generateOne = useCallback(async (
    pageId: string | null,
    imagePrompt: string,
    qualityMode: 'fast' | 'quality',
    characterIds?: string[],
  ) => {
    if (!activeBookId) return

    if (pageId) {
      setPages(prev => prev.map(p =>
        p.id === pageId
          ? { ...p, illustration: { ...p.illustration!, status: 'generating' } as PageIllustration['illustration'] }
          : p,
      ))
    }

    const res = await fetch(`/api/v1/story/books/${activeBookId}/illustrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, imagePrompt, qualityMode, characterIds }),
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error || 'Generation failed')
    }

    const { data } = await res.json()
    await fetchIllustrations()
    return data
  }, [activeBookId, fetchIllustrations])

  const generateBatch = useCallback(async (
    pages: { pageId: string; imagePrompt: string; characterIds?: string[] }[],
    qualityMode: 'fast' | 'quality',
    includeCover?: boolean,
    coverPrompt?: string,
  ) => {
    if (!activeBookId) return

    const res = await fetch(`/api/v1/story/books/${activeBookId}/illustrate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages, qualityMode, includeCover, coverPrompt }),
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error || 'Batch failed')
    }

    const { data } = await res.json()
    return data
  }, [activeBookId])

  return {
    pages, cover, loading, error,
    generateOne, generateBatch,
    refresh: fetchIllustrations,
  }
}
