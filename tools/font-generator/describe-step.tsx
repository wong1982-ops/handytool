'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FontStyle, FONT_STYLES, FONT_COLOR_PALETTES } from '@/tools/font-generator/types'
import { getSavedPalettes } from '@/tools/color-palette/palette-storage'

interface DescribeStepProps {
  stylePreset: FontStyle | null
  customPrompt: string
  colors: string[]
  colorMode: 'custom' | 'ai-suggested'
  referenceImageBase64: string | null
  onStyleChange: (s: FontStyle) => void
  onCustomPromptChange: (v: string) => void
  onColorsChange: (c: string[]) => void
  onColorModeChange: (m: 'custom' | 'ai-suggested') => void
  onReferenceChange: (base64: string | null) => void
  onNext: () => void
}

export function DescribeStep({
  stylePreset,
  customPrompt,
  colors,
  colorMode,
  referenceImageBase64,
  onStyleChange,
  onCustomPromptChange,
  onColorsChange,
  onColorModeChange,
  onReferenceChange,
  onNext,
}: DescribeStepProps) {
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [savedPalettes, setSavedPalettes] = useState<{ name: string; colors: string[] }[]>([])
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    const palettes = getSavedPalettes()
    setSavedPalettes(palettes.filter((p) => p.colors.length >= 3 && p.colors.length <= 5))
  }, [])

  const isNextEnabled = stylePreset !== null

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
      : FONT_COLOR_PALETTES.find(
          (p) =>
            p.colors.length === colors.length &&
            p.colors.every((c, i) => c.toLowerCase() === (colors[i] ?? '').toLowerCase())
        ) ?? null

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 10 * 1024 * 1024) return // 10MB max
      const reader = new FileReader()
      reader.onload = () => {
        onReferenceChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [onReferenceChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div className="space-y-6">
      {/* Font Style */}
      <div>
        <p className="text-sm font-medium text-[#a6abb5] mb-3">Font Style</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FONT_STYLES.map((s) => {
            const isSelected = stylePreset === s.id
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

      {/* Creative Direction */}
      <div>
        <p className="text-sm font-medium text-[#a6abb5] mb-3">
          Creative Direction <span className="text-[#70767f] font-normal">(optional)</span>
        </p>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder='Describe your vision... e.g. "Include swirls, made of chocolate, fantasy RPG look"'
          rows={3}
          maxLength={500}
          className="w-full rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-sm px-4 py-3 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none resize-none transition-colors"
        />
        <p className="text-[10px] text-[#4a5060] mt-1 text-right">{customPrompt.length}/500</p>
      </div>

      {/* Color Palette */}
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
            {FONT_COLOR_PALETTES.map((palette) => {
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

            {/* Saved palettes from Color Palette tool */}
            {savedPalettes.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-[#70767f] mb-2">From your Color Palette tool:</p>
                {savedPalettes.map((palette) => {
                  const paletteColors = palette.colors.slice(0, 5)
                  const isSelected =
                    paletteColors.length === colors.length &&
                    paletteColors.every(
                      (c, i) => c.toLowerCase() === (colors[i] ?? '').toLowerCase()
                    )
                  return (
                    <button
                      key={palette.name + paletteColors.join()}
                      type="button"
                      onClick={() => handlePaletteSelect(paletteColors)}
                      className={[
                        'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all mb-1.5',
                        isSelected
                          ? 'shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)] bg-[#131a23]'
                          : 'bg-[#131a23] hover:bg-[#1e2631]',
                      ].join(' ')}
                    >
                      <span className="text-xs font-medium text-[#a6abb5] w-20 text-left shrink-0 truncate">
                        {palette.name}
                      </span>
                      <div className="flex gap-1.5">
                        {paletteColors.map((color, i) => (
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
              </div>
            )}

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

      {/* Reference Image */}
      <div>
        <p className="text-sm font-medium text-[#a6abb5] mb-3">
          Reference Image <span className="text-[#70767f] font-normal">(optional)</span>
        </p>

        {referenceImageBase64 ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={referenceImageBase64}
              alt="Reference upload"
              className="max-h-40 rounded-xl border border-[#1e2631] object-contain"
            />
            <button
              type="button"
              onClick={() => onReferenceChange(null)}
              aria-label="Remove reference image"
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={[
              'w-full rounded-xl border-2 border-dashed px-4 py-8 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer',
              dragOver
                ? 'border-[#3D6AF2] bg-[#3D6AF2]/10'
                : 'border-[#1e2631] bg-[#131a23] hover:border-[#3D6AF2]/50',
            ].join(' ')}
          >
            <svg
              className="w-8 h-8 text-[#70767f]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-[#70767f]">Drop an image or click to upload</p>
            <p className="text-[10px] text-[#4a5060]">Max 10 MB</p>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Next button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onNext}
          disabled={!isNextEnabled}
          className="w-full bg-gradient-to-r from-[#3D6AF2] to-[#7C3AED] text-white font-semibold rounded-xl min-h-[44px] cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}
