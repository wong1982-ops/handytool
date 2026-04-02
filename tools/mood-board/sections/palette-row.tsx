'use client'
import type { BoardElement, PaletteData, FontData } from '../types'

interface PaletteRowProps {
  palette: BoardElement | null
  fonts: BoardElement[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRemove: (id: string) => void
}

export function PaletteRow({ palette, fonts, selectedId, onSelect, onRemove }: PaletteRowProps) {
  const hasContent = palette !== null || fonts.length > 0

  if (!hasContent) {
    return (
      <div className="flex flex-col md:flex-row gap-6 py-6 border-t border-b border-[#1e2631]">
        <p className="text-sm text-[#70767f]">No palette generated</p>
      </div>
    )
  }

  const paletteData = palette ? (palette.data as PaletteData) : null

  return (
    <div className="flex flex-col md:flex-row gap-6 py-6 border-t border-b border-[#1e2631]">
      {/* Color palette swatches */}
      {paletteData ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-[#a6abb5] uppercase tracking-wider">Palette</p>
          <div className="flex gap-3 flex-wrap">
            {paletteData.colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Select color ${color}`}
                onClick={() => onSelect(palette!.id)}
                className={[
                  'flex flex-col items-center gap-1 group',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] rounded-lg',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-12 h-12 rounded-lg block transition-all',
                    'hover:scale-105',
                    selectedId === palette!.id ? 'ring-2 ring-[#3D6AF2] ring-offset-2 ring-offset-[#090f16]' : '',
                  ].join(' ')}
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-[#70767f] font-mono">{color.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#70767f]">No palette generated</p>
      )}

      {/* Font cards */}
      {fonts.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-[#a6abb5] uppercase tracking-wider">Typography</p>
          <div className="flex gap-4 flex-wrap">
            {fonts.map((fontEl) => {
              const fontData = fontEl.data as FontData
              return (
                <button
                  key={fontEl.id}
                  type="button"
                  aria-label={`Select font ${fontData.fontFamily}`}
                  onClick={() => onSelect(fontEl.id)}
                  className={[
                    'rounded-xl bg-[#131a23] border border-[#1e2631] p-4',
                    'text-left cursor-pointer transition-all',
                    'hover:border-[#3D6AF2]/50',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]',
                    selectedId === fontEl.id ? 'ring-2 ring-[#3D6AF2]' : '',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-white leading-tight">
                    {fontData.fontFamily}
                  </p>
                  <p
                    className="text-sm text-[#a6abb5] mt-1 leading-snug"
                    style={{ fontFamily: fontData.fontFamily }}
                  >
                    {fontData.sampleText}
                  </p>
                  <span className="text-xs text-[#70767f] mt-2 block capitalize">
                    {fontData.category}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
