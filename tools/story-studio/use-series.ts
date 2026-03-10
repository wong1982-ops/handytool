'use client'

import { useState, useCallback, useEffect } from 'react'

export interface SeriesCharacter {
  id: string
  name: string
  description: string
  referenceImageUrl: string | null
  status: 'draft' | 'approved'
  refinementCount: number
  voice: string | null
}

export interface SeriesItem {
  id: string
  title: string
  description: string
  setting: string
  artStyle: string
  isPublic: boolean
  createdAt: string
  characters: { name: string; referenceImageUrl: string | null; status: string }[]
  bookCount: number
}

export interface SeriesDetail {
  id: string
  title: string
  description: string
  setting: string
  artStyle: string
  isPublic: boolean
  createdAt: string
  characters: SeriesCharacter[]
  books: {
    id: string
    slug: string
    title: string
    coverImageUrl: string | null
    pageCount: number
    isPublic: boolean
    createdAt: string
  }[]
  isOwner: boolean
}

export function useSeriesList() {
  const [series, setSeries] = useState<SeriesItem[]>([])
  const [loading, setLoading] = useState(true)

  const [needsAuth, setNeedsAuth] = useState(false)

  const fetchSeries = useCallback(async () => {
    setLoading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('/api/v1/story/series', { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        const { data } = await res.json()
        setSeries(data || [])
      } else if (res.status === 401) {
        setNeedsAuth(true)
      }
    } catch { /* silently fail on network/timeout error */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSeries() }, [fetchSeries])

  const createSeries = useCallback(async (input: { title: string; description: string; setting: string; artStyle: string }) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch('/api/v1/story/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to create series')
      }
      const { data } = await res.json()
      await fetchSeries()
      return data.id as string
    } catch (err) {
      clearTimeout(timeout)
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.')
      }
      throw err
    }
  }, [fetchSeries])

  const deleteSeries = useCallback(async (id: string) => {
    await fetch(`/api/v1/story/series/${id}`, { method: 'DELETE' })
    setSeries(prev => prev.filter(s => s.id !== id))
  }, [])

  return { series, loading, needsAuth, fetchSeries, createSeries, deleteSeries }
}

export function useSeriesDetail(id: string) {
  const [detail, setDetail] = useState<SeriesDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refiningCharId, setRefiningCharId] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(`/api/v1/story/series/${id}`, { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        const { data } = await res.json()
        setDetail(data)
      } else {
        setError('Series not found')
      }
    } catch { setError('Failed to load series') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  const updateSeries = useCallback(async (updates: { title?: string; description?: string; setting?: string; artStyle?: string; isPublic?: boolean }) => {
    const res = await fetch(`/api/v1/story/series/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) await fetchDetail()
  }, [id, fetchDetail])

  const addCharacter = useCallback(async (name: string, description: string, voice?: string | null) => {
    const res = await fetch(`/api/v1/story/series/${id}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, voice: voice || null }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.error || 'Failed to add character')
    }
    const { data } = await res.json()
    await fetchDetail()
    return data.id as string
  }, [id, fetchDetail])

  const updateCharacter = useCallback(async (charId: string, updates: { name?: string; description?: string; voice?: string | null }) => {
    await fetch(`/api/v1/story/series/${id}/characters/${charId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    await fetchDetail()
  }, [id, fetchDetail])

  const deleteCharacter = useCallback(async (charId: string) => {
    await fetch(`/api/v1/story/series/${id}/characters/${charId}`, { method: 'DELETE' })
    await fetchDetail()
  }, [id, fetchDetail])

  const refineCharacter = useCallback(async (charId: string, description: string, feedback?: string) => {
    setRefiningCharId(charId)
    setError(null)
    try {
      const res = await fetch('/api/v1/story/series/refine-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId: id, characterId: charId, description, feedback }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        if (err?.code === 'INSUFFICIENT_CREDITS') {
          throw new Error(err.details?.message || 'Insufficient credits')
        }
        throw new Error(err?.error || 'Refinement failed')
      }
      const { data } = await res.json()
      const result = data as { description: string; referenceImageUrl: string; refinementCount: number; maxRefinements: number }

      // Optimistic update: patch only this character instead of refetching everything
      setDetail(prev => {
        if (!prev) return prev
        return {
          ...prev,
          characters: prev.characters.map(c =>
            c.id === charId
              ? { ...c, description: result.description, referenceImageUrl: result.referenceImageUrl, refinementCount: result.refinementCount }
              : c
          ),
        }
      })

      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Refinement failed'
      setError(msg)
      throw err
    } finally {
      setRefiningCharId(null)
    }
  }, [id])

  const approveCharacter = useCallback(async (charId: string) => {
    const res = await fetch(`/api/v1/story/series/${id}/characters/${charId}/approve`, { method: 'POST' })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.error || 'Failed to approve character')
    }
    await fetchDetail()
  }, [id, fetchDetail])

  const duplicateCharacter = useCallback(async (sourceSeriesId: string, sourceCharacterId: string) => {
    const res = await fetch(`/api/v1/story/series/${id}/characters/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceSeriesId, sourceCharacterId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      throw new Error(err?.error || 'Failed to duplicate character')
    }
    const { data } = await res.json()
    await fetchDetail()
    return data.id as string
  }, [id, fetchDetail])

  return {
    detail, loading, error, setError, refiningCharId,
    fetchDetail, updateSeries, addCharacter, updateCharacter, deleteCharacter,
    refineCharacter, approveCharacter, duplicateCharacter,
  }
}
