'use client'

import { useState, useEffect } from 'react'
import type { JobProgress } from '@/tools/story-studio/use-job-progress'
import { useLanguage } from '@/tools/story-studio/use-language-context'

export interface MobileProgressProps {
  jobProgress: JobProgress | null
  onBackground: () => void
}

// Step order for status determination
const STEP_ORDER = [
  'story_bible',
  'story_draft',
  'validate',
  'character_ref',
  'cover',
  'illustrate_page',
  'tts_page',
  'save',
  'done',
] as const

// Pipeline groups: icon + zh label + en label + matched steps
const PIPELINE_GROUPS = [
  {
    icon: '📖',
    labelZh: '写故事',
    labelEn: 'Write Story',
    steps: ['story_bible', 'story_draft', 'validate'] as string[],
  },
  {
    icon: '🎨',
    labelZh: '画插画',
    labelEn: 'Illustrate',
    steps: ['character_ref', 'cover', 'illustrate_page'] as string[],
  },
  {
    icon: '🎙',
    labelZh: '录配音',
    labelEn: 'Narrate',
    steps: ['tts_page'] as string[],
  },
]

type StepStatus = 'done' | 'active' | 'pending'

function getGroupStatus(currentStep: string, groupSteps: string[]): StepStatus {
  const currentIdx = STEP_ORDER.indexOf(currentStep as typeof STEP_ORDER[number])
  const firstGroupIdx = STEP_ORDER.indexOf(groupSteps[0] as typeof STEP_ORDER[number])
  const lastGroupIdx = STEP_ORDER.indexOf(groupSteps[groupSteps.length - 1] as typeof STEP_ORDER[number])

  if (currentIdx < 0) return 'pending'
  if (currentIdx > lastGroupIdx) return 'done'
  if (currentIdx >= firstGroupIdx) return 'active'
  return 'pending'
}

export default function MobileProgress({ jobProgress, onBackground }: MobileProgressProps) {
  const { t, language } = useLanguage()
  const [tipIndex, setTipIndex] = useState(0)

  // Rotate fun tips every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % t.progress.funTips.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [t.progress.funTips.length])

  // Gracefully handle null jobProgress
  const percent = jobProgress?.percent ?? 5
  const label = jobProgress?.label ?? t.progress.starting
  const currentStep = jobProgress?.job.current_step ?? ''
  const isFailed = jobProgress?.job.status === 'failed'
  const totalPages = jobProgress?.job.total_pages ?? 0
  const pagesCompleted = jobProgress?.job.pages_completed ?? 0

  return (
    <div
      className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col items-center justify-center px-6 py-8"
      role="main"
      aria-live="polite"
      aria-label={isFailed ? t.progress.generationFailed : t.progress.castingASpell}
    >
      {/* Magic animation — 96x96 circle */}
      <div className="relative w-24 h-24 mb-6 flex-shrink-0">
        {/* Conic-gradient glow ring */}
        <div
          className={`absolute inset-0 rounded-full ${isFailed ? 'animate-none opacity-30' : 'animate-[mobile-orb-pulse_3s_ease-in-out_infinite]'}`}
          style={{
            background: isFailed
              ? 'conic-gradient(from 0deg, #ef4444, #f97316, #ef4444)'
              : 'conic-gradient(from 0deg, #fbbf24, #a78bfa, #818cf8, #3D6AF2, #a78bfa, #fbbf24)',
            filter: 'blur(10px)',
            opacity: 0.5,
          }}
        />
        {/* Inner dark circle */}
        <div
          className={`absolute inset-2.5 rounded-full flex items-center justify-center shadow-2xl ${
            isFailed
              ? 'bg-red-950'
              : 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900'
          }`}
        >
          {/* Bouncing sparkle SVG icon */}
          {isFailed ? (
            <svg
              className="w-9 h-9 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          ) : (
            <svg
              className="w-9 h-9 text-amber-300 drop-shadow-lg animate-[mobile-sparkle-bounce_1.8s_ease-in-out_infinite]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          )}
        </div>
      </div>

      {/* Status heading */}
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
        {isFailed ? t.progress.generationFailed : (language === 'zh' ? '正在创作你的故事...' : t.progress.castingASpell)}
      </h1>

      {/* Rotating fun tip */}
      {!isFailed && (
        <p
          className="text-sm text-amber-600 dark:text-amber-400 italic mb-1 text-center h-5 transition-opacity duration-300"
          aria-live="off"
        >
          {t.progress.funTips[tipIndex]}
        </p>
      )}

      {/* Substatus */}
      {!isFailed && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-5 text-center">
          {t.progress.storyReadyInMoment}
        </p>
      )}

      {isFailed && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 text-center">
          {t.progress.somethingWentWrong}
        </p>
      )}

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-1.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{percent}%</span>
        </div>
        <div
          className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: isFailed
                ? '#ef4444'
                : 'linear-gradient(90deg, #3D6AF2, #a855f7)',
            }}
          />
        </div>
      </div>

      {/* Step breakdown */}
      <div className="w-full max-w-xs mt-4 mb-6 space-y-2">
        {PIPELINE_GROUPS.map(group => {
          const status = isFailed ? 'pending' : getGroupStatus(currentStep, group.steps)
          const isIllustrating = status === 'active' && group.steps.includes('illustrate_page') && currentStep === 'illustrate_page'
          const groupLabel = language === 'zh' ? group.labelZh : group.labelEn

          return (
            <div
              key={group.labelEn}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">{group.icon}</span>
                <span className={`text-sm font-medium ${
                  status === 'active'
                    ? 'text-[#3D6AF2] dark:text-indigo-400'
                    : status === 'done'
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {groupLabel}
                </span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1">
                {status === 'done' && (
                  <span className="text-sm" aria-label="done">✅</span>
                )}
                {status === 'active' && (
                  <span className="flex items-center gap-1">
                    {isIllustrating && totalPages > 0 && (
                      <span className="text-xs text-[#3D6AF2] dark:text-indigo-400 font-medium">
                        {pagesCompleted}/{totalPages}
                      </span>
                    )}
                    <span className="text-sm" aria-label="in progress">⏳</span>
                  </span>
                )}
                {status === 'pending' && (
                  <span className="text-sm text-slate-300 dark:text-slate-600" aria-label="pending">○</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Background button */}
      <button
        onClick={onBackground}
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded"
        style={{ minHeight: '44px' }}
        type="button"
      >
        {language === 'zh' ? '在后台继续' : 'Continue in background'}
      </button>

      <style jsx>{`
        @keyframes mobile-orb-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 0.7; }
        }
        @keyframes mobile-sparkle-bounce {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-5px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
