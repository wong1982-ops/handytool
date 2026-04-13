'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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
  hasAudio: boolean
  hasIllustrations: boolean
  createdAt: string
  updatedAt: string
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'updated'

const PAGE_SIZE = 12

export function useStoriesList() {
  const [stories, setStories] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterSeries, setFilterSeries] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const cursorRef = useRef<string | null>(null)

  const fetchStories = useCallback(async (cursor?: string | null) => {
    const isFirstPage = !cursor
    try {
      if (isFirstPage) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
      if (cursor) params.set('cursor', cursor)

      const res = await fetch(`/api/v1/story/books?${params}`)
      if (!res.ok) {
        if (res.status === 401) { setLoading(false); setLoadingMore(false); return }
        throw new Error('Failed to load stories')
      }
      const json = await res.json()

      // Support both paginated { items, nextCursor } and legacy array response
      let items: StoryItem[]
      let nextCursor: string | null = null

      if (json.data && Array.isArray(json.data.items)) {
        items = json.data.items
        nextCursor = json.data.nextCursor ?? null
      } else if (Array.isArray(json.data)) {
        items = json.data
        nextCursor = null
      } else {
        items = []
      }

      cursorRef.current = nextCursor
      setHasMore(nextCursor !== null)

      if (isFirstPage) {
        setStories(items)
      } else {
        setStories(prev => {
          const existingIds = new Set(prev.map(s => s.id))
          const newItems = items.filter(s => !existingIds.has(s.id))
          return [...prev, ...newItems]
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { fetchStories() }, [fetchStories])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !cursorRef.current) return
    fetchStories(cursorRef.current)
  }, [fetchStories, loadingMore, hasMore])

  const refresh = useCallback(() => {
    cursorRef.current = null
    setHasMore(false)
    fetchStories()
  }, [fetchStories])

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
    loading, loadingMore, error,
    hasMore, loadMore,
    search, setSearch,
    sortBy, setSortBy,
    filterSeries, setFilterSeries,
    deleteStory, toggleShare, markComplete,
    refresh,
  }
}
