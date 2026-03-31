'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { SlotGameConfig } from '../../slots-types'

interface GameCardProps {
  game: SlotGameConfig
}

export function GameCard({ game }: GameCardProps) {
  const lobbyImage = game.theme.lobbyImage

  return (
    <Link
      href={`/tools/slots/${game.id}`}
      className="group block shrink-0 w-[160px] sm:w-[180px]"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#d4a052]/30 hover:border-[#d4a052]/70 transition-all hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,160,82,0.3)]">
        {lobbyImage ? (
          <Image
            src={lobbyImage}
            alt={game.name}
            fill
            className="object-cover"
            sizes="180px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: game.theme.headerGradient }}
          >
            {game.icon}
          </div>
        )}
        {/* Name overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
          <p className="text-sm font-bold text-white drop-shadow">{game.name}</p>
        </div>
      </div>
    </Link>
  )
}
