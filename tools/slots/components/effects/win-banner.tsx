'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WinTier } from '../../slots-types'

interface WinBannerProps {
  tier: WinTier
  amount: number
  visible: boolean
  onDismiss: () => void
}

export function WinBanner({ tier, amount, visible, onDismiss }: WinBannerProps) {
  const [displayAmount, setDisplayAmount] = useState(0)
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!visible || amount === 0) {
      setDisplayAmount(0)
      return
    }

    // Count up animation
    const duration = tier === 'mega' ? 3000 : tier === 'big' ? 2000 : 1000
    const steps = 30
    const increment = amount / steps
    const stepTime = duration / steps
    let current = 0

    animRef.current = setInterval(() => {
      current += increment
      if (current >= amount) {
        current = amount
        if (animRef.current) clearInterval(animRef.current)
      }
      setDisplayAmount(Math.floor(current))
    }, stepTime)

    // Auto dismiss
    const dismissTimer = setTimeout(onDismiss, duration + 1500)

    return () => {
      if (animRef.current) clearInterval(animRef.current)
      clearTimeout(dismissTimer)
    }
  }, [visible, amount, tier, onDismiss])

  if (tier === 'none' || tier === 'small') return null

  const title = tier === 'mega' ? 'MEGA WIN!' : 'BIG WIN!'

  const titleGradient = tier === 'mega'
    ? 'from-yellow-200 via-yellow-400 to-amber-500'
    : 'from-amber-300 via-yellow-400 to-amber-500'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dark overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Banner */}
          <motion.div
            className="relative text-center z-10"
            initial={{ scale: 0.3, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          >
            {/* Title */}
            <motion.h2
              className={`text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-b ${titleGradient} bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {title}
            </motion.h2>

            {/* Amount */}
            <motion.div
              className="mt-4 text-3xl sm:text-5xl font-bold text-yellow-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 10 }}
            >
              {displayAmount.toLocaleString()}
            </motion.div>

            {/* Decorative line */}
            <motion.div
              className="mt-3 mx-auto h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
