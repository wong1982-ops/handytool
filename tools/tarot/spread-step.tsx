'use client'

import { useState } from 'react'
import type { SpreadCategory, TarotProject } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'
import { getSpreadsByCategory } from '@/tools/tarot/tarot-spreads'
import { SpreadCard } from '@/tools/tarot/spread-card'

interface SpreadStepProps {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onBack: () => void
}

const CATEGORIES: Array<{ key: 'all' | SpreadCategory; label: keyof I18nStrings['categories'] }> = [
  { key: 'all', label: 'all' },
  { key: 'general', label: 'general' },
  { key: 'love', label: 'love' },
  { key: 'career', label: 'career' },
  { key: 'finance', label: 'finance' },
  { key: 'growth', label: 'growth' },
]

export function SpreadStep({ project, setProject, t, onBack }: SpreadStepProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | SpreadCategory>('all')

  const spreads = getSpreadsByCategory(activeCategory)
  const selectedSpreadId = project.spreadId
  const recommendedSpreadId = project.recommendedSpreadId

  function handleSelectSpread(id: string) {
    setProject((prev) => ({ ...prev, spreadId: id }))
  }

  function handleStartReading() {
    if (!selectedSpreadId) return
    setProject((prev) => ({ ...prev, step: 3 }))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category filter pills */}
      <div
        className="flex gap-2 flex-wrap"
        role="group"
        aria-label="Filter spreads by category"
      >
        {CATEGORIES.map(({ key, label }) => {
          const isActive = activeCategory === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer min-h-[44px]',
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-100 dark:bg-[#131a23] text-slate-600 dark:text-[#a6abb5] hover:bg-slate-200 dark:hover:bg-[#1e2631] border border-slate-200 dark:border-[#1e2631]',
              ].join(' ')}
              aria-pressed={isActive}
            >
              {t.categories[label]}
            </button>
          )
        })}
      </div>

      {/* Spread grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        role="list"
        aria-label="Available spreads"
      >
        {spreads.map((spread) => (
          <div key={spread.id} role="listitem">
            <SpreadCard
              spread={spread}
              language={project.language}
              selected={selectedSpreadId === spread.id}
              recommended={recommendedSpreadId === spread.id}
              onClick={() => handleSelectSpread(spread.id)}
              t={t}
            />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#1e2631]">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-200 dark:border-[#1e2631] px-6 py-3 text-sm font-medium text-slate-600 dark:text-[#a6abb5] hover:bg-slate-50 dark:hover:bg-[#131a23] transition-colors cursor-pointer min-h-[44px]"
        >
          {t.spreadStep.back}
        </button>
        <button
          type="button"
          onClick={handleStartReading}
          disabled={!selectedSpreadId}
          className={[
            'rounded-xl px-6 py-3 text-sm font-semibold transition-all cursor-pointer min-h-[44px]',
            selectedSpreadId
              ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-md shadow-purple-500/20 hover:opacity-90 active:scale-[0.98]'
              : 'bg-slate-100 dark:bg-[#1e2631] text-slate-400 dark:text-[#4a5568] cursor-not-allowed opacity-60',
          ].join(' ')}
          aria-disabled={!selectedSpreadId}
        >
          {t.spreadStep.startReading}
        </button>
      </div>
    </div>
  )
}
