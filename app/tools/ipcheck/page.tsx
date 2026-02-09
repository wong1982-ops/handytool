'use client'

import { useState, useCallback } from 'react'
import { SearchBar } from '@/components/ui/search-bar'
import { IpHeroCard } from '@/tools/ipcheck/ip-hero-card'
import { IpInfoGrid } from '@/tools/ipcheck/ip-info-grid'
import { LocationDetail } from '@/tools/ipcheck/location-detail'

interface IpData {
  ip: string
  location: string
  isSecure: boolean
  info: {
    proxy: { detected: boolean; status: string }
    isp: { name: string; asn: string }
    dns: { server: string; provider: string }
    userAgent: { browser: string; version: string }
  }
  locationDetail: {
    city: string
    state: string
    country: string
    countryCode: string
    postalCode: string
    lat: number
    lng: number
  }
}

// Mock data — replace with API calls later
const mockData: IpData = {
  ip: '104.28.192.254',
  location: 'San Francisco, CA, US',
  isSecure: true,
  info: {
    proxy: { detected: false, status: 'Clean Status' },
    isp: { name: 'Google Cloud LLC', asn: 'AS15169' },
    dns: { server: '8.8.8.8', provider: 'Google Public DNS' },
    userAgent: { browser: 'Chrome / macOS', version: 'v122.0.0.0' },
  },
  locationDetail: {
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    countryCode: 'US',
    postalCode: '94105',
    lat: 37.7749,
    lng: -122.4194,
  },
}

type PageState = 'idle' | 'loading' | 'success' | 'error'

export default function IpCheckPage() {
  const [state, setState] = useState<PageState>('success')
  const [data] = useState<IpData>(mockData)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback((query: string) => {
    setState('loading')
    setError(null)
    // TODO: Call IP lookup API with query
    // Simulating instant response with mock data
    void query
    setState('success')
  }, [])

  const handleRefresh = useCallback(() => {
    setState('loading')
    setError(null)
    // TODO: Re-fetch current IP
    setState('success')
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setState('loading')
    // TODO: Retry last operation
    setState('success')
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
      <div className="mb-12 flex justify-center">
        <SearchBar
          placeholder="Lookup any IP address or domain..."
          buttonLabel="Lookup"
          onSearch={handleSearch}
        />
      </div>

      {state === 'error' && error && (
        <div
          role="alert"
          className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="shrink-0 text-sm font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {state === 'loading' && <LoadingSkeleton />}

      {(state === 'success' || state === 'idle') && data && (
        <div>
          <IpHeroCard
            ip={data.ip}
            location={data.location}
            isSecure={data.isSecure}
            onRefresh={handleRefresh}
          />
          <IpInfoGrid data={data.info} />
          <LocationDetail data={data.locationDetail} />
        </div>
      )}
    </main>
  )
}

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading IP information">
      {/* Hero card skeleton */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-xl p-8 md:p-12 text-center">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-16 md:h-20 w-80 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-6 animate-pulse" />
        <div className="flex justify-center gap-4 mb-8">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
        <div className="flex justify-center gap-3">
          <div className="h-12 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="h-12 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Info grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 rounded-xl shadow-sm"
          >
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-1 animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Location detail skeleton */}
      <div className="mt-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-3">
          <div className="p-8 md:col-span-1 border-r border-slate-200 dark:border-slate-800">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center pb-2 mb-4">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="md:col-span-2 min-h-[300px] bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
