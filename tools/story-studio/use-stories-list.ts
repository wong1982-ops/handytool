'use client'

import { useState, useEffect, useCallback } from 'react'

export interface StoryItem {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  pageCount: number
  isPublic: boolean
  status: 'draft' | 'complete'
  seriesId: string | null
  seriesTitle: string | null
  audience: string | null
  style: string | null
  createdAt: string
  updatedAt: string
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'updated'

export function useStoriesList() {
  const [stories, setStories] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterSeries, setFilterSeries] = useState<string | null>(null)

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/story/books')
      if (!res.ok) {
        if (res.status === 401) { setLoading(false); return }
        throw new Error('Failed to load stories')
      }
      const { data } = await res.json()
      setStories(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStories() }, [fetchStories])

  const deleteStory = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/story/books/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    setStories(prev => prev.filter(s => s.id !== id))
  }, [])

  const toggleShare = useCallback(async (id: string, isPublic: boolean) => {
    const res = await fetch('/api/v1/story/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId: id, isPublic }),
    })
    if (!res.ok) throw new Error('Failed to update sharing')
    setStories(prev => prev.map(s => s.id === id ? { ...s, isPublic } : s))
  }, [])

  const markComplete = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/story/books/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'complete' }),
    })
    if (!res.ok) throw new Error('Failed to mark as complete')
    setStories(prev => prev.map(s => s.id === id ? { ...s, status: 'complete' as const } : s))
  }, [])

  // Client-side filtering & sorting
  const filtered = stories
    .filter(s => {
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filterSeries && s.seriesId !== filterSeries) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'alphabetical': return a.title.localeCompare(b.title)
        case 'updated': return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        default: return 0
      }
    })

  return {
    stories: filtered,
    allStories: stories,
    loading, error,
    search, setSearch,
    sortBy, setSortBy,
    filterSeries, setFilterSeries,
    deleteStory, toggleShare, markComplete,
    refresh: fetchStories,
  }
}
