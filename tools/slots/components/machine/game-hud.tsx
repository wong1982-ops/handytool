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
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
    >
      {/* Left: back + level */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          aria-label="Back to lobby"
        >
          ←
        </button>
        <div
          className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: 'rgba(100,100,255,0.5)' }}
        >
          LV {player.level}
        </div>
      </div>

      {/* Right: coins + store */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <span className="text-xs">🪙</span>
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: '#ffd700', fontFamily: '"SF Mono", monospace' }}
          >
            {player.coins.toLocaleString()}
          </span>
        </div>
        <button
          onClick={onStore}
          className="px-3 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: '#22c55e' }}
        >
          STORE
        </button>
      </div>
    </div>
  )
}
