'use client'

import { TEST_CONFIGS, CATEGORY_ORDER } from './constants'
import { TestCard } from './test-card'
import { useTestScores } from './use-test-scores'
import type { TestId } from './types'
import DailyChallenge from './daily-challenge'
import { FavoriteButton } from '@/components/ui/favorite-button'

interface DashboardProps {
  onSelectTest: (testId: TestId) => void
}

export function Dashboard({ onSelectTest }: DashboardProps) {
  const { scores } = useTestScores()

  const testsCompleted = Object.keys(scores).length
  const totalAttempts = Object.values(scores).reduce(
    (sum, s) => sum + s.attempts,
    0,
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1724]">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-12">
        {/* Stats hero card */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 md:mb-12">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {/* Left: icon + titles */}
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex size-24 rounded-full border border-slate-200 dark:border-slate-700 items-center justify-center shrink-0">
                <div className="size-16 rounded-full bg-[var(--tk-color-primary-500)] flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Human Benchmark
                  </h1>
                  <FavoriteButton slug="human-benchmark" name="Human Benchmark" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Cognitive Testing Dashboard
                </p>
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex items-center gap-6">
              <div className="pr-6 border-r border-slate-200 dark:border-slate-700">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Completed
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {testsCompleted}/{TEST_CONFIGS.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  Tests
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {totalAttempts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily challenge */}
        <DailyChallenge onStartChallenge={onSelectTest} />

        {/* Grouped test sections */}
        {CATEGORY_ORDER.map((category) => {
          const tests = TEST_CONFIGS.filter((t) => t.category === category)
          if (tests.length === 0) return null
          return (
            <div key={category} className="mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {tests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    score={scores[test.id]}
                    onClick={() => onSelectTest(test.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
