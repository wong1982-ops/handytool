'use client'
import Image from 'next/image'

interface SymbolCellProps {
  icon: string
  imagePath?: string
  highlighted: boolean
  accentColor?: string
}

export function SymbolCell({ icon, imagePath, highlighted, accentColor = '#d4a052' }: SymbolCellProps) {
  return (
    <div
      className={`w-full aspect-square relative overflow-hidden transition-all duration-300
        ${highlighted ? 'scale-105' : ''}
      `}
      style={highlighted ? {
        boxShadow: `0 0 12px ${accentColor}`,
        border: `1px solid ${accentColor}`,
      } : undefined}
      role="img"
      aria-label={icon}
    >
      {imagePath ? (
        <Image
          src={imagePath}
          alt={icon}
          fill
          className="object-cover"
          sizes="80px"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl">{icon}</span>
      )}
    </div>
  )
}
