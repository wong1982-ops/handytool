'use client'

import type { ReactNode } from 'react'
import type { TestConfig, TestScore } from './types'
import { StatCards } from './stat-cards'
import { ResultsTable } from './results-table'

interface TestViewProps {
  config: TestConfig
  scores?: TestScore
  children: ReactNode
  onBack: () => void
  onClearHistory: () => void
}

export function TestView({
  config,
  scores,
  children,
  onBack,
  onClearHistory,
}: TestViewProps) {
  const history = scores?.history ?? []
  const attempts = scores?.attempts ?? 0
  const best = scores?.best

  const average =
    history.length > 0
      ? Math.round(
          history.reduce((sum, e) => sum + e.score, 0) / history.length,
        )
      : undefined

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0f1724]">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1724] px-4 md:px-10 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`${config.iconBgLight} dark:${config.iconBg} ${config.iconColorLight} dark:${config.iconColor} size-8 rounded-lg flex items-center justify-center`}
          >
            {config.icon}
          </div>
          <span className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            Human Benchmark
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="sm:hidden text-sm font-semibold text-[var(--tk-color-primary-500)]"
          >
            Dashboard
          </button>
          <button
            onClick={onBack}
            className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 min-h-[44px] text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span aria-hidden="true">&larr;</span> Back to dashboard
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 md:px-10 py-8">
        {/* Test header */}
        <div className="text-center mb-6">
          <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold">
            {config.name} Test
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            {config.description}
          </p>
        </div>

        {/* Game card area */}
        {children}

        {/* Stat cards */}
        <StatCards
          average={average}
          best={best}
          attempts={attempts}
          unit={config.unit}
        />

        {/* Results table */}
        {history.length > 0 && best !== undefined && (
          <ResultsTable
            history={history}
            unit={config.unit}
            best={best}
            lowerIsBetter={config.lowerIsBetter}
            onClear={onClearHistory}
          />
        )}
      </main>
    </div>
  )
}
