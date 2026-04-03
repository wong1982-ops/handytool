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
      className="flex-1 rounded-lg overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, #050208, #0a0515, #050208)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
      }}
    >
      {/* LCD scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
        }}
      />
      <div className="relative px-1 py-[5px] text-center">
        <div className="text-[7px] uppercase tracking-[0.15em] font-semibold mb-px" style={{ color: 'rgba(212,160,82,0.5)' }}>
          {label}
        </div>
        <div
          className={`text-[11px] font-bold tabular-nums ${pulse ? 'animate-pulse' : ''}`}
          style={{
            color: pulse ? '#fbbf24' : '#f0d080',
            fontFamily: '"SF Mono", "Consolas", monospace',
            textShadow: `0 0 6px ${pulse ? 'rgba(251,191,36,0.5)' : 'rgba(240,208,128,0.35)'}`,
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
    <div className="px-3 pb-3 space-y-2.5" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.6))' }}>
      {/* LCD Panels */}
      <div className="grid grid-cols-2 gap-[2px] rounded-[10px] p-[2px]" style={{ background: 'linear-gradient(180deg, #d4a052, #a07030)' }}>
        <LcdPanel label="Total Bet" value={totalBet} />
        <LcdPanel label="Total Win" value={totalWin} pulse={totalWin > 0} />
      </div>

      {/* Spin row: −, SPIN, + */}
      <div className="flex items-center justify-center gap-4">
        {/* Decrease bet */}
        <button
          onClick={onDecreaseBet}
          disabled={!canDecrease || spinning}
          className="w-12 h-12 min-h-[44px] rounded-full flex items-center justify-center text-white text-lg font-bold transition-all active:translate-y-[2px] disabled:opacity-30"
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
          className={`px-10 py-3.5 min-h-[52px] rounded-2xl text-white text-[15px] font-black uppercase tracking-[0.08em] transition-all active:translate-y-[2px] disabled:opacity-30 disabled:cursor-not-allowed ${
            !spinning && canSpin ? 'animate-[spinPulse_2s_ease-in-out_infinite]' : ''
          }`}
          style={{
            background: 'linear-gradient(180deg, #34d058, #22c55e, #16a34a)',
            boxShadow: canSpin
              ? '0 4px 0 #0f7a2f, 0 6px 16px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              : '0 4px 0 #0f7a2f',
            minWidth: 140,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          aria-label={spinning ? 'Stop' : 'Spin'}
        >
          {spinning ? '■ STOP' : '▶ SPIN'}
        </button>

        {/* Increase bet */}
        <button
          onClick={onIncreaseBet}
          disabled={!canIncrease || spinning}
          className="w-12 h-12 min-h-[44px] rounded-full flex items-center justify-center text-white text-lg font-bold transition-all active:translate-y-[2px] disabled:opacity-30"
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
          className="w-7 h-7 min-h-[44px] rounded-full flex items-center justify-center text-[#a6abb5] text-xs font-bold"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          aria-label="Paytable"
        >
          i
        </button>
        <button
          onClick={onMaxBet}
          disabled={spinning}
          className="px-4 py-1.5 min-h-[44px] rounded-lg text-[11px] font-bold uppercase tracking-[0.06em] text-[#0d0519] transition-all active:translate-y-[1px] disabled:opacity-30"
          style={{
            background: 'linear-gradient(180deg, #e8b230, #d4a052, #a07030)',
            boxShadow: '0 3px 0 #705020',
            border: '1px solid rgba(255,255,255,0.1)',
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
