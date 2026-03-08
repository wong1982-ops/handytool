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
    <div className="max-w-md mx-auto text-center py-12 md:py-16">
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
          {hasError ? (
            <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          ) : (
            <svg className="w-9 h-9 text-purple-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
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
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
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
