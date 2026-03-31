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
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'stopping' | 'stopped'>('idle')
  const [spinSymbols, setSpinSymbols] = useState<SymbolConfig[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (spinning && phase === 'idle') {
      // Generate random symbols for spin animation (15 symbols)
      const randomSyms: SymbolConfig[] = []
      for (let i = 0; i < 15; i++) {
        randomSyms.push(symbols[Math.floor(Math.random() * symbols.length)])
      }
      // Add final visible symbols at the end
      const finalSyms = visibleSymbolIds.map(id => symbols.find(s => s.id === id) || symbols[0])
      setSpinSymbols([...randomSyms, ...finalSyms])
      setPhase('spinning')

      // Schedule stop
      timerRef.current = setTimeout(() => {
        setPhase('stopping')
        setTimeout(() => {
          setPhase('stopped')
          onStop?.()
          // Reset after a brief moment
          setTimeout(() => setPhase('idle'), 100)
        }, 400) // bounce duration
      }, stopDelay)
    }

    if (!spinning && phase !== 'idle') {
      setPhase('idle')
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [spinning]) // eslint-disable-line react-hooks/exhaustive-deps

  // Final visible symbols
  const displaySymbols = visibleSymbolIds.map(id => symbols.find(s => s.id === id) || symbols[0])

  if (phase === 'spinning' || phase === 'stopping') {
    const stripHeight = spinSymbols.length * 80 // approximate symbol height
    const finalOffset = -(stripHeight - 3 * 80) // stop at last 3 symbols

    return (
      <div className="overflow-hidden h-[240px] relative" style={{ perspective: '300px' }}>
        <div
          className="flex flex-col gap-1 absolute w-full"
          style={{
            transform: phase === 'spinning'
              ? `translateY(${finalOffset}px)`
              : `translateY(${finalOffset}px)`,
            transition: phase === 'spinning'
              ? `transform ${stopDelay / 1000}s linear`
              : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: phase === 'spinning' ? 'blur(1px)' : 'none',
          }}
        >
          {spinSymbols.map((sym, i) => (
            <div key={i} className="h-[78px] shrink-0">
              <SymbolCell
                icon={sym.icon}
                imagePath={sym.imagePath}
                highlighted={false}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {displaySymbols.map((sym, row) => (
        <SymbolCell
          key={`${row}-${sym.id}`}
          icon={sym.icon}
          imagePath={sym.imagePath}
          highlighted={highlightedPositions.includes(row)}
          isWild={sym.isWild}
          isScatter={sym.isScatter}
        />
      ))}
    </div>
  )
}
