'use client'

import { useCallback, useState, useEffect } from 'react'

const CACHE_KEY = 'ht-currency-cached-rates'

interface CachedRates {
  rates: Record<string, Record<string, number>> // from -> { to: rate }
  timestamp: number
}

function loadCache(): CachedRates | null {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object' && parsed.rates && parsed.timestamp) {
        return parsed as CachedRates
      }
    }
  } catch {
    // Ignore corrupt data
  }
  return null
}

function saveCache(cache: CachedRates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Storage full or disabled
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function useOfflineRates() {
  const [cache, setCache] = useState<CachedRates | null>(null)
  const [isUsingCache, setIsUsingCache] = useState(false)

  // Load cache on mount
  useEffect(() => {
    setCache(loadCache())
  }, [])

  const cacheRates = useCallback((from: string, to: string, rate: number) => {
    setCache((prev) => {
      const existing = prev || { rates: {}, timestamp: Date.now() }
      const updated: CachedRates = {
        rates: {
          ...existing.rates,
          [from]: {
            ...(existing.rates[from] || {}),
            [to]: rate,
          },
        },
        timestamp: Date.now(),
      }
      saveCache(updated)
      return updated
    })
    setIsUsingCache(false)
  }, [])

  const getCachedRate = useCallback(
    (from: string, to: string): number | null => {
      if (!cache) return null
      const rate = cache.rates[from]?.[to]
      if (rate !== undefined) {
        setIsUsingCache(true)
        return rate
      }
      return null
    },
    [cache]
  )

  const isStale = cache ? Date.now() - cache.timestamp > 5 * 60 * 1000 : false // 5 minutes
  const lastUpdated = cache ? formatTimeAgo(cache.timestamp) : null

  return { cacheRates, getCachedRate, isUsingCache, isStale, lastUpdated }
}
