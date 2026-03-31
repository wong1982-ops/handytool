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
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'landing'>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build a looping strip: duplicate set so the CSS animation can loop seamlessly
  // 6 random symbols repeated twice = 12 total, then 3 final result symbols
  const randomSymbols = useMemo(() => {
    const set: SymbolConfig[] = []
    for (let i = 0; i < 6; i++) {
      set.push(symbols[Math.floor(Math.random() * symbols.length)])
    }
    return set
  }, [symbols])

  const finalSymbols = useMemo(
    () => visibleSymbolIds.map(id => symbols.find(s => s.id === id) || symbols[0]),
    [visibleSymbolIds, symbols]
  )

  useEffect(() => {
    if (spinning && phase === 'idle') {
      setPhase('spinning')

      timerRef.current = setTimeout(() => {
        setPhase('landing')
        // Brief landing pause then done
        setTimeout(() => {
          setPhase('idle')
          onStop?.()
        }, 350)
      }, stopDelay - 350) // subtract landing time from total delay
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [spinning]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when not spinning externally
  useEffect(() => {
    if (!spinning && phase !== 'idle') {
      setPhase('idle')
    }
  }, [spinning]) // eslint-disable-line react-hooks/exhaustive-deps

  // Idle: show 3 result symbols
  if (phase === 'idle') {
    return (
      <div ref={containerRef} className="flex flex-col gap-1">
        {finalSymbols.map((sym, row) => (
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

  // Spinning: CSS animation drives the scroll (GPU-accelerated, 60fps)
  // Landing: CSS transition eases into final position
  // The strip has: [6 random] + [6 random repeat] + [3 final]
  // We scroll through the first 6, then loop seamlessly, then on landing snap to final 3
  const stripSymbols = phase === 'landing'
    ? finalSymbols  // On landing, just show the final 3 with bounce animation
    : [...randomSymbols, ...randomSymbols] // During spin, double the set for seamless loop

  if (phase === 'landing') {
    return (
      <div className="flex flex-col gap-1">
        {stripSymbols.map((sym, i) => (
          <div
            key={i}
            className="animate-[reelLand_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
          >
            <SpinCell sym={sym} />
          </div>
        ))}
      </div>
    )
  }

  // Spinning: overflow-hidden viewport, CSS keyframe scrolls the strip
  return (
    <div className="flex flex-col gap-1">
      {/* Invisible sizer to keep container height = 3 cells */}
      <div className="relative overflow-hidden">
        {/* Sizer */}
        <div className="invisible flex flex-col gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-full aspect-square" />
          ))}
        </div>

        {/* Scrolling strip — CSS animation on GPU */}
        <div
          className="absolute inset-x-0 top-0 flex flex-col gap-1"
          style={{
            animation: `slotScroll 0.3s linear infinite`,
            willChange: 'transform',
          }}
        >
          {stripSymbols.map((sym, i) => (
            <SpinCell key={i} sym={sym} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slotScroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, -50%, 0); }
        }
      `}</style>
    </div>
  )
}

/** Lightweight cell for spin animation — native <img>, no Next.js Image */
function SpinCell({ sym }: { sym: SymbolConfig }) {
  return (
    <div
      className="w-full aspect-square flex items-center justify-center rounded-lg relative overflow-hidden shrink-0"
      style={{
        backgroundColor: '#1a0a2e',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      {sym.imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sym.imagePath}
          alt=""
          className="absolute inset-0 w-full h-full object-contain p-1"
        />
      ) : (
        <span className="text-3xl sm:text-4xl">{sym.icon}</span>
      )}
    </div>
  )
}
