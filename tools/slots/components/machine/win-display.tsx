'use client'

import { useState, useEffect, useRef } from 'react'
import { getWinTier } from '../../slots-types'

interface WinDisplayProps {
  winAmount: number
  totalBet: number
  visible: boolean
}

export function WinDisplay({ winAmount, totalBet, visible }: WinDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(0)
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tier = getWinTier(winAmount, totalBet)

  useEffect(() => {
    if (!visible || winAmount === 0) {
      setDisplayAmount(0)
      return
    }

    // Count up animation
    const steps = 20
    const increment = winAmount / steps
    let current = 0

    animRef.current = setInterval(() => {
      current += increment
      if (current >= winAmount) {
        current = winAmount
        if (animRef.current) clearInterval(animRef.current)
      }
      setDisplayAmount(Math.floor(current))
    }, 50)

    return () => {
      if (animRef.current) clearInterval(animRef.current)
    }
  }, [winAmount, visible])

  if (!visible || winAmount === 0) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className={`text-center ${tier === 'mega' || tier === 'big' ? 'animate-bounce' : ''}`}>
        {(tier === 'big' || tier === 'mega') && (
          <div className={`text-2xl sm:text-4xl font-black mb-2 ${
            tier === 'mega'
              ? 'text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)]'
              : 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]'
          }`}>
            {tier === 'mega' ? 'MEGA WIN!' : 'BIG WIN!'}
          </div>
        )}
        <div className={`font-bold ${
          tier === 'mega' ? 'text-4xl sm:text-6xl text-yellow-300' :
          tier === 'big' ? 'text-3xl sm:text-5xl text-amber-400' :
          tier === 'medium' ? 'text-2xl sm:text-3xl text-yellow-400' :
          'text-xl text-yellow-300'
        } drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]`}>
          {displayAmount.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
