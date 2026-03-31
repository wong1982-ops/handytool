'use client'

import { useSlots } from '../../slots-provider'
import type { SlotGameConfig } from '../../slots-types'

interface BetControlsProps {
  config: SlotGameConfig
  betPerLine: number
  onBetChange: (bet: number) => void
  onSpin: () => void
  onAutoSpin: () => void
  onMaxBet: () => void
  spinning: boolean
  autoSpinning: boolean
}

export function BetControls({
  config, betPerLine, onBetChange, onSpin, onAutoSpin, onMaxBet, spinning, autoSpinning,
}: BetControlsProps) {
  const { player, t } = useSlots()

  const lines = config.useWays ? 243 : config.paylines.length
  const totalBet = config.useWays ? betPerLine * 25 : betPerLine * lines
  const canSpin = player.coins >= totalBet && !spinning

  const betIndex = config.betSteps.indexOf(betPerLine)

  const decreaseBet = () => {
    if (betIndex > 0) onBetChange(config.betSteps[betIndex - 1])
  }
  const increaseBet = () => {
    if (betIndex < config.betSteps.length - 1) onBetChange(config.betSteps[betIndex + 1])
  }

  return (
    <div className="space-y-3 px-2">
      {/* Info row */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{config.useWays ? t.machine.ways : t.machine.lines}: {lines}</span>
        <span>{t.machine.totalBet}: {totalBet.toLocaleString()}</span>
      </div>

      {/* Bet adjuster */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={decreaseBet}
          disabled={betIndex <= 0 || spinning}
          className="w-8 h-8 rounded-full bg-gray-700 text-white text-lg flex items-center justify-center hover:bg-gray-600 disabled:opacity-30 transition-colors"
          aria-label="Decrease bet"
        >
          ◄
        </button>
        <div className="text-center min-w-[100px]">
          <div className="text-xs text-gray-400">{t.machine.betPerLine}</div>
          <div className="text-lg font-bold text-white">{betPerLine.toLocaleString()}</div>
        </div>
        <button
          onClick={increaseBet}
          disabled={betIndex >= config.betSteps.length - 1 || spinning}
          className="w-8 h-8 rounded-full bg-gray-700 text-white text-lg flex items-center justify-center hover:bg-gray-600 disabled:opacity-30 transition-colors"
          aria-label="Increase bet"
        >
          ►
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAutoSpin}
          disabled={!canSpin}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            autoSpinning
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:opacity-30`}
        >
          {autoSpinning ? t.machine.stop : t.machine.auto}
        </button>

        <button
          onClick={onSpin}
          disabled={!canSpin}
          className="flex-[2] py-3 rounded-xl text-lg font-bold bg-red-600 text-white hover:bg-red-500 active:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-600/30"
          aria-label={spinning ? t.machine.stop : t.machine.spin}
        >
          {spinning ? t.machine.stop : t.machine.spin}
        </button>

        <button
          onClick={onMaxBet}
          disabled={spinning}
          className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-30 transition-colors"
        >
          {t.machine.maxBet}
        </button>
      </div>

      {/* Insufficient coins warning */}
      {player.coins < totalBet && !spinning && (
        <p className="text-center text-xs text-red-400">{t.machine.insufficientCoins}</p>
      )}
    </div>
  )
}
