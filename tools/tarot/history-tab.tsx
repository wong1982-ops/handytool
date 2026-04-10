'use client'

import type { Language } from '@/tools/tarot/tarot-types'
import { en } from '@/tools/tarot/i18n/en'
import { zh } from '@/tools/tarot/i18n/zh'

interface HistoryTabProps {
  language: Language
}

export function HistoryTab({ language }: HistoryTabProps) {
  const t = language === 'zh' ? zh : en

  return (
    <div className="text-center py-16">
      <p className="text-slate-500 dark:text-[#a6abb5] mb-2">
        {t.history.empty}
      </p>
      <p className="text-xs text-slate-400 dark:text-[#70767f]">
        {t.history.emptyHint}
      </p>
    </div>
  )
}
