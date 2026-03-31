'use client'

interface SymbolCellProps {
  icon: string       // emoji
  highlighted: boolean
  isWild?: boolean
  isScatter?: boolean
}

export function SymbolCell({ icon, highlighted, isWild, isScatter }: SymbolCellProps) {
  return (
    <div
      className={`w-full aspect-square flex items-center justify-center text-3xl sm:text-4xl transition-all duration-300 rounded-lg
        ${highlighted ? 'bg-yellow-400/30 ring-2 ring-yellow-400 scale-110' : 'bg-white/5'}
        ${isWild ? 'ring-1 ring-amber-400/50' : ''}
        ${isScatter ? 'ring-1 ring-purple-400/50' : ''}
      `}
      role="img"
      aria-label={icon}
    >
      {icon}
    </div>
  )
}
