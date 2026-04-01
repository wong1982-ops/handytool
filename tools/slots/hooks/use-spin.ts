'use client'

import { useState, useCallback } from 'react'
import { spin as engineSpin } from '../engine/slot-engine'
import { useSlots } from '../slots-provider'
import { useSound } from './use-sound'
import type { SlotGameConfig, SpinResult } from '../slots-types'
import { getWinTier, JACKPOT_CONFIG } from '../slots-types'
import type { JackpotTier } from '../slots-types'

interface UseSpinOptions {
  config: SlotGameConfig
  betPerLine: number
}

const JACKPOT_TIERS: JackpotTier[] = ['grand', 'major', 'minor']

export function useSpin({ config, betPerLine }: UseSpinOptions) {
  const { player, dispatch } = useSlots()
  const { play } = useSound()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [showWin, setShowWin] = useState(false)
  const [bonusActive, setBonusActive] = useState(false)
  const [jackpotWin, setJackpotWin] = useState<{ tier: JackpotTier; amount: number } | null>(null)

  const totalBet = config.useWays ? betPerLine * 25 : betPerLine * config.paylines.length

  const doSpin = useCallback(() => {
    if (spinning || player.coins < totalBet) return

    // Deduct bet
    dispatch({ type: 'DEDUCT_COINS', payload: totalBet })
    dispatch({ type: 'ADD_XP', payload: Math.floor(totalBet * 0.1) })

    setShowWin(false)
    setJackpotWin(null)
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

    // 2. Jackpot contribution — add to all 3 tiers
    for (const tier of JACKPOT_TIERS) {
      const contribution = Math.floor(totalBet * JACKPOT_CONFIG[tier].contribution)
      if (contribution > 0) {
        dispatch({ type: 'ADD_JACKPOT', payload: { tier, amount: contribution } })
      }
    }

    // 3. Jackpot trigger check — highest tier first, only one can trigger
    for (const tier of JACKPOT_TIERS) {
      if (Math.floor(Math.random() * JACKPOT_CONFIG[tier].odds) === 0) {
        const jackpotAmount = player.jackpots[tier]

        dispatch({ type: 'ADD_COINS', payload: jackpotAmount })
        dispatch({ type: 'RESET_JACKPOT', payload: { tier } })
        setJackpotWin({ tier, amount: jackpotAmount })
        break // only one jackpot per spin
      }
    }

    if (result.bonusTriggered) {
      play('bonusTrigger')
      setTimeout(() => setBonusActive(true), 1500)
    }
  }, [result, totalBet, dispatch, play, player.jackpots])

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
    jackpotWin,
  }
}
