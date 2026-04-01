'use client'

import { useEffect, useState } from 'react'
import type { PaylineWin } from '../../slots-types'

// Colors for different payline wins — cycle through these
const LINE_COLORS = [
  '#ff4444', '#ffaa00', '#44ff44', '#4488ff', '#ff44ff',
  '#44ffff', '#ff8844', '#88ff44', '#ff4488', '#44aaff',
]

interface PaylineOverlayProps {
  wins: PaylineWin[]
  reels: number
  rows: number
  visible: boolean
}

export function PaylineOverlay({ wins, reels, rows, visible }: PaylineOverlayProps) {
  const [activeWinIndex, setActiveWinIndex] = useState(0)

  // Cycle through wins one at a time (like real machines)
  useEffect(() => {
    if (!visible || wins.length === 0) {
      setActiveWinIndex(0)
      return
    }

    if (wins.length === 1) return

    const interval = setInterval(() => {
      setActiveWinIndex(prev => (prev + 1) % wins.length)
    }, 1500) // Show each win line for 1.5 seconds

    return () => clearInterval(interval)
  }, [visible, wins.length])

  if (!visible || wins.length === 0) return null

  const activeWin = wins[activeWinIndex]
  if (!activeWin) return null

  const color = LINE_COLORS[activeWinIndex % LINE_COLORS.length]

  // Calculate positions as percentages
  // Each cell is 1/reels wide and 1/rows tall (plus gaps)
  const cellW = 100 / reels
  const cellH = 100 / rows

  // Build SVG path through winning positions
  // For ways wins (paylineIndex === -1 but not scatter), pick one position per reel
  const allPoints = activeWin.positions
    .sort((a, b) => a[0] - b[0])

  // Determine if this is a scatter win (scatter symbol) vs ways/payline win
  const isScatterSymbol = activeWin.symbolId && activeWin.positions.length > 0 &&
    activeWin.paylineIndex === -1 &&
    // If positions span multiple rows on the same reel, it's likely a ways win with multiple matches
    // Scatter wins typically have exactly 1 position per reel
    allPoints.filter((p, i, arr) => i === 0 || arr[i - 1][0] !== p[0]).length === allPoints.length

  // For line drawing: pick one position per reel (first match)
  const linePoints: { x: number; y: number }[] = []
  const seenReels = new Set<number>()
  for (const [reel, row] of allPoints) {
    if (!seenReels.has(reel)) {
      seenReels.add(reel)
      linePoints.push({
        x: cellW * reel + cellW / 2,
        y: cellH * row + cellH / 2,
      })
    }
  }

  const allPointsMapped = allPoints.map(([reel, row]) => ({
    x: cellW * reel + cellW / 2,
    y: cellH * row + cellH / 2,
  }))

  // Use scatter circles only for actual scatter symbol wins with 3+ positions
  // Everything else (paylines AND ways) draws connecting lines
  const isScatter = isScatterSymbol && activeWin.paylineIndex === -1 && linePoints.length >= 3 &&
    activeWin.symbolId?.includes('scatter')

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      >
        {isScatter ? (
          // Scatter: draw circles at each position
          allPointsMapped.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={cellH / 3}
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              opacity="0.9"
            >
              <animate attributeName="r" values={`${cellH / 3};${cellH / 2.5};${cellH / 3}`} dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1s" repeatCount="indefinite" />
            </circle>
          ))
        ) : (
          // Payline / Ways: draw a line through one position per reel
          <>
            {/* Thick glow line */}
            <polyline
              points={linePoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
            />
            {/* Main line */}
            <polyline
              points={linePoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            >
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1s" repeatCount="indefinite" />
            </polyline>
            {/* Dots at each winning position */}
            {allPointsMapped.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="1.5"
                fill={color}
                opacity="0.9"
              >
                <animate attributeName="r" values="1.5;2.5;1.5" dur="1s" repeatCount="indefinite" />
              </circle>
            ))}
          </>
        )}
      </svg>

      {/* Win amount badge */}
      <div
        className="absolute top-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold animate-bounce"
        style={{
          backgroundColor: color,
          color: '#000',
          boxShadow: `0 0 10px ${color}80`,
        }}
      >
        +{activeWin.winAmount.toLocaleString()}
      </div>
    </div>
  )
}
