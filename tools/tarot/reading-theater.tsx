'use client'

import type { TarotProject } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface ReadingTheaterProps {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
  onStartOver: () => void
}

export function ReadingTheater({ t, onStartOver }: ReadingTheaterProps) {
  return (
    <div className="text-center py-16">
      <p className="text-slate-500 dark:text-[#a6abb5] mb-6">
        Reading theater &mdash; coming soon
      </p>
      <button
        type="button"
        onClick={onStartOver}
        className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all cursor-pointer min-h-[44px] hover:shadow-xl"
      >
        {t.theater.newReading}
      </button>
    </div>
  )
}
