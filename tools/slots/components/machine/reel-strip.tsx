'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { SymbolCell } from './symbol-cell'
import type { SymbolConfig } from '../../slots-types'

interface ReelStripProps {
  symbols: SymbolConfig[]
  visibleSymbolIds: string[]
  spinning: boolean
  stopDelay: number
  highlightedPositions: number[]
  onStop?: () => void
}

export function ReelStrip({ symbols, visibleSymbolIds, spinning, stopDelay, highlightedPositions, onStop }: ReelStripProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-pick 6 random emoji for the spin blur strip (lightweight, no Images)
  const spinEmoji = useMemo(() => {
    const picks: string[] = []
    for (let i = 0; i < 6; i++) {
      picks.push(symbols[Math.floor(Math.random() * symbols.length)].icon)
    }
    return picks
  }, [symbols])

  useEffect(() => {
    if (spinning && !isSpinning) {
      setIsSpinning(true)
      setShowResult(false)

      timerRef.current = setTimeout(() => {
        setIsSpinning(false)
        setShowResult(true)
        onStop?.()
      }, stopDelay)
    }

    if (!spinning && isSpinning) {
      // Force stop
      setIsSpinning(false)
      setShowResult(true)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [spinning]) // eslint-disable-line react-hooks/exhaustive-deps

  const displaySymbols = visibleSymbolIds.map(id => symbols.find(s => s.id === id) || symbols[0])

  if (isSpinning) {
    // Lightweight spin: just emoji in a CSS-animated strip, no Image components
    return (
      <div className="overflow-hidden relative" style={{ height: `${3 * 80}px` }}>
        <div
          className="absolute w-full"
          style={{
            animation: `reelSpin 0.15s linear infinite`,
          }}
        >
          {spinEmoji.map((emoji, i) => (
            <div
              key={i}
              className="h-[78px] flex items-center justify-center text-3xl rounded-lg"
              style={{ backgroundColor: '#1a0a2e', filter: 'blur(0.5px)' }}
            >
              {emoji}
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes reelSpin {
            0% { transform: translateY(0); }
            100% { transform: translateY(-${3 * 78}px); }
          }
        `}</style>
      </div>
    )
  }

  // Stopped: show actual result with images
  return (
    <div className="flex flex-col gap-1">
      {displaySymbols.map((sym, row) => (
        <div
          key={`${row}-${sym.id}`}
          className={showResult ? 'animate-[reelLand_0.3s_cubic-bezier(0.34,1.56,0.64,1)]' : ''}
        >
          <SymbolCell
            icon={sym.icon}
            imagePath={sym.imagePath}
            highlighted={highlightedPositions.includes(row)}
            isWild={sym.isWild}
            isScatter={sym.isScatter}
          />
        </div>
      ))}
    </div>
  )
}
