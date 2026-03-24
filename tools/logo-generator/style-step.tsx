'use client'

import { useRef } from 'react'
import { LogoStyle, LOGO_STYLES, COLOR_PALETTES } from './types'

interface StyleStepProps {
  style: LogoStyle | null
  colors: string[]
  colorMode: 'custom' | 'ai-suggested'
  onStyleChange: (s: LogoStyle) => void
  onColorsChange: (c: string[]) => void
  onColorModeChange: (m: 'custom' | 'ai-suggested') => void
  onNext: () => void
  onBack: () => void
}

export function StyleStep({
  style,
  colors,
  colorMode,
  onStyleChange,
  onColorsChange,
  onColorModeChange,
  onNext,
  onBack,
}: StyleStepProps) {
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isNextEnabled = style !== null

  function handleCustomColorChange(index: number, value: string) {
    const updated = [...colors]
    updated[index] = value
    onColorsChange(updated)
  }

  function handlePaletteSelect(paletteColors: string[]) {
    onColorsChange(paletteColors)
  }

  const selectedPalette =
    colorMode === 'ai-suggested'
      ? null
      : COLOR_PALETTES.find(
          (p) =>
            p.colors.length === colors.length &&
            p.colors.every((c, i) => c.toLowerCase() === (colors[i] ?? '').toLowerCase())
        ) ?? null

  return (
    <div className="space-y-6">
      {/* Style Cards */}
      <div>
        <p className="text-sm font-medium text-[#a6abb5] mb-3">Logo Style</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LOGO_STYLES.map((s) => {
            const isSelected = style === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onStyleChange(s.id)}
                className={[
                  'relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.03] text-left',
                  isSelected
                    ? 'shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)]'
                    : '',
                ].join(' ')}
              >
                {/* Gradient background */}
                <div className={`bg-gradient-to-br ${s.gradient} h-16 w-full`} />
                {/* Card info */}
                <div className="bg-[#131a23] px-3 py-2">
                  <p className="text-white text-sm font-semibold leading-tight">{s.name}</p>
                  <p className="text-[#70767f] text-xs mt-0.5 leading-snug line-clamp-2">
                    {s.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Color Section */}
      <div>
        <p className="text-sm font-medium text-[#a6abb5] mb-3">Color Palette</p>

        {/* Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => onColorModeChange('ai-suggested')}
            className={[
              'flex-1 rounded-xl min-h-[44px] text-sm font-medium transition-all',
              colorMode === 'ai-suggested'
                ? 'bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white'
                : 'bg-[#131a23] text-[#a6abb5] hover:text-white',
            ].join(' ')}
          >
            Let AI decide
          </button>
          <button
            type="button"
            onClick={() => onColorModeChange('custom')}
            className={[
              'flex-1 rounded-xl min-h-[44px] text-sm font-medium transition-all',
              colorMode === 'custom'
                ? 'bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white'
                : 'bg-[#131a23] text-[#a6abb5] hover:text-white',
            ].join(' ')}
          >
            Choose palette
          </button>
        </div>

        {/* Palette picker (when "Choose palette") */}
        {colorMode === 'custom' && (
          <div className="space-y-2">
            {COLOR_PALETTES.map((palette) => {
              const isSelected = selectedPalette?.name === palette.name
              return (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => handlePaletteSelect(palette.colors)}
                  className={[
                    'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all',
                    isSelected
                      ? 'shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)] bg-[#131a23]'
                      : 'bg-[#131a23] hover:bg-[#1e2631]',
                  ].join(' ')}
                >
                  <span className="text-xs font-medium text-[#a6abb5] w-20 text-left shrink-0">
                    {palette.name}
                  </span>
                  <div className="flex gap-1.5">
                    {palette.colors.map((color, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded-md shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}

            {/* Custom color pickers */}
            <div className="mt-3">
              <p className="text-xs text-[#70767f] mb-2">Or pick custom colors:</p>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const currentColor = colors[i] ?? '#3D6AF2'
                  return (
                    <div key={i} className="relative">
                      <button
                        type="button"
                        aria-label={`Pick color ${i + 1}`}
                        onClick={() => colorInputRefs.current[i]?.click()}
                        className="w-10 h-10 rounded-lg border-2 border-[#1e2631] hover:border-[#3D6AF2] transition-colors cursor-pointer"
                        style={{ backgroundColor: currentColor }}
                      />
                      <input
                        ref={(el) => {
                          colorInputRefs.current[i] = el
                        }}
                        type="color"
                        value={currentColor}
                        onChange={(e) => handleCustomColorChange(i, e.target.value)}
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-2 border border-[#3D6AF2] text-[#3D6AF2] rounded-xl min-h-[44px] font-semibold hover:bg-[#3D6AF2]/10 transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isNextEnabled}
          className="flex-1 bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
