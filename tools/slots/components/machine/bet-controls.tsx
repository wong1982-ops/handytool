'use client'

import { useSlots } from '../../slots-provider'
import type { SlotGameConfig } from '../../slots-types'

interface BetControlsProps {
  config: SlotGameConfig
  betPerLine: number
  lastWin?: number
  onBetChange: (bet: number) => void
  onSpin: () => void
  onAutoSpin: () => void
  onMaxBet: () => void
  spinning: boolean
  autoSpinning: boolean
}

/** LED-style digital display — mimics real casino machine LCD panels */
function LedDisplay({ label, value, color = '#f0d080' }: { label: string; value: string | number; color?: string }) {
  return (
    <div
      className="relative rounded-md overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050208 0%, #0a0515 50%, #050208 100%)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 0 rgba(212,160,82,0.1)',
        border: '1px solid rgba(212,160,82,0.25)',
      }}
    >
      {/* Scanline effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
      <div className="relative px-3 py-1.5 text-center">
        <div
          className="text-[9px] uppercase tracking-[0.15em] font-medium mb-0.5"
          style={{ color: 'rgba(212,160,82,0.5)' }}
        >
          {label}
        </div>
        <div
          className="text-base sm:text-lg font-bold tabular-nums"
          style={{
            color,
            textShadow: `0 0 8px ${color}60, 0 0 20px ${color}30`,
            fontFamily: '"SF Mono", "Cascadia Code", "Consolas", monospace',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    </div>
  )
}

/** Physical machine button with 3D bevel effect */
function MachineButton({
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  className = '',
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'spin' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ariaLabel?: string
}) {
  const baseStyles = 'relative font-bold uppercase tracking-wider transition-all active:translate-y-[1px] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:translate-y-0'

  const sizeStyles = {
    sm: 'px-4 py-2 text-[11px] rounded-lg',
    md: 'px-5 py-2.5 text-xs rounded-lg',
    lg: 'px-6 py-4 text-base rounded-2xl',
  }

  const variantStyles = {
    default: {
      background: 'linear-gradient(180deg, #3d2060 0%, #2d1052 40%, #1a0a2e 100%)',
      boxShadow: '0 3px 0 #0d0519, 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
      border: '1px solid rgba(212,160,82,0.3)',
      color: '#d4a052',
    },
    spin: {
      background: 'linear-gradient(180deg, #34d058 0%, #22c55e 30%, #16a34a 100%)',
      boxShadow: '0 4px 0 #0f7a2f, 0 6px 16px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.15)',
      color: '#ffffff',
    },
    accent: {
      background: 'linear-gradient(180deg, #e8b230 0%, #d4a052 40%, #a07030 100%)',
      boxShadow: '0 3px 0 #705020, 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#0d0519',
    },
  }

  const vs = variantStyles[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={vs}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

export function BetControls({
  config, betPerLine, lastWin = 0, onBetChange, onSpin, onAutoSpin, onMaxBet, spinning, autoSpinning,
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
    <div className="space-y-3">
      {/* LED Display Panel — like the top panel of a real machine */}
      <div
        className="grid grid-cols-3 gap-[2px] rounded-xl p-[2px]"
        style={{
          background: 'linear-gradient(180deg, #d4a052 0%, #a07030 100%)',
        }}
      >
        <LedDisplay label="Credit" value={player.coins} />
        <LedDisplay label="Bet" value={totalBet} />
        <LedDisplay label="Win" value={lastWin} color={lastWin > 0 ? '#fbbf24' : '#f0d080'} />
      </div>

      {/* Bet selector — metallic panel with arrow buttons */}
      <div
        className="flex items-center justify-center gap-4 py-2 rounded-xl"
        style={{
          background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0519 100%)',
          border: '1px solid rgba(212,160,82,0.2)',
        }}
      >
        <MachineButton onClick={decreaseBet} disabled={betIndex <= 0 || spinning} size="sm" ariaLabel="Decrease bet">
          ◀
        </MachineButton>

        <div className="text-center min-w-[100px]">
          <div className="text-[9px] uppercase tracking-[0.15em] text-[#d4a052]/50 mb-0.5">
            {config.useWays ? `${lines} Ways` : `${lines} Lines`} · Bet/Line
          </div>
          <div
            className="text-xl font-bold tabular-nums"
            style={{
              color: '#f0d080',
              fontFamily: '"SF Mono", monospace',
              textShadow: '0 0 8px rgba(240,208,128,0.4)',
            }}
          >
            {betPerLine.toLocaleString()}
          </div>
        </div>

        <MachineButton onClick={increaseBet} disabled={betIndex >= config.betSteps.length - 1 || spinning} size="sm" ariaLabel="Increase bet">
          ▶
        </MachineButton>
      </div>

      {/* Button panel — physical casino machine buttons */}
      <div className="flex items-center gap-2">
        <MachineButton
          onClick={onAutoSpin}
          disabled={!canSpin}
          variant={autoSpinning ? 'accent' : 'default'}
          size="md"
          className="flex-1"
        >
          {autoSpinning ? 'Stop' : 'Auto'}
        </MachineButton>

        {/* SPIN — the big green button */}
        <MachineButton
          onClick={onSpin}
          disabled={!canSpin}
          variant="spin"
          size="lg"
          className={`flex-[2.5] ${!spinning && canSpin ? 'animate-[spinPulse_2s_ease-in-out_infinite]' : ''}`}
          ariaLabel={spinning ? t.machine.stop : t.machine.spin}
        >
          {spinning ? '■ STOP' : '▶ SPIN'}
        </MachineButton>

        <MachineButton
          onClick={onMaxBet}
          disabled={spinning}
          variant="default"
          size="md"
          className="flex-1"
        >
          Max Bet
        </MachineButton>
      </div>

      {/* Insufficient coins */}
      {player.coins < totalBet && !spinning && (
        <div
          className="text-center text-xs py-1 rounded-lg"
          style={{ color: '#ff6b6b', backgroundColor: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)' }}
        >
          {t.machine.insufficientCoins}
        </div>
      )}

      <style jsx>{`
        @keyframes spinPulse {
          0%, 100% { box-shadow: 0 4px 0 #0f7a2f, 0 6px 16px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
          50% { box-shadow: 0 4px 0 #0f7a2f, 0 6px 24px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
        }
      `}</style>
    </div>
  )
}
