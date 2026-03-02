'use client'

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type PanInfo } from 'framer-motion'

const COMMIT_THRESHOLD = 100
const VELOCITY_THRESHOLD = 800

interface GestureBackProps {
  children: ReactNode
  enabled?: boolean
}

export function GestureBack({ children, enabled = true }: GestureBackProps) {
  const router = useRouter()

  if (!enabled) return <>{children}</>

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (
      info.offset.x > COMMIT_THRESHOLD ||
      info.velocity.x > VELOCITY_THRESHOLD
    ) {
      router.back()
    }
  }

  return (
    <motion.div
      className="flex-1 relative"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      dragDirectionLock
    >
      {children}
    </motion.div>
  )
}
