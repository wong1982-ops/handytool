'use client'

import { useState } from 'react'
import { StylePicker } from './style-picker'
import { AUDIENCES, PAGE_COUNTS, CREDIT_COSTS, type StoryInput, type Audience, type BookStyle } from './types'

interface StoryInputFormProps {
  onSubmit: (input: StoryInput) => void
  loading: boolean
  creditBalance: number | null
}

export function StoryInputForm({ onSubmit, loading, creditBalance }: StoryInputFormProps) {
  const [title, setTitle] = useState('')
  const [plot, setPlot] = useState('')
  const [audience, setAudience] = useState<Audience>('all-ages')
  const [pageCount, setPageCount] = useState(10)
  const [style, setStyle] = useState<BookStyle>({ preset: 'watercolor' })

  const totalCost = CREDIT_COSTS.enrich + pageCount * CREDIT_COSTS.illustrate + CREDIT_COSTS.exportPdf
  const canAfford = creditBalance === null || creditBalance >= CREDIT_COSTS.enrich
  const plotValid = plot.trim().length >= 20

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!plotValid || loading) return
    onSubmit({ title: title.trim() || undefined, plot: plot.trim(), audience, format: 'picture-book', pageCount, style })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Title <span className="text-slate-400">(optional — AI will generate one)</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Amazing Story"
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#3D6AF2] focus:outline-none"
          maxLength={200}
        />
      </div>

      {/* Plot */}
      <div>
        <label htmlFor="plot" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Storyline / Main Plot <span className="text-red-400">*</span>
        </label>
        <textarea
          id="plot"
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
          placeholder="Tell us your story idea... A curious little fox discovers a hidden garden behind the old library where books come to life at night..."
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm resize-none h-32 focus:border-[#3D6AF2] focus:outline-none"
          maxLength={2000}
          required
        />
        <p className="text-xs text-slate-400 mt-1">{plot.length}/2000 characters (min 20)</p>
      </div>

      {/* Audience */}
      <div>
        <label htmlFor="audience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Target Audience
        </label>
        <select
          id="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value as Audience)}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#3D6AF2] focus:outline-none cursor-pointer"
        >
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Page Count */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Pages
        </label>
        <div className="flex gap-2">
          {PAGE_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setPageCount(count)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                pageCount === count
                  ? 'bg-[#3D6AF2] text-white'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
              style={{ minHeight: '44px' }}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <StylePicker value={style} onChange={setStyle} />

      {/* Cost & Submit */}
      <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Estimated total cost</span>
          <span className="font-bold text-slate-900 dark:text-white">{totalCost} credits</span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Story: {CREDIT_COSTS.enrich} + Illustrations: {pageCount} x {CREDIT_COSTS.illustrate} + Export: {CREDIT_COSTS.exportPdf}
        </div>
        <button
          type="submit"
          disabled={!plotValid || loading || !canAfford}
          className="w-full py-3 rounded-xl bg-[#3D6AF2] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-default"
          style={{ minHeight: '44px' }}
        >
          {loading ? 'Generating Story...' : `Generate Story (${CREDIT_COSTS.enrich} credits)`}
        </button>
        {!canAfford && (
          <p className="text-xs text-red-400 text-center">Insufficient credits. Purchase more in Billing.</p>
        )}
      </div>
    </form>
  )
}
