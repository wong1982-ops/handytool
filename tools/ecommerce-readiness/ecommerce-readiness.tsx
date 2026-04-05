'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolFrame } from '@/components/layout/tool-frame'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { calculateScores } from './scoring'
import { QuizWizard } from './quiz-wizard'
import { ResultsView } from './results-view'
import { RoadmapView } from './roadmap-view'
import { generatePdf } from './pdf-export'
import { ROADMAP_ITEMS } from './roadmap-data'
import type { WizardStep, UserAnswers, AssessmentResult } from './types'

const ShoppingCartIcon = (
  <svg
    className="w-12 h-12 text-[#3D6AF2]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
)

const ShoppingCartIconSmall = (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
)

const FEATURE_PILLS = [
  { icon: '📊', label: 'Score' },
  { icon: '🛒', label: 'Platform Match' },
  { icon: '💰', label: 'Cost Estimate' },
  { icon: '📋', label: 'Action Plan' },
]

export default function EcommerceReadiness() {
  const { user } = useAuth()
  const [step, setStep] = useState<WizardStep>('welcome')
  const [answers, setAnswers] = useState<UserAnswers>({})
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [roadmapProgress, setRoadmapProgress] = useState<Record<string, boolean>>({})
  const [showSignIn, setShowSignIn] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQuizComplete = useCallback(
    async (completedAnswers: UserAnswers) => {
      const scores = calculateScores(completedAnswers)
      setAnswers(completedAnswers)
      setResult(scores)
      setStep('results')

      if (user) {
        // Fire-and-forget — save assessment to API
        fetch('/api/v1/ecommerce-readiness/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: completedAnswers, result: scores }),
        }).catch(() => {
          // Silently ignore — non-critical
        })
      }
    },
    [user]
  )

  const handleToggleItem = useCallback(
    (id: string) => {
      setRoadmapProgress((prev) => {
        const next = { ...prev, [id]: !prev[id] }

        if (user) {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            fetch('/api/v1/ecommerce-readiness/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ progress: next }),
            }).catch(() => {
              // Silently ignore — non-critical
            })
          }, 800)
        }

        return next
      })
    },
    [user]
  )

  const handleExportPdf = useCallback(() => {
    if (!user) {
      setShowSignIn(true)
      return
    }

    if (!result) return

    const filteredRoadmapItems = ROADMAP_ITEMS.filter(
      (item) => result.overallScore < item.triggerBelow
    )
    generatePdf(result, filteredRoadmapItems)
  }, [user, result])

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signInWithOAuth('google')
    } catch {
      // Silently ignore — user can retry
    }
  }, [])

  return (
    <ToolFrame
      toolName="E-commerce Readiness"
      toolSlug="ecommerce-readiness"
      category="utility"
      icon={ShoppingCartIconSmall}
    >
      {/* Welcome step */}
      {step === 'welcome' && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-xl w-full text-center flex flex-col items-center gap-6 px-4">
            {ShoppingCartIcon}

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Is your business ready to sell online?
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Answer a few quick questions and get a personalised e-commerce readiness score,
              platform recommendation, cost estimate, and step-by-step launch plan — tailored
              for NZ small businesses.
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {FEATURE_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  <span aria-hidden="true">{pill.icon}</span>
                  {pill.label}
                </span>
              ))}
            </div>

            <button
              onClick={() => setStep('quiz')}
              className="w-full max-w-sm py-3 px-6 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] text-white font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2 min-h-[44px]"
            >
              Start Assessment
            </button>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              Free &middot; No credit card &middot; Takes 5 minutes
            </p>
          </div>
        </div>
      )}

      {/* Quiz step */}
      {step === 'quiz' && (
        <QuizWizard
          onComplete={handleQuizComplete}
          onBack={() => setStep('welcome')}
        />
      )}

      {/* Results step */}
      {step === 'results' && result && (
        <ResultsView
          result={result}
          onViewRoadmap={() => setStep('roadmap')}
          onExportPdf={handleExportPdf}
          isAuthenticated={!!user}
        />
      )}

      {/* Roadmap step */}
      {step === 'roadmap' && result && (
        <RoadmapView
          result={result}
          answers={answers}
          progress={roadmapProgress}
          onToggleItem={handleToggleItem}
          onExportPdf={handleExportPdf}
          onBack={() => setStep('results')}
        />
      )}

      {/* Sign-in modal */}
      {showSignIn && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSignIn(false)
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
            <h2
              id="signin-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-white text-center"
            >
              Sign in to download your report
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Sign in to download your PDF report and save your progress across sessions.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => setShowSignIn(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </ToolFrame>
  )
}
