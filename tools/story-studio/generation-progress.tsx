'use client'

import type { ProgressEvent } from './types'

interface GenerationProgressProps {
  events: ProgressEvent[]
  totalPages: number | null
}

export function GenerationProgress({ events, totalPages }: GenerationProgressProps) {
  const imagesDone = events.filter(e => e.type === 'image-done').length
  const audiosDone = events.filter(e => e.type === 'audio-done').length
  const storyReady = events.some(e => e.type === 'story-ready')
  const latestStatus = [...events].reverse().find(e => e.type === 'status')
  const hasError = events.some(e => e.type === 'error')

  const statusMessage = hasError
    ? 'Something went wrong...'
    : latestStatus?.type === 'status'
      ? latestStatus.message
      : 'Starting...'

  // Progress: 0-33% story, 33-66% illustrations, 66-100% audio
  let progress = 0
  if (storyReady && totalPages) {
    const imageProgress = imagesDone / totalPages
    const audioProgress = audiosDone / totalPages

    if (audioProgress > 0) {
      progress = 66 + audioProgress * 34
    } else if (imageProgress > 0 || imagesDone > 0) {
      progress = 33 + imageProgress * 33
    } else {
      progress = 33
    }
  } else if (storyReady) {
    progress = 33
  } else {
    progress = 15
  }

  const stageLabel = hasError
    ? 'Generation failed'
    : !storyReady
      ? 'Writing story...'
      : totalPages && imagesDone < totalPages
        ? `Illustrating... ${imagesDone} / ${totalPages} pages`
        : totalPages && audiosDone < totalPages
          ? `Recording narration... ${audiosDone} / ${totalPages} pages`
          : 'Finishing up...'

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--tk-color-primary-500,#3D6AF2)]/10 flex items-center justify-center">
          {hasError ? (
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-[var(--tk-color-primary-500,#3D6AF2)] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          {hasError ? 'Generation Failed' : 'Creating Your Book'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {statusMessage}
        </p>
      </div>

      {!hasError && (
        <>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3">
            <div
              className="bg-[var(--tk-color-primary-500,#3D6AF2)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="text-xs text-slate-400">
            {stageLabel}
          </div>
        </>
      )}
    </div>
  )
}
