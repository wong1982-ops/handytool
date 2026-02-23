'use client'

import type { TestConfig, TestScore } from './types'

interface TestCardProps {
  test: TestConfig
  score?: TestScore
  onClick: () => void
}

export function TestCard({ test, score, onClick }: TestCardProps) {
  const lastScore =
    score && score.history.length > 0
      ? `${score.history[score.history.length - 1].score} ${test.unit}`
      : '\u2014'

  return (
    <div className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[var(--tk-color-primary-500)]/50 hover:shadow-xl hover:shadow-[var(--tk-color-primary-500)]/5 flex flex-col justify-between transition-all">
      <div>
        <div
          className={`${test.iconBgLight} dark:${test.iconBg} ${test.iconColorLight} dark:${test.iconColor} size-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
        >
          {test.icon}
        </div>
        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
          {test.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
          {test.description}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-[10px] uppercase font-bold tracking-widest flex justify-between">
          <span className="text-slate-400 dark:text-slate-500">
            Last Score
          </span>
          <span className="text-[var(--tk-color-primary-500)]">
            {lastScore}
          </span>
        </div>
        <button
          onClick={onClick}
          className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold group-hover:bg-[var(--tk-color-primary-500)] group-hover:text-white transition-colors min-h-[44px]"
        >
          Start Test
        </button>
      </div>
    </div>
  )
}
