'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'ht-currency-alerts'
const POLL_INTERVAL = 60_000 // 60 seconds

export interface RateAlert {
  id: string
  from: string
  to: string
  targetRate: number
  direction: 'above' | 'below'
  createdAt: string
  triggered: boolean
}

function loadAlerts(): RateAlert[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Ignore corrupt data
  }
  return []
}

function saveAlerts(alerts: RateAlert[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  } catch {
    // Storage full or disabled
  }
}

function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

async function fetchCurrentRate(from: string, to: string): Promise<number | null> {
  try {
    // Use frankfurter for fiat pairs
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`)
    const data = await res.json()
    return data.rates?.[to] ?? null
  } catch {
    return null
  }
}

export function useRateAlerts() {
  const [alerts, setAlerts] = useState<RateAlert[]>([])
  const [hasPermission, setHasPermission] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load alerts from localStorage on mount
  useEffect(() => {
    setAlerts(loadAlerts())
    if (notificationsSupported()) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  // Persist alerts whenever they change
  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  const requestPermission = useCallback(async () => {
    if (!notificationsSupported()) return
    const result = await Notification.requestPermission()
    setHasPermission(result === 'granted')
  }, [])

  const addAlert = useCallback((from: string, to: string, targetRate: number, direction: 'above' | 'below') => {
    const newAlert: RateAlert = {
      id: crypto.randomUUID(),
      from,
      to,
      targetRate,
      direction,
      createdAt: new Date().toISOString(),
      triggered: false,
    }
    setAlerts((prev) => [...prev, newAlert])
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearTriggered = useCallback(() => {
    setAlerts((prev) => prev.filter((a) => !a.triggered))
  }, [])

  // Poll for active alerts
  useEffect(() => {
    const activeAlerts = alerts.filter((a) => !a.triggered)

    if (activeAlerts.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const checkAlerts = async () => {
      const currentAlerts = loadAlerts() // Read fresh from storage in case state is stale
      const active = currentAlerts.filter((a) => !a.triggered)
      if (active.length === 0) return

      // Group by pair to minimize API calls
      const pairs = new Map<string, RateAlert[]>()
      for (const alert of active) {
        const key = `${alert.from}-${alert.to}`
        if (!pairs.has(key)) pairs.set(key, [])
        pairs.get(key)!.push(alert)
      }

      let changed = false
      const updatedAlerts = [...currentAlerts]

      for (const [, pairAlerts] of pairs) {
        const { from, to } = pairAlerts[0]
        const rate = await fetchCurrentRate(from, to)
        if (rate === null) continue

        for (const alert of pairAlerts) {
          const shouldTrigger =
            (alert.direction === 'above' && rate >= alert.targetRate) ||
            (alert.direction === 'below' && rate <= alert.targetRate)

          if (shouldTrigger) {
            const idx = updatedAlerts.findIndex((a) => a.id === alert.id)
            if (idx !== -1) {
              updatedAlerts[idx] = { ...updatedAlerts[idx], triggered: true }
              changed = true

              // Send browser notification
              if (notificationsSupported() && Notification.permission === 'granted') {
                new Notification('Rate Alert Triggered', {
                  body: `${alert.from}/${alert.to} is now ${alert.direction === 'above' ? 'above' : 'below'} ${alert.targetRate} (current: ${rate.toFixed(4)})`,
                  icon: '/favicon.ico',
                })
              }
            }
          }
        }
      }

      if (changed) {
        saveAlerts(updatedAlerts)
        setAlerts(updatedAlerts)
      }
    }

    // Check immediately, then on interval
    checkAlerts()
    intervalRef.current = setInterval(checkAlerts, POLL_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [alerts.filter((a) => !a.triggered).length]) // Re-setup when active count changes

  return {
    alerts,
    addAlert,
    removeAlert,
    clearTriggered,
    hasPermission,
    requestPermission,
    notificationsSupported: notificationsSupported(),
  }
}
