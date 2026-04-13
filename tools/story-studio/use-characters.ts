'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

export const ART_STYLES = [
  { value: "children's book illustration", label: "Children's Book", labelZh: '绘本风' },
  { value: 'watercolor painting', label: 'Watercolor', labelZh: '水彩' },
  { value: 'cartoon', label: 'Cartoon', labelZh: '卡通' },
  { value: 'anime', label: 'Anime', labelZh: '动漫' },
  { value: 'pixel art', label: 'Pixel Art', labelZh: '像素' },
  { value: 'oil painting', label: 'Oil Painting', labelZh: '油画' },
  { value: 'pencil sketch', label: 'Pencil Sketch', labelZh: '铅笔素描' },
  { value: 'comic book', label: 'Comic Book', labelZh: '漫画' },
  { value: 'flat vector illustration', label: 'Flat Vector', labelZh: '扁平矢量' },
  { value: '3D render', label: '3D Render', labelZh: '3D 渲染' },
  { value: 'realistic digital art', label: 'Realistic', labelZh: '写实' },
  { value: 'pastel drawing', label: 'Pastel', labelZh: '粉彩' },
  { value: 'ink wash painting', label: 'Ink Wash', labelZh: '水墨' },
  { value: 'storybook gouache', label: 'Gouache', labelZh: '水粉' },
] as const

export function getArtStyleLabel(style: typeof ART_STYLES[number], lang: string) {
  return lang === 'zh' ? style.labelZh : style.label
}

export interface CharacterPortrait {
  id: string
  imageUrl: string
  artStyle: string
  isPrimary: boolean
  refinementCount: number
  createdAt: string
}

export interface CharacterItem {
  id: string
  name: string
  age: string | null
  role: string | null
  personality: string | null
  physicalDescription: string | null
  referenceImageUrl: string | null
  voice: string | null
  artStyle: string | null
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
  artStyle?: string
}

export interface UpdateCharacterInput {
  name?: string
  age?: string
  role?: 'protagonist' | 'antagonist' | 'supporting'
  personality?: string
  physicalDescription?: string
  voice?: string | null
  artStyle?: string
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
        artStyle: (c.art_style as string) ?? null,
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
  const [portraits, setPortraits] = useState<CharacterPortrait[]>([])
  const [loading, setLoading] = useState(false)
  const [refining, setRefining] = useState(false)

  const fetchCharacter = useCallback(async () => {
    if (!characterId || !user) return
    setLoading(true)
    try {
      const [charRes, portraitsRes] = await Promise.all([
        fetch(`/api/v1/story/characters/${characterId}`),
        fetch(`/api/v1/story/characters/${characterId}/portraits`),
      ])
      if (!charRes.ok) throw new Error('Not found')
      const { data: charData } = await charRes.json()
      setCharacter(charData)

      if (portraitsRes.ok) {
        const { data: portraitsData } = await portraitsRes.json()
        setPortraits(portraitsData ?? [])
      }
    } catch {
      setCharacter(null)
      setPortraits([])
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

  // Generate a new portrait for a given art style, or refine an existing one
  const generatePortrait = useCallback(async (artStyle: string, feedback?: string, portraitId?: string) => {
    if (!characterId || !character?.physicalDescription) return
    setRefining(true)
    try {
      const res = await fetch(`/api/v1/story/characters/${characterId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          physicalDescription: character.physicalDescription,
          artStyle,
          feedback,
          portraitId,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.code === 'INSUFFICIENT_CREDITS' ? 'Insufficient credits' : json.error)
      }
      // Update portraits from response
      if (json.data.portraits) {
        setPortraits(json.data.portraits)
      }
      // Refresh character to get updated reference_image_url
      await fetchCharacter()
      return json.data
    } finally {
      setRefining(false)
    }
  }, [characterId, character?.physicalDescription, fetchCharacter])

  const setPrimaryPortrait = useCallback(async (portraitId: string) => {
    if (!characterId) return
    const res = await fetch(`/api/v1/story/characters/${characterId}/portraits/${portraitId}/primary`, {
      method: 'POST',
    })
    if (!res.ok) throw new Error('Failed to set primary')
    // Optimistic update
    setPortraits(prev => prev.map(p => ({ ...p, isPrimary: p.id === portraitId })))
    await fetchCharacter()
  }, [characterId, fetchCharacter])

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
    character, portraits, loading, refining,
    updateCharacter, generatePortrait, setPrimaryPortrait, approveCharacter,
    linkToSeries, unlinkFromSeries, refresh: fetchCharacter,
  }
}
