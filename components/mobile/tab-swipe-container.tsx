'use client'

import { useRef, useState, type ReactNode } from 'react'
import type { TabId } from '@/components/mobile/bottom-tab-bar'

const TAB_ORDER: TabId[] = ['tools', 'favorites', 'profile']
const SWIPE_THRESHOLD = 60
const VELOCITY_THRESHOLD = 0.3

interface TabSwipeContainerProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: [ReactNode, ReactNode, ReactNode]
}

export function TabSwipeContainer({ activeTab, onTabChange, children }: TabSwipeContainerProps) {
  const activeIndex = TAB_ORDER.indexOf(activeTab)
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const touchRef = useRef<{
    startX: number
    startY: number
    startTime: number
    locked: 'x' | 'y' | null
  } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      locked: null,
    }
    setSwiping(false)
    setSwipeX(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchRef.current.startX
    const dy = touch.clientY - touchRef.current.startY

    // Determine lock direction on first significant movement
    if (!touchRef.current.locked) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        touchRef.current.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      } else {
        return
      }
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
    if (!touchRef.current) return
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

  return (
    <div
      className="flex-1 overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(${translateX}%)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
          willChange: 'transform',
        }}
      >
        {children.map((child, i) => (
          <div
            key={TAB_ORDER[i]}
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
