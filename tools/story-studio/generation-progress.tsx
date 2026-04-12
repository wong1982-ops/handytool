'use client'

import { useState, useEffect } from 'react'
import type { ProgressEvent } from './types'
import { useLanguage } from '@/tools/story-studio/use-language-context'

interface GenerationProgressProps {
  events: ProgressEvent[]
  totalPages: number | null
  /** If set, generation is running in background via job queue */
  activeJobId?: string | null
  /** Story mode — affects UI (speed shows spell animation) */
  mode?: 'speed' | 'professional'
}

function SpellAnimation({ jobId: _jobId }: { jobId: string }) {
  const { t } = useLanguage()
  const [msgIndex, setMsgIndex] = useState(0)

  // Rotate fun messages
  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % t.progress.spellMessages.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [t.progress.spellMessages.length])

  return (
    <div className="max-w-sm mx-auto text-center py-10 md:py-14">
      {/* Sparkle wand animation */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full animate-[spell-glow_2s_ease-in-out_infinite]" style={{
          background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24, #fde68a, #fbbf24)',
          filter: 'blur(16px)',
          opacity: 0.5,
        }} />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-950 shadow-2xl flex items-center justify-center">
          <svg className="w-12 h-12 text-amber-300 drop-shadow-lg animate-[wand-wave_1.5s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        {/* Floating sparkles */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-[sparkle_2s_ease-in-out_infinite_0.2s] opacity-0" />
        <div className="absolute top-2 -left-2 w-2 h-2 rounded-full bg-yellow-300 animate-[sparkle_2s_ease-in-out_infinite_0.6s] opacity-0" />
        <div className="absolute -bottom-1 right-4 w-2.5 h-2.5 rounded-full bg-orange-300 animate-[sparkle_2s_ease-in-out_infinite_1s] opacity-0" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {t.progress.castingASpell}
      </h2>
      <p className="text-sm text-amber-600 dark:text-amber-400 mb-2 h-5 transition-opacity">
        {t.progress.spellMessages[msgIndex]}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
        {t.progress.storyReadyInMoment}
      </p>

      {/* Pulsing progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-400"
            style={{ animation: `dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <a
        href="/tools/story-studio/bookshelf"
        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        {t.progress.orGoToBookshelf}
      </a>

      <style jsx>{`
        @keyframes spell-glow {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
          50% { transform: scale(1.12) rotate(180deg); opacity: 0.6; }
        }
        @keyframes wand-wave {
          0%, 100% { transform: rotate(-5deg) translateY(0); }
          50% { transform: rotate(5deg) translateY(-3px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

function BackgroundJobProgress({ jobId: _jobId }: { jobId: string }) {
  const { t } = useLanguage()

  return (
    <div className="max-w-lg mx-auto text-center py-10 md:py-14">
      <div className="relative w-28 h-28 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full animate-[orb-pulse_3s_ease-in-out_infinite]" style={{
          background: 'conic-gradient(from 0deg, #818cf8, #a78bfa, #c084fc, #e879f9, #f472b6, #fb923c, #fbbf24, #a3e635, #34d399, #22d3ee, #818cf8)',
          filter: 'blur(12px)',
          opacity: 0.4,
        }} />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#0c1424] via-purple-900 to-[#090f16] shadow-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-300 drop-shadow-lg animate-[orb-float_2s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
        {t.progress.bookBeingCreated}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        {t.progress.storyGeneratedBackground}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
        {t.progress.trackProgress}
      </p>

      <a
        href="/tools/story-studio/bookshelf"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
        style={{ minHeight: '44px' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
        {t.progress.goToBookshelf}
      </a>

      <style jsx>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.08) rotate(180deg); }
        }
        @keyframes orb-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

export function GenerationProgress({ events, totalPages, activeJobId, mode }: GenerationProgressProps) {
  const { t } = useLanguage()

  // Background job mode
  if (activeJobId) {
    // Speed mode: show spell animation inline
    if (mode === 'speed') {
      return <SpellAnimation jobId={activeJobId} />
    }
    // Professional mode: show background job UI with bookshelf link
    return <BackgroundJobProgress jobId={activeJobId} />
  }

  const imagesDone = events.filter(e => e.type === 'image-done').length
  const audiosDone = events.filter(e => e.type === 'audio-done').length
  const storyReady = events.some(e => e.type === 'story-ready')
  const latestStatus = [...events].reverse().find(e => e.type === 'status')
  const hasError = events.some(e => e.type === 'error')
  const latestMessage = latestStatus?.type === 'status' ? latestStatus.message ?? '' : ''

  // Detect which stage we're in based on SSE status messages
  const isWriting = !storyReady
  const hasCharRef = latestMessage.includes('character reference') || latestMessage.includes('portrait') || latestMessage.includes('consistency seed')
  const isCharRef = storyReady && imagesDone === 0 && (hasCharRef || (!latestMessage.includes('Illustrating') && !latestMessage.includes('narration')))
  const isIllustrating = storyReady && imagesDone < (totalPages ?? 0) && (latestMessage.includes('Illustrating') || latestMessage.includes('Cover') || imagesDone > 0)
  const isNarrating = storyReady && totalPages !== null && imagesDone >= totalPages && audiosDone < totalPages

  // 5-stage pipeline: 0=Writing, 1=Reviewing, 2=Character Ref, 3=Illustrating, 4=Narrating
  const stage = isWriting ? 0
    : isCharRef ? 2
    : isIllustrating ? 3
    : isNarrating ? 4
    : storyReady && !isIllustrating && !isNarrating && imagesDone === 0 ? 1
    : 4

  const statusMessage = hasError
    ? t.progress.somethingWentWrong
    : latestMessage || t.progress.starting

  // Progress: 0-15% writing, 15-25% reviewing, 25-35% char ref, 35-75% illustrations, 75-100% audio
  let progress = 0
  if (storyReady && totalPages) {
    const imageProgress = imagesDone / totalPages
    const audioProgress = audiosDone / totalPages

    if (audioProgress > 0) {
      progress = 75 + audioProgress * 25
    } else if (imagesDone > 0) {
      progress = 35 + imageProgress * 40
    } else if (isCharRef) {
      progress = 28
    } else {
      progress = 20
    }
  } else if (storyReady) {
    progress = 18
  } else {
    progress = 10
  }

  // Pick a fun tip based on progress to rotate through them
  const tipIndex = Math.floor(progress / 10) % t.progress.funTips.length
  const funTip = t.progress.funTips[tipIndex]

  const stageLabel = hasError
    ? t.progress.generationFailed
    : isWriting
      ? t.progress.writingStory
      : stage <= 1
        ? t.progress.reviewingConsistency
        : isCharRef
          ? t.progress.creatingCharacterRefs
          : isIllustrating
            ? t.progress.illustrating.replace('{done}', String(imagesDone)).replace('{total}', String(totalPages))
            : isNarrating
              ? t.progress.recordingNarration.replace('{done}', String(audiosDone)).replace('{total}', String(totalPages))
              : t.progress.finishingUp

  const stageIndicators = [
    { label: t.progress.stageWriting, idx: 0 },
    { label: t.progress.stageReviewing, idx: 1 },
    { label: t.progress.stageCharacters, idx: 2 },
    { label: t.progress.stageIllustrating, idx: 3 },
    { label: t.progress.stageNarrating, idx: 4 },
  ]

  return (
    <div className="max-w-lg mx-auto text-center py-10 md:py-14">
      {hasError ? (
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t.progress.generationFailed}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{statusMessage}</p>
        </div>
      ) : (
        <>
          {/* Animated magic orb */}
          <div className="relative w-36 h-36 mx-auto mb-8">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full animate-[orb-pulse_3s_ease-in-out_infinite]" style={{
              background: 'conic-gradient(from 0deg, #818cf8, #a78bfa, #c084fc, #e879f9, #f472b6, #fb923c, #fbbf24, #a3e635, #34d399, #22d3ee, #818cf8)',
              filter: 'blur(12px)',
              opacity: 0.4,
            }} />
            {/* Inner orb */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#0c1424] via-purple-900 to-[#090f16] shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Swirling inner particles */}
              <div className="absolute inset-0 opacity-60" style={{
                backgroundImage: `
                  radial-gradient(2px 2px at 30% 40%, #fbbf24, transparent),
                  radial-gradient(1.5px 1.5px at 60% 25%, #c4b5fd, transparent),
                  radial-gradient(2px 2px at 45% 70%, #fbbf24, transparent),
                  radial-gradient(1.5px 1.5px at 75% 55%, #818cf8, transparent),
                  radial-gradient(1px 1px at 20% 80%, #f9a8d4, transparent)
                `,
                animation: 'orb-spin 4s linear infinite',
              }} />
              <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `
                  radial-gradient(1.5px 1.5px at 50% 30%, #fff, transparent),
                  radial-gradient(2px 2px at 25% 65%, #fbbf24, transparent),
                  radial-gradient(1px 1px at 80% 40%, #c4b5fd, transparent)
                `,
                animation: 'orb-spin 6s linear infinite reverse',
              }} />

              {/* Stage icon in center */}
              <div className="relative z-10 animate-[orb-float_2s_ease-in-out_infinite]">
                {stage === 0 ? (
                  /* Quill — writing */
                  <svg className="w-10 h-10 text-amber-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                  </svg>
                ) : stage === 1 ? (
                  /* Magnifier — reviewing */
                  <svg className="w-10 h-10 text-cyan-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ) : stage === 2 ? (
                  /* People — character reference */
                  <svg className="w-10 h-10 text-emerald-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                ) : stage === 3 ? (
                  /* Paintbrush — illustrating */
                  <svg className="w-10 h-10 text-[#a6abb5] drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                  </svg>
                ) : (
                  /* Microphone — narrating */
                  <svg className="w-10 h-10 text-pink-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Status text */}
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
            {t.progress.craftingYourTale}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {statusMessage}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
            {t.progress.qualityNote}
          </p>
          <p className="text-xs text-purple-400 dark:text-purple-500 italic mb-6 h-4">
            {funTip}
          </p>

          {/* Stage indicators */}
          <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-6 flex-wrap">
            {stageIndicators.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                {i > 0 && (
                  <div className={`w-4 md:w-6 h-0.5 rounded-full transition-colors duration-500 ${
                    stage > s.idx - 1 ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-500 ${
                  stage === s.idx
                    ? 'bg-[#3D6AF2]/15 bg-[#3D6AF2]/15 text-[#3D6AF2] dark:text-[#93aaff] ring-1 ring-indigo-300 dark:ring-indigo-700'
                    : stage > s.idx
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}>
                  {stage > s.idx ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : stage === s.idx ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3D6AF2] animate-pulse" />
                  ) : null}
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: 'linear-gradient(90deg, #818cf8, #a78bfa, #c084fc, #e879f9)',
              }}
            >
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 animate-[shimmer_1.5s_ease-in-out_infinite]" style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              }} />
            </div>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">
            {stageLabel}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.08) rotate(180deg); }
        }
        @keyframes orb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orb-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
