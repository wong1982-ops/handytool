'use client'
import Link from 'next/link'
import type { SlotGameConfig } from '../../slots-types'

interface GameCardProps {
  game: SlotGameConfig
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/tools/slots/${game.id}`}
      className="group block rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all hover:scale-[1.02] hover:shadow-lg"
    >
      <div
        className="aspect-[4/3] flex items-center justify-center text-5xl"
        style={{ background: game.theme.headerGradient }}
      >
        <span className="group-hover:scale-110 transition-transform">{game.icon}</span>
      </div>
      <div className="px-3 py-2 bg-gray-800">
        <div className="text-sm font-medium text-white truncate">{game.name}</div>
        <div className="text-xs text-gray-400 truncate">{game.description}</div>
      </div>
    </Link>
  )
}
