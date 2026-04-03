'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Job, JobFilters, JobCategory, JobsResponse } from './types'
import { JobCard } from './job-card'
import { JobSearchBar } from './job-search-bar'
import { JobFiltersPanel } from './job-filters'
import { JobPagination } from './job-pagination'
import { JobDetailModal } from './job-detail-modal'

interface JobGalleryProps {
  category: JobCategory
}

type PageState = 'loading' | 'success' | 'error'

function buildFiltersFromParams(params: URLSearchParams, category: JobCategory): JobFilters {
  return {
    category,
    page: Number(params.get('page')) || 1,
    limit: Number(params.get('limit')) || 20,
    sort: (params.get('sort') as JobFilters['sort']) || 'posted_at',
    order: (params.get('order') as JobFilters['order']) || 'desc',
    employment_type: (params.get('employment_type') as JobFilters['employment_type']) || undefined,
    work_mode: (params.get('work_mode') as JobFilters['work_mode']) || undefined,
    country: (params.get('country') as JobFilters['country']) || undefined,
    days: params.get('days') ? Number(params.get('days')) : undefined,
    salary_min: params.get('salary_min') ? Number(params.get('salary_min')) : undefined,
    salary_max: params.get('salary_max') ? Number(params.get('salary_max')) : undefined,
    hourly_min: params.get('hourly_min') ? Number(params.get('hourly_min')) : undefined,
    hourly_max: params.get('hourly_max') ? Number(params.get('hourly_max')) : undefined,
    q: params.get('q') || undefined,
  }
}

function filtersToParams(filters: JobFilters): URLSearchParams {
  const p = new URLSearchParams()
  p.set('category', filters.category)
  if (filters.page > 1) p.set('page', String(filters.page))
  if (filters.q) p.set('q', filters.q)
  if (filters.employment_type) p.set('employment_type', filters.employment_type)
  if (filters.work_mode) p.set('work_mode', filters.work_mode)
  if (filters.country) p.set('country', filters.country)
  if (filters.days) p.set('days', String(filters.days))
  if (filters.salary_min) p.set('salary_min', String(filters.salary_min))
  if (filters.salary_max) p.set('salary_max', String(filters.salary_max))
  if (filters.hourly_min) p.set('hourly_min', String(filters.hourly_min))
  if (filters.hourly_max) p.set('hourly_max', String(filters.hourly_max))
  if (filters.sort !== 'posted_at') p.set('sort', filters.sort)
  if (filters.order !== 'desc') p.set('order', filters.order)
  return p
}

export function JobGallery({ category }: JobGalleryProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filters, setFilters] = useState<JobFilters>(() =>
    buildFiltersFromParams(searchParams, category),
  )
  const [state, setState] = useState<PageState>('loading')
  const [response, setResponse] = useState<JobsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Re-sync category when tab changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, category, page: 1 }))
  }, [category])

  const fetchJobs = useCallback(async (f: JobFilters) => {
    setState('loading')
    setError(null)

    const params = filtersToParams(f)

    try {
      const res = await fetch(`/api/v1/jobs?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || `Request failed (${res.status})`)
      }

      setResponse(json.data)
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
      setState('error')
    }
  }, [])

  // Fetch on filter change
  useEffect(() => {
    fetchJobs(filters)
    // Update URL without navigation
    const params = filtersToParams(filters)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [filters, fetchJobs, router])

  const updateFilters = (updates: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + filter bar — sticky on mobile */}
      <div className="sticky top-14 z-30 pb-3 -mx-4 px-4 pt-2 border-b border-[rgba(30,38,49,0.6)] bg-[#090f16] lg:static lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0 lg:bg-transparent lg:z-auto lg:border-b-0">
        <div className="flex flex-col gap-2 lg:gap-3">
          <JobSearchBar
            value={filters.q ?? ''}
            onChange={(q) => updateFilters({ q: q || undefined, page: 1 })}
          />
          <div className="lg:hidden">
            <JobFiltersPanel filters={filters} onFilterChange={updateFilters} mode="mobile" />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="hidden lg:block">
          <JobFiltersPanel filters={filters} onFilterChange={updateFilters} mode="desktop" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {state === 'error' && (
            <div className="p-6 text-center rounded-xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)]">
              <p className="text-sm text-[#EF4444] mb-3">{error}</p>
              <button
                type="button"
                onClick={() => fetchJobs(filters)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[rgba(239,68,68,0.15)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.25)] transition-colors cursor-pointer min-h-[44px]"
              >
                Retry
              </button>
            </div>
          )}

          {state === 'loading' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, #131a23 25%, #1e2631 50%, #131a23 75%)',
                    backgroundSize: '800px 100%',
                    animation: 'shimmer 1.5s infinite linear',
                  }}
                />
              ))}
            </div>
          )}

          {state === 'success' && response && (
            <>
              {response.data.length === 0 ? (
                <div className="p-10 text-center rounded-xl border border-[#1e2631]">
                  <p className="text-[#a6abb5]">No jobs found matching your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {response.data.map((job) => (
                    <JobCard key={job.id} job={job} onClick={setSelectedJob} />
                  ))}
                </div>
              )}
              <JobPagination
                pagination={response.pagination}
                onPageChange={(page) => updateFilters({ page })}
              />
            </>
          )}
        </div>
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  )
}
