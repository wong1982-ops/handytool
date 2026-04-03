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
      <div className="flex flex-col md:flex-row gap-10 py-6 border-t border-b border-[#1e2631]">
        <p className="text-sm text-[#70767f]">No palette generated</p>
      </div>
    )
  }

  const paletteData = palette ? (palette.data as PaletteData) : null

  return (
    <div className="flex flex-col md:flex-row gap-10 py-6 border-t border-b border-[#1e2631]">
      {/* Color palette swatches */}
      {paletteData ? (
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#70767f]">Palette</p>
          <div className="flex gap-3.5 flex-wrap">
            {paletteData.colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Select color ${color}`}
                onClick={() => onSelect(palette!.id)}
                className={[
                  'flex flex-col items-center gap-1.5 group',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] rounded-lg',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-12 h-12 rounded-[10px] block transition-transform cursor-pointer',
                    'hover:scale-[1.06]',
                    selectedId === palette!.id ? 'ring-2 ring-[#3D6AF2] ring-offset-2 ring-offset-[#090f16]' : '',
                  ].join(' ')}
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-[#70767f] font-mono">{color.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#70767f]">No palette generated</p>
      )}

      {/* Font cards */}
      {fonts.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#70767f]">Typography</p>
          <div className="flex gap-3 flex-wrap">
            {fonts.map((fontEl) => {
              const fontData = fontEl.data as FontData
              return (
                <button
                  key={fontEl.id}
                  type="button"
                  aria-label={`Select font ${fontData.fontFamily}`}
                  onClick={() => onSelect(fontEl.id)}
                  className={[
                    'rounded-[10px] bg-[#131a23] border p-3.5 min-w-[140px]',
                    'text-left cursor-pointer transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]',
                    selectedId === fontEl.id
                      ? 'border-[#3D6AF2] shadow-[0_0_0_2px_rgba(61,106,242,0.3)]'
                      : 'border-[#1e2631] hover:border-[rgba(61,106,242,0.5)]',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-white leading-tight mb-1">
                    {fontData.fontFamily}
                  </p>
                  <p
                    className="text-[13px] text-[#a6abb5] leading-snug mb-1.5"
                    style={{ fontFamily: fontData.fontFamily }}
                  >
                    {fontData.sampleText}
                  </p>
                  <span className="text-[11px] text-[#70767f] block capitalize">
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
