// tools/story-studio/use-story-book.ts
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryBook, StoryConcept, AppPhase, ProgressEvent, Page } from './types'
import { clearPlotDraft } from './plot-input'

const STORAGE_KEY = 'toolk1t-story-studio-v2'

function loadFromStorage(): { book: StoryBook; concepts: StoryConcept; plot: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveToStorage(data: { book: StoryBook; concepts: StoryConcept; plot: string } | null) {
  try {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage full — silently fail
  }
}

export function useStoryBook() {
  const [phase, setPhase] = useState<AppPhase>('input')
  const [plot, setPlot] = useState<string | null>(null)
  const [concepts, setConcepts] = useState<StoryConcept | null>(null)
  const [selectedConcept, setSelectedConcept] = useState<StoryConcept | null>(null)
  const [book, setBook] = useState<StoryBook | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [progressEvents, setProgressEvents] = useState<ProgressEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromStorage()
    if (saved?.book?.status === 'complete') {
      setBook(saved.book)
      setConcepts(saved.concepts)
      setPlot(saved.plot)
      setPhase('viewer')
    }
  }, [])

  // Auto-save on book changes
  useEffect(() => {
    if (book?.status === 'complete' && concepts && plot) {
      saveToStorage({ book, concepts, plot })
    }
  }, [book, concepts, plot])

  const updateBook = useCallback((updates: Partial<StoryBook>) => {
    setBook(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null)
  }, [])

  const updatePage = useCallback((sequence: number, updates: Partial<Page>) => {
    setBook(prev => {
      if (!prev) return null
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        pages: prev.pages.map(p =>
          p.sequence === sequence ? { ...p, ...updates } : p
        ),
      }
    })
  }, [])

  const selectConcept = useCallback((concept: StoryConcept) => {
    setSelectedConcept(concept)
    setPhase('refine')
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setPhase('input')
    setPlot(null)
    setConcepts(null)
    setSelectedConcept(null)
    setBook(null)
    setEditorOpen(false)
    setProgressEvents([])
    setLoading(false)
    setError(null)
    setCreditsUsed(null)
    saveToStorage(null)
    clearPlotDraft()
  }, [])

  const [seriesId, setSeriesId] = useState<string | null>(null)

  const fetchConcepts = useCallback(async (plotText: string, seriesIdOverride?: string) => {
    setLoading(true)
    setError(null)
    setErrorCode(null)
    setPlot(plotText)

    const activeSeriesId = seriesIdOverride ?? seriesId

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/v1/story/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: plotText, ...(activeSeriesId ? { seriesId: activeSeriesId } : {}) }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        if (err?.code === 'INSUFFICIENT_CREDITS') {
          setErrorCode('INSUFFICIENT_CREDITS')
          throw new Error(err.details?.message || 'Insufficient credits to generate a story.')
        }
        throw new Error(err?.error || `Failed: ${res.status}`)
      }

      const { data } = await res.json()
      const concept = data as StoryConcept
      setConcepts(concept)
      setSelectedConcept(concept)
      setPhase('refine')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to generate concepts')
    } finally {
      setLoading(false)
    }
  }, [seriesId])

  const startGeneration = useCallback(async (plotText: string, concept: StoryConcept) => {
    setLoading(true)
    setError(null)
    setErrorCode(null)
    setPhase('generating')
    setProgressEvents([])

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/v1/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: plotText, concept, ...(seriesId ? { seriesId } : {}) }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        if (err?.code === 'INSUFFICIENT_CREDITS') {
          setErrorCode('INSUFFICIENT_CREDITS')
          throw new Error(err.details?.message || 'Insufficient credits to generate a story.')
        }
        throw new Error(err?.error || `Failed: ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as ProgressEvent

            setProgressEvents(prev => [...prev, event])

            if (event.type === 'story-ready') {
              setBook(event.data)
            } else if (event.type === 'image-done' && event.url) {
              setBook(prev => {
                if (!prev) return null
                return {
                  ...prev,
                  pages: prev.pages.map(p =>
                    p.sequence === event.page
                      ? { ...p, imageUrl: event.url, imageStatus: 'done' as const }
                      : p
                  ),
                }
              })
            } else if (event.type === 'audio-done' && event.url) {
              setBook(prev => {
                if (!prev) return null
                return {
                  ...prev,
                  pages: prev.pages.map(p =>
                    p.sequence === event.page
                      ? { ...p, audioUrl: event.url }
                      : p
                  ),
                }
              })
            } else if (event.type === 'complete') {
              setBook(event.data)
              if (event.creditsUsed) setCreditsUsed(event.creditsUsed)
              setPhase('viewer')
              clearPlotDraft()
            } else if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch (parseErr) {
            // Skip unparseable SSE lines
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Generation failed')
      setPhase('input')
    } finally {
      setLoading(false)
    }
  }, [seriesId])

  return {
    phase,
    setPhase,
    plot,
    concepts,
    selectedConcept,
    setSelectedConcept,
    book,
    editorOpen,
    setEditorOpen,
    progressEvents,
    loading,
    error,
    setError,
    errorCode,
    setErrorCode,
    creditsUsed,
    seriesId,
    setSeriesId,
    fetchConcepts,
    selectConcept,
    startGeneration,
    updateBook,
    updatePage,
    reset,
  }
}
