'use client'
import { useSlots } from '../../slots-provider'

export function CoinDisplay() {
  const { player } = useSlots()
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#2d1052] to-[#1a0a2e] border border-[#d4a052]/40 shadow-[0_0_10px_rgba(212,160,82,0.15)]">
      <span className="text-sm" aria-hidden="true">🪙</span>
      <span className="text-sm font-bold text-[#f0d080]">{player.coins.toLocaleString()}</span>
    </div>
  )
}
