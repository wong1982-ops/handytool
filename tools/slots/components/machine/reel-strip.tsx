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

  // Pre-pick 6 random symbols for the spin strip (uses same images, already browser-cached)
  const spinSymbols = useMemo(() => {
    const picks: SymbolConfig[] = []
    for (let i = 0; i < 6; i++) {
      picks.push(symbols[Math.floor(Math.random() * symbols.length)])
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
      setIsSpinning(false)
      setShowResult(true)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [spinning]) // eslint-disable-line react-hooks/exhaustive-deps

  const displaySymbols = visibleSymbolIds.map(id => symbols.find(s => s.id === id) || symbols[0])

  if (isSpinning) {
    // Spin strip: use native <img> (browser-cached, no Next.js Image overhead)
    // 6 symbols looping with CSS keyframe = smooth, fast, uses actual game artwork
    return (
      <div className="overflow-hidden relative" style={{ height: `${3 * 80}px` }}>
        <div
          className="absolute w-full flex flex-col gap-1"
          style={{
            animation: 'reelSpin 0.2s linear infinite',
          }}
        >
          {spinSymbols.map((sym, i) => (
            <div
              key={i}
              className="h-[78px] shrink-0 flex items-center justify-center rounded-lg overflow-hidden"
              style={{ backgroundColor: '#1a0a2e' }}
            >
              {sym.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sym.imagePath}
                  alt=""
                  className="w-full h-full object-contain p-1"
                  style={{ filter: 'blur(0.5px)' }}
                />
              ) : (
                <span className="text-3xl" style={{ filter: 'blur(0.5px)' }}>{sym.icon}</span>
              )}
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes reelSpin {
            0% { transform: translateY(0); }
            100% { transform: translateY(-${3 * 79}px); }
          }
        `}</style>
      </div>
    )
  }

  // Stopped: show actual result with Next.js Image for quality
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
