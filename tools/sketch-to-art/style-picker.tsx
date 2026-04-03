'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ART_STYLES, STYLE_CATEGORIES } from './types'
import type { SketchMode } from './types'

const SHOWCASE_BASE = 'https://pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev/sketch-art/showcase'

function StyleCard({
  style,
  isSelected,
  isFun,
  onSelect,
}: {
  style: (typeof ART_STYLES)[number]
  isSelected: boolean
  isFun: boolean
  onSelect: (id: string) => void
}) {
  const [imgError, setImgError] = useState(false)
  const imgUrl = `${SHOWCASE_BASE}/mermaid-${style.id}.png`

  return (
    <button
      type="button"
      onClick={() => onSelect(style.id)}
      className={`group relative flex flex-col items-center gap-2 rounded-2xl p-2 transition-all duration-300 cursor-pointer hover:scale-[1.03] ${
        isSelected
          ? 'shadow-[0_0_0_3px_#3D6AF2,0_0_20px_rgba(61,106,242,0.4)] bg-[#131a23]'
          : 'hover:bg-[#131a23]/60'
      }`}
    >
      {/* Image card */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden">
        {imgError ? (
          <div className={`w-full h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center`} />
        ) : (
          <Image
            src={imgUrl}
            alt={`${style.name} style`}
            fill
            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 14vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--tk-color-primary-500)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        )}
      </div>
      {/* Label */}
      <span className={`text-center leading-tight text-xs ${
        isFun
          ? 'font-medium text-white'
          : isSelected ? 'font-medium text-white' : 'text-[#a6abb5]'
      }`}>
        {isFun ? style.funLabel : style.name}
      </span>
    </button>
  )
}

interface StylePickerProps {
  selectedStyle: string | null
  customStyle: string
  onSelectStyle: (id: string) => void
  onCustomStyleChange: (text: string) => void
  mode: SketchMode
}

export default function StylePicker({
  selectedStyle,
  customStyle,
  onSelectStyle,
  onCustomStyleChange,
  mode,
}: StylePickerProps) {
  const isFun = mode === 'fun'

  const handleSelectPreset = useCallback(
    (id: string) => {
      onSelectStyle(id)
      onCustomStyleChange('')
    },
    [onSelectStyle, onCustomStyleChange],
  )

  const handleCustomChange = useCallback(
    (text: string) => {
      onCustomStyleChange(text)
      if (text.trim()) {
        onSelectStyle('')
      }
    },
    [onCustomStyleChange, onSelectStyle],
  )

  return (
    <div className="flex flex-col gap-8">
      {STYLE_CATEGORIES.map((category) => {
        const styles = ART_STYLES.filter((s) => s.category === category.id)
        const categoryIconMap: Record<string, React.ReactNode> = {
          classic: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
            </svg>
          ),
          modern: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          ),
          fantasy: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
          ),
        }
        return (
          <section key={category.id}>
            <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-wider text-[#a6abb5]">
              {categoryIconMap[category.id]}
              {category.label}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {styles.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  isSelected={selectedStyle === style.id}
                  isFun={isFun}
                  onSelect={handleSelectPreset}
                />
              ))}
            </div>
          </section>
        )
      })}

      {/* Custom style input */}
      <div className="mt-2">
        <label
          htmlFor="custom-style-input"
          className={`mb-2 block font-medium ${
            isFun ? 'text-sm text-white' : 'text-[11px] uppercase tracking-wider text-[#a6abb5]'
          }`}
        >
          {isFun ? 'Or describe your own style' : 'Custom style'}
        </label>
        <input
          id="custom-style-input"
          type="text"
          value={customStyle}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="e.g. 'underwater kingdom', 'retro 80s poster'..."
          className={`w-full min-h-[44px] rounded-xl border px-4 py-3 text-sm transition-colors bg-[#0d1520] text-white placeholder:text-[#70767f] ${
            customStyle.trim()
              ? 'border-[#3D6AF2] shadow-[0_0_0_2px_rgba(61,106,242,0.25)]'
              : 'border-[#1e2631]'
          } focus:outline-none focus:border-[#3D6AF2] focus:shadow-[0_0_0_2px_rgba(61,106,242,0.25)]`}
        />
      </div>
    </div>
  )
}
