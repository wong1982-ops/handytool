'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 767

/**
 * Returns whether the viewport is mobile-sized.
 * Returns `false` during SSR and before first mount to avoid hydration mismatch.
 * The first client render always matches the server (false), then updates.
 */
export function useMobileShell(): boolean {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    setIsMobile(mql.matches)
    setMounted(true)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Return false until mounted to prevent hydration mismatch
  return mounted ? isMobile : false
}
