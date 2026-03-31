'use client'

import { useState, useCallback } from 'react'
import { spin as engineSpin } from '../engine/slot-engine'
import { useSlots } from '../slots-provider'
import { useSound } from './use-sound'
import type { SlotGameConfig, SpinResult } from '../slots-types'
import { getWinTier } from '../slots-types'

interface UseSpinOptions {
  config: SlotGameConfig
  betPerLine: number
}

export function useSpin({ config, betPerLine }: UseSpinOptions) {
  const { player, dispatch } = useSlots()
  const { play } = useSound()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [showWin, setShowWin] = useState(false)
  const [bonusActive, setBonusActive] = useState(false)

  const totalBet = config.useWays ? betPerLine * 25 : betPerLine * config.paylines.length

  const doSpin = useCallback(() => {
    if (spinning || player.coins < totalBet) return

    // Deduct bet
    dispatch({ type: 'DEDUCT_COINS', payload: totalBet })
    dispatch({ type: 'ADD_XP', payload: Math.floor(totalBet * 0.1) })

    setShowWin(false)
    setSpinning(true)
    play('spin')

    // Run engine
    const spinResult = engineSpin(config, betPerLine)
    setResult(spinResult)

    // The reel animation will call onAllReelsStopped when done
  }, [spinning, player.coins, totalBet, config, betPerLine, dispatch, play])

  const onAllReelsStopped = useCallback(() => {
    setSpinning(false)

    if (!result) return

    if (result.totalWin > 0) {
      dispatch({ type: 'ADD_COINS', payload: result.totalWin })
      setShowWin(true)

      const tier = getWinTier(result.totalWin, totalBet)
      if (tier === 'mega') play('winMega')
      else if (tier === 'big') play('winBig')
      else play('winSmall')

      play('coinCredit')
    }

    if (result.bonusTriggered) {
      play('bonusTrigger')
      setTimeout(() => setBonusActive(true), 1500)
    }
  }, [result, totalBet, dispatch, play])

  const onBonusComplete = useCallback((bonusWin: number) => {
    dispatch({ type: 'ADD_COINS', payload: bonusWin })
    setBonusActive(false)
    play('coinCredit')
  }, [dispatch, play])

  return {
    spinning,
    result,
    showWin,
    bonusActive,
    totalBet,
    doSpin,
    onAllReelsStopped,
    onBonusComplete,
  }
}
