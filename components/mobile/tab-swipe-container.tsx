'use client'

import { useRef, useState, useCallback, type ReactNode } from 'react'
import type { TabId } from '@/components/mobile/bottom-tab-bar'

const TAB_ORDER: TabId[] = ['tools', 'favorites', 'billing', 'profile']
const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 0.3
const PULL_REFRESH_THRESHOLD = 100

interface TabSwipeContainerProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: [ReactNode, ReactNode, ReactNode, ReactNode]
}

export function TabSwipeContainer({ activeTab, onTabChange, children }: TabSwipeContainerProps) {
  const activeIndex = TAB_ORDER.indexOf(activeTab)
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const touchRef = useRef<{
    startX: number
    startY: number
    startTime: number
    locked: 'x' | 'y' | 'pull' | null
  } | null>(null)

  const setPanelRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    panelRefs.current[index] = el
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return
    const touch = e.touches[0]
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      locked: null,
    }
    setSwiping(false)
    setSwipeX(0)
    setPullY(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current || refreshing) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchRef.current.startX
    const dy = touch.clientY - touchRef.current.startY

    // Determine lock direction on first significant movement
    if (!touchRef.current.locked) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        if (Math.abs(dx) > Math.abs(dy)) {
          touchRef.current.locked = 'x'
        } else if (dy > 0) {
          // Pulling down — check if scroll is at top
          const panel = panelRefs.current[activeIndex]
          const atTop = !panel || panel.scrollTop <= 0
          touchRef.current.locked = atTop ? 'pull' : 'y'
        } else {
          touchRef.current.locked = 'y'
        }
      } else {
        return
      }
    }

    // Pull-to-refresh handling
    if (touchRef.current.locked === 'pull') {
      e.preventDefault()
      const dampened = Math.min(dy * 0.4, 150)
      setPullY(Math.max(0, dampened))
      return
    }

    // If vertical scroll, let it happen naturally
    if (touchRef.current.locked === 'y') return

    // Horizontal swipe — prevent scroll and track offset
    e.preventDefault()
    setSwiping(true)

    // Add resistance at edges
    const atLeftEdge = activeIndex === 0 && dx > 0
    const atRightEdge = activeIndex === TAB_ORDER.length - 1 && dx < 0
    const dampened = (atLeftEdge || atRightEdge) ? dx * 0.2 : dx

    setSwipeX(dampened)
  }

  const handleTouchEnd = () => {
    if (!touchRef.current || refreshing) return

    // Pull-to-refresh release
    if (touchRef.current.locked === 'pull') {
      if (pullY >= PULL_REFRESH_THRESHOLD * 0.4) {
        setRefreshing(true)
        setPullY(50) // Hold at spinner position
        window.location.reload()
        return
      }
      setPullY(0)
      touchRef.current = null
      return
    }

    const elapsed = (Date.now() - touchRef.current.startTime) / 1000
    const velocity = elapsed > 0 ? swipeX / elapsed : 0

    if (touchRef.current.locked === 'x') {
      if (Math.abs(swipeX) > SWIPE_THRESHOLD || Math.abs(velocity) > VELOCITY_THRESHOLD * 1000) {
        if (swipeX > 0 && activeIndex > 0) {
          onTabChange(TAB_ORDER[activeIndex - 1])
        } else if (swipeX < 0 && activeIndex < TAB_ORDER.length - 1) {
          onTabChange(TAB_ORDER[activeIndex + 1])
        }
      }
    }

    touchRef.current = null
    setSwiping(false)
    setSwipeX(0)
  }

  const translateX = -activeIndex * 100 + (swiping ? (swipeX / window.innerWidth) * 100 : 0)
  const pullReady = pullY >= PULL_REFRESH_THRESHOLD * 0.4

  return (
    <div
      className="flex-1 overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullY > 0 || refreshing) && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
          style={{ top: 0, height: `${pullY}px`, transition: pullY === 50 ? 'height 0.2s ease' : 'none' }}
        >
          <div className={`flex items-center gap-2 text-xs font-medium ${pullReady || refreshing ? 'text-[#3D6AF2]' : 'text-slate-400 dark:text-slate-500'}`}>
            <svg
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ transform: refreshing ? undefined : `rotate(${Math.min(pullY / (PULL_REFRESH_THRESHOLD * 0.4) * 180, 180)}deg)`, transition: 'transform 0.1s ease' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : pullReady ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}

      <div
        className="flex h-full"
        style={{
          transform: `translateX(${translateX}%)${pullY > 0 ? ` translateY(${pullY}px)` : ''}`,
          transition: swiping || pullY > 0 ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
          willChange: 'transform',
        }}
      >
        {children.map((child, i) => (
          <div
            key={TAB_ORDER[i]}
            ref={setPanelRef(i)}
            className="w-full shrink-0 h-full overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
