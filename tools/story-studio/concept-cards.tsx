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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Pick a direction
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          We created two story concepts from your idea. Choose one to refine or generate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {concepts.map((concept) => (
          <div
            key={concept.id}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                {concept.title}
              </h3>

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
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  {concept.tags.tone}
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

            {/* Action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => onPick(concept)}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[var(--tk-color-primary-500,#3D6AF2)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-default"
                style={{ minHeight: '44px' }}
              >
                {loading ? 'Loading...' : 'Pick This'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
