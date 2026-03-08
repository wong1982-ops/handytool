'use client'

import { useState } from 'react'

interface PlotInputProps {
  onSubmit: (plot: string) => void
  loading: boolean
}

export function PlotInput({ onSubmit, loading }: PlotInputProps) {
  const [plot, setPlot] = useState('')

  const plotValid = plot.trim().length >= 10

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!plotValid || loading) return
    onSubmit(plot.trim())
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
        />
        <p className="text-xs text-slate-400 mt-1.5 mb-5">{plot.length}/2000 characters (min 10)</p>

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
