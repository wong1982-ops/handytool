'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { BonusProps, SpinResult } from '../../slots-types'
import { spin } from '../../engine/slot-engine'
import { ReelBoard } from '../machine/reel-board'

export function ExpandingWildsBonus({ config, betAmount, onComplete }: BonusProps) {
  const spinsAwarded = (config.bonusConfig.freeSpinsCount || 8)
  const [spinsRemaining, setSpinsRemaining] = useState(spinsAwarded)
  const [totalWin, setTotalWin] = useState(0)
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null)
  const [spinning, setSpinning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doFreeSpin = useCallback(() => {
    if (spinsRemaining <= 0) return
    setSpinning(true)
    const result = spin(config, betAmount)

    // Expanding wilds: if any wild appears on a reel, fill that entire reel with wilds
    const wildId = config.specialSymbols.wild
    if (wildId) {
      for (let reel = 0; reel < config.reels; reel++) {
        if (result.grid[reel].includes(wildId)) {
          result.grid[reel] = result.grid[reel].map(() => wildId)
        }
      }
      // Re-evaluate wins with expanded wilds
      // (simplified: just add bonus multiplier)
      result.totalWin = result.totalWin * 2
    }

    setCurrentResult(result)
  }, [spinsRemaining, config, betAmount])

  const onReelsStopped = useCallback(() => {
    setSpinning(false)
    if (currentResult) {
      setTotalWin((prev) => prev + currentResult.totalWin)
      setSpinsRemaining((prev) => prev - 1)
    }
  }, [currentResult])

  useEffect(() => {
    if (!spinning && spinsRemaining > 0) {
      timerRef.current = setTimeout(doFreeSpin, 1000)
    } else if (!spinning && spinsRemaining <= 0 && currentResult !== null) {
      timerRef.current = setTimeout(() => onComplete(totalWin), 2000)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [spinning, spinsRemaining]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-green-300">EXPANDING WILDS!</div>
        <div className="text-sm text-gray-400">{spinsRemaining} spins left</div>
      </div>

      <div className="w-full max-w-md">
        <ReelBoard config={config} result={currentResult} spinning={spinning} onAllReelsStopped={onReelsStopped} />
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm text-gray-400">Total Bonus Win</div>
        <div className="text-3xl font-bold text-yellow-300">{totalWin.toLocaleString()}</div>
      </div>
    </div>
  )
}
