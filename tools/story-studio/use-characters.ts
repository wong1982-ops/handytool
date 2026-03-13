'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

export interface CharacterItem {
  id: string
  name: string
  age: string | null
  role: string | null
  personality: string | null
  physicalDescription: string | null
  referenceImageUrl: string | null
  voice: string | null
  status: 'draft' | 'approved'
  refinementCount: number
  seriesIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateCharacterInput {
  name: string
  age?: string
  role?: 'protagonist' | 'antagonist' | 'supporting'
  personality?: string
  physicalDescription?: string
  voice?: string
}

export interface UpdateCharacterInput {
  name?: string
  age?: string
  role?: 'protagonist' | 'antagonist' | 'supporting'
  personality?: string
  physicalDescription?: string
  voice?: string | null
}

export function useCharacterList() {
  const { user } = useAuth()
  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCharacters = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      setLoading(true)
      const res = await fetch('/api/v1/story/characters')
      if (!res.ok) throw new Error('Failed to load characters')
      const { data } = await res.json()
      const mapped: CharacterItem[] = (data ?? []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        name: c.name as string,
        age: (c.age as string) ?? null,
        role: (c.role as string) ?? null,
        personality: (c.personality as string) ?? null,
        physicalDescription: (c.physical_description as string) ?? null,
        referenceImageUrl: (c.reference_image_url as string) ?? null,
        voice: (c.voice as string) ?? null,
        status: (c.status as 'draft' | 'approved') ?? 'draft',
        refinementCount: (c.refinement_count as number) ?? 0,
        seriesIds: Array.isArray(c.series)
          ? (c.series as { id: string }[]).map(s => s.id)
          : [],
        createdAt: c.created_at as string,
        updatedAt: c.updated_at as string,
      }))
      setCharacters(mapped)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchCharacters() }, [fetchCharacters])

  const createCharacter = useCallback(async (input: CreateCharacterInput) => {
    const res = await fetch('/api/v1/story/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create character')
    }
    await fetchCharacters()
    return json.data.id as string
  }, [fetchCharacters])

  const deleteCharacter = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/story/characters/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete character')
    setCharacters(prev => prev.filter(c => c.id !== id))
  }, [])

  return { characters, loading, error, createCharacter, deleteCharacter, refresh: fetchCharacters }
}

export function useCharacterDetail(characterId: string | null) {
  const { user } = useAuth()
  const [character, setCharacter] = useState<CharacterItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [refining, setRefining] = useState(false)

  const fetchCharacter = useCallback(async () => {
    if (!characterId || !user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/story/characters/${characterId}`)
      if (!res.ok) throw new Error('Not found')
      const { data } = await res.json()
      setCharacter(data)
    } catch {
      setCharacter(null)
    } finally {
      setLoading(false)
    }
  }, [characterId, user])

  useEffect(() => { fetchCharacter() }, [fetchCharacter])

  const updateCharacter = useCallback(async (updates: UpdateCharacterInput) => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update')
    await fetchCharacter()
  }, [characterId, fetchCharacter])

  const refinePortrait = useCallback(async (physicalDescription: string, feedback?: string) => {
    if (!characterId) return
    setRefining(true)
    try {
      const res = await fetch(`/api/v1/story/characters/${characterId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physicalDescription, feedback }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.code === 'INSUFFICIENT_CREDITS' ? 'Insufficient credits' : json.error)
      }
      setCharacter(prev => prev ? {
        ...prev,
        physicalDescription: json.data.physicalDescription,
        referenceImageUrl: json.data.referenceImageUrl,
        refinementCount: json.data.refinementCount,
      } : null)
      return json.data
    } finally {
      setRefining(false)
    }
  }, [characterId])

  const approveCharacter = useCallback(async () => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}/approve`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to approve')
    setCharacter(prev => prev ? { ...prev, status: 'approved' } : null)
  }, [characterId])

  const linkToSeries = useCallback(async (seriesId: string) => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}/series`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesId }),
    })
    if (!res.ok) throw new Error('Failed to link')
    await fetchCharacter()
  }, [characterId, fetchCharacter])

  const unlinkFromSeries = useCallback(async (seriesId: string) => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}/series?seriesId=${seriesId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to unlink')
    await fetchCharacter()
  }, [characterId, fetchCharacter])

  return {
    character, loading, refining,
    updateCharacter, refinePortrait, approveCharacter,
    linkToSeries, unlinkFromSeries, refresh: fetchCharacter,
  }
}
