'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { DashboardWidget, WidgetSize } from './types'
import { MAX_WIDGETS } from './types'
import { DEFAULT_WIDGETS } from './default-layout'

interface UseDashboardReturn {
  widgets: DashboardWidget[]
  loading: boolean
  addWidget: (toolSlug: string) => void
  removeWidget: (id: string) => void
  resizeWidget: (id: string) => void
  reorderWidgets: (activeId: string, overId: string) => void
  resetLayout: () => void
  isToolOnDashboard: (toolSlug: string) => boolean
}

export function useDashboard(): UseDashboardReturn {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [loading, setLoading] = useState(true)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const widgetsRef = useRef(widgets)
  widgetsRef.current = widgets
  const initialLoadDone = useRef(false)

  useEffect(() => {
    fetch('/api/v1/dashboard/layout')
      .then(r => r.json())
      .then(json => {
        const data = json.data ?? json
        setWidgets(data.widgets || DEFAULT_WIDGETS)
      })
      .catch(() => setWidgets(DEFAULT_WIDGETS))
      .finally(() => { setLoading(false); initialLoadDone.current = true })
  }, [])

  useEffect(() => {
    if (!initialLoadDone.current) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/v1/dashboard/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: widgetsRef.current }),
      }).catch(() => {})
    }, 2000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [widgets])

  const addWidget = useCallback((toolSlug: string) => {
    setWidgets(prev => {
      if (prev.length >= MAX_WIDGETS) return prev
      if (prev.some(w => w.toolSlug === toolSlug)) return prev
      return [...prev, { id: `w-${Date.now()}`, toolSlug, size: 'medium' as WidgetSize, order: prev.length }]
    })
  }, [])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id).map((w, i) => ({ ...w, order: i })))
  }, [])

  const resizeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w
      const sizes: WidgetSize[] = ['small', 'medium', 'large']
      const nextIndex = (sizes.indexOf(w.size) + 1) % sizes.length
      return { ...w, size: sizes[nextIndex] }
    }))
  }, [])

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setWidgets(prev => {
      const oldIndex = prev.findIndex(w => w.id === activeId)
      const newIndex = prev.findIndex(w => w.id === overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const updated = [...prev]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, moved)
      return updated.map((w, i) => ({ ...w, order: i }))
    })
  }, [])

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS.map((w, i) => ({ ...w, id: `w-${Date.now()}-${i}`, order: i })))
  }, [])

  const isToolOnDashboard = useCallback((toolSlug: string) => {
    return widgetsRef.current.some(w => w.toolSlug === toolSlug)
  }, [])

  return { widgets, loading, addWidget, removeWidget, resizeWidget, reorderWidgets, resetLayout, isToolOnDashboard }
}
