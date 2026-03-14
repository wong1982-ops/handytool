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
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([])
  const [selectedArtStyle, setSelectedArtStyle] = useState<string | null>(null)

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
        body: JSON.stringify({
          plot: plotText,
          ...(activeSeriesId ? { seriesId: activeSeriesId } : {}),
          ...(selectedCharacterIds.length > 0 ? { characterIds: selectedCharacterIds } : {}),
          ...(selectedArtStyle ? { artStyle: selectedArtStyle } : {}),
        }),
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
  }, [seriesId, selectedCharacterIds, selectedArtStyle])

  // Job ID for background generation tracking
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  /**
   * Start background generation via the job queue.
   * Submits to POST /api/v1/story/jobs and returns immediately.
   * Progress is tracked via useJobProgress (Supabase Realtime).
   */
  const startGeneration = useCallback(async (plotText: string, concept: StoryConcept, options?: { skipIllustration?: boolean; skipAudio?: boolean; skipValidation?: boolean }) => {
    setLoading(true)
    setError(null)
    setErrorCode(null)
    setPhase('generating')
    setProgressEvents([])

    try {
      const res = await fetch('/api/v1/story/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot: plotText,
          concept,
          ...(seriesId ? { seriesId } : {}),
          ...(selectedCharacterIds.length > 0 ? { characterIds: selectedCharacterIds } : {}),
          ...(selectedArtStyle ? { artStyle: selectedArtStyle } : {}),
          ...(options?.skipIllustration ? { skipIllustration: true } : {}),
          ...(options?.skipAudio ? { skipAudio: true } : {}),
          ...(options?.skipValidation ? { skipValidation: true } : {}),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        if (err?.code === 'INSUFFICIENT_CREDITS') {
          setErrorCode('INSUFFICIENT_CREDITS')
          throw new Error(err.details?.message || 'Insufficient credits to generate a story.')
        }
        if (err?.code === 'JOB_LIMIT_REACHED') {
          setErrorCode('JOB_LIMIT_REACHED')
          throw new Error(err.error || 'You have 3 books generating. Wait for one to finish.')
        }
        throw new Error(err?.error || `Failed: ${res.status}`)
      }

      const { jobId } = await res.json()
      setActiveJobId(jobId)
      clearPlotDraft()

      // Generation is now running in the background.
      // The UI should show "Your book is being generated" with progress
      // tracked via useJobProgress.
      setProgressEvents([{ type: 'status', message: 'Your book is being generated in the background. You can leave this page.' }])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Generation failed')
      setPhase('input')
    } finally {
      setLoading(false)
    }
  }, [seriesId, selectedCharacterIds, selectedArtStyle])

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
    selectedCharacterIds,
    setSelectedCharacterIds,
    selectedArtStyle,
    setSelectedArtStyle,
    activeJobId,
    setActiveJobId,
    fetchConcepts,
    selectConcept,
    startGeneration,
    updateBook,
    updatePage,
    reset,
  }
}
