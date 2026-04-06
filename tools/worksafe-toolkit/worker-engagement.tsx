'use client'

import { useState } from 'react'
import { ENGAGEMENT_ITEMS } from './industry-data'
import type { EngagementStatus } from './types'

type Answers = Record<string, EngagementStatus>

const PILL_CONFIG: { value: EngagementStatus; label: string; activeClass: string }[] = [
  { value: 'yes', label: 'Yes', activeClass: 'bg-green-500 text-white' },
  { value: 'partially', label: 'Partially', activeClass: 'bg-amber-500 text-white' },
  { value: 'no', label: 'No', activeClass: 'bg-red-500 text-white' },
]

const POINTS: Record<NonNullable<EngagementStatus>, number> = {
  yes: 10,
  partially: 5,
  no: 0,
}

function ScoreCircle({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? score / max : 0
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - pct)

  const colorClass =
    pct >= 0.75 ? 'text-green-500' : pct >= 0.45 ? 'text-amber-500' : 'text-red-500'
  const strokeColor =
    pct >= 0.75 ? '#22c55e' : pct >= 0.45 ? '#f59e0b' : '#ef4444'

  const label = pct >= 0.75 ? 'Strong' : pct >= 0.45 ? 'Developing' : 'Needs Work'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28" role="img" aria-label={`Engagement score ${score} out of ${max}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-white/10"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold tabular-nums ${colorClass}`}>{score}</span>
          <span className="text-xs text-slate-400">/ {max}</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${colorClass}`}>{label}</span>
    </div>
  )
}

export default function WorkerEngagement() {
  const [answers, setAnswers] = useState<Answers>({})

  const totalAnswered = Object.values(answers).filter((v) => v !== null).length
  const totalItems = ENGAGEMENT_ITEMS.length
  const maxScore = totalAnswered * 10
  const actualScore = Object.values(answers).reduce<number>((sum, v) => {
    if (v === null || v === undefined) return sum
    return sum + POINTS[v]
  }, 0)
  const displayScore = totalAnswered > 0 ? Math.round((actualScore / (totalItems * 10)) * 100) : 0
  const displayMax = 100

  const needsAttention = ENGAGEMENT_ITEMS.filter(
    (item) => answers[item.id] === 'no' || answers[item.id] === 'partially'
  )

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header + score */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Worker Engagement Checklist
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Assess how well your business engages workers on Health & Safety matters under the Health and Safety at Work Act 2015.
          </p>
        </div>
        {totalAnswered > 0 && (
          <div className="shrink-0">
            <ScoreCircle score={displayScore} max={displayMax} />
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {totalAnswered > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] transition-all"
              style={{ width: `${(totalAnswered / totalItems) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 shrink-0">
            {totalAnswered}/{totalItems} answered
          </span>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-4">
        {ENGAGEMENT_ITEMS.map((item, idx) => {
          const answer = answers[item.id] ?? null
          const showRecommendation = answer === 'no' || answer === 'partially'
          return (
            <div
              key={item.id}
              className="card-bg border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3"
            >
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                <span className="text-slate-400 dark:text-slate-500 mr-2">{idx + 1}.</span>
                {item.question}
              </p>
              <div className="flex gap-2 flex-wrap" role="group" aria-label={`Answer for: ${item.question}`}>
                {PILL_CONFIG.map(({ value, label, activeClass }) => (
                  <button
                    key={value}
                    onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: value }))}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] ${
                      answer === value
                        ? activeClass
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}
                    aria-pressed={answer === value}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {showRecommendation && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    {item.recommendation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {totalAnswered === totalItems && (
        <div className="border border-slate-200 dark:border-white/10 rounded-xl p-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
            Assessment Summary
          </h3>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Score</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{displayScore}<span className="text-sm font-normal text-slate-400">/100</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Items Passing</span>
              <span className="text-2xl font-bold text-green-500">
                {Object.values(answers).filter((v) => v === 'yes').length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Partial</span>
              <span className="text-2xl font-bold text-amber-500">
                {Object.values(answers).filter((v) => v === 'partially').length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Gaps</span>
              <span className="text-2xl font-bold text-red-500">
                {Object.values(answers).filter((v) => v === 'no').length}
              </span>
            </div>
          </div>

          {needsAttention.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Priority Improvement Areas
              </p>
              <ul className="flex flex-col gap-1.5">
                {needsAttention.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span
                      className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        answers[item.id] === 'no'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                      aria-hidden="true"
                    >
                      {answers[item.id] === 'no' ? '✗' : '~'}
                    </span>
                    {item.question}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            This is a self-assessment tool for guidance only. For definitive compliance advice, consult WorkSafe NZ or a qualified H&S professional.
          </p>
        </div>
      )}
    </div>
  )
}
