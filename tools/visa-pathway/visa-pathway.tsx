'use client'

import { useState } from 'react'
import { ToolFrame } from '@/components/layout/tool-frame'
import { QUIZ_QUESTIONS } from './quiz-data'
import { matchPathways, calculatePoints } from './pathway-matcher'
import PathwayCard from './pathway-card'
import type { QuizAnswers, PathwayMatch, PointsBreakdown } from './types'

const GLOBE_ICON = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
)

export default function VisaPathway() {
  const [step, setStep] = useState<'quiz' | 'results'>('quiz')
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [pathways, setPathways] = useState<PathwayMatch[]>([])
  const [pointsBreakdown, setPointsBreakdown] = useState<PointsBreakdown | null>(null)
  const [showUnlikely, setShowUnlikely] = useState(false)

  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined)

  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleSubmit() {
    const matched = matchPathways(answers)
    const breakdown = calculatePoints(answers)
    setPathways(matched)
    setPointsBreakdown(breakdown)
    setStep('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const strongAndPossible = pathways.filter((p) => p.matchLevel !== 'unlikely')
  const unlikely = pathways.filter((p) => p.matchLevel === 'unlikely')

  if (step === 'results') {
    return (
      <ToolFrame
        toolName="Visa Pathway Finder"
        toolSlug="visa-pathway"
        category="utility"
        icon={GLOBE_ICON}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Your Immigration Pathways
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Based on your answers, here are the visa pathways most relevant to you.
            </p>
          </div>

          {/* Match legend */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              Strong Match
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Possible Match
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
              Unlikely
            </span>
          </div>

          {/* Strong + possible cards */}
          <div className="space-y-4">
            {strongAndPossible.map((pathway) => (
              <PathwayCard
                key={pathway.id}
                pathway={pathway}
                answers={answers}
                pointsBreakdown={pathway.id === 'smc' ? pointsBreakdown : null}
              />
            ))}
          </div>

          {/* Unlikely section */}
          {unlikely.length > 0 && (
            <div>
              <button
                onClick={() => setShowUnlikely((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 min-h-[44px] transition-colors"
                aria-expanded={showUnlikely}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showUnlikely ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showUnlikely ? 'Hide' : 'Show'} {unlikely.length} unlikely pathway{unlikely.length !== 1 ? 's' : ''}
              </button>

              {showUnlikely && (
                <div className="space-y-4 mt-3 opacity-60">
                  {unlikely.map((pathway) => (
                    <PathwayCard
                      key={pathway.id}
                      pathway={pathway}
                      answers={answers}
                      pointsBreakdown={pathway.id === 'smc' ? pointsBreakdown : null}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit answers */}
          <div className="pt-2">
            <button
              onClick={() => {
                setStep('quiz')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline min-h-[44px] flex items-center"
            >
              ← Edit Answers
            </button>
          </div>

          {/* Disclaimer footer */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer</p>
            <p>
              This tool provides general guidance only and does not constitute immigration advice.
              Always consult a licensed immigration adviser or lawyer before making any immigration decision.
            </p>
            <a
              href="https://www.immigration.govt.nz/about-us/identity-and-values/immigration-advisers-licensing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Find a licensed adviser at the Immigration Advisers Authority
            </a>
          </div>
        </div>
      </ToolFrame>
    )
  }

  return (
    <ToolFrame
      toolName="Visa Pathway Finder"
      toolSlug="visa-pathway"
      category="utility"
      icon={GLOBE_ICON}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Disclaimer banner */}
        <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 rounded-r-lg">
          <strong>Disclaimer:</strong> This tool provides general guidance only. It is not immigration
          advice. Consult a licensed immigration adviser before making decisions.
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((question, index) => (
            <fieldset key={question.id}>
              <legend className="w-full">
                <div className="flex items-start gap-3 mb-3">
                  <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    Q{index + 1}
                  </span>
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-0.5">
                    {question.question}
                  </span>
                </div>
              </legend>
              <div className="space-y-2 pl-10">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={`w-full min-h-[44px] text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        selected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      aria-pressed={selected}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-2 pb-6">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full min-h-[48px] py-3 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Find My Pathways
          </button>
          {!allAnswered && (
            <p className="mt-2 text-xs text-center text-slate-400">
              Please answer all {QUIZ_QUESTIONS.length} questions to continue.
            </p>
          )}
        </div>
      </div>
    </ToolFrame>
  )
}
