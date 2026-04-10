'use client'

import { useState, useCallback } from 'react'
import { TarotProject, DEFAULT_PROJECT, WizardStep } from '@/tools/tarot/tarot-types'
import { QuestionStep } from '@/tools/tarot/question-step'
import { SpreadStep } from '@/tools/tarot/spread-step'
import { ReadingTheater } from '@/tools/tarot/reading-theater'
import { HistoryTab } from '@/tools/tarot/history-tab'
import { en } from '@/tools/tarot/i18n/en'
import { zh } from '@/tools/tarot/i18n/zh'
import type { I18nStrings } from '@/tools/tarot/i18n/en'

type Tab = 'create' | 'history'

const STEPS: WizardStep[] = [1, 2, 3]

export default function TarotWizard() {
  const [project, setProject] = useState<TarotProject>(DEFAULT_PROJECT)
  const [activeTab, setActiveTab] = useState<Tab>('create')

  const t: I18nStrings = project.language === 'zh' ? zh : en

  const STEP_LABELS = [t.steps.question, t.steps.spread, t.steps.reading]
  const STEP_SUBTITLES: Record<WizardStep, string> = {
    1: t.stepSubtitles.question,
    2: t.stepSubtitles.spread,
    3: t.stepSubtitles.reading,
  }

  /* ---- Callbacks ---- */

  const handleBack = useCallback(() => {
    setProject((p) => {
      if (p.step <= 1) return p
      return { ...p, step: (p.step - 1) as WizardStep, error: null }
    })
  }, [])

  const handleStartOver = useCallback(() => {
    setProject({ ...DEFAULT_PROJECT, language: project.language })
    setActiveTab('create')
  }, [project.language])

  const handleLanguageToggle = useCallback(() => {
    setProject((p) => ({ ...p, language: p.language === 'en' ? 'zh' : 'en' }))
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title + language toggle */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white text-center tracking-tight">
          Tarot{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400">
            Reading
          </span>
        </h1>
        <button
          type="button"
          onClick={handleLanguageToggle}
          className="shrink-0 rounded-lg border border-slate-200 dark:border-[#1e2631] px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-[#a6abb5] hover:bg-slate-50 dark:hover:bg-[#131a23] transition-colors cursor-pointer min-h-[44px] flex items-center"
        >
          {project.language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-[#a6abb5] text-center max-w-sm mx-auto mb-6">
        {activeTab === 'history' ? t.tabs.history : STEP_SUBTITLES[project.step]}
      </p>

      {/* Tab toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-50 dark:bg-[#131a23] rounded-xl p-1 flex gap-1 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg'
                : 'text-slate-400 dark:text-[#70767f] hover:text-white'
            }`}
          >
            {t.tabs.create}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow-lg'
                : 'text-slate-400 dark:text-[#70767f] hover:text-white'
            }`}
          >
            {t.tabs.history}
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <HistoryTab language={project.language} />
      ) : (
        <>
          {/* Step indicator — Desktop */}
          <nav aria-label="Wizard progress" className="mb-10">
            <ol className="hidden sm:flex items-center justify-center gap-0">
              {STEPS.map((s, i) => {
                const isCompleted = s < project.step
                const isCurrent = s === project.step
                return (
                  <li key={s} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-purple-500 border-purple-500'
                            : isCurrent
                            ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                            : 'border-slate-200 dark:border-[#1e2631] bg-transparent'
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-purple-500' : 'text-slate-400 dark:text-[#70767f]'
                            }`}
                          >
                            {s}
                          </span>
                        )}
                      </div>
                      <span
                        className={`mt-1.5 text-[11px] font-medium transition-colors ${
                          isCompleted || isCurrent
                            ? 'text-slate-500 dark:text-[#a6abb5]'
                            : 'text-slate-400 dark:text-[#70767f]'
                        }`}
                      >
                        {STEP_LABELS[i]}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-12 lg:w-20 h-0.5 mx-2 rounded-full transition-colors duration-300 ${
                          s < project.step ? 'bg-purple-500' : 'bg-slate-200 dark:bg-[#1e2631]'
                        }`}
                      />
                    )}
                  </li>
                )
              })}
            </ol>

            {/* Step indicator — Mobile */}
            <div className="flex sm:hidden items-center justify-center gap-1.5">
              {STEPS.map((s, i) => {
                const isCompleted = s < project.step
                const isCurrent = s === project.step
                return (
                  <div key={s} className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        isCompleted
                          ? 'bg-purple-500 text-white'
                          : isCurrent
                          ? 'bg-purple-500/15 text-purple-500 ring-1 ring-purple-500/30'
                          : 'bg-slate-50 dark:bg-[#131a23] text-slate-400 dark:text-[#70767f]'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{s}</span>
                      )}
                      {isCurrent && <span>{STEP_LABELS[i]}</span>}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-3 h-0.5 rounded-full ${
                          s < project.step ? 'bg-purple-500' : 'bg-slate-200 dark:bg-[#1e2631]'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Error banner */}
          {project.error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {project.error}
            </div>
          )}

          {/* Step content */}
          <div id="wizard-content" style={{ scrollMarginTop: '80px' }}>
            {project.step === 1 && (
              <QuestionStep project={project} setProject={setProject} t={t} />
            )}
            {project.step === 2 && (
              <SpreadStep project={project} setProject={setProject} t={t} onBack={handleBack} />
            )}
            {project.step === 3 && (
              <ReadingTheater
                project={project}
                setProject={setProject}
                t={t}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
