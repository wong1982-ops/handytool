# Human Benchmark Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Human Benchmark tool with 8 cognitive tests (Reaction Time, Sequence Memory, Aim Trainer, Number Memory, Verbal Memory, Chimp Test, Visual Memory, Typing) behind a single dashboard at `/tools/human-benchmark`.

**Architecture:** Single `page.tsx` with a view state machine switching between `dashboard` and individual tests (same pattern as ecard-studio). Each test is a standalone component in `tools/human-benchmark/tests/`. Tests render inside a page-integrated layout with colored game card, stats row, and results table — NOT full-screen takeover. Dashboard uses bordered cards with tinted icon boxes per the design mockups.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, pnpm, Playwright E2E.

**Design doc:** `docs/plans/2026-02-23-human-benchmark-design.md`
**Design mockups:** `designs/13.HumanBenchmark/` (screen.png = dashboard, screen_1.png = test view, code.html = reference)

---

### Task 1: Types, constants, and data files

**Files:**
- Create: `tools/human-benchmark/types.ts`
- Create: `tools/human-benchmark/constants.ts`
- Create: `tools/human-benchmark/data/words.ts`
- Create: `tools/human-benchmark/data/typing-passages.ts`

**Step 1: Create types.ts**

```typescript
// tools/human-benchmark/types.ts

export type TestId =
  | 'reaction-time'
  | 'sequence-memory'
  | 'aim-trainer'
  | 'number-memory'
  | 'verbal-memory'
  | 'chimp-test'
  | 'visual-memory'
  | 'typing'

export type ViewState = 'dashboard' | TestId

export interface TestConfig {
  id: TestId
  name: string
  description: string
  icon: React.ReactNode
  iconBg: string        // e.g. 'bg-blue-900/30'
  iconColor: string     // e.g. 'text-blue-400'
  iconBgLight: string   // e.g. 'bg-blue-100'
  iconColorLight: string // e.g. 'text-blue-600'
  gameBgColor: string   // color for the game card background
  unit: string
  lowerIsBetter: boolean
}

export interface ScoreEntry {
  score: number
  date: string
}

export interface TestScore {
  best: number
  history: ScoreEntry[]
  attempts: number
}

export interface StoredScores {
  [testId: string]: TestScore
}

export interface TestComponentProps {
  onComplete: (score: number) => void
  onBack: () => void
  bestScore?: number
  scores?: TestScore
}
```

**Step 2: Create constants.ts**

Each test config includes tinted icon backgrounds per the design mockups. Use inline SVG Heroicons (not Material Symbols). `gameBgColor` is the color for the game card during active play.

