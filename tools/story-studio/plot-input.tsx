'use client'

import { useState, useCallback } from 'react'
import { useCharacterList, ART_STYLES } from '@/tools/story-studio/use-characters'

export const PLOT_DRAFT_KEY = 'toolk1t-story-plot-draft'

export function clearPlotDraft() {
  try { localStorage.removeItem(PLOT_DRAFT_KEY) } catch { /* ignore */ }
}

interface PlotInputProps {
  onSubmit: (plot: string) => void
  loading: boolean
  initialPlot?: string
  selectedCharacterIds: string[]
  onCharacterIdsChange: (ids: string[]) => void
  selectedArtStyle: string | null
  onArtStyleChange: (style: string | null) => void
}

export function PlotInput({
  onSubmit, loading, initialPlot,
  selectedCharacterIds, onCharacterIdsChange,
  selectedArtStyle, onArtStyleChange,
}: PlotInputProps) {
  const [plot, setPlot] = useState(() => {
    if (initialPlot) return initialPlot
    try {
      return localStorage.getItem(PLOT_DRAFT_KEY) || ''
    } catch {
      return ''
    }
  })

  const { characters } = useCharacterList()

  const updatePlot = useCallback((value: string) => {
    setPlot(value)
    try {
      if (value) {
        localStorage.setItem(PLOT_DRAFT_KEY, value)
      } else {
        localStorage.removeItem(PLOT_DRAFT_KEY)
      }
    } catch { /* ignore */ }
  }, [])
  const [rephrasing, setRephrasing] = useState(false)
  const [showCharPicker, setShowCharPicker] = useState(false)

  const plotValid = plot.trim().length >= 10

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!plotValid || loading) return
    onSubmit(plot.trim())
  }

  const handleRephrase = async () => {
    if (!plotValid || rephrasing || loading) return
    setRephrasing(true)
    try {
      const res = await fetch('/api/v1/story/rephrase-plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: plot.trim() }),
      })
      if (res.ok) {
        const { data } = await res.json()
        if (data?.rephrasedPlot) {
          updatePlot(data.rephrasedPlot)
        }
      }
    } catch { /* silently fail */ }
    finally { setRephrasing(false) }
  }

  const toggleCharacter = (id: string) => {
    onCharacterIdsChange(
      selectedCharacterIds.includes(id)
        ? selectedCharacterIds.filter(c => c !== id)
        : [...selectedCharacterIds, id]
    )
  }

  const approvedCharacters = characters.filter(c => c.status === 'approved')
  const selectedChars = characters.filter(c => selectedCharacterIds.includes(c.id))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Plot input */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">&#x1F389;</span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            The Main Plot
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Every epic journey starts with a single spark of imagination.
        </p>

        <textarea
          value={plot}
          onChange={(e) => updatePlot(e.target.value)}
          placeholder="Example: A clockmaker in a city of clouds discovers a gear that can turn back time, but only for five minutes a day..."
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none h-36 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-slate-400 transition-all"
          maxLength={2000}
          disabled={rephrasing}
        />
        <div className="flex items-center justify-between mt-1.5 mb-5">
          <p className="text-xs text-slate-400">{plot.length}/2000 characters (min 10)</p>
          <button
            type="button"
            onClick={handleRephrase}
            disabled={!plotValid || rephrasing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 transition-colors disabled:opacity-40 disabled:cursor-default cursor-pointer"
          >
            {rephrasing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rephrasing...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Rephrase with AI
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">1 credit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Character picker */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Characters</h3>
            <span className="text-xs text-slate-400">optional</span>
          </div>
          {approvedCharacters.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCharPicker(v => !v)}
              className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
            >
              {showCharPicker ? 'Hide' : `Choose from ${approvedCharacters.length} character${approvedCharacters.length > 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        {/* Selected characters display */}
        {selectedChars.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedChars.map(c => (
              <div
                key={c.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
              >
                {c.referenceImageUrl && (
                  <img src={c.referenceImageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{c.name}</span>
                <button
                  type="button"
                  onClick={() => toggleCharacter(c.id)}
                  className="w-4 h-4 flex items-center justify-center text-indigo-400 hover:text-indigo-600 cursor-pointer"
                  aria-label={`Remove ${c.name}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Character picker grid */}
        {showCharPicker && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {approvedCharacters.map(c => {
              const isSelected = selectedCharacterIds.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCharacter(c.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all cursor-pointer text-left
                    ${isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  style={{ minHeight: '44px' }}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {c.referenceImageUrl ? (
                      <img src={c.referenceImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{c.name}</p>
                    {c.role && (
                      <p className="text-[10px] text-slate-400 capitalize">{c.role}</p>
                    )}
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {approvedCharacters.length === 0 && (
          <p className="text-xs text-slate-400 italic">
            No approved characters yet. Create and approve characters in the Characters tab first.
          </p>
        )}
      </div>

      {/* Art style picker */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Art Style</h3>
          <span className="text-xs text-slate-400">optional — AI picks if not set</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ART_STYLES.map(style => {
            const isSelected = selectedArtStyle === style.value
            return (
              <button
                key={style.value}
                type="button"
                onClick={() => onArtStyleChange(isSelected ? null : style.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer
                  ${isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200 dark:border-slate-700'
                  }`}
                style={{ minHeight: '32px' }}
              >
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-8 shadow-sm">
        <p className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          AI-generated stories may contain inaccuracies. The more detail you provide — characters, setting, tone — the better the result. Content involving violence, sexual themes, or other prohibited material will be blocked.
        </p>

        <button
          type="submit"
          disabled={!plotValid || loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default"
          style={{ minHeight: '44px' }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Ideas...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate Story Paths
            </span>
          )}
        </button>
      </div>
    </form>
  )
}
