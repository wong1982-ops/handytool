'use client'

import { useRef, useEffect, useState } from 'react'
import { useSlots } from '../../slots-provider'

const TIERS = [
  { key: 'grand' as const, label: 'GRAND', bg: 'linear-gradient(180deg, #8B0000, #cc0000)' },
  { key: 'major' as const, label: 'MAJOR', bg: 'linear-gradient(180deg, #1a1a5a, #3333cc)' },
  { key: 'minor' as const, label: 'MINOR', bg: 'linear-gradient(180deg, #0a3a1a, #30b060)' },
]

export function JackpotTickers() {
  const { player } = useSlots()
  const [displayValues, setDisplayValues] = useState(player.jackpots)
  const rafRef = useRef<number>(0)

  // Animate: add tiny random increments each frame for "live counter" feel
  useEffect(() => {
    const animate = () => {
      setDisplayValues(prev => ({
        grand: prev.grand + Math.random() * 0.5,
        major: prev.major + Math.random() * 0.3,
        minor: prev.minor + Math.random() * 0.2,
      }))
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Sync with actual values when they change (e.g., after jackpot win/reset)
  useEffect(() => {
    setDisplayValues(player.jackpots)
  }, [player.jackpots.grand, player.jackpots.major, player.jackpots.minor])

  return (
    <div className="flex gap-1 px-2">
      {TIERS.map(({ key, label, bg }) => (
        <div
          key={key}
          className="flex-1 rounded-md overflow-hidden"
          style={{ background: bg, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          <div className="text-center py-1 px-1">
            <div className="text-[8px] font-bold text-white/70 tracking-wider">{label}</div>
            <div
              className="text-[11px] font-bold tabular-nums"
              style={{
                color: '#ffd700',
                fontFamily: '"SF Mono", "Consolas", monospace',
                textShadow: '0 0 6px rgba(255,215,0,0.5)',
              }}
            >
              {Math.floor(displayValues[key]).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
