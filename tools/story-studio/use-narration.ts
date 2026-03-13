'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'

export interface PageNarration {
  id: string
  sequence: number
  narrativeText: string
  dialogue: { speaker: string; line: string }[] | null
  audio: {
    id: string
    audioUrl: string | null
    status: 'pending' | 'generating' | 'done' | 'error'
    voiceMap: Record<string, string> | null
    durationSeconds: number | null
    createdAt: string
    updatedAt: string
  } | null
}

export function useNarration() {
  const { activeBook } = useBookContext()
  const activeBookId = activeBook?.id ?? null
  const [pages, setPages] = useState<PageNarration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAudio = useCallback(async () => {
    if (!activeBookId) { setPages([]); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/story/books/${activeBookId}/audio`)
      if (!res.ok) throw new Error('Failed to load audio')
      const { data } = await res.json()
      setPages(data.pages ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [activeBookId])

  useEffect(() => { fetchAudio() }, [fetchAudio])

  const generateOne = useCallback(async (
    pageId: string,
    narratorVoice: string,
    voiceMap?: Record<string, string>,
  ) => {
    if (!activeBookId) return

    setPages(prev => prev.map(p =>
      p.id === pageId
        ? { ...p, audio: { ...p.audio!, status: 'generating' } as PageNarration['audio'] }
        : p,
    ))

    const res = await fetch(`/api/v1/story/books/${activeBookId}/narrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, narratorVoice, voiceMap }),
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error || 'Narration failed')
    }

    await fetchAudio()
    return json
  }, [activeBookId, fetchAudio])

  const generateBatch = useCallback(async (
    pageIds: string[],
    narratorVoice: string,
    voiceMap?: Record<string, string>,
  ) => {
    if (!activeBookId) return

    const res = await fetch(`/api/v1/story/books/${activeBookId}/narrate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageIds, narratorVoice, voiceMap }),
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error || 'Batch narration failed')
    }

    return await res.json()
  }, [activeBookId])

  return {
    pages, loading, error,
    generateOne, generateBatch,
    refresh: fetchAudio,
  }
}
