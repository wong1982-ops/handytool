'use client'

import { useState } from 'react'

interface PlotInputProps {
  onSubmit: (plot: string) => void
  loading: boolean
  initialPlot?: string
}

export function PlotInput({ onSubmit, loading, initialPlot }: PlotInputProps) {
  const [plot, setPlot] = useState(initialPlot || '')
  const [rephrasing, setRephrasing] = useState(false)

  const plotValid = plot.trim().length >= 10

  const handleSubmit = (e: React.FormEvent) => {
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
          setPlot(data.rephrasedPlot)
        }
      }
    } catch { /* silently fail */ }
    finally { setRephrasing(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
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
          onChange={(e) => setPlot(e.target.value)}
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
              </>
            )}
          </button>
        </div>

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
