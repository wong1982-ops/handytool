'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { NewsItem, NewsFilters, NewsCategory, NewsResponse } from './types'
import { DAYS_OPTIONS } from './types'
import { NewsCard } from './news-card'
import { NewsSearchBar } from './news-search-bar'
import { NewsPagination } from './news-pagination'
import { NewsDetailModal } from './news-detail-modal'

interface NewsFeedProps {
  category: NewsCategory | 'all'
}

type PageState = 'loading' | 'success' | 'error'

function buildFiltersFromParams(params: URLSearchParams, category: NewsCategory | 'all'): NewsFilters {
  return {
    category: category === 'all' ? undefined : category,
    page: Number(params.get('page')) || 1,
    limit: 20,
    days: params.get('days') ? Number(params.get('days')) : undefined,
    q: params.get('q') || undefined,
  }
}

function filtersToParams(filters: NewsFilters, category: NewsCategory | 'all'): URLSearchParams {
  const p = new URLSearchParams()
  p.set('category', category)
  if (filters.page > 1) p.set('page', String(filters.page))
  if (filters.q) p.set('q', filters.q)
  if (filters.days) p.set('days', String(filters.days))
  return p
}

function filtersToApiParams(filters: NewsFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.category) p.set('category', filters.category)
  p.set('page', String(filters.page))
  p.set('limit', String(filters.limit))
  if (filters.days) p.set('days', String(filters.days))
  if (filters.q) p.set('q', filters.q)
  return p
}

export function NewsFeed({ category }: NewsFeedProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filters, setFilters] = useState<NewsFilters>(() =>
    buildFiltersFromParams(searchParams, category),
  )
  const [state, setState] = useState<PageState>('loading')
  const [response, setResponse] = useState<NewsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null)

  // Re-sync category when tab changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: category === 'all' ? undefined : category,
      page: 1,
    }))
  }, [category])

  const fetchNews = useCallback(async (f: NewsFilters) => {
    setState('loading')
    setError(null)

    const params = filtersToApiParams(f)

    try {
      const res = await fetch(`/api/v1/ai-news?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || `Request failed (${res.status})`)
      }

      setResponse(json.data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
      setState('error')
    }
  }, [])

  // Fetch on filter change
  useEffect(() => {
    fetchNews(filters)
    const params = filtersToParams(filters, category)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [filters, fetchNews, router, category])

  const updateFilters = (updates: Partial<NewsFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + days filter row */}
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <NewsSearchBar
            value={filters.q ?? ''}
            onChange={(q) => updateFilters({ q: q || undefined, page: 1 })}
          />
        </div>
        <select
          value={filters.days?.toString() ?? ''}
          onChange={(e) => updateFilters({ days: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
          className="h-12 px-3 pr-8 rounded-xl border border-[#1e2631] bg-[#131a23] text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]/50 shrink-0 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2370767f%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat"
          aria-label="Filter by time range"
        >
          <option value="">All time</option>
          {DAYS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {state === 'error' && (
        <div className="p-6 text-center rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10">
          <p className="text-sm text-[#EF4444] mb-3">{error}</p>
          <button
            type="button"
            onClick={() => fetchNews(filters)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 transition-colors cursor-pointer min-h-[44px]"
          >
            Retry
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-[#1e2631] animate-pulse" />
          ))}
        </div>
      )}

      {state === 'success' && response && (
        <>
          {response.data.length === 0 ? (
            <div className="p-10 text-center rounded-xl border border-[#1e2631]">
              <p className="text-[#a6abb5]">No AI news found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {response.data.map((item) => (
                <NewsCard key={item.id} item={item} onClick={setSelectedItem} />
              ))}
            </div>
          )}
          <NewsPagination
            pagination={response.pagination}
            onPageChange={(page) => updateFilters({ page })}
          />
        </>
      )}

      <NewsDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
