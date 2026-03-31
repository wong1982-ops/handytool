'use client'

import { useState, useEffect, useRef } from 'react'
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
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [spinDisplay, setSpinDisplay] = useState<SymbolConfig[]>([])

  useEffect(() => {
    if (spinning && !isSpinning) {
      setIsSpinning(true)
      setShowResult(false)

      // Rapidly cycle through random symbols at 100ms intervals
      spinIntervalRef.current = setInterval(() => {
        const picks: SymbolConfig[] = []
        for (let i = 0; i < 3; i++) {
          picks.push(symbols[Math.floor(Math.random() * symbols.length)])
        }
        setSpinDisplay(picks)
      }, 100)

      // Schedule stop
      timerRef.current = setTimeout(() => {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
        setIsSpinning(false)
        setShowResult(true)
        onStop?.()
      }, stopDelay)
    }

    if (!spinning && isSpinning) {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
      setIsSpinning(false)
      setShowResult(true)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current)
    }
  }, [spinning]) // eslint-disable-line react-hooks/exhaustive-deps

  const displaySymbols = visibleSymbolIds.map(id => symbols.find(s => s.id === id) || symbols[0])

  // Always render 3 cells in the same container — swap content based on state
  const cellSymbols = isSpinning && spinDisplay.length === 3 ? spinDisplay : displaySymbols

  return (
    <div className="flex flex-col gap-1">
      {cellSymbols.map((sym, row) => (
        <div
          key={row}
          className={!isSpinning && showResult ? 'animate-[reelLand_0.3s_cubic-bezier(0.34,1.56,0.64,1)]' : ''}
        >
          {isSpinning ? (
            // During spin: native <img> for speed (browser-cached), slight blur
            <div
              className="w-full aspect-square flex items-center justify-center rounded-lg relative overflow-hidden"
              style={{ backgroundColor: '#1a0a2e', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
            >
              {sym.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sym.imagePath}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain p-1"
                  style={{ filter: 'blur(0.8px)' }}
                />
              ) : (
                <span className="text-3xl sm:text-4xl" style={{ filter: 'blur(0.8px)' }}>{sym.icon}</span>
              )}
            </div>
          ) : (
            // Stopped: full SymbolCell with highlights
            <SymbolCell
              icon={sym.icon}
              imagePath={sym.imagePath}
              highlighted={highlightedPositions.includes(row)}
              isWild={sym.isWild}
              isScatter={sym.isScatter}
            />
          )}
        </div>
      ))}
    </div>
  )
}
