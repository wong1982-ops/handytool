'use client'

import type { ReactNode } from 'react'

interface GameCardProps {
  bgColor: string
  children: ReactNode
  badge?: string
}

export function GameCard({ bgColor, children, badge }: GameCardProps) {
  return (
    <div
      className="relative rounded-xl min-h-[350px] md:min-h-[400px] flex items-center justify-center overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {badge && (
        <span className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
          {badge}
        </span>
      )}
      {children}
    </div>
  )
}