```typescript
// tools/human-benchmark/constants.ts
import type { TestConfig } from './types'

export const TEST_CONFIGS: TestConfig[] = [
  {
    id: 'reaction-time',
    name: 'Reaction Time',
    description: 'Test your visual reflexes by clicking as fast as you can when the screen turns green.',
    icon: /* bolt SVG (w-6 h-6) */,
    iconBg: 'bg-blue-900/30', iconColor: 'text-blue-400',
    iconBgLight: 'bg-blue-100', iconColorLight: 'text-blue-600',
    gameBgColor: '#dc2626',
    unit: 'ms', lowerIsBetter: true,
  },
  {
    id: 'sequence-memory',
    name: 'Sequence Memory',
    description: 'Remember an ever-increasing pattern of squares being lit up on a grid.',
    icon: /* reorder/grid SVG */,
    iconBg: 'bg-purple-900/30', iconColor: 'text-purple-400',
    iconBgLight: 'bg-purple-100', iconColorLight: 'text-purple-600',
    gameBgColor: '#7c3aed',
    unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'aim-trainer',
    name: 'Aim Trainer',
    description: 'Hit the targets as fast as you can. Measures your precision and speed.',
    icon: /* target/crosshair SVG */,
    iconBg: 'bg-red-900/30', iconColor: 'text-red-400',
    iconBgLight: 'bg-red-100', iconColorLight: 'text-red-600',
    gameBgColor: '#16a34a',
    unit: 'ms', lowerIsBetter: true,
  },
  {
    id: 'number-memory',
    name: 'Number Memory',
    description: 'Remember the longest number possible. Each level adds one digit to the sequence.',
    icon: /* hash/pin SVG */,
    iconBg: 'bg-amber-900/30', iconColor: 'text-amber-400',
    iconBgLight: 'bg-amber-100', iconColorLight: 'text-amber-600',
    gameBgColor: '#2563eb',
    unit: 'digits', lowerIsBetter: false,
  },
  {
    id: 'verbal-memory',
    name: 'Verbal Memory',
    description: 'Keep track of which words you\'ve seen before. Avoid words you haven\'t seen yet.',
    icon: /* translate/text SVG */,
    iconBg: 'bg-emerald-900/30', iconColor: 'text-emerald-400',
    iconBgLight: 'bg-emerald-100', iconColorLight: 'text-emerald-600',
    gameBgColor: '#d97706',
    unit: 'score', lowerIsBetter: false,
  },
  {
    id: 'chimp-test',
    name: 'Chimp Test',
    description: 'Are you smarter than a chimpanzee? Memorize a numbered grid then click hidden tiles.',
    icon: /* paw/pets SVG */,
    iconBg: 'bg-orange-900/30', iconColor: 'text-orange-400',
    iconBgLight: 'bg-orange-100', iconColorLight: 'text-orange-600',
    gameBgColor: '#db2777',
    unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'visual-memory',
    name: 'Visual Memory',
    description: 'Remember a grid of squares and reproduce the pattern correctly as it grows.',
    icon: /* grid_on SVG */,
    iconBg: 'bg-cyan-900/30', iconColor: 'text-cyan-400',
    iconBgLight: 'bg-cyan-100', iconColorLight: 'text-cyan-600',
    gameBgColor: '#0d9488',
    unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'typing',
    name: 'Typing',
    description: 'Measure your typing speed (Words Per Minute) and accuracy with a random paragraph.',
    icon: /* keyboard SVG */,
    iconBg: 'bg-indigo-900/30', iconColor: 'text-indigo-400',
    iconBgLight: 'bg-indigo-100', iconColorLight: 'text-indigo-600',
    gameBgColor: '#4f46e5',
    unit: 'WPM', lowerIsBetter: false,
  },
]

export const STORAGE_KEY = 'human-benchmark-scores'
```

**Step 3: Create data/words.ts** — ~100 common English words (same as previous plan)

**Step 4: Create data/typing-passages.ts** — 5 passages (same as previous plan)

**Step 5: Commit**

```bash
git add tools/human-benchmark/types.ts tools/human-benchmark/constants.ts tools/human-benchmark/data/words.ts tools/human-benchmark/data/typing-passages.ts
git commit -m "feat(human-benchmark): add types, constants, and data files"
```

---

### Task 2: localStorage hook (use-test-scores)

**Files:**
- Create: `tools/human-benchmark/use-test-scores.ts`

Same as previous plan — `saveScore(testId, score, lowerIsBetter)` with best comparison, history (last 50), attempts counter. `clearHistory(testId)` added for the "Clear History" button.

```typescript
const clearHistory = useCallback((testId: TestId): void => {
  setScores(prev => {
    const updated = { ...prev }
    delete updated[testId]
    writeScores(updated)
    return updated
  })
}, [])

return { getScore, saveScore, clearHistory, scores }
```

**Commit:** `feat(human-benchmark): add localStorage scores hook`

---

### Task 3: Shared UI — test-view, game-card, stat-cards, results-table, test-card

**Files:**
- Create: `tools/human-benchmark/test-view.tsx`
- Create: `tools/human-benchmark/game-card.tsx`
- Create: `tools/human-benchmark/stat-cards.tsx`
- Create: `tools/human-benchmark/results-table.tsx`
- Create: `tools/human-benchmark/test-card.tsx`

**Step 1: Create game-card.tsx**

The colored game area card (replaces full-screen TestWrapper). Per design: large rounded card with colored background, centered content, optional attempt badge.

```tsx
// tools/human-benchmark/game-card.tsx
'use client'

import type { ReactNode } from 'react'

interface GameCardProps {
  bgColor: string
  children: ReactNode
  badge?: string  // e.g. "ATTEMPT 4/5"
}

export function GameCard({ bgColor, children, badge }: GameCardProps) {
  return (
    <div
      className="relative w-full min-h-[350px] md:min-h-[400px] rounded-xl flex items-center justify-center overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {badge && (
        <span className="absolute top-4 right-4 px-3 py-1 bg-black/20 backdrop-blur rounded-full text-xs font-bold text-white uppercase tracking-wider">
          {badge}
        </span>
      )}
      {children}
    </div>
  )
}
```

