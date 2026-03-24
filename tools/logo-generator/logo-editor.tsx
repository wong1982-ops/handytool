'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { LogoConcept, GOOGLE_FONTS } from '@/tools/logo-generator/types'

interface LogoEditorProps {
  concept: LogoConcept
  businessName: string
  tagline: string
  onBack: () => void
  onNext: () => void
}

type LayoutMode = 'icon-above' | 'icon-left' | 'icon-right' | 'text-only' | 'icon-only'

const DEFAULT_COLORS = ['#3D6AF2', '#1e2631', '#ffffff', '#32A9D9', '#131a23']

const LAYOUT_OPTIONS: { id: LayoutMode; label: string; icon: React.ReactNode }[] = [
  {
    id: 'icon-above',
    label: 'Icon above',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <rect x="9" y="3" width="6" height="6" rx="1" />
        <rect x="4" y="12" width="16" height="3" rx="1" opacity="0.7" />
        <rect x="6" y="17" width="12" height="2" rx="1" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'icon-left',
    label: 'Icon left',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <rect x="3" y="8" width="7" height="7" rx="1" />
        <rect x="13" y="9" width="8" height="2.5" rx="1" opacity="0.7" />
        <rect x="13" y="13" width="6" height="2" rx="1" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'icon-right',
    label: 'Icon right',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <rect x="14" y="8" width="7" height="7" rx="1" />
        <rect x="3" y="9" width="8" height="2.5" rx="1" opacity="0.7" />
        <rect x="3" y="13" width="6" height="2" rx="1" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'text-only',
    label: 'Text only',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <rect x="2" y="8" width="20" height="3" rx="1" opacity="0.9" />
        <rect x="4" y="13" width="16" height="2" rx="1" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'icon-only',
    label: 'Icon only',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <rect x="7" y="7" width="10" height="10" rx="2" />
      </svg>
    ),
  },
]

