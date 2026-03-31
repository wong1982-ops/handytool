'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import type { BonusProps, SpinResult } from '../../slots-types'
import { spin } from '../../engine/slot-engine'
import { ReelBoard } from '../machine/reel-board'

export function FreeSpinsBonus({ config, triggerScatterCount, betAmount, onComplete }: BonusProps) {
  const spinsAwarded = (config.bonusConfig.freeSpinsCount || 10) + (triggerScatterCount - config.bonusConfig.triggerCount) * 5
  const multiplier = config.bonusConfig.multiplier || 1

  const [spinsRemaining, setSpinsRemaining] = useState(spinsAwarded)
  const [totalWin, setTotalWin] = useState(0)
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null)
  const [spinning, setSpinning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doFreeSpin = useCallback(() => {
    if (spinsRemaining <= 0) return
    setSpinning(true)
    const result = spin(config, betAmount)
    setCurrentResult(result)
  }, [spinsRemaining, config, betAmount])

  const onReelsStopped = useCallback(() => {
    setSpinning(false)
    if (currentResult) {
      const win = currentResult.totalWin * multiplier
      setTotalWin((prev) => prev + win)

      // Check retrigger
      if (config.bonusConfig.retriggerable && currentResult.bonusTriggered) {
        setSpinsRemaining((prev) => prev + (config.bonusConfig.freeSpinsCount || 5))
      }

      setSpinsRemaining((prev) => prev - 1)
    }
  }, [currentResult, multiplier, config.bonusConfig])

  // Auto-spin loop
  useEffect(() => {
    if (!spinning && spinsRemaining > 0) {
      timerRef.current = setTimeout(doFreeSpin, 1000)
    } else if (!spinning && spinsRemaining <= 0 && currentResult !== null) {
      // Bonus complete
      timerRef.current = setTimeout(() => onComplete(totalWin), 2000)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [spinning, spinsRemaining]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-purple-300">FREE SPINS</div>
        <div className="text-sm text-gray-400">{spinsRemaining} spins left · {multiplier}x multiplier</div>
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
