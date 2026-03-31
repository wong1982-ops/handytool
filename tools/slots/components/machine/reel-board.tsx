'use client'

import { useCallback, useRef } from 'react'
import { ReelStrip } from './reel-strip'
import type { SlotGameConfig, SpinResult } from '../../slots-types'

interface ReelBoardProps {
  config: SlotGameConfig
  result: SpinResult | null
  spinning: boolean
  onAllReelsStopped: () => void
}

export function ReelBoard({ config, result, spinning, onAllReelsStopped }: ReelBoardProps) {
  const stoppedRef = useRef(0)

  const handleReelStop = useCallback(() => {
    stoppedRef.current++
    if (stoppedRef.current >= config.reels) {
      stoppedRef.current = 0
      setTimeout(() => onAllReelsStopped(), 100)
    }
  }, [config.reels, onAllReelsStopped])

  // Get winning positions per reel
  const winPositions: number[][] = Array.from({ length: config.reels }, () => [])
  if (result && !spinning) {
    for (const win of result.wins) {
      for (const [reel, row] of win.positions) {
        if (!winPositions[reel].includes(row)) {
          winPositions[reel].push(row)
        }
      }
    }
  }

  // Get visible symbols (from result or empty)
  const getVisibleIds = (reelIdx: number): string[] => {
    if (result) {
      return result.grid[reelIdx]
    }
    // Default: show first 3 symbols
    return Array.from({ length: config.rows }, (_, r) => {
      const idx = config.reelStrips[reelIdx][r % config.reelStrips[reelIdx].length]
      return config.symbols[idx].id
    })
  }

  const backgroundImage = config.theme.backgroundImage

  return (
    <div
      className="rounded-2xl p-[2px]"
      style={{
        background: 'linear-gradient(180deg, #d4a052 0%, #f0d080 40%, #d4a052 60%, #a07030 100%)',
        boxShadow: '0 0 20px rgba(212, 160, 82, 0.3), inset 0 0 10px rgba(240, 208, 128, 0.2)',
      }}
    >
      <div
        className="rounded-[14px] p-3 relative overflow-hidden"
        style={{
          backgroundColor: config.theme.reelBackground || '#0d0519',
        }}
      >
        {/* Background image overlay */}
        {backgroundImage && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}

        {/* Inner shadow for depth */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[14px]"
          style={{
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5), inset 0 -2px 8px rgba(0,0,0,0.3)',
          }}
        />

        <div
          className="grid gap-1 relative z-10"
          style={{
            gridTemplateColumns: `repeat(${config.reels}, 1fr)`,
          }}
          role="img"
          aria-label="Slot machine reels"
        >
          {Array.from({ length: config.reels }, (_, reelIdx) => (
            <ReelStrip
              key={reelIdx}
              symbols={config.symbols}
              visibleSymbolIds={getVisibleIds(reelIdx)}
              spinning={spinning}
              stopDelay={800 + reelIdx * 200}
              highlightedPositions={winPositions[reelIdx]}
              onStop={handleReelStop}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
