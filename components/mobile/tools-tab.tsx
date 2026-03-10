'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'

const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 500

interface ToolsTabProps {
  children: ReactNode
}

/** Root paths where no back button is shown */
const ROOT_PATHS = ['/', '/tools']

/** Compute the parent path for back navigation */
function getParentPath(pathname: string): string {
  // /tools/story-studio/series/[id] → /tools/story-studio/series
  // /tools/story-studio → /tools
  // /tools → /
  const segments = pathname.replace(/\/$/, '').split('/')
  segments.pop()
  const parent = segments.join('/') || '/'
  return parent
}

/** Get a human-readable label for the back button */
function getBackLabel(parentPath: string): string {
  if (parentPath === '/' || parentPath === '/tools') return 'Tools'
  // Take the last segment and format it: "story-studio" → "Story Studio"
  const last = parentPath.split('/').pop() || 'Back'
  return last
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function ToolsTab({ children }: ToolsTabProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isRoot = ROOT_PATHS.includes(pathname)

  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'in' | 'out' | null>(null)
  const prevPathRef = useRef(pathname)

  const touchRef = useRef<{
    startX: number
    startY: number
    startTime: number
    locked: 'x' | 'y' | null
  } | null>(null)

  // Detect navigation direction for slide animation
  useEffect(() => {
    const prev = prevPathRef.current
    if (prev !== pathname) {
      const prevDepth = prev.split('/').filter(Boolean).length
      const nextDepth = pathname.split('/').filter(Boolean).length
      setSlideDirection(nextDepth > prevDepth ? 'in' : 'out')
      prevPathRef.current = pathname

      // Clear the animation after it completes
      const timer = setTimeout(() => setSlideDirection(null), 300)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const goBack = useCallback(() => {
    const parent = getParentPath(pathname)
    router.push(parent)
  }, [pathname, router])

  // Swipe-to-go-back handlers (only active on non-root pages)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isRoot) return
      const touch = e.touches[0]
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        locked: null,
      }
      setSwiping(false)
      setSwipeX(0)
    },
    [isRoot],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isRoot || !touchRef.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - touchRef.current.startX
      const dy = touch.clientY - touchRef.current.startY

      if (!touchRef.current.locked) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          touchRef.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        } else {
          return
        }
      }

      if (touchRef.current.locked === 'y') return

      // Horizontal swipe — stop propagation to prevent tab swipe
      e.stopPropagation()

      // Only allow swipe right (positive dx) to go back
      if (dx > 0) {
        setSwiping(true)
        setSwipeX(dx)
      }
    },
    [isRoot],
  )

  const handleTouchEnd = useCallback(() => {
    if (isRoot || !touchRef.current) return

    if (touchRef.current.locked === 'x') {
      const elapsed = (Date.now() - touchRef.current.startTime) / 1000
      const velocity = elapsed > 0 ? swipeX / elapsed : 0

      if (swipeX > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        goBack()
      }
    }

    touchRef.current = null
    setSwiping(false)
    setSwipeX(0)
  }, [isRoot, swipeX, goBack])

  const parentPath = getParentPath(pathname)
  const backLabel = getBackLabel(parentPath)

  // Slide animation classes
  const getAnimationClass = () => {
    if (!slideDirection) return ''
    if (slideDirection === 'in') return 'animate-slide-in-right'
    return 'animate-slide-in-left'
  }

  if (isRoot) {
    return <div className={getAnimationClass()}>{children}</div>
  }

  const swipeOffset = swiping
    ? (swipeX / (typeof window !== 'undefined' ? window.innerWidth : 375)) * 100
    : 0

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="h-full"
    >
      <div
        style={{
          transform: swiping ? `translateX(${swipeOffset}%)` : undefined,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
          willChange: swiping ? 'transform' : undefined,
        }}
        className={getAnimationClass()}
      >
        {/* Sticky back button */}
        <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm px-2 py-2 border-b border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-[#3D6AF2] font-medium cursor-pointer px-2 py-1"
            style={{ minHeight: '44px' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLabel}
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
