'use client'

interface SpinControlsProps {
  totalBet: number
  totalWin: number
  onSpin: () => void
  onIncreaseBet: () => void
  onDecreaseBet: () => void
  onMaxBet: () => void
  onOpenPaytable: () => void
  spinning: boolean
  canSpin: boolean
  canDecrease: boolean
  canIncrease: boolean
}

/** Metallic LCD panel */
function LcdPanel({ label, value, pulse }: { label: string; value: number; pulse?: boolean }) {
  return (
    <div
      className="flex-1 rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #d4a052, #a07030)',
        padding: '2px',
      }}
    >
      <div
        className="rounded-[6px] px-3 py-1.5 text-center"
        style={{
          background: 'linear-gradient(180deg, #050208, #0a0515, #050208)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        <div className="text-[8px] uppercase tracking-[0.15em] font-medium" style={{ color: 'rgba(212,160,82,0.5)' }}>
          {label}
        </div>
        <div
          className={`text-sm font-bold tabular-nums ${pulse ? 'animate-pulse' : ''}`}
          style={{
            color: pulse ? '#fbbf24' : '#f0d080',
            fontFamily: '"SF Mono", "Consolas", monospace',
            textShadow: `0 0 6px ${pulse ? 'rgba(251,191,36,0.6)' : 'rgba(240,208,128,0.3)'}`,
          }}
        >
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export function SpinControls({
  totalBet, totalWin, onSpin, onIncreaseBet, onDecreaseBet, onMaxBet, onOpenPaytable,
  spinning, canSpin, canDecrease, canIncrease,
}: SpinControlsProps) {
  return (
    <div className="px-3 pb-4 space-y-3" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.5))' }}>
      {/* LCD Panels */}
      <div className="flex gap-2">
        <LcdPanel label="Total Bet" value={totalBet} />
        <LcdPanel label="Total Win" value={totalWin} pulse={totalWin > 0} />
      </div>

      {/* Spin row: −, SPIN, + */}
      <div className="flex items-center justify-center gap-4">
        {/* Decrease bet */}
        <button
          onClick={onDecreaseBet}
          disabled={!canDecrease || spinning}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all active:translate-y-[2px] disabled:opacity-30"
          style={{
            background: 'linear-gradient(180deg, #2563eb, #1d4ed8)',
            boxShadow: '0 3px 0 #1e3a8a, 0 4px 8px rgba(0,0,0,0.4)',
          }}
          aria-label="Decrease bet"
        >
          −
        </button>

        {/* SPIN */}
        <button
          onClick={onSpin}
          disabled={!canSpin}
          className={`px-10 py-3.5 rounded-full text-white text-lg font-black uppercase tracking-wider transition-all active:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed ${
            !spinning && canSpin ? 'animate-[spinPulse_2s_ease-in-out_infinite]' : ''
          }`}
          style={{
            background: 'linear-gradient(180deg, #34d058, #22c55e, #16a34a)',
            boxShadow: canSpin
              ? '0 4px 0 #0a6a2a, 0 6px 16px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              : '0 4px 0 #0a6a2a',
            minWidth: 140,
          }}
          aria-label={spinning ? 'Stop' : 'Spin'}
        >
          {spinning ? '■ STOP' : '▶ SPIN'}
        </button>

        {/* Increase bet */}
        <button
          onClick={onIncreaseBet}
          disabled={!canIncrease || spinning}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all active:translate-y-[2px] disabled:opacity-30"
          style={{
            background: 'linear-gradient(180deg, #2563eb, #1d4ed8)',
            boxShadow: '0 3px 0 #1e3a8a, 0 4px 8px rgba(0,0,0,0.4)',
          }}
          aria-label="Increase bet"
        >
          +
        </button>
      </div>

      {/* Bottom row: info + max bet */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={onOpenPaytable}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 text-xs font-bold"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          aria-label="Paytable"
        >
          i
        </button>
        <button
          onClick={onMaxBet}
          disabled={spinning}
          className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-black transition-all active:translate-y-[1px] disabled:opacity-30"
          style={{
            background: 'linear-gradient(180deg, #f0d080, #d4a052)',
            boxShadow: '0 2px 0 #a07030',
          }}
        >
          Max Bet
        </button>
      </div>

      <style jsx>{`
        @keyframes spinPulse {
          0%, 100% { box-shadow: 0 4px 0 #0a6a2a, 0 6px 16px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
          50% { box-shadow: 0 4px 0 #0a6a2a, 0 6px 24px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
        }
      `}</style>
    </div>
  )
}
