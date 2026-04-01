'use client'

import { useCallback, useRef } from 'react'
import { ReelStrip } from './reel-strip'
import { PaylineOverlay } from './payline-overlay'
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

  const { cabinetFrame, cabinetAccent, reelBackground } = config.theme

  return (
    <div
      className="p-[6px] rounded-2xl"
      style={{
        background: cabinetFrame || 'linear-gradient(180deg, #d4a052 0%, #f0d080 40%, #d4a052 60%, #a07030 100%)',
        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="rounded-[10px] overflow-hidden relative"
        style={{
          backgroundColor: reelBackground || '#0d0519',
        }}
      >
        <div className="relative">
          <div
            className="grid relative z-10"
            style={{
              gridTemplateColumns: `repeat(${config.reels}, 1fr)`,
              gap: 0,
            }}
            role="img"
            aria-label="Slot machine reels"
          >
            {Array.from({ length: config.reels }, (_, reelIdx) => (
              <div
                key={reelIdx}
                style={reelIdx < config.reels - 1 ? {
                  borderRight: `1px solid ${cabinetAccent || '#d4a052'}15`,
                } : undefined}
              >
                <ReelStrip
                  symbols={config.symbols}
                  visibleSymbolIds={getVisibleIds(reelIdx)}
                  spinning={spinning}
                  stopDelay={800 + reelIdx * 200}
                  highlightedPositions={winPositions[reelIdx]}
                  onStop={handleReelStop}
                  reelBackground={reelBackground}
                  accentColor={cabinetAccent}
                />
              </div>
            ))}
          </div>

          {/* Win lines overlay */}
          <PaylineOverlay
            wins={result?.wins || []}
            reels={config.reels}
            rows={config.rows}
            visible={!spinning && !!result && result.wins.length > 0}
          />
        </div>
      </div>
    </div>
  )
}
