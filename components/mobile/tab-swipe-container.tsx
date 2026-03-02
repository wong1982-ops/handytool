'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, type PanInfo } from 'framer-motion'
import type { TabId } from '@/components/mobile/bottom-tab-bar'

const TAB_ORDER: TabId[] = ['tools', 'favorites', 'profile']
const SWIPE_THRESHOLD = 50
const VELOCITY_THRESHOLD = 500

interface TabSwipeContainerProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: [ReactNode, ReactNode, ReactNode] // tools, favorites, profile
}

export function TabSwipeContainer({ activeTab, onTabChange, children }: TabSwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIndex = TAB_ORDER.indexOf(activeTab)

  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info

    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD) {
      if (offset.x > 0 && activeIndex > 0) {
        onTabChange(TAB_ORDER[activeIndex - 1])
      } else if (offset.x < 0 && activeIndex < TAB_ORDER.length - 1) {
        onTabChange(TAB_ORDER[activeIndex + 1])
      }
    }
    x.set(0)
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden relative">
      <motion.div
        className="flex h-full"
        animate={{ x: `${-activeIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children.map((child, i) => (
          <motion.div
            key={TAB_ORDER[i]}
            className="w-full shrink-0 h-full overflow-y-auto"
            drag={i === activeIndex ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={i === activeIndex ? { x: springX } : undefined}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
