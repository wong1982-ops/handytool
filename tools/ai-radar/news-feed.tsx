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
          className="h-12 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50 shrink-0"
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
        <div className="p-6 text-center rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            type="button"
            onClick={() => fetchNews(filters)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {state === 'success' && response && (
        <>
          {response.data.length === 0 ? (
            <div className="p-10 text-center rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">No AI news found matching your search.</p>
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
