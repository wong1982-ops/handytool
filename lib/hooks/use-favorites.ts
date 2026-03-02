'use client'

import { useSyncExternalStore, useCallback } from 'react'

const STORAGE_KEY = 'toolk1t-favorites'

// Module-level store shared across all hook instances
let listeners: Array<() => void> = []
let cached: string[] | null = null

function read(): string[] {
  if (cached) return cached
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    cached = stored ? JSON.parse(stored) : []
  } catch {
    cached = []
  }
  return cached!
}

function write(next: string[]) {
  cached = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): string[] {
  return read()
}

function getServerSnapshot(): string[] {
  return []
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback((slug: string) => {
    const prev = read()
    const next = prev.includes(slug)
      ? prev.filter((s) => s !== slug)
      : [...prev, slug]
    write(next)
  }, [])

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  )

  return { favorites, toggle, isFavorite }
}
