'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'
import { INDUSTRIES, WORKPLACE_QUESTIONS } from './industry-data'
import { generatePlanPdf } from './pdf-plan'
import type { IndustryId, PlanData } from './types'

type Step = 'industry' | 'questions' | 'preview'

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
}

function GoogleSignInModal({ onSignIn, onClose }: { onSignIn: () => void; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4">
        <h2 id="signin-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white text-center">
          Sign in to download your H&S Plan
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Sign in to download your PDF and save your progress.
        </p>
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
        <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  )
}

export default function PlanGenerator() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('industry')
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [showSignIn, setShowSignIn] = useState(false)

  const filteredQuestions = WORKPLACE_QUESTIONS.filter(
    (q) => selectedIndustry && q.industries.includes(selectedIndustry)
  )

  const allAnswered = filteredQuestions.every((q) => q.id in answers)

  const handleDownload = useCallback(() => {
    if (!user) {
      setShowSignIn(true)
      return
    }
    if (!selectedIndustry) return
    const planData: PlanData = {
      industry: selectedIndustry,
      businessName,
      questions: answers,
    }
    generatePlanPdf(planData, INDUSTRIES.find(i => i.id === selectedIndustry)?.name || selectedIndustry)
  }, [user, selectedIndustry, businessName, answers])

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signInWithOAuth('google')
    } catch {
      // Silently ignore
    }
  }, [])

  const planSections = [
    { title: 'Purpose & Commitment', done: true },
    { title: 'Scope & Applicability', done: true },
    { title: 'Policy Statements', done: true },
    { title: 'Industry Hazard Overview', done: !!selectedIndustry },
    { title: 'Emergency Procedures', done: true },
    { title: 'Incident Reporting Process', done: answers['incident_reporting'] === true },
    { title: 'Worker Engagement', done: answers['regular_reviews'] === true },
    { title: 'Plan Review Schedule', done: true },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step: Industry Selection */}
      {step === 'industry' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Step 1 of 3 — Select Your Industry
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose the industry that best matches your workplace. This tailors the plan to your sector.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Business Name (optional)
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Kiwi Constructions Ltd"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`card-bg border rounded-xl p-4 text-left transition-all hover:card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] min-h-[44px] ${
                  selectedIndustry === industry.id
                    ? 'ring-2 ring-[#3D6AF2] border-[#3D6AF2]/50'
                    : 'border-slate-200 dark:border-white/10'
                }`}
                aria-pressed={selectedIndustry === industry.id}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-2xl" aria-hidden="true">{industry.icon}</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">{industry.name}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{industry.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep('questions')}
            disabled={!selectedIndustry}
            className="self-end px-6 py-3 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2"
          >
            Next: Workplace Questions →
          </button>
        </div>
      )}

      {/* Step: Questions */}
      {step === 'questions' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('industry')}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors min-h-[44px] px-2"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Step 2 of 3 — Workplace Questions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Answer yes or no for each question. This generates your personalised plan.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="card-bg border border-slate-200 dark:border-white/10 rounded-xl p-4"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  <span className="text-slate-400 dark:text-slate-500 mr-2">{idx + 1}.</span>
                  {q.question}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: true }))}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] ${
                      answers[q.id] === true
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}
                    aria-pressed={answers[q.id] === true}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: false }))}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] ${
                      answers[q.id] === false
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                    }`}
                    aria-pressed={answers[q.id] === false}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              {Object.keys(answers).length} / {filteredQuestions.length} answered
            </span>
            <button
              onClick={() => setStep('preview')}
              disabled={!allAnswered}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2"
            >
              Preview Plan →
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && selectedIndustry && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('questions')}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors min-h-[44px] px-2"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Step 3 of 3 — Your H&S Plan
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Review your plan sections below, then download as PDF.
              </p>
            </div>
          </div>

          {/* Plan preview card */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
            {/* Plan header */}
            <div className="bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] px-6 py-5">
              <h3 className="text-lg font-bold text-white">
                Health & Safety Management Plan
              </h3>
              <p className="text-sm text-blue-100 mt-0.5">
                {businessName.trim() || 'Your Business'} &mdash;{' '}
                {INDUSTRIES.find((i) => i.id === selectedIndustry)?.name}
              </p>
            </div>

            {/* Sections list */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {planSections.map((section) => (
                <div key={section.title} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      section.done
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                    }`}
                    aria-hidden="true"
                  >
                    {section.done ? '✓' : '○'}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{section.title}</span>
                  {!section.done && (
                    <span className="ml-auto text-xs text-amber-500 dark:text-amber-400">Partial</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Risk summary from answers */}
          {filteredQuestions.filter((q) => answers[q.id] === false).length > 0 && (
            <div className="border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
                Priority Actions in Your Plan
              </p>
              <ul className="flex flex-col gap-1.5">
                {filteredQuestions
                  .filter((q) => answers[q.id] === false)
                  .map((q) => (
                    <li key={q.id} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                      <span aria-hidden="true" className="mt-0.5">⚠</span>
                      {q.question}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#32A9D9] text-white font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF Plan
            {!user && <span className="text-xs opacity-80">(sign in required)</span>}
          </button>
        </div>
      )}

      {showSignIn && (
        <GoogleSignInModal
          onSignIn={handleGoogleSignIn}
          onClose={() => setShowSignIn(false)}
        />
      )}
    </div>
  )
}
