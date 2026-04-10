'use client'

import { useCallback, useState } from 'react'
import type { TarotProject, SpreadCategory } from '@/tools/tarot/tarot-types'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

interface QuestionStepProps {
  project: TarotProject
  setProject: React.Dispatch<React.SetStateAction<TarotProject>>
  t: I18nStrings
}

const CATEGORIES: { key: SpreadCategory; emoji: string }[] = [
  { key: 'general', emoji: '\u{1F31F}' },
  { key: 'love', emoji: '\u{2764}\u{FE0F}' },
  { key: 'career', emoji: '\u{1F4BC}' },
  { key: 'finance', emoji: '\u{1F4B0}' },
  { key: 'growth', emoji: '\u{1F331}' },
]

export function QuestionStep({ project, setProject, t }: QuestionStepProps) {
  const [recommending, setRecommending] = useState(false)

  const handleRecommend = useCallback(async () => {
    setRecommending(true)
    try {
      const res = await fetch('/api/v1/tarot/recommend-spread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: project.question, language: project.language }),
      })
      if (res.ok) {
        const json = await res.json()
        const { spreadId } = json.data
        setProject((p) => ({ ...p, recommendedSpreadId: spreadId, spreadId, step: 2, error: null }))
      } else {
        setProject((p) => ({ ...p, step: 2, error: null }))
      }
    } catch {
      setProject((p) => ({ ...p, step: 2, error: null }))
    } finally {
      setRecommending(false)
    }
  }, [project.question, project.language, setProject])

  const handleQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setProject((p) => ({ ...p, question: e.target.value }))
    },
    [setProject],
  )

  const handleCategoryToggle = useCallback(
    (cat: SpreadCategory) => {
      setProject((p) => ({
        ...p,
        category: p.category === cat ? null : cat,
      }))
    },
    [setProject],
  )

  const handleNext = useCallback(() => {
    setProject((p) => ({ ...p, step: 2, error: null }))
  }, [setProject])

  const canProceed = project.question.trim().length > 0 || project.category !== null

  return (
    <div className="space-y-6">
      {/* Question textarea */}
      <div>
        <div className="relative">
          <textarea
            value={project.question}
            onChange={handleQuestionChange}
            maxLength={500}
            rows={4}
            placeholder={t.questionStep.placeholder}
            className="w-full rounded-xl border border-slate-200 dark:border-[#1e2631] bg-white dark:bg-[#131a23] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#70767f] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-colors"
          />
          <span className="absolute bottom-2 right-3 text-[11px] text-slate-400 dark:text-[#70767f]">
            {project.question.length}/500
          </span>
        </div>
      </div>

      {/* Category pills */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-[#a6abb5] mb-3">
          {t.questionStep.orChooseCategory}
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, emoji }) => {
            const isActive = project.category === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryToggle(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-[#131a23] text-slate-600 dark:text-[#a6abb5] border border-slate-200 dark:border-[#1e2631] hover:border-purple-400 dark:hover:border-purple-500'
                }`}
              >
                <span>{emoji}</span>
                <span>{t.categories[key]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* AI recommend button */}
      {project.question.trim().length > 0 && (
        <button
          type="button"
          onClick={handleRecommend}
          disabled={recommending}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] cursor-pointer border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
        >
          {recommending ? '...' : `✨ ${t.questionStep.recommendSpread}`}
        </button>
      )}

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all cursor-pointer min-h-[44px] hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg"
        >
          {t.questionStep.next}
        </button>
      </div>
    </div>
  )
}
