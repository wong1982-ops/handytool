'use client'

import { useState } from 'react'
import type { Language } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface TrendsPanelProps {
  language: Language
  readingCount: number
  t: I18nStrings
}

interface TrendsData {
  frequentCards: string[]
  recurringThemes: string[]
  insights: string[]
  narrative: string
}

export function TrendsPanel({ language: _language, readingCount, t }: TrendsPanelProps) {
  const [loading, setLoading] = useState(false)
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (readingCount < 5) {
    return (
      <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-4 text-center">
        <p className="text-sm text-slate-400">{t.history.trendsMinimum}</p>
      </div>
    )
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/tarot/trends')
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error?.message ?? t.errors.generationFailed)
        return
      }
      setTrends(json?.data ?? null)
    } catch {
      setError(t.errors.network)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 p-4 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-purple-300">{t.trends.title}</h3>

      {!trends && !loading && (
        <button
          type="button"
          onClick={handleAnalyze}
          className="w-full rounded-xl border-2 border-dashed border-purple-500/40 py-3 text-sm font-medium text-purple-300 hover:border-purple-400/60 hover:text-purple-200 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {t.history.analyzeTrends}
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-spin text-purple-400"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span className="text-sm text-purple-300">{t.trends.loading}</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {trends && (
        <div className="flex flex-col gap-4">
          {/* Frequent Cards */}
          {trends.frequentCards.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                {t.trends.frequentCards}
              </p>
              <div className="flex flex-wrap gap-2">
                {trends.frequentCards.map((card, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs text-purple-200"
                  >
                    {card}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Themes */}
          {trends.recurringThemes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-pink-400 uppercase tracking-wide">
                {t.trends.recurringThemes}
              </p>
              <div className="flex flex-wrap gap-2">
                {trends.recurringThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-pink-500/20 border border-pink-500/30 px-3 py-1 text-xs text-pink-200"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {trends.insights.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                {t.trends.insights}
              </p>
              <ul className="flex flex-col gap-1 list-disc list-inside">
                {trends.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-slate-300 leading-relaxed">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Narrative */}
          {trends.narrative && (
            <p className="text-sm text-slate-300 leading-relaxed italic border-t border-purple-500/20 pt-3">
              {trends.narrative}
            </p>
          )}

          {/* Re-analyze button */}
          <button
            type="button"
            onClick={handleAnalyze}
            className="self-start text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-1"
          >
            {t.history.analyzeTrends}
          </button>
        </div>
      )}
    </div>
  )
}
