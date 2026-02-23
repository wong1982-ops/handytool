'use client'

import { useRef, useCallback } from 'react'
import type { ECardData, TextAlign } from '@/tools/ecard-studio/types'
import { PATTERNS } from '@/tools/ecard-studio/patterns'
import { COLOR_PRESETS, FONT_OPTIONS } from '@/tools/ecard-studio/templates'

interface CustomizationPanelProps {
  cardData: ECardData
  onChange: (updates: Partial<ECardData>) => void
}

export function CustomizationPanel({ cardData, onChange }: CustomizationPanelProps) {
  const bgColorRef = useRef<HTMLInputElement>(null)
  const accentColorRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ logoUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const alignments: { value: TextAlign; label: string }[] = [
    { value: 'left', label: 'Align left' },
    { value: 'center', label: 'Align center' },
    { value: 'right', label: 'Align right' },
    { value: 'justify', label: 'Justify' },
  ]

  return (
    <div className="flex flex-col gap-6 p-5 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Editor
        </span>
      </div>

      {/* CONTENT Section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Content
        </h3>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-name" className="text-xs text-slate-500 uppercase tracking-wider">
            Name
          </label>
          <input
            id="content-name"
            type="text"
            value={cardData.heading}
            onChange={(e) => onChange({ heading: e.target.value })}
            placeholder="e.g. Jane Smith"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-title" className="text-xs text-slate-500 uppercase tracking-wider">
            Title
          </label>
          <input
            id="content-title"
            type="text"
            value={cardData.subheading}
            onChange={(e) => onChange({ subheading: e.target.value })}
            placeholder="e.g. Senior Product Designer"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-message" className="text-xs text-slate-500 uppercase tracking-wider">
            Message
          </label>
          <textarea
            id="content-message"
            rows={2}
            value={cardData.body}
            onChange={(e) => onChange({ body: e.target.value })}
            placeholder="e.g. Wishing you a wonderful holiday season!"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-company" className="text-xs text-slate-500 uppercase tracking-wider">
            Company
          </label>
          <input
            id="content-company"
            type="text"
            value={cardData.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="e.g. Acme Corporation"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Tagline */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content-tagline" className="text-xs text-slate-500 uppercase tracking-wider">
            Tagline
          </label>
          <input
            id="content-tagline"
            type="text"
            value={cardData.companyTagline}
            onChange={(e) => onChange({ companyTagline: e.target.value })}
            placeholder="e.g. Innovation meets excellence"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* TYPOGRAPHY Section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Typography
        </h3>

        {/* Font Family */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="font-family" className="text-xs text-slate-500 uppercase tracking-wider">
            Font Family
          </label>
          <select
            id="font-family"
            value={cardData.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size + Line Height */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="font-size" className="text-xs text-slate-500 uppercase tracking-wider">
              Font Size
            </label>
            <div className="relative">
              <input
                id="font-size"
                type="number"
                min={10}
                max={120}
                value={cardData.fontSize}
                onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                PX
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="line-height"
              className="text-xs text-slate-500 uppercase tracking-wider"
            >
              Line Height
            </label>
            <input
              id="line-height"
              type="number"
              min={0.5}
              max={3}
              step={0.1}
              value={cardData.lineHeight}
              onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Text Alignment + Bold */}
        <div className="flex items-center gap-1">
          {alignments.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={cardData.textAlign === value}
              onClick={() => onChange({ textAlign: value })}
              className={`p-2 rounded-lg transition-colors ${
                cardData.textAlign === value
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlignIcon align={value} />
            </button>
          ))}

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Bold Toggle */}
          <button
            type="button"
            aria-label="Toggle bold"
            aria-pressed={cardData.bold}
            onClick={() => onChange({ bold: !cardData.bold })}
            className={`px-2.5 py-2 rounded-lg font-bold text-sm transition-colors ${
              cardData.bold
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            B
          </button>
        </div>
      </section>

      {/* BUSINESS PALETTE Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Business Palette
          </h3>
          <svg
            className="w-4 h-4 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Color Presets */}
        <div className="flex items-center gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isActive =
              cardData.backgroundColor === preset.background &&
              cardData.accentColor === preset.accent
            return (
              <button
                key={preset.name}
                type="button"
                aria-label={`${preset.name} palette`}
                aria-pressed={isActive}
                onClick={() =>
                  onChange({ backgroundColor: preset.background, accentColor: preset.accent })
                }
                className={`w-10 h-10 rounded-full shrink-0 transition-all ${
                  isActive ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''
                }`}
                style={{ backgroundColor: preset.accent }}
              />
            )
          })}
        </div>

        {/* Background Fill */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wider">Background Fill</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={cardData.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              aria-label="Pick background color"
              onClick={() => bgColorRef.current?.click()}
              className="w-9 h-9 rounded-lg border border-slate-700 shrink-0"
              style={{ backgroundColor: cardData.backgroundColor }}
            />
            <input
              ref={bgColorRef}
              type="color"
              value={cardData.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wider">Accent Color</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={cardData.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg text-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              aria-label="Pick accent color"
              onClick={() => accentColorRef.current?.click()}
              className="w-9 h-9 rounded-lg border border-slate-700 shrink-0"
              style={{ backgroundColor: cardData.accentColor }}
            />
            <input
              ref={accentColorRef}
              type="color"
              value={cardData.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* CARD ELEMENTS Section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Card Elements
        </h3>

        {/* Background Pattern */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-500 uppercase tracking-wider">
            Background Pattern
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-label={`${p.label} pattern`}
                aria-pressed={cardData.backgroundPattern === p.id}
                onClick={() => onChange({ backgroundPattern: p.id })}
                className={`px-2 py-1.5 rounded-md text-[10px] transition-colors ${
                  cardData.backgroundPattern === p.id
                    ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Border Accents Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Border Accents</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cardData.borderAccents}
              onChange={(e) => onChange({ borderAccents: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
          </label>
        </div>

        {/* Logo Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 uppercase tracking-wider">
            Logo
          </label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="sr-only"
            aria-label="Upload logo"
          />
          {cardData.logoUrl ? (
            <div className="flex items-center gap-2">
              <img
                src={cardData.logoUrl}
                alt="Uploaded logo"
                className="w-10 h-10 rounded-md object-contain bg-slate-800 border border-slate-700"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange({ logoUrl: '' })}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 border border-dashed border-slate-600 rounded-lg text-sm text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Upload Logo
            </button>
          )}

          {/* Logo Position hint */}
          {cardData.logoUrl && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1V13M1 7H13M3 3L7 1L11 3M3 11L7 13L11 11M1 7L3 3M1 7L3 11M13 7L11 3M13 7L11 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              </svg>
              Drag the logo on the card to reposition
            </p>
          )}
        </div>
      </section>

      {/* Save as Template */}
      <button
        type="button"
        disabled
        className="mt-auto flex items-center justify-center gap-2 w-full bg-slate-800 border border-slate-700 rounded-xl py-3 text-sm text-slate-500 cursor-not-allowed transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
        Save as Template
        <span className="text-[10px] text-slate-600 ml-1">Coming soon</span>
      </button>
    </div>
  )
}

/* ---------- SVG alignment icons ---------- */

function AlignIcon({ align }: { align: TextAlign }) {
  switch (align) {
    case 'left':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h12M3 18h16" />
        </svg>
      )
    case 'center':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M4 18h16" />
        </svg>
      )
    case 'right':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 12h12M5 18h16" />
        </svg>
      )
    case 'justify':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      )
  }
}
