'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const TRACK_ENDPOINT = `${API_URL}/api/v1/analytics/track`

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('tk_sid')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('tk_sid', id)
  }
  return id
}

function extractToolSlug(path: string): string | null {
  const match = path.match(/^\/tools\/([^/]+)/)
  return match ? match[1] : null
}

function sendEvent(data: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(data)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_ENDPOINT, new Blob([payload], { type: 'application/json' }))
    } else {
      fetch(TRACK_ENDPOINT, { method: 'POST', body: payload, keepalive: true })
    }
  } catch {
    // Silent fail — analytics should never break the app
  }
}

export function PageTracker() {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())
  const pathnameRef = useRef<string>(pathname)

  useEffect(() => {
    const sessionId = getSessionId()
    if (!sessionId) return

    // Track page entry
    startTimeRef.current = Date.now()
    pathnameRef.current = pathname

    const sendLeaveEvent = () => {
      const duration_ms = Date.now() - startTimeRef.current
      sendEvent({
        session_id: sessionId,
        page_path: pathnameRef.current,
        tool_slug: extractToolSlug(pathnameRef.current),
        referrer: document.referrer || null,
        duration_ms,
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendLeaveEvent()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sendLeaveEvent()
    }
  }, [pathname])

  return null
}
