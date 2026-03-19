'use client'

import { useState } from 'react'

interface AITabProps {
  onApply: (colors: string[]) => void
}

const PRESET_PALETTES: Record<string, string[]> = {
  Sunrise: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'],
  Ocean: ['#05668D', '#028090', '#00A896', '#02C39A', '#F0F3BD'],
  Forest: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#D8F3DC'],
  Neon: ['#FF006E', '#8338EC', '#3A86FF', '#FB5607', '#FFBE0B'],
  Pastel: ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4', '#FEC89A'],
  Corporate: ['#1B4965', '#5FA8D3', '#BEE9E8', '#62B6CB', '#CAE9FF'],
  Vintage: ['#CB997E', '#DDBEA9', '#FFE8D6', '#B7B7A4', '#A5A58D'],
  Candy: ['#FF99C8', '#FCF6BD', '#D0F4DE', '#A9DEF9', '#E4C1F9'],
}

const PRESET_NAMES = Object.keys(PRESET_PALETTES)

export function AITab({ onApply }: AITabProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [generatedColors, setGeneratedColors] = useState<string[]>([])

  function handlePresetClick(name: string) {
    setSelectedPreset(name)
    setGeneratedColors(PRESET_PALETTES[name])
  }

  function handleApply() {
    if (generatedColors.length > 0) {
      onApply(generatedColors)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Prompt textarea */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="ai-prompt"
          className="text-sm font-medium text-[var(--tk-color-text)]"
        >
          Describe your palette
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your brand mood — e.g., 'warm sunset, luxury feel'"
          rows={3}
          className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-bg)] text-[var(--tk-color-text)] placeholder:text-[var(--tk-color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] resize-none"
        />
      </div>

      {/* Generate button */}
      <button
        type="button"
        disabled
        className="w-full py-3 min-h-[44px] rounded-xl bg-[var(--tk-color-primary-500)] text-white font-semibold text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        Generate with AI
        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">
          1 credit
        </span>
      </button>

      {/* Coming soon notice */}
      <div className="flex items-center justify-center gap-2 py-4 rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-hover)]">
        <svg
          className="w-5 h-5 text-[var(--tk-color-text-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        <span className="text-sm text-[var(--tk-color-text-muted)]">
          AI palette generation coming soon
        </span>
      </div>

      {/* Quick preset pills */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[var(--tk-color-text)]">
          Quick Presets
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handlePresetClick(name)}
              className={`px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors cursor-pointer ${
                selectedPreset === name
                  ? 'bg-[var(--tk-color-primary-500)] text-white'
                  : 'bg-[var(--tk-color-hover)] text-[var(--tk-color-text)] hover:bg-[var(--tk-color-border)]'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Generated / preset colors */}
      {generatedColors.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-1.5 rounded-xl overflow-hidden h-14 border border-[var(--tk-color-border)]">
            {generatedColors.map((hex, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 min-h-[44px] rounded-xl bg-[var(--tk-color-primary-500)] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Apply to Palette
          </button>
        </div>
      )}
    </div>
  )
}
