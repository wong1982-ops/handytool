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

  return (
    <div
      className="grid gap-1 p-3 rounded-xl"
      style={{
        gridTemplateColumns: `repeat(${config.reels}, 1fr)`,
        backgroundColor: config.theme.reelBackground,
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
  )
}
