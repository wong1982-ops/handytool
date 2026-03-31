import type { SlotGameConfig } from '../slots-types'
import { spin } from './slot-engine'

interface RtpResult {
  totalSpins: number
  totalBet: number
  totalWon: number
  rtp: number
  bonusTriggers: number
  bonusRate: string
  biggestWin: number
  hitRate: string
}

/**
 * Simulate N spins and calculate actual RTP
 * Run this in dev console or as a Node script to verify game configs
 */
export function calculateRtp(config: SlotGameConfig, spins: number = 100000, betPerLine: number = 1): RtpResult {
  let totalBet = 0
  let totalWon = 0
  let bonusTriggers = 0
  let biggestWin = 0
  let winSpins = 0

  const betAmount = config.useWays
    ? betPerLine
    : betPerLine * config.paylines.length

  for (let i = 0; i < spins; i++) {
    totalBet += betAmount
    const result = spin(config, betPerLine)
    totalWon += result.totalWin

    if (result.totalWin > 0) winSpins++
    if (result.totalWin > biggestWin) biggestWin = result.totalWin
    if (result.bonusTriggered) bonusTriggers++
  }

  return {
    totalSpins: spins,
    totalBet,
    totalWon,
    rtp: totalWon / totalBet,
    bonusTriggers,
    bonusRate: `1 in ${Math.round(spins / Math.max(bonusTriggers, 1))}`,
    biggestWin,
    hitRate: `${((winSpins / spins) * 100).toFixed(1)}%`,
  }
}
