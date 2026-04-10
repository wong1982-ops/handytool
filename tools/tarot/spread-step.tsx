'use client'

import type { TarotProject } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface SpreadStepProps {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onBack: () => void
}

export function SpreadStep({ t, onBack }: SpreadStepProps) {
  return (
    <div className="text-center py-16">
      <p className="text-slate-500 dark:text-[#a6abb5] mb-6">
        Spread selection &mdash; coming soon
      </p>
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl border border-slate-200 dark:border-[#1e2631] px-6 py-3 text-sm font-medium text-slate-600 dark:text-[#a6abb5] hover:bg-slate-50 dark:hover:bg-[#131a23] transition-colors cursor-pointer min-h-[44px]"
      >
        {t.spreadStep.back}
      </button>
    </div>
  )
}
