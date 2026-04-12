'use client'

import { useState, useCallback } from 'react'
import { useLanguage } from '@/tools/story-studio/use-language-context'

export interface MobileReaderControlsProps {
  currentPage: number   // 0 = cover
  totalPages: number    // total content pages (not including cover)
  hasAudio: boolean
  isPlaying: boolean
  onTogglePlay: () => void
  onShare: () => void
}

const DOT_THRESHOLD = 7

export default function MobileReaderControls({
  currentPage,
  totalPages,
  hasAudio,
  isPlaying,
  onTogglePlay,
  onShare,
}: MobileReaderControlsProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: still call the passed handler
    }
    onShare()
  }, [onShare])

  // +1 for cover
  const totalSlides = totalPages + 1
  const useDotsIndicator = totalSlides <= DOT_THRESHOLD

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200/60 dark:border-slate-800/60 pb-[env(safe-area-inset-bottom)]"
      role="toolbar"
      aria-label="Reader controls"
    >
      <div className="flex items-center justify-between px-4 py-2 gap-3">

        {/* Left — page indicator */}
        <div className="flex items-center min-w-0">
          {useDotsIndicator ? (
            <DotIndicator
              currentPage={currentPage}
              totalSlides={totalSlides}
            />
          ) : (
            <TextIndicator
              currentPage={currentPage}
              totalPages={totalPages}
              coverLabel={t.viewer.cover}
            />
          )}
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Play / Pause button */}
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={!hasAudio}
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-4 h-11 min-w-[80px] justify-center',
              'text-sm font-medium text-white bg-[#3D6AF2]',
              'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2',
              !hasAudio ? 'opacity-30 cursor-not-allowed' : 'active:opacity-80',
            ].join(' ')}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            <span className="leading-none">
              {isPlaying ? 'Pause' : 'Play'}
            </span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label={copied ? t.viewer.copied : t.viewer.share}
            className={[
              'flex items-center justify-center rounded-full w-11 h-11 shrink-0',
              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
              'transition-colors active:bg-slate-200 dark:active:bg-slate-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2',
            ].join(' ')}
          >
            {copied ? <CheckIcon /> : <ShareIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DotIndicatorProps {
  currentPage: number
  totalSlides: number
}

function DotIndicator({ currentPage, totalSlides }: DotIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: totalSlides }, (_, i) => {
        const isActive = i === currentPage
        return (
          <span
            key={i}
            className={[
              'rounded-full transition-all duration-200',
              isActive
                ? 'w-2.5 h-2.5 bg-[#3D6AF2]'
                : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600',
            ].join(' ')}
          />
        )
      })}
    </div>
  )
}

interface TextIndicatorProps {
  currentPage: number
  totalPages: number
  coverLabel: string
}

function TextIndicator({ currentPage, totalPages, coverLabel }: TextIndicatorProps) {
  const label = currentPage === 0
    ? coverLabel
    : `${currentPage} / ${totalPages}`

  return (
    <span className="text-sm font-medium tabular-nums text-slate-600 dark:text-slate-400">
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Icons (inline SVG — no external dependency)
// ---------------------------------------------------------------------------

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm5-2.25A.75.75 0 0 1 7.75 7h.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 7 12.25v-4.5Zm4 0a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-4.5Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