**Step 2: Create stat-cards.tsx**

3-card stats row below game area. Per design: icon + label + value in bordered cards.

```tsx
// tools/human-benchmark/stat-cards.tsx
'use client'

interface StatCardsProps {
  average?: number
  best?: number
  attempts: number
  unit: string
}

export function StatCards({ average, best, attempts, unit }: StatCardsProps) {
  const stats = [
    { icon: '📊', label: 'AVERAGE', value: average != null ? `${average}${unit}` : '—' },
    { icon: '🏆', label: 'PERSONAL BEST', value: best != null ? `${best}${unit}` : '—' },
    { icon: '🎯', label: 'ATTEMPTS', value: String(attempts) },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-2xl">{s.icon}</span>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">{s.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Create results-table.tsx**

Recent results table per design. Shows attempt #, score, date/time, status badge.

```tsx
// tools/human-benchmark/results-table.tsx
'use client'

import type { ScoreEntry } from './types'

interface ResultsTableProps {
  history: ScoreEntry[]
  unit: string
  best: number
  lowerIsBetter: boolean
  onClear: () => void
}

export function ResultsTable({ history, unit, best, lowerIsBetter, onClear }: ResultsTableProps) {
  if (history.length === 0) return null

  function getStatus(score: number): { label: string; color: string } {
    if (score === best) return { label: 'FASTEST', color: 'text-green-400' }
    // Within 10% of best
    const threshold = lowerIsBetter ? best * 1.1 : best * 0.9
    const isClose = lowerIsBetter ? score <= threshold : score >= threshold
    if (isClose) return { label: 'AVERAGE', color: 'text-slate-400' }
    return { label: 'NORMAL', color: 'text-slate-500' }
  }

  const recent = [...history].reverse().slice(0, 10)

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
          <span>🕐</span> Recent Results
        </h3>
        <button onClick={onClear} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
          Clear History
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">Attempt</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">Score</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest hidden sm:table-cell">Date/Time</th>
              <th className="text-right px-4 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((entry, i) => {
              const status = getStatus(entry.score)
              const attemptNum = history.length - i
              const date = new Date(entry.date)
              const timeAgo = getTimeAgo(date)
              return (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{attemptNum}</td>
                  <td className="px-4 py-3 text-primary font-semibold">{entry.score}{unit}</td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{timeAgo}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${status.color} bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}
```

**Step 4: Create test-view.tsx**

Full test page layout. Per design: sticky nav bar with "Back to dashboard" button, test title + description, game card area, stat cards, results table.

```tsx
// tools/human-benchmark/test-view.tsx
'use client'

import type { ReactNode } from 'react'
import type { TestConfig, TestScore } from './types'
import { StatCards } from './stat-cards'
import { ResultsTable } from './results-table'

interface TestViewProps {
  config: TestConfig
  scores?: TestScore
  children: ReactNode  // The game card content
  onBack: () => void
  onClearHistory: () => void
}

export function TestView({ config, scores, children, onBack, onClearHistory }: TestViewProps) {
  const average = scores && scores.history.length > 0
    ? Math.round(scores.history.reduce((sum, e) => sum + e.score, 0) / scores.history.length)
    : undefined

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1724]">
      {/* Top nav bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-10 py-3 bg-white dark:bg-[#0f1724] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`size-8 rounded-lg flex items-center justify-center ${config.iconBg} ${config.iconColor} dark:${config.iconBg} dark:${config.iconColor}`}>
            {config.icon}
          </div>
          <span className="text-slate-900 dark:text-white font-bold text-sm">Human Benchmark</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary hidden sm:block">Dashboard</button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
          >
            ← Back to dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-10 py-8">
        {/* Test header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{config.name} Test</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{config.description}</p>
        </div>

        {/* Game card area — children rendered here */}
        {children}

        {/* Stats row */}
        <StatCards
          average={average}
          best={scores?.best}
          attempts={scores?.attempts ?? 0}
          unit={config.unit}
        />

        {/* Recent results */}
        {scores && scores.history.length > 0 && (
          <ResultsTable
            history={scores.history}
            unit={config.unit}
            best={scores.best}
            lowerIsBetter={config.lowerIsBetter}
            onClear={onClearHistory}
          />
        )}
      </main>
    </div>
  )
}
```

**Step 5: Create test-card.tsx**

Dashboard card per design. Bordered card (NOT glass morphism), tinted icon box, "LAST SCORE" row, "Start Test" button that turns primary on hover.

```tsx
// tools/human-benchmark/test-card.tsx
'use client'

