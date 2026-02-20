'use client'

import { useState, useCallback, useEffect } from 'react'
import { SearchBar } from '@/components/ui/search-bar'
import { IpHeroCard } from '@/tools/ipcheck/ip-hero-card'
import { IpInfoGrid } from '@/tools/ipcheck/ip-info-grid'
import { LocationDetail } from '@/tools/ipcheck/location-detail'

interface IpData {
  ip: string
  ipVersion: 'ipv4' | 'ipv6'
  ipv6?: string
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

type PageState = 'idle' | 'loading' | 'success' | 'error'

function detectBrowser(): { browser: string; version: string } {
  if (typeof navigator === 'undefined') return { browser: 'Unknown', version: '' }
  const ua = navigator.userAgent
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    const m = ua.match(/Chrome\/([\d.]+)/)
    return { browser: 'Chrome', version: m ? `v${m[1]}` : '' }
  }
  if (ua.includes('Firefox')) {
    const m = ua.match(/Firefox\/([\d.]+)/)
    return { browser: 'Firefox', version: m ? `v${m[1]}` : '' }
  }
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const m = ua.match(/Version\/([\d.]+)/)
    return { browser: 'Safari', version: m ? `v${m[1]}` : '' }
  }
  if (ua.includes('Edg')) {
    const m = ua.match(/Edg\/([\d.]+)/)
    return { browser: 'Edge', version: m ? `v${m[1]}` : '' }
  }
  return { browser: 'Unknown', version: '' }
}

function isIpAddress(query: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(query) || query.includes(':')
}

const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/
function isValidIpv4(ip: string): boolean {
  if (!IPV4_REGEX.test(ip)) return false
  return ip.split('.').every((octet) => {
    const n = parseInt(octet, 10)
    return n >= 0 && n <= 255
  })
}

const IPV6_REGEX = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
function isValidIpv6(ip: string): boolean {
  return IPV6_REGEX.test(ip)
}

const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain) && domain.length <= 253
}

function validateIpInput(query: string): string | null {
  if (!query) return 'Please enter an IP address or domain'
  if (isValidIpv4(query) || isValidIpv6(query) || isValidDomain(query)) return null
  // Check if it looks like a partial IP to give a specific hint
  if (/^\d+$/.test(query)) return 'Enter a complete IPv4 address (e.g. 8.8.8.8) or domain (e.g. google.com)'
  if (/^\d+\./.test(query)) return 'Incomplete IPv4 address — use format like 192.168.1.1'
  if (query.includes(':')) return 'Invalid IPv6 address — use format like 2001:4860:4860::8888'
  return 'Enter a valid IP address (e.g. 8.8.8.8) or domain (e.g. google.com)'
}

export default function IpCheckPage() {
  const [state, setState] = useState<PageState>('loading')
  const [data, setData] = useState<IpData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState<string>('')
  const [userIp, setUserIp] = useState<string>('')

  const fetchIp = useCallback(async (query: string) => {
    setState('loading')
    setError(null)
    setLastQuery(query)
    try {
      const param = isIpAddress(query) ? `ip=${encodeURIComponent(query)}` : `domain=${encodeURIComponent(query)}`
      const res = await fetch(`/api/v1/ipcheck?${param}`)
      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || `Lookup failed (${res.status})`)
      }

      const d = json.data
      const browser = detectBrowser()

      setData({
        ip: d.ip,
        ipVersion: d.ipVersion || 'ipv4',
        ipv6: d.ipv6,
        location: `${d.location.city}, ${d.location.state}, ${d.location.countryCode}`,
        isSecure: typeof window !== 'undefined' && window.location.protocol === 'https:',
        info: {
          proxy: { detected: d.network.proxy, status: d.network.proxy ? 'Proxy Detected' : 'Clean Status' },
          isp: { name: d.network.isp, asn: d.network.asn },
          dns: { server: '-', provider: d.network.org || d.network.isp },
          userAgent: { browser: browser.browser, version: browser.version },
        },
        locationDetail: {
          city: d.location.city,
          state: d.location.state,
          country: d.location.country,
          countryCode: d.location.countryCode,
          postalCode: d.location.postalCode,
          lat: d.location.lat,
          lng: d.location.lng,
        },
      })
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to look up IP')
      setState('error')
    }
  }, [])

  // Auto-fetch user's current IP on mount
  useEffect(() => {
    fetch('/api/v1/myip')
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.ip) {
          setUserIp(json.data.ip)
          fetchIp(json.data.ip)
        } else {
          setState('idle')
        }
      })
      .catch(() => {
        setState('idle')
      })
  }, [fetchIp])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) return
    fetchIp(query.trim())
  }, [fetchIp])

  const handleRefresh = useCallback(() => {
    if (lastQuery) fetchIp(lastQuery)
  }, [lastQuery, fetchIp])

  const handleRetry = useCallback(() => {
    if (lastQuery) fetchIp(lastQuery)
  }, [lastQuery, fetchIp])

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 md:py-5 flex-1">
      <nav aria-label="Breadcrumb" className="mb-6 md:mb-4">
        <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-slate-900 dark:text-white font-medium">IP Check</li>
        </ol>
      </nav>

      <div className="mb-8 md:mb-5">
        <div className="w-full flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <SearchBar
              placeholder="Lookup any IP address or domain..."
              buttonLabel="Lookup"
              defaultValue={userIp}
              onSearch={handleSearch}
              validate={validateIpInput}
            />
          </div>
          {userIp && (
            <button
              onClick={() => fetchIp(userIp)}
              disabled={state === 'loading'}
              title={`Quick check: ${userIp}`}
              className="shrink-0 h-[54px] flex items-center gap-1.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-[var(--tk-color-primary-500)] hover:text-[var(--tk-color-primary-500)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">My IP</span>
            </button>
          )}
        </div>
      </div>

      {state === 'error' && error && (
        <div
          role="alert"
          className="mb-6 md:mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4"
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

      {state === 'idle' && (
        <div className="text-center py-16 md:py-10">
          <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Enter an IP address or domain to get started</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">e.g. 8.8.8.8 or google.com</p>
        </div>
      )}

      {state === 'success' && data && (
        <div>
          <IpHeroCard
            ip={data.ip}
            ipVersion={data.ipVersion}
            ipv6={data.ipv6}
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
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-xl p-8 md:p-6 text-center">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-3 animate-pulse" />
        <div className="h-14 md:h-14 w-80 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4 animate-pulse" />
        <div className="flex justify-center gap-4 mb-4">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 md:mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 p-5 rounded-xl shadow-sm"
          >
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
