'use client'

import { useState } from 'react'
import type { KeywordResearchResponse, KeywordResult } from './types'

// ── helpers ──────────────────────────────────────────────────────────────────

function volumeBadge(v: KeywordResult['volume']) {
  const map = {
    high: 'bg-green-900/40 text-green-400 border border-green-800',
    medium: 'bg-amber-900/40 text-amber-400 border border-amber-800',
    low: 'bg-slate-800 text-slate-400 border border-slate-700',
  } as const
  return map[v]
}

function competitionBadge(c: KeywordResult['competition']) {
  const map = {
    easy: 'bg-green-900/40 text-green-400 border border-green-800',
    medium: 'bg-amber-900/40 text-amber-400 border border-amber-800',
    hard: 'bg-red-900/40 text-red-400 border border-red-800',
  } as const
  return map[c]
}

function buildCsv(suggestions: KeywordResult[]): string {
  const header = 'Keyword,Volume,Competition,Relevance'
  const rows = suggestions.map(
    (s) => `"${s.keyword}",${s.volume},${s.competition},${s.relevance}%`,
  )
  return [header, ...rows].join('\n')
}

function downloadCsv(suggestions: KeywordResult[]) {
  const blob = new Blob([buildCsv(suggestions)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'keyword-research.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── component ─────────────────────────────────────────────────────────────────

export default function KeywordResearch() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<KeywordResearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function handleResearch() {
    if (query.length < 2 || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/seo-studio/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Request failed (${res.status})`)
      }
      const json = await res.json()
      const data = (json.data ?? json) as KeywordResearchResponse
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function copyKeyword(kw: string) {
    navigator.clipboard.writeText(kw).then(() => {
      setToast(`Copied!`)
      setTimeout(() => setToast(null), 1800)
    })
  }

  return (
    <section className="w-full space-y-8" aria-label="Keyword Research">
      {/* ── error banner ── */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* ── toast ── */}
      {toast && (
        <div
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1e2631] px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {/* ── search section ── */}
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
        <div className="flex w-full gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            placeholder="Enter a keyword or topic..."
            aria-label="Keyword or topic"
            className="min-h-[44px] flex-1 rounded-xl border border-[#1e2631] bg-[#131a23] px-4 text-white placeholder-[#70767f] focus:border-[#3D6AF2] focus:outline-none focus:ring-1 focus:ring-[#3D6AF2]"
          />
          <button
            onClick={handleResearch}
            disabled={loading || query.length < 2}
            aria-busy={loading}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Researching…
              </>
            ) : (
              'Research'
            )}
          </button>
        </div>
        <p className="text-xs text-[#7C3AED]">1 credit per research</p>
      </div>

      {/* ── results ── */}
      {results && (
        <div className="w-full space-y-6">

          {/* a. Keyword Suggestions */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Keyword Suggestions</h2>
                <span className="rounded-full bg-[#1e2631] px-2.5 py-0.5 text-xs text-[#a6abb5]">
                  {results.suggestions.length}
                </span>
              </div>
              <button
                onClick={() => downloadCsv(results.suggestions)}
                className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#1e2631] bg-[#131a23] px-3 text-xs text-[#a6abb5] transition-colors hover:border-[#3D6AF2] hover:text-white"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#1e2631] bg-[#131a23]">
              <table className="w-full text-sm" role="grid">
                <thead>
                  <tr className="border-b border-[#1e2631]">
                    {['Keyword', 'Volume', 'Competition', 'Relevance'].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#70767f]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.suggestions.map((row, i) => (
                    <tr
                      key={i}
                      onClick={() => copyKeyword(row.keyword)}
                      title="Click to copy"
                      className="cursor-pointer border-b border-[#1e2631] transition-colors last:border-0 hover:bg-[#1a2332]"
                    >
                      <td className="px-4 py-3 text-white">{row.keyword}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${volumeBadge(row.volume)}`}>
                          {row.volume}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${competitionBadge(row.competition)}`}>
                          {row.competition}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#a6abb5]">{row.relevance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* b. Related Questions */}
          {results.questions.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-semibold text-white">People Also Ask</h2>
              <ul className="space-y-2">
                {results.questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-[#1e2631] bg-[#131a23] p-3"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#3D6AF2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-[#c8cdd6]">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* c. Google Autocomplete */}
          {results.autocomplete.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-semibold text-white">Google Autocomplete</h2>
              <div className="flex flex-wrap gap-2">
                {results.autocomplete.map((term, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[#1e2631] bg-[#131a23] px-3 py-1.5 text-sm text-[#a6abb5]"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* d. Long-tail Keywords */}
          {results.longTail.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-semibold text-white">Long-tail Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {results.longTail.map((term, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[#1e2631] bg-[#131a23] px-3 py-1.5 text-sm text-[#a6abb5]"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
