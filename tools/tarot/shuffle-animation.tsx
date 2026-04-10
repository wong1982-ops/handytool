'use client'

import { useEffect, useRef, useState } from 'react'

interface ShuffleAnimationProps {
  onComplete: () => void
  duration?: number
}

export function ShuffleAnimation({
  onComplete,
  duration = 2500,
}: ShuffleAnimationProps) {
  const [phase, setPhase] = useState<'shuffle' | 'gather'>('shuffle')
  const completedRef = useRef(false)

  useEffect(() => {
    const gatherTime = duration * 0.7
    const gatherTimer = setTimeout(() => {
      setPhase('gather')
    }, gatherTime)

    const completeTimer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    }, duration)

    return () => {
      clearTimeout(gatherTimer)
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  const cards = Array.from({ length: 7 }, (_, i) => i)

  return (
    <div className="relative flex items-center justify-center" style={{ height: 200 }}>
      {/* Subtle glow underneath */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-500/20 rounded-full blur-xl"
        style={{ width: 200, height: 40 }}
      />

      {/* Card backs */}
      <div className="relative" style={{ width: 200, height: 140 }}>
        {cards.map((i) => {
          const center = 3
          const offset = i - center

          const shuffleX = offset * 28
          const shuffleRotation = offset * 8
          const shuffleY = Math.abs(offset) * -6

          const gatherX = offset * 3
          const gatherRotation = offset * 1
          const gatherY = 0

          const x = phase === 'shuffle' ? shuffleX : gatherX
          const y = phase === 'shuffle' ? shuffleY : gatherY
          const rotation = phase === 'shuffle' ? shuffleRotation : gatherRotation

          return (
            <div
              key={i}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 rounded-lg border border-purple-500/30 flex items-center justify-center bg-gradient-to-b from-purple-700 via-indigo-800 to-purple-900"
              style={{
                width: 64,
                height: 96,
                marginLeft: -32,
                marginTop: -48,
                transform: `translateX(${x}px) translateY(${y}px) rotate(${rotation}deg)`,
                transition: `transform ${phase === 'gather' ? '0.5s' : '0.6s'} cubic-bezier(0.34, 1.56, 0.64, 1)`,
                zIndex: i,
              }}
            >
              <span
                className="flex items-center justify-center border border-purple-400/40 rounded"
                style={{ width: 36, height: 54 }}
              >
                <span className="text-purple-300 text-sm select-none">&#x2726;</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
