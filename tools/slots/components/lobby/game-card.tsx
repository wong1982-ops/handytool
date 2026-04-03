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
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#3D6AF2]/35 hover:border-[#3D6AF2]/85 transition-all hover:scale-[1.03] hover:shadow-[0_0_16px_rgba(61,106,242,0.35)]">
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
            className="w-full h-full flex items-center justify-center text-[52px]"
            style={{ background: game.theme.headerGradient }}
          >
            {game.icon}
          </div>
        )}
        {/* Name overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2.5 pb-3 pt-8">
          <p className="text-[13px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{game.name}</p>
        </div>
      </div>
    </Link>
  )
}
