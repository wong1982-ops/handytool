'use client'
import { useSlots } from '../../slots-provider'

export function CoinDisplay() {
  const { player } = useSlots()
  return (
    <div className="flex items-center gap-1.5 px-3 py-[5px] rounded-full bg-[#3D6AF2]/10 border border-[#3D6AF2]/30">
      <span className="text-sm" aria-hidden="true">🪙</span>
      <span className="text-[13px] font-bold text-[#f0d080]" style={{ fontFamily: '"SF Mono", monospace' }}>{player.coins.toLocaleString()}</span>
    </div>
  )
}
