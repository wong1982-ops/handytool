'use client'

import { useState, useCallback, useEffect } from 'react'
import { MyIpHero } from '@/tools/myip/myip-hero'
import { TechInfoPanel } from '@/tools/myip/tech-info-panel'
import { LiveLocationPanel } from '@/tools/myip/live-location-panel'

interface MyIpData {
  ip: string
  ipVersion: 'ipv4' | 'ipv6'
  isp: string
  country: string
  countryCode: string
  city: string
  region: string
  coordinates: { lat: number; lng: number }
  proxy: boolean
  vpn: boolean
  tor: boolean
  timezone: string
  isSecure: boolean
}

type PageState = 'loading' | 'success' | 'error'

export default function MyIpPage() {
  const [state, setState] = useState<PageState>('loading')
  const [data, setData] = useState<MyIpData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchMyIp = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const res = await fetch('/api/v1/myip')
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || `Request failed (${res.status})`)
      }

      const d = json.data
      setData({
        ip: d.ip,
        ipVersion: d.ipVersion || 'ipv4',
        isp: d.isp,
        country: d.country,
        countryCode: d.countryCode,
        city: d.city,
        region: d.region,
        coordinates: d.coordinates,
        proxy: d.proxy ?? false,
        vpn: false,
        tor: false,
        timezone: d.timezone,
        isSecure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      })
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IP information')
      setState('error')
    }
  }, [])

  useEffect(() => {
    fetchMyIp()
  }, [fetchMyIp])

  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-[1024px] flex flex-col gap-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-900 dark:text-white font-medium">My IP</li>
          </ol>
        </nav>

        {/* Error State */}
        {state === 'error' && error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={fetchMyIp}
              className="shrink-0 text-sm font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {state === 'loading' && <LoadingSkeleton />}

        {/* Success State */}
        {state === 'success' && data && (
          <>
            {/* Hero Section */}
            <MyIpHero ip={data.ip} ipVersion={data.ipVersion} isSecure={data.isSecure} />

            {/* Technical Details & Map Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <TechInfoPanel data={data} />
              </div>
              <div className="lg:col-span-5">
                <LiveLocationPanel lat={data.coordinates.lat} lng={data.coordinates.lng} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading IP information">
      {/* Hero skeleton */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-16 md:h-20 w-full max-w-80 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded mx-auto animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
              >
                <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="min-h-[300px] bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
