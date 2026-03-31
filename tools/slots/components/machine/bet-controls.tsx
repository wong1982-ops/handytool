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
      {/* Info counters row */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="rounded-lg px-3 py-2 text-center border border-[#d4a052]/40"
          style={{ backgroundColor: '#0d0519' }}
        >
          <div className="text-[10px] uppercase tracking-wider text-[#d4a052]/70 font-medium">
            Credit
          </div>
          <div className="text-sm font-bold text-[#f0d080]">
            {player.coins.toLocaleString()}
          </div>
        </div>
        <div
          className="rounded-lg px-3 py-2 text-center border border-[#d4a052]/40"
          style={{ backgroundColor: '#0d0519' }}
        >
          <div className="text-[10px] uppercase tracking-wider text-[#d4a052]/70 font-medium">
            {t.machine.totalBet}
          </div>
          <div className="text-sm font-bold text-[#f0d080]">
            {totalBet.toLocaleString()}
          </div>
        </div>
        <div
          className="rounded-lg px-3 py-2 text-center border border-[#d4a052]/40"
          style={{ backgroundColor: '#0d0519' }}
        >
          <div className="text-[10px] uppercase tracking-wider text-[#d4a052]/70 font-medium">
            {t.machine.win || 'Win'}
          </div>
          <div className="text-sm font-bold text-[#f0d080]">
            0
          </div>
        </div>
      </div>

      {/* Bet adjuster */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={decreaseBet}
          disabled={betIndex <= 0 || spinning}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30 border border-[#d4a052]/50 text-[#d4a052] hover:text-[#f0d080] hover:border-[#f0d080]/60"
          style={{ backgroundColor: '#2d1052' }}
          aria-label="Decrease bet"
        >
          ◄
        </button>
        <div className="text-center min-w-[100px]">
          <div className="text-[10px] uppercase tracking-wider text-[#d4a052]/70">
            {t.machine.betPerLine}
          </div>
          <div className="text-lg font-bold text-[#f0d080]">
            {betPerLine.toLocaleString()}
          </div>
        </div>
        <button
          onClick={increaseBet}
          disabled={betIndex >= config.betSteps.length - 1 || spinning}
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30 border border-[#d4a052]/50 text-[#d4a052] hover:text-[#f0d080] hover:border-[#f0d080]/60"
          style={{ backgroundColor: '#2d1052' }}
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
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 border ${
            autoSpinning
              ? 'bg-[#d4a052] text-[#0d0519] border-[#f0d080]'
              : 'border-[#d4a052]/40 text-[#d4a052] hover:text-[#f0d080] hover:border-[#f0d080]/60'
          }`}
          style={!autoSpinning ? { backgroundColor: '#2d1052' } : undefined}
        >
          {autoSpinning ? t.machine.stop : t.machine.auto}
        </button>

        <button
          onClick={onSpin}
          disabled={!canSpin}
          className={`flex-[2] py-3.5 rounded-full text-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white ${
            !spinning && canSpin ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: '#22c55e',
            boxShadow: canSpin ? '0 0 20px rgba(34, 197, 94, 0.4), 0 4px 12px rgba(0,0,0,0.3)' : undefined,
          }}
          onMouseEnter={(e) => { if (canSpin) e.currentTarget.style.backgroundColor = '#16a34a' }}
          onMouseLeave={(e) => { if (canSpin) e.currentTarget.style.backgroundColor = '#22c55e' }}
          aria-label={spinning ? t.machine.stop : t.machine.spin}
        >
          {spinning ? t.machine.stop : t.machine.spin}
        </button>

        <button
          onClick={onMaxBet}
          disabled={spinning}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 border border-[#d4a052]/40 text-[#d4a052] hover:text-[#f0d080] hover:border-[#f0d080]/60"
          style={{ backgroundColor: '#2d1052' }}
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
