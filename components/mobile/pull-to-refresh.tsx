'use client'

import { useState, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type PanInfo } from 'framer-motion'

const THRESHOLD = 60

interface PullToRefreshProps {
  children: ReactNode
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter()
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const canPull = () => {
    if (!containerRef.current) return false
    return containerRef.current.scrollTop <= 0
  }

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (!canPull() || info.offset.y < 0) return
    setPulling(true)
    setPullDistance(Math.min(info.offset.y * 0.5, 100))
  }

  const handleDragEnd = () => {
    if (pullDistance > THRESHOLD && !refreshing) {
      setRefreshing(true)
      router.refresh()
      setTimeout(() => {
        setRefreshing(false)
        setPulling(false)
        setPullDistance(0)
      }, 1000)
    } else {
      setPulling(false)
      setPullDistance(0)
    }
  }

  return (
    <motion.div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      dragListener={false}
      onPointerDown={() => {
        if (canPull()) {
          // Allow drag only when at top
        }
      }}
    >
      {/* Pull indicator */}
      {pulling && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center z-10"
          style={{ transform: `translateY(${pullDistance - 40}px)` }}
        >
          <div className={`w-8 h-8 rounded-full border-2 border-[#3D6AF2] border-t-transparent ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}
      {children}
    </motion.div>
  )
}
