'use client'

import { useState, useCallback, useEffect } from 'react'

export type PanelId = 'rate-chart' | 'stats-row' | 'currency-pairs' | 'external-links' | 'multi-currency' | 'rate-alerts'

export interface PanelConfig {
  id: PanelId
  colSpan: 1 | 2 | 3
}

export interface PanelLayoutConfig {
  version: 1
  panels: PanelConfig[]
}

const STORAGE_KEY = 'ht-currency-exchange-layout'

const ALL_IDS: PanelId[] = ['rate-chart', 'stats-row', 'currency-pairs', 'external-links', 'multi-currency', 'rate-alerts']

const DEFAULT_LAYOUT: PanelLayoutConfig = {
  version: 1,
  panels: [
    { id: 'rate-chart', colSpan: 2 },
    { id: 'currency-pairs', colSpan: 1 },
    { id: 'stats-row', colSpan: 2 },
    { id: 'external-links', colSpan: 1 },
    { id: 'multi-currency', colSpan: 3 },
    { id: 'rate-alerts', colSpan: 1 },
  ],
}

function isValidLayout(parsed: unknown): parsed is PanelLayoutConfig {
  if (!parsed || typeof parsed !== 'object') return false
  const obj = parsed as Record<string, unknown>
  if (obj.version !== 1 || !Array.isArray(obj.panels) || obj.panels.length !== ALL_IDS.length) return false
  const ids = new Set((obj.panels as PanelConfig[]).map((p) => p.id))
  return ALL_IDS.every((id) => ids.has(id))
}

export function usePanelLayout() {
  const [layout, setLayout] = useState<PanelLayoutConfig>(DEFAULT_LAYOUT)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (isValidLayout(parsed)) {
          setLayout(parsed)
        }
      }
    } catch {
      // Ignore corrupt data
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    } catch {
      // Storage full or disabled
    }
  }, [layout, isLoaded])

  const reorderPanels = useCallback((newOrder: PanelId[]) => {
    setLayout((prev) => ({
      ...prev,
      panels: newOrder.map((id) => prev.panels.find((p) => p.id === id)!),
    }))
  }, [])

  const setColSpan = useCallback((id: PanelId, colSpan: 1 | 2 | 3) => {
    setLayout((prev) => ({
      ...prev,
      panels: prev.panels.map((p) => (p.id === id ? { ...p, colSpan } : p)),
    }))
  }, [])

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* */
    }
  }, [])

  const isDefault = JSON.stringify(layout) === JSON.stringify(DEFAULT_LAYOUT)

  return { panels: layout.panels, isLoaded, reorderPanels, setColSpan, resetLayout, isDefault }
}
