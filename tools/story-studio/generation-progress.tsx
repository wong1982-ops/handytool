'use client'

import type { ProgressEvent } from './types'

interface GenerationProgressProps {
  events: ProgressEvent[]
  totalPages: number | null
}

const FUN_TIPS = [
  'Mixing metaphors and magic dust...',
  'Teaching dragons to pose for portraits...',
  'Convincing the moon to hold still...',
  'Brewing a potion of perfect plot twists...',
  'Whispering secrets to enchanted quills...',
  'Asking the stars for character inspiration...',
  'Painting dreams onto invisible canvases...',
  'Negotiating with mischievous fairies...',
  'Polishing a crystal ball for foresight...',
  'Untangling a ball of narrative yarn...',
]

export function GenerationProgress({ events, totalPages }: GenerationProgressProps) {
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
    ? 'Something went wrong...'
    : latestMessage || 'Starting...'

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
  const tipIndex = Math.floor(progress / 10) % FUN_TIPS.length
  const funTip = FUN_TIPS[tipIndex]

  const stageLabel = hasError
    ? 'Generation failed'
    : isWriting
      ? 'Writing story...'
      : stage <= 1
        ? 'Reviewing for consistency...'
        : isCharRef
          ? 'Creating character references...'
          : isIllustrating
            ? `Illustrating... ${imagesDone} / ${totalPages} pages`
            : isNarrating
              ? `Recording narration... ${audiosDone} / ${totalPages} pages`
              : 'Finishing up...'

  return (
    <div className="max-w-lg mx-auto text-center py-10 md:py-14">
      {hasError ? (
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Generation Failed</h2>
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
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 shadow-2xl flex items-center justify-center overflow-hidden">
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
                  <svg className="w-10 h-10 text-purple-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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
            Crafting Your Tale
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {statusMessage}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
            To generate quality storybook illustrations and narration, this may take 2–3 minutes.
          </p>
          <p className="text-xs text-purple-400 dark:text-purple-500 italic mb-6 h-4">
            {funTip}
          </p>

          {/* Stage indicators */}
          <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-6 flex-wrap">
            {[
              { label: 'Writing', idx: 0 },
              { label: 'Reviewing', idx: 1 },
              { label: 'Characters', idx: 2 },
              { label: 'Illustrating', idx: 3 },
              { label: 'Narrating', idx: 4 },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5">
                {i > 0 && (
                  <div className={`w-4 md:w-6 h-0.5 rounded-full transition-colors duration-500 ${
                    stage > s.idx - 1 ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-500 ${
                  stage === s.idx
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-700'
                    : stage > s.idx
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}>
                  {stage > s.idx ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : stage === s.idx ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
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
