// tools/story-studio/use-story-book.ts
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StoryBook, StoryConcept, AppPhase, ProgressEvent, Page } from './types'

const STORAGE_KEY = 'toolk1t-story-studio-v2'

function loadFromStorage(): { book: StoryBook; concepts: [StoryConcept, StoryConcept]; plot: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveToStorage(data: { book: StoryBook; concepts: [StoryConcept, StoryConcept]; plot: string } | null) {
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
  const [concepts, setConcepts] = useState<[StoryConcept, StoryConcept] | null>(null)
  const [selectedConcept, setSelectedConcept] = useState<StoryConcept | null>(null)
  const [book, setBook] = useState<StoryBook | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [progressEvents, setProgressEvents] = useState<ProgressEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    saveToStorage(null)
  }, [])

  const fetchConcepts = useCallback(async (plotText: string) => {
    setLoading(true)
    setError(null)
    setPlot(plotText)

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/v1/story/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: plotText }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || `Failed: ${res.status}`)
      }

      const { data } = await res.json()
      setConcepts(data as [StoryConcept, StoryConcept])
      setPhase('concepts')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to generate concepts')
    } finally {
      setLoading(false)
    }
  }, [])

  const startGeneration = useCallback(async (plotText: string, concept: StoryConcept) => {
    setLoading(true)
    setError(null)
    setPhase('generating')
    setProgressEvents([])

    try {
      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch('/api/v1/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: plotText, concept }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
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
              setPhase('viewer')
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
  }, [])

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
    fetchConcepts,
    selectConcept,
    startGeneration,
    updateBook,
    updatePage,
    reset,
  }
}
