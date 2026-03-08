'use client'

import type { StoryConcept } from './types'

interface ConceptCardsProps {
  concepts: [StoryConcept, StoryConcept]
  onPick: (concept: StoryConcept) => void
  loading: boolean
}

const SECTION_LABELS: { key: keyof StoryConcept['sections']; label: string }[] = [
  { key: 'premise', label: 'The Story' },
  { key: 'authorIntent', label: 'What It Provokes' },
  { key: 'messageToAudience', label: 'The Takeaway' },
  { key: 'narrativeArc', label: 'How It Unfolds' },
  { key: 'tone', label: 'The Voice' },
  { key: 'visualStyle', label: 'The Look' },
]

export function ConceptCards({ concepts, onPick, loading }: ConceptCardsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Suggested Story Paths
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            We created two story concepts from your idea. Choose one to refine or generate.
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full inline-flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          AI Powered
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {concepts.map((concept, idx) => (
          <div
            key={concept.id}
            className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col overflow-hidden hover:scale-[1.01] transition-transform cursor-pointer ${
              idx === 0
                ? 'border-l-4 border-l-purple-500'
                : 'border-l-4 border-l-slate-300 dark:border-l-slate-600'
            }`}
            onClick={() => !loading && onPick(concept)}
          >
            {/* Header */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className={`text-lg font-bold ${
                  idx === 0
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {concept.title}
                </h3>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                  {concept.tags.tone}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {concept.tags.style}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  {concept.tags.audience}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {concept.tags.pageCount} pages
                </span>
              </div>
            </div>

            {/* Sections */}
            <div className="px-5 pb-4 flex-1 space-y-3">
              {SECTION_LABELS.map(({ key, label }) => (
                <div key={key}>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    {label}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {concept.sections[key]}
                  </p>
                </div>
              ))}
            </div>

            {/* Action — "Select Path | Refine" inline links like design */}
            <div className="px-5 pb-5 flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onPick(concept) }}
                disabled={loading}
                className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer disabled:opacity-50"
                style={{ minHeight: '44px' }}
              >
                Select Path
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                onClick={(e) => { e.stopPropagation(); onPick(concept) }}
                disabled={loading}
                className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer disabled:opacity-50"
                style={{ minHeight: '44px' }}
              >
                Refine
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
