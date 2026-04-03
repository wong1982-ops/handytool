'use client'

import { useSlots } from '../../slots-provider'

interface GameHudProps {
  onBack: () => void
  onStore: () => void
}

export function GameHud({ onBack, onStore }: GameHudProps) {
  const { player } = useSlots()

  return (
    <div
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3.5 py-2.5"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
    >
      {/* Left: back + level */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-9 h-9 min-h-[44px] rounded-full flex items-center justify-center text-white text-[17px]"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)' }}
          aria-label="Back to lobby"
        >
          ←
        </button>
        <div
          className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.04em] text-white"
          style={{ backgroundColor: 'rgba(61,106,242,0.6)', border: '1px solid rgba(61,106,242,0.8)' }}
        >
          LV {player.level}
        </div>
      </div>

      {/* Right: coins + store */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-[5px] px-2.5 py-[5px] rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <span className="text-xs">🪙</span>
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: '#f0d080', fontFamily: '"SF Mono", monospace' }}
          >
            {player.coins.toLocaleString()}
          </span>
        </div>
        <button
          onClick={onStore}
          className="px-3 py-[5px] min-h-[32px] rounded-full text-[10px] font-extrabold tracking-[0.05em] text-white"
          style={{ backgroundColor: '#10B981' }}
        >
          STORE
        </button>
      </div>
    </div>
  )
}
