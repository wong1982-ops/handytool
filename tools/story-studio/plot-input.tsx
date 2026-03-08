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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          What's your story about?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Describe your story idea and we'll create two unique concepts for you to choose from.
        </p>

        <textarea
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
          placeholder="A curious little fox discovers a hidden garden behind the old library where books come to life at night..."
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none h-36 focus:border-[var(--tk-color-primary-500,#3D6AF2)] focus:outline-none placeholder:text-slate-400"
          maxLength={2000}
        />
        <p className="text-xs text-slate-400 mt-1.5 mb-5">{plot.length}/2000 characters (min 10)</p>

        <button
          type="submit"
          disabled={!plotValid || loading}
          className="w-full py-3 rounded-xl bg-[var(--tk-color-primary-500,#3D6AF2)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-default"
          style={{ minHeight: '44px' }}
        >
          {loading ? 'Generating Ideas...' : 'Generate Ideas'}
        </button>
      </div>
    </form>
  )
}