import type { TestConfig, TestScore } from './types'

interface TestCardProps {
  test: TestConfig
  score?: TestScore
  onClick: () => void
}

export function TestCard({ test, score, onClick }: TestCardProps) {
  return (
    <div className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all hover:border-[var(--tk-color-primary-500)]/50 hover:shadow-xl hover:shadow-[var(--tk-color-primary-500)]/5">
      <div>
        <div className={`${test.iconBgLight} dark:${test.iconBg} ${test.iconColorLight} dark:${test.iconColor} size-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          {test.icon}
        </div>
        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{test.name}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">{test.description}</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest flex justify-between">
          <span>Last Score</span>
          <span className="text-[var(--tk-color-primary-500)]">
            {score ? `${score.best} ${test.unit}` : '—'}
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
```

**Step 6: Commit**

```bash
git add tools/human-benchmark/game-card.tsx tools/human-benchmark/stat-cards.tsx tools/human-benchmark/results-table.tsx tools/human-benchmark/test-view.tsx tools/human-benchmark/test-card.tsx
git commit -m "feat(human-benchmark): add shared UI components matching design mockups"
```

---

### Task 4: Dashboard component

**Files:**
- Create: `tools/human-benchmark/dashboard.tsx`

Per design (screen.png): stats hero card with brain icon + "Human Benchmark" title + stats (tests completed, total attempts), then "Cognitive Assessment Modules" section heading, then 4x2 grid of test cards.

```tsx
// tools/human-benchmark/dashboard.tsx
'use client'

import { TEST_CONFIGS } from './constants'
import { TestCard } from './test-card'
import { useTestScores } from './use-test-scores'
import type { TestId } from './types'

interface DashboardProps {
  onSelectTest: (testId: TestId) => void
}

export function Dashboard({ onSelectTest }: DashboardProps) {
  const { scores } = useTestScores()

  const totalAttempts = Object.values(scores).reduce((sum, s) => sum + s.attempts, 0)
  const testsCompleted = Object.keys(scores).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1724] px-4 md:px-10 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Stats hero card */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex gap-6 items-center">
              <div className="hidden sm:flex relative">
                <div className="size-24 rounded-full border-4 border-[var(--tk-color-primary-500)]/20 flex items-center justify-center">
                  <div className="size-16 rounded-full bg-[var(--tk-color-primary-500)] flex items-center justify-center">
                    {/* Brain icon */}
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold">Human Benchmark</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-1">Cognitive Testing Dashboard</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-col text-center px-4 border-r border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Completed</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{testsCompleted}/8</span>
              </div>
              <div className="flex flex-col text-center px-4">
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Tests</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalAttempts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section heading */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-slate-900 dark:text-white text-xl font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Cognitive Assessment Modules
          </h2>
        </div>

        {/* 4x2 test card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {TEST_CONFIGS.map(test => (
            <TestCard
              key={test.id}
              test={test}
              score={scores[test.id]}
              onClick={() => onSelectTest(test.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Commit:** `feat(human-benchmark): add dashboard component matching design`

---

### Task 5: Route, layout, and tool registry

**Files:**
- Create: `app/tools/human-benchmark/page.tsx`
- Create: `app/tools/human-benchmark/layout.tsx`
- Modify: `lib/tools.tsx` (add entry at end of array)

**Step 1: Create layout.tsx** — NO viewport lock (not full-screen). Standard metadata + JSON-LD + breadcrumbs. Same as previous plan.

**Step 2: Create page.tsx** — State machine. Key change: tests now receive `scores` prop and use `TestView` wrapper.

```tsx
// app/tools/human-benchmark/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { Dashboard } from '@/tools/human-benchmark/dashboard'
import { TEST_CONFIGS } from '@/tools/human-benchmark/constants'
import { useTestScores } from '@/tools/human-benchmark/use-test-scores'
import { TestView } from '@/tools/human-benchmark/test-view'
import { GameCard } from '@/tools/human-benchmark/game-card'
import type { ViewState, TestId } from '@/tools/human-benchmark/types'

// Test component imports
import { ReactionTime } from '@/tools/human-benchmark/tests/reaction-time'
import { SequenceMemory } from '@/tools/human-benchmark/tests/sequence-memory'
import { AimTrainer } from '@/tools/human-benchmark/tests/aim-trainer'
import { NumberMemory } from '@/tools/human-benchmark/tests/number-memory'
import { VerbalMemory } from '@/tools/human-benchmark/tests/verbal-memory'
import { ChimpTest } from '@/tools/human-benchmark/tests/chimp-test'
import { VisualMemory } from '@/tools/human-benchmark/tests/visual-memory'
import { TypingTest } from '@/tools/human-benchmark/tests/typing-test'

const TEST_COMPONENTS: Record<TestId, React.ComponentType<{
  onComplete: (score: number) => void
  onBack: () => void
  bestScore?: number
  gameCard: typeof GameCard
}>> = {
  'reaction-time': ReactionTime,
  'sequence-memory': SequenceMemory,
  'aim-trainer': AimTrainer,
  'number-memory': NumberMemory,
  'verbal-memory': VerbalMemory,
  'chimp-test': ChimpTest,
  'visual-memory': VisualMemory,
  'typing': TypingTest,
}

export default function HumanBenchmarkPage() {
  const [view, setView] = useState<ViewState>('dashboard')
  const { getScore, saveScore, clearHistory } = useTestScores()

  const handleSelectTest = useCallback((testId: TestId) => setView(testId), [])
  const handleBack = useCallback(() => setView('dashboard'), [])

  const handleComplete = useCallback((testId: TestId, score: number) => {
    const config = TEST_CONFIGS.find(t => t.id === testId)
    saveScore(testId, score, config?.lowerIsBetter ?? false)
  }, [saveScore])

  if (view === 'dashboard') {
    return <Dashboard onSelectTest={handleSelectTest} />
  }

  const config = TEST_CONFIGS.find(t => t.id === view)!
  const testScore = getScore(view)
  const TestComponent = TEST_COMPONENTS[view]

  return (
    <TestView
      config={config}
      scores={testScore}
      onBack={handleBack}
      onClearHistory={() => clearHistory(view)}
    >
      <TestComponent
        onComplete={(score) => handleComplete(view, score)}
        onBack={handleBack}
        bestScore={testScore?.best}
        gameCard={GameCard}
      />
    </TestView>
  )
}
```

**Step 3: Add to tool registry** — same brain icon SVG as previous plan.

**Step 4: Commit:** `feat(human-benchmark): add page route, layout, and tool registry`

---

### Task 6: Reaction Time test

**Files:** `tools/human-benchmark/tests/reaction-time.tsx`

Key change: renders GameCard instead of full-screen TestWrapper. Game states (waiting/ready/too-early/result) render **inside** the GameCard. The TestView wrapper (nav, stats, history) is provided by page.tsx.

Per design (screen_1.png):
- Red game card with "WAIT FOR GREEN" text + "CLICKING TOO EARLY RESULTS IN A PENALTY" subtext
- Attempt badge "ATTEMPT 4/5" in top-right of game card
- Green game card with "CLICK!" when ready
- Result shown in game card after 5 rounds

```tsx
interface Props {
  onComplete: (score: number) => void
  onBack: () => void
  bestScore?: number
  gameCard: typeof GameCard
}

export function ReactionTime({ onComplete, bestScore, gameCard: GC }: Props) {
  // ... same state logic as before

  // Renders game content inside GC (GameCard) — NOT full-screen
  // GC receives bgColor and badge props

  if (phase === 'intro') {
    return (
      <GC bgColor={config.gameBgColor}>
        {/* Centered intro: icon + "Click to start" */}
      </GC>
    )
  }

  return (
    <GC bgColor={bgColor} badge={`ATTEMPT ${attempt}/5`}>
      <div onClick={handleClick} className="...">
        {/* waiting / ready / too-early / result content */}
      </div>
    </GC>
  )
}
```

**Commit:** `feat(human-benchmark): add reaction time test`

---

### Task 7: Sequence Memory test

**Files:** `tools/human-benchmark/tests/sequence-memory.tsx`

Same game logic as before but rendered inside GameCard. Grid centered in the card.

**Commit:** `feat(human-benchmark): add sequence memory test`

---

### Task 8: Aim Trainer test

**Files:** `tools/human-benchmark/tests/aim-trainer.tsx`

Same logic but GameCard wraps the play area. Remaining counter as badge.

**Commit:** `feat(human-benchmark): add aim trainer test`

---

### Task 9: Number Memory test

**Files:** `tools/human-benchmark/tests/number-memory.tsx`

Same logic. Number display + input field inside GameCard.

**Commit:** `feat(human-benchmark): add number memory test`

---

### Task 10: Verbal Memory test

**Files:** `tools/human-benchmark/tests/verbal-memory.tsx`

Same logic. Word + SEEN/NEW buttons inside GameCard. Lives as badge.

**Commit:** `feat(human-benchmark): add verbal memory test`

---

### Task 11: Chimp Test

**Files:** `tools/human-benchmark/tests/chimp-test.tsx`

Same logic. Numbered grid inside GameCard. Strikes as badge.

**Commit:** `feat(human-benchmark): add chimp test`

---

### Task 12: Visual Memory test

**Files:** `tools/human-benchmark/tests/visual-memory.tsx`

Same logic. Grid inside GameCard. Lives as badge.

**Commit:** `feat(human-benchmark): add visual memory test`

---

### Task 13: Typing Test

**Files:** `tools/human-benchmark/tests/typing-test.tsx`

Same logic. Passage + hidden input inside GameCard. WPM counter as badge.

**Commit:** `feat(human-benchmark): add typing test`

---

### Task 14: Verify build compiles

**Step 1:** `pnpm build` — fix any TypeScript errors
**Step 2:** `pnpm dev` — visit `/tools/human-benchmark`, verify:
- Dashboard matches design (bordered cards, tinted icons, "Start Test" buttons, "LAST SCORE" row)
- Test view has nav bar with "Back to dashboard", game card, stat cards, results table
- Game card background changes color per test state
- Stats update after completing a test
- Results table shows history with time ago + status badges
- Scores persist after refresh
**Step 3:** Commit fixes

---

### Task 15: E2E tests

**Files:** `e2e/human-benchmark.spec.ts`

Tests updated to match new UI:
- Dashboard: check "Start Test" buttons, "Cognitive Assessment Modules" heading
- Test view: check "Back to dashboard" button, test title, game card
- Navigation: "Back to dashboard" returns to dashboard
- Score persistence: complete a test flow (verbal memory is easiest to automate), check stats appear

```typescript
test.describe('Human Benchmark - Dashboard', () => {
  test('renders dashboard with all 8 test cards', async ({ page }) => {
    await page.goto('/tools/human-benchmark')
    await expect(page.getByText('Cognitive Assessment Modules')).toBeVisible()
    await expect(page.getByText('Reaction Time')).toBeVisible()
    // ... all 8 tests
    const buttons = page.getByRole('button', { name: 'Start Test' })
    await expect(buttons).toHaveCount(8)
  })
})

test.describe('Human Benchmark - Test View', () => {
  test('reaction time shows game card with waiting state', async ({ page }) => {
    await page.goto('/tools/human-benchmark')
    await page.getByText('Reaction Time').closest('[class*="group"]')!
      .getByRole('button', { name: 'Start Test' }).click()
    await expect(page.getByText('Reaction Time Test')).toBeVisible()
    await expect(page.getByText('Back to dashboard')).toBeVisible()
  })

  test('back to dashboard returns from test view', async ({ page }) => {
    await page.goto('/tools/human-benchmark')
    await page.getByText('Reaction Time').closest('[class*="group"]')!
      .getByRole('button', { name: 'Start Test' }).click()
    await page.getByText('Back to dashboard').click()
    await expect(page.getByText('Cognitive Assessment Modules')).toBeVisible()
  })
})
```

**Commit:** `test(human-benchmark): add E2E tests`

---

### Task 16: Final review and cleanup

**Step 1:** `pnpm build`
**Step 2:** `pnpm test:e2e`
**Step 3:** Browser verification:
- `/tools` listing — "Human Benchmark" card appears
- Dashboard matches design mockup (screen.png)
- Test view matches design mockup (screen_1.png)
- Mobile viewport (375px) — cards stack, nav responsive
- Dark mode — all components themed
**Step 4:** Final commit
