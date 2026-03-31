'use client'
import { useSlots } from '../../slots-provider'

export function CoinDisplay() {
  const { player } = useSlots()
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-900/30 border border-yellow-700/50">
      <span className="text-sm" aria-hidden="true">🪙</span>
      <span className="text-sm font-bold text-yellow-300">{player.coins.toLocaleString()}</span>
    </div>
  )
}
