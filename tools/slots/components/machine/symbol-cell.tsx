'use client'
import Image from 'next/image'

interface SymbolCellProps {
  icon: string
  imagePath?: string
  highlighted: boolean
  isWild?: boolean
  isScatter?: boolean
}

export function SymbolCell({ icon, imagePath, highlighted, isWild, isScatter }: SymbolCellProps) {
  return (
    <div
      className={`w-full aspect-square flex items-center justify-center rounded-lg transition-all duration-300 relative overflow-hidden
        ${highlighted ? 'ring-2 ring-[#f0d080] shadow-[0_0_15px_rgba(212,160,82,0.6)] scale-105' : ''}
        ${isWild ? 'ring-1 ring-[#d4a052]/40' : ''}
        ${isScatter ? 'ring-1 ring-purple-400/40' : ''}
      `}
      style={{ backgroundColor: '#1a0a2e', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
      role="img"
      aria-label={icon}
    >
      {imagePath ? (
        <Image
          src={imagePath}
          alt={icon}
          fill
          className="object-contain p-1"
          sizes="80px"
        />
      ) : (
        <span className="text-3xl sm:text-4xl">{icon}</span>
      )}
    </div>
  )
}
