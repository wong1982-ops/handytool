'use client'

import { useState, useEffect, useRef } from 'react'
import { SymbolCell } from './symbol-cell'
import type { SymbolConfig } from '../../slots-types'

interface ReelStripProps {
  symbols: SymbolConfig[]         // all game symbols for lookup
  visibleSymbolIds: string[]      // 3 symbol IDs currently visible
  spinning: boolean
  stopDelay: number               // ms delay before this reel stops
  highlightedPositions: number[]  // row indices to highlight
  onStop?: () => void
}

// Generate random symbols for the spinning blur effect
function getRandomIcons(symbols: SymbolConfig[], count: number): string[] {
  const icons: string[] = []
  for (let i = 0; i < count; i++) {
    icons.push(symbols[Math.floor(Math.random() * symbols.length)].icon)
  }
  return icons
}

export function ReelStrip({ symbols, visibleSymbolIds, spinning, stopDelay, highlightedPositions, onStop }: ReelStripProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [displaySymbols, setDisplaySymbols] = useState(visibleSymbolIds)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (spinning) {
      setIsSpinning(true)
      // Cycle random symbols while spinning
      intervalRef.current = setInterval(() => {
        setDisplaySymbols(getRandomIcons(symbols, 3).map(icon => {
          const sym = symbols.find(s => s.icon === icon)
          return sym?.id || symbols[0].id
        }))
      }, 80)

      // Stop after delay
      timerRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplaySymbols(visibleSymbolIds)
        setIsSpinning(false)
        onStop?.()
      }, stopDelay)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [spinning]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update display when result changes (after spin)
  useEffect(() => {
    if (!spinning && !isSpinning) {
      setDisplaySymbols(visibleSymbolIds)
    }
  }, [visibleSymbolIds, spinning, isSpinning])

  return (
    <div className={`flex flex-col gap-1 ${isSpinning ? 'animate-pulse' : ''}`}>
      {displaySymbols.map((symId, row) => {
        const sym = symbols.find((s) => s.id === symId) || symbols[0]
        return (
          <SymbolCell
            key={`${row}-${symId}`}
            icon={sym.icon}
            highlighted={!isSpinning && highlightedPositions.includes(row)}
            isWild={sym.isWild}
            isScatter={sym.isScatter}
          />
        )
      })}
    </div>
  )
}
