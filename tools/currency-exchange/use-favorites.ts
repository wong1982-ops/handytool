'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ht-currency-favorites'
const RECENT_KEY = 'ht-currency-recent'
const MAX_FAVORITES = 8
const MAX_RECENT = 5

export interface CurrencyPair {
  from: string
  to: string
}

function loadPairs(key: string): CurrencyPair[] {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Ignore corrupt data
  }
  return []
}

function savePairs(key: string, pairs: CurrencyPair[]) {
  try {
    localStorage.setItem(key, JSON.stringify(pairs))
  } catch {
    // Storage full or disabled
  }
}

function pairsEqual(a: CurrencyPair, b: CurrencyPair): boolean {
  return a.from === b.from && a.to === b.to
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<CurrencyPair[]>([])
  const [recent, setRecent] = useState<CurrencyPair[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setFavorites(loadPairs(STORAGE_KEY))
    setRecent(loadPairs(RECENT_KEY))
    setLoaded(true)
  }, [])

  // Persist favorites
  useEffect(() => {
    if (!loaded) return
    savePairs(STORAGE_KEY, favorites)
  }, [favorites, loaded])

  // Persist recent
  useEffect(() => {
    if (!loaded) return
    savePairs(RECENT_KEY, recent)
  }, [recent, loaded])

  const isFavorite = useCallback(
    (from: string, to: string): boolean => {
      return favorites.some((p) => pairsEqual(p, { from, to }))
    },
    [favorites]
  )

  const addFavorite = useCallback((from: string, to: string) => {
    setFavorites((prev) => {
      if (prev.some((p) => pairsEqual(p, { from, to }))) return prev
      const next = [{ from, to }, ...prev]
      return next.slice(0, MAX_FAVORITES)
    })
  }, [])

  const removeFavorite = useCallback((from: string, to: string) => {
    setFavorites((prev) => prev.filter((p) => !pairsEqual(p, { from, to })))
  }, [])

  const addRecent = useCallback((from: string, to: string) => {
    setRecent((prev) => {
      const filtered = prev.filter((p) => !pairsEqual(p, { from, to }))
      return [{ from, to }, ...filtered].slice(0, MAX_RECENT)
    })
  }, [])

  return { favorites, recent, addFavorite, removeFavorite, isFavorite, addRecent }
}
