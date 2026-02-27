'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackToolVisit } from '@/lib/hooks/use-profile-prompt'

function getSessionId(): string {
  const key = 'ht-session-id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w <= 1024) return 'tablet'
  return 'desktop'
}

function getToolSlug(pathname: string): string | null {
  const match = pathname.match(/^\/tools\/([^/]+)/)
  return match ? match[1] : null
}

export function usePageTracking() {
  const pathname = usePathname()
  const clientRowIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const toolSlug = getToolSlug(pathname)
    if (!toolSlug) return

    trackToolVisit(toolSlug)

    const supabase = createClient()
    const sessionId = getSessionId()
    const clientRowId = crypto.randomUUID()
    const startTime = Date.now()
    startTimeRef.current = startTime
    clientRowIdRef.current = clientRowId

    // Insert page view row (no .select() needed — avoids RLS SELECT issue for anon users)
    async function insertView() {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase
        .from('page_views')
        .insert({
          user_id: user?.id ?? null,
          session_id: sessionId,
          client_row_id: clientRowId,
          tool_slug: toolSlug,
          page_path: pathname,
          referrer: document.referrer || null,
          device_type: getDeviceType(),
        })
    }

    insertView()

    // Flush duration on page leave
    function flushDuration() {
      if (!clientRowIdRef.current) return
      const duration = Math.round((Date.now() - startTime) / 1000)
      // Use sendBeacon for reliability on page close
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_views?client_row_id=eq.${clientRowIdRef.current}`
      const body = JSON.stringify({ duration_seconds: duration })
      const headers = {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Prefer': 'return=minimal',
      }
      // Try sendBeacon first (works on tab close), fall back to fetch
      const blob = new Blob([body], { type: 'application/json' })
      if (!navigator.sendBeacon(url, blob)) {
        fetch(url, { method: 'PATCH', headers, body, keepalive: true })
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flushDuration()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      flushDuration()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname])
}