export function LogoEditor({
  concept,
  businessName: initialBusinessName,
  tagline: initialTagline,
  onBack,
  onNext,
}: LogoEditorProps) {
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS)
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [fontWeight, setFontWeight] = useState(700)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [layout, setLayout] = useState<LayoutMode>('icon-above')
  const [editedBusinessName, setEditedBusinessName] = useState(initialBusinessName)
  const [editedTagline, setEditedTagline] = useState(initialTagline)
  const colorInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Load Google Fonts dynamically
  useEffect(() => {
    const allFonts = Object.values(GOOGLE_FONTS).flat()
    const fontFamilies = allFonts
      .map((f) => f.replace(/ /g, '+') + ':wght@300;400;500;600;700;800;900')
      .join('&family=')
    const href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`

    const existing = document.querySelector(`link[data-google-fonts]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.setAttribute('data-google-fonts', 'true')
    document.head.appendChild(link)

    return () => {
      // leave the link in place to avoid flicker on re-renders
    }
  }, [])

  const handleColorChange = (index: number, value: string) => {
    setColors((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const previewTextStyle: React.CSSProperties = {
    fontFamily: `'${selectedFont}', sans-serif`,
    fontWeight,
    letterSpacing: `${letterSpacing}px`,
    color: colors[0],
  }

  const showIcon = layout !== 'text-only'
  const showText = layout !== 'icon-only'
  const isHorizontal = layout === 'icon-left' || layout === 'icon-right'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Preview */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px]">
            <div
              className={`flex items-center gap-4 ${
                isHorizontal
                  ? layout === 'icon-right'
                    ? 'flex-row-reverse'
                    : 'flex-row'
                  : 'flex-col'
              }`}
            >
              {showIcon && (
                <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
                  <Image
                    src={concept.imageUrl}
                    alt={`Logo concept: ${concept.variation}`}
                    fill
                    className="object-contain"
                    sizes="160px"
                  />
                </div>
              )}
              {showText && (
                <div
                  className={`flex flex-col ${isHorizontal ? 'items-start' : 'items-center'} gap-1`}
                >
                  <span
                    className="text-3xl leading-tight"
                    style={previewTextStyle}
                  >
                    {editedBusinessName || 'Business Name'}
                  </span>
                  {editedTagline && (
                    <span
                      className="text-sm"
                      style={{
                        ...previewTextStyle,
                        fontWeight: Math.max(300, fontWeight - 200),
                        color: colors[3] || colors[0],
                        fontSize: '0.875rem',
                      }}
                    >
                      {editedTagline}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-4 overflow-y-auto max-h-[600px] lg:max-h-none">
          <div className="bg-[#131a23] rounded-2xl p-5 space-y-6">

            {/* Colors */}
            <section>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Logo Colors
              </h3>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color, i) => (
                  <div key={i} className="relative">
                    <button
                      type="button"
                      aria-label={`Color ${i + 1}: ${color}`}
                      onClick={() => colorInputRefs.current[i]?.click()}
                      className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
                      style={{ backgroundColor: color }}
                    />
                    <input
                      ref={(el) => { colorInputRefs.current[i] = el }}
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(i, e.target.value)}
                      className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Typography */}
            <section>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Font
              </h3>
              <div className="space-y-3">
                {Object.entries(GOOGLE_FONTS).map(([category, fonts]) => (
                  <div key={category}>
                    <p className="text-xs text-white/40 mb-1.5 capitalize">{category}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {fonts.map((font) => (
                        <button
                          key={font}
                          type="button"
                          onClick={() => setSelectedFont(font)}
                          className={`px-2 py-1.5 rounded-lg text-sm text-left truncate transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] ${
                            selectedFont === font
                              ? 'bg-[#3D6AF2] text-white'
                              : 'bg-[#1e2631] text-white/70 hover:bg-[#253040] hover:text-white'
                          }`}
                          style={{ fontFamily: `'${font}', sans-serif` }}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Font Weight */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-white/60">Font Weight</label>
                  <span className="text-xs text-white/60">{fontWeight}</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={900}
                  step={100}
                  value={fontWeight}
                  onChange={(e) => setFontWeight(Number(e.target.value))}
                  className="w-full accent-[#3D6AF2]"
                  aria-label="Font weight"
                />
              </div>

              {/* Letter Spacing */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-white/60">Letter Spacing</label>
                  <span className="text-xs text-white/60">{letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min={-2}
                  max={5}
                  step={0.5}
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-[#3D6AF2]"
                  aria-label="Letter spacing"
                />
              </div>
            </section>

            {/* Layout */}
            <section>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Layout
              </h3>
              <div className="flex gap-2">
                {LAYOUT_OPTIONS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    title={label}
                    onClick={() => setLayout(id)}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] ${
                      layout === id
                        ? 'bg-[#3D6AF2] text-white'
                        : 'bg-[#1e2631] text-white/60 hover:bg-[#253040] hover:text-white'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </section>

            {/* Text */}
            <section>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                Text
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1.5">Business Name</label>
                  <input
                    type="text"
                    value={editedBusinessName}
                    onChange={(e) => setEditedBusinessName(e.target.value)}
                    placeholder="Your business name"
                    className="w-full bg-[#1e2631] text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-[#3D6AF2] focus:outline-none focus:ring-1 focus:ring-[#3D6AF2] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1.5">Tagline</label>
                  <input
                    type="text"
                    value={editedTagline}
                    onChange={(e) => setEditedTagline(e.target.value)}
                    placeholder="Your tagline (optional)"
                    className="w-full bg-[#1e2631] text-white placeholder-white/30 rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-[#3D6AF2] focus:outline-none focus:ring-1 focus:ring-[#3D6AF2] transition-colors"
                  />
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2631] text-white/70 hover:text-white hover:bg-[#253040] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3D6AF2] text-white hover:bg-[#3D79F2] active:bg-[#3D5FE0] transition-colors text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Download
        </button>
      </div>
    </div>
  )
}
