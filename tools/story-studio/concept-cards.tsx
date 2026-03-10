'use client'

import type { StoryConcept } from './types'

interface ConceptCardsProps {
  concept: StoryConcept
  onPick: (concept: StoryConcept) => void
  loading: boolean
}

const SECTION_LABELS: { key: keyof StoryConcept['sections']; label: string; icon: string }[] = [
  { key: 'premise', label: 'The Story', icon: '📖' },
  { key: 'authorIntent', label: 'What It Provokes', icon: '💭' },
  { key: 'messageToAudience', label: 'The Takeaway', icon: '🎁' },
  { key: 'narrativeArc', label: 'How It Unfolds', icon: '🗺️' },
  { key: 'tone', label: 'The Voice', icon: '🎵' },
  { key: 'visualStyle', label: 'The Look', icon: '🎨' },
]

export function ConceptCards({ concept, onPick, loading }: ConceptCardsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
              Your Story Path
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              The Story Fairy has crafted a concept from your idea
            </p>
          </div>
        </div>
      </div>

      <div
        className="group relative rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.005] transition-transform"
        onClick={() => !loading && onPick(concept)}
      >
        {/* Magical glow border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 via-purple-400/15 to-indigo-400/20 dark:from-amber-400/10 dark:via-purple-400/5 dark:to-indigo-400/10" />

        <div className="relative bg-white/95 dark:bg-slate-900/95 border border-amber-200/50 dark:border-amber-700/30 rounded-2xl shadow-lg shadow-amber-500/5 overflow-hidden">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-500" />

          {/* Header */}
          <div className="p-5 pb-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 dark:from-amber-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                {concept.title}
              </h3>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-700/30">
                {concept.tags.tone}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                {concept.tags.style}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                {concept.tags.audience}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
                {concept.tags.pageCount} pages
              </span>
            </div>
          </div>

          {/* Sections */}
          <div className="px-5 pb-4 space-y-4">
            {SECTION_LABELS.map(({ key, label, icon }) => (
              <div key={key}>
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <span className="text-sm">{icon}</span>
                  {label}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                  {concept.sections[key]}
                </p>
              </div>
            ))}
          </div>

          {/* Action footer */}
          <div className="px-5 pb-5 flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onPick(concept) }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-sm font-bold shadow-md shadow-purple-500/15 hover:shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Refine & Generate
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">
              Click to customize or go straight to generation
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
