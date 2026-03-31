'use client'
import { useState } from 'react'
import type { BonusProps } from '../../slots-types'

export function WheelBonus({ config, betAmount, onComplete }: BonusProps) {
  const segments = config.bonusConfig.wheelSegments || 8
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [won, setWon] = useState<number | null>(null)

  // Generate wheel prizes
  const prizes = Array.from({ length: segments }, (_, i) => {
    const multipliers = [5, 10, 15, 20, 30, 50, 8, 25]
    return (multipliers[i % multipliers.length]) * betAmount
  })

  const spinWheel = () => {
    if (spinning) return
    setSpinning(true)

    // Random landing position
    const winIndex = Math.floor(Math.random() * segments)
    const segmentAngle = 360 / segments
    const targetAngle = 360 * 5 + (360 - winIndex * segmentAngle - segmentAngle / 2)

    setRotation(targetAngle)

    setTimeout(() => {
      setSpinning(false)
      setWon(prizes[winIndex])
      setTimeout(() => onComplete(prizes[winIndex]), 2000)
    }, 4000)
  }

  const segmentAngle = 360 / segments

  return (
    <div className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="text-lg font-bold text-purple-300 mb-6">SPIN THE WHEEL!</div>

      {/* Wheel */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-2xl">▼</div>

        {/* Spinning wheel */}
        <div
          className="w-full h-full rounded-full border-4 border-yellow-400 overflow-hidden transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: spinning ? '4s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          }}
        >
          {prizes.map((prize, i) => {
            const colors = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-amber-600', 'bg-pink-600', 'bg-cyan-600', 'bg-orange-600']
            return (
              <div
                key={i}
                className={`absolute w-full h-full flex items-start justify-center pt-4 ${colors[i % colors.length]}`}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((i * segmentAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((i * segmentAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos(((i + 1) * segmentAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin(((i + 1) * segmentAngle - 90) * Math.PI / 180)}%)`,
                  transform: `rotate(${i * segmentAngle + segmentAngle / 2}deg)`,
                }}
              >
                <span className="text-xs font-bold text-white">{(prize / betAmount)}x</span>
              </div>
            )
          })}
        </div>
      </div>

      {!spinning && won === null && (
        <button
          onClick={spinWheel}
          className="mt-6 px-8 py-3 rounded-xl text-lg font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
        >
          SPIN!
        </button>
      )}

      {won !== null && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-400">You Won</div>
          <div className="text-3xl font-bold text-yellow-300">{won.toLocaleString()}</div>
        </div>
      )}
    </div>
  )
}
