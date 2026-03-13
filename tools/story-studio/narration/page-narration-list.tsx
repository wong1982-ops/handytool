'use client'

import { useRef, useState } from 'react'
import type { PageNarration } from '@/tools/story-studio/use-narration'

interface PageNarrationListProps {
  pages: PageNarration[]
  selectedIds: Set<string>
  onToggleSelect: (pageId: string) => void
  onPageClick: (pageId: string) => void
}

export function PageNarrationList({
  pages, selectedIds, onToggleSelect, onPageClick,
}: PageNarrationListProps) {
  return (
    <div className="space-y-2">
      {pages.map(page => {
        const audio = page.audio
        const isSelected = selectedIds.has(page.id)
        const previewText = (page.narrativeText || '').slice(0, 100) + ((page.narrativeText?.length ?? 0) > 100 ? '...' : '')
        const speakers = [...new Set((page.dialogue ?? []).map(d => d.speaker))]

        return (
          <div
            key={page.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer
              hover:shadow-sm transition-all ${
                isSelected
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            onClick={() => onPageClick(page.id)}
          >
            {/* Checkbox */}
            <div
              onClick={e => { e.stopPropagation(); onToggleSelect(page.id) }}
              className="shrink-0"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>

            {/* Page info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Page {page.sequence}
                </span>
                {speakers.length > 0 && (
                  <span className="text-[10px] text-slate-400 truncate">
                    {speakers.join(', ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{previewText || 'No text'}</p>
            </div>

            {/* Duration + status */}
            <div className="shrink-0 text-right">
              {audio?.durationSeconds ? (
                <span className="text-xs text-slate-500">
                  {Math.floor(audio.durationSeconds / 60)}:{String(Math.floor(audio.durationSeconds % 60)).padStart(2, '0')}
                </span>
              ) : null}
              <span className={`block text-[10px] font-semibold mt-0.5 ${
                audio?.status === 'done' ? 'text-green-600 dark:text-green-400' :
                audio?.status === 'generating' ? 'text-blue-600 dark:text-blue-400' :
                audio?.status === 'error' ? 'text-red-600 dark:text-red-400' :
                'text-slate-400'
              }`}>
                {audio?.status === 'done' ? 'Done' :
                 audio?.status === 'generating' ? 'Generating...' :
                 audio?.status === 'error' ? 'Error' : 'Pending'}
              </span>
            </div>

            {/* Inline audio player for done pages */}
            {audio?.audioUrl && audio.status === 'done' && (
              <InlinePlayer audioUrl={audio.audioUrl} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function InlinePlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (!audioRef.current) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
        text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800
        transition-colors cursor-pointer"
      aria-label={playing ? 'Pause' : 'Play'}
    >
      {playing ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
      )}
    </button>
  )
}
