'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { FaviconConfig } from './types'

interface AiTabProps {
  config: FaviconConfig
  onConfigChange: (updates: Partial<FaviconConfig>) => void
}

const STYLES = ['Flat', '3D', 'Pixel Art', 'Minimal', 'Gradient'] as const

interface AiIcon {
  name: string
  svg: string
}

export default function AiTab({ onConfigChange }: AiTabProps) {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('Flat')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<AiIcon[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  async function handleGenerate() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    setResults([])
    setSelectedIndex(null)

    try {
      const res = await fetch('/api/v1/favicon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style: selectedStyle }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.code === 'INSUFFICIENT_CREDITS') {
          setError('Not enough credits. Top up to use AI generation.')
        } else if (json.code === 'UNAUTHORIZED') {
          setError('Please sign in to use AI generation.')
        } else {
          setError(json.error || 'Failed to generate favicon.')
        }
        return
      }

      const icons = json.data?.icons as AiIcon[]
      if (icons?.length > 0) {
        setResults(icons)
      } else {
        setError('AI returned no icons. Try a different description.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectIcon(index: number) {
    setSelectedIndex(index)
    const icon = results[index]
    if (icon) {
      onConfigChange({ mode: 'icon', iconSvg: icon.svg })
    }
  }

  // Auth gate
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-xl border border-[#1e2631] bg-[#131a23]">
        <svg className="w-10 h-10 text-[#70767f]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <p className="text-sm text-[#a6abb5]">Sign in to use AI favicon generation</p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-[#3D6AF2] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer min-h-[44px]"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#1e2631] bg-[#131a23] p-5 space-y-5">
      {/* Prompt */}
      <div className="space-y-2">
        <label htmlFor="ai-prompt" className="block text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">
          Describe your favicon
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'a minimalist rocket icon' or 'coffee cup with steam, warm colors'"
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-[#1e2631] bg-[#090f16] px-4 py-3 text-sm text-white placeholder-[#70767f] focus:outline-none focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 resize-none transition-all"
        />
        <p className="text-xs text-[#70767f]">{prompt.length}/500</p>
      </div>

      {/* Style selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">Style</span>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer min-h-[36px] ${
                selectedStyle === style
                  ? 'bg-[#3D6AF2] text-white'
                  : 'bg-[#1e2631] text-[#a6abb5] hover:bg-[#1e2a3a]'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim() || loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-br from-[#3D6AF2] to-[#7c3aed] hover:opacity-90 disabled:opacity-50 disabled:cursor-default transition-all cursor-pointer min-h-[48px]"
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
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">1 credit</span>
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-sm text-[#EF4444]">
          {error}
        </div>
      )}

      {/* Results -- 4 icon thumbnails */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-[#70767f] uppercase tracking-[0.08em]">
            Choose an icon
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {results.map((icon, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectIcon(i)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer min-h-[100px] ${
                  selectedIndex === i
                    ? 'border-[#3D6AF2] bg-[#3D6AF2]/[0.07]'
                    : 'border-[#1e2631] hover:border-[#2a3447]'
                }`}
              >
                <div
                  className="w-12 h-12"
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
                <span className="text-xs text-[#70767f] truncate w-full text-center">
                  {icon.name}
                </span>
                {selectedIndex === i && (
                  <svg className="w-4 h-4 text-[#3D6AF2]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {selectedIndex !== null && (
            <p className="text-xs text-[#70767f] text-center">
              Icon applied — customize it further using the style controls
            </p>
          )}
        </div>
      )}

      {/* Empty state (no results yet) */}
      {results.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2a3447] bg-[#090f16]/40 p-8 text-center">
          <svg className="w-8 h-8 text-[#70767f] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <p className="text-sm text-[#70767f]">
            Describe your favicon and AI will generate 4 icon options
          </p>
        </div>
      )}
    </div>
  )
}
