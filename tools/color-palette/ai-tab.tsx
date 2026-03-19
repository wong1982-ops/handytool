'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

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

interface AIPalette {
  name: string
  colors: string[]
}

export function AITab({ onApply }: AITabProps) {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [generatedColors, setGeneratedColors] = useState<string[]>([])
  const [aiResults, setAiResults] = useState<AIPalette[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePresetClick(name: string) {
    setSelectedPreset(name)
    setGeneratedColors(PRESET_PALETTES[name])
    setAiResults([])
    setError(null)
  }

  async function handleGenerate() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    setAiResults([])
    setGeneratedColors([])
    setSelectedPreset(null)

    try {
      const res = await fetch('/api/v1/palette/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.code === 'INSUFFICIENT_CREDITS') {
          setError('Not enough credits. Top up to use AI generation.')
        } else if (json.code === 'UNAUTHORIZED') {
          setError('Please sign in to use AI generation.')
        } else {
          setError(json.error || 'Failed to generate palette.')
        }
        return
      }

      const palettes = json.data?.palettes as AIPalette[]
      if (palettes?.length > 0) {
        setAiResults(palettes)
        setGeneratedColors(palettes[0].colors)
      } else {
        setError('AI returned no palettes. Try a different description.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectAiPalette(palette: AIPalette) {
    setGeneratedColors(palette.colors)
    setSelectedPreset(null)
  }

  function handleApply() {
    if (generatedColors.length > 0) {
      onApply(generatedColors)
    }
  }

  // Auth gate
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border border-slate-200 dark:border-slate-700">
        <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to use AI palette generation</p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-[var(--tk-color-primary-500)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Prompt textarea */}
      <div className="flex flex-col gap-2">
        <label htmlFor="ai-prompt" className="text-sm font-medium text-slate-900 dark:text-white">
          Describe your palette
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'warm sunset over ocean, luxury feel' or 'modern tech startup, clean and bold'"
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50 resize-none"
        />
        <p className="text-xs text-slate-400">{prompt.length}/500</p>
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--tk-color-primary-500)] to-purple-600 hover:from-[var(--tk-color-primary-600)] hover:to-purple-700 text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-default flex items-center justify-center gap-2"
        style={{ minHeight: '44px' }}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Generate with AI
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/20">1 credit</span>
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* AI Results — 3 palette suggestions */}
      {aiResults.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Suggestions</h3>
          {aiResults.map((palette, i) => {
            const isSelected = generatedColors === palette.colors
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectAiPalette(palette)}
                className={`flex flex-col gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{palette.name}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[var(--tk-color-primary-500)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex gap-1 rounded-lg overflow-hidden h-8">
                  {palette.colors.map((hex, j) => (
                    <div key={j} className="flex-1" style={{ backgroundColor: hex }} title={hex} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Quick preset pills */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Presets</h3>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handlePresetClick(name)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                selectedPreset === name
                  ? 'bg-[var(--tk-color-primary-500)] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={{ minHeight: '44px' }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected colors preview + apply */}
      {generatedColors.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-1.5 rounded-xl overflow-hidden h-14 border border-slate-200 dark:border-slate-700">
            {generatedColors.map((hex, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: hex }} title={hex} />
            ))}
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 rounded-xl bg-[var(--tk-color-primary-500)] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Apply to Palette
          </button>
        </div>
      )}
    </div>
  )
}
