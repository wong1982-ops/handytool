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
      className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all ${
        isFun ? 'hover:scale-105' : 'hover:brightness-110'
      } ${
        isSelected
          ? 'ring-2 ring-[var(--tk-color-primary-500)] ring-offset-2 dark:ring-offset-[var(--tk-color-surface-900)]'
          : ''
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
      <span className={`text-center leading-tight ${
        isFun
          ? 'text-xs font-medium text-[var(--tk-color-text-primary)]'
          : 'text-xs text-[var(--tk-color-text-secondary)]'
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
    <div className="flex flex-col gap-6">
      {STYLE_CATEGORIES.map((category) => {
        const styles = ART_STYLES.filter((s) => s.category === category.id)
        return (
          <section key={category.id}>
            <h3
              className={`mb-3 font-semibold ${
                isFun ? 'text-lg' : 'text-sm uppercase tracking-wider text-[var(--tk-color-text-secondary)]'
              }`}
            >
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
            isFun ? 'text-sm' : 'text-xs uppercase tracking-wider text-[var(--tk-color-text-secondary)]'
          }`}
        >
          {isFun ? '✍️ Or describe your own style' : 'Custom style'}
        </label>
        <input
          id="custom-style-input"
          type="text"
          value={customStyle}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="Or describe your own style — e.g., 'underwater kingdom'"
          className={`w-full min-h-[44px] rounded-xl border px-4 py-3 text-sm transition-colors bg-[var(--tk-color-surface-50)] dark:bg-[var(--tk-color-surface-800)] text-[var(--tk-color-text-primary)] placeholder:text-[var(--tk-color-text-tertiary)] ${
            customStyle.trim()
              ? 'border-[var(--tk-color-primary-500)]'
              : 'border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)]'
          } focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]`}
        />
      </div>
    </div>
  )
}
