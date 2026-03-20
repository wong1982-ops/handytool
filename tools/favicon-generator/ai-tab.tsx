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
      <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-2xl border border-slate-200 dark:border-slate-700">
        <svg className="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to use AI favicon generation</p>
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
    <div className="space-y-5">
      {/* Prompt */}
      <div className="space-y-1.5">
        <label htmlFor="ai-prompt" className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Describe your favicon
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'a minimalist rocket icon' or 'coffee cup with steam, warm colors'"
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]/50 resize-none"
        />
        <p className="text-xs text-slate-400">{prompt.length}/500</p>
      </div>

      {/* Style selector */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Style</span>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                selectedStyle === style
                  ? 'bg-[var(--tk-color-primary-500)] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={{ minHeight: '44px' }}
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
        className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[var(--tk-color-primary-500)] to-purple-600 hover:from-[var(--tk-color-primary-600)] hover:to-purple-700 disabled:opacity-50 disabled:cursor-default transition-all cursor-pointer"
        style={{ minHeight: '48px' }}
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
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results — 4 icon thumbnails */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Choose an icon
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {results.map((icon, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectIcon(i)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedIndex === i
                    ? 'border-[var(--tk-color-primary-500)] bg-[var(--tk-color-primary-500)]/5 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div
                  className="w-12 h-12"
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-full text-center">
                  {icon.name}
                </span>
                {selectedIndex === i && (
                  <svg className="w-4 h-4 text-[var(--tk-color-primary-500)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {selectedIndex !== null && (
            <p className="text-xs text-slate-400 text-center">
              Icon applied — customize it further using the style controls
            </p>
          )}
        </div>
      )}

      {/* Empty state (no results yet) */}
      {results.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
          <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Describe your favicon and AI will generate 4 icon options
          </p>
        </div>
      )}
    </div>
  )
}
