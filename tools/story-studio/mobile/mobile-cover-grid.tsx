'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { StoryItem } from '@/tools/story-studio/use-stories-list'
import type { JobProgress } from '@/tools/story-studio/use-job-progress'
import { useLanguage } from '@/tools/story-studio/use-language-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MobileCoverGridProps {
  stories: StoryItem[]
  activeJobs?: JobProgress[]
  onDelete?: (id: string) => void
  onToggleShare?: (id: string, isPublic: boolean) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LONG_PRESS_DELAY = 500
const SVG_RADIUS = 30
const SVG_CIRCUMFERENCE = 2 * Math.PI * SVG_RADIUS

// ---------------------------------------------------------------------------
// MobileCoverGrid
// ---------------------------------------------------------------------------

export default function MobileCoverGrid({
  stories,
  activeJobs = [],
  onDelete,
  onToggleShare,
}: MobileCoverGridProps) {
  const [menuId, setMenuId] = useState<string | null>(null)

  const closeMenu = () => setMenuId(null)

  // Separate bulk jobs (match to existing story cards) from new-story jobs (standalone cards)
  const bulkModes = new Set(['bulk-illustrate', 'bulk-narrate'])
  const bulkJobsByTitle = new Map<string, JobProgress>()
  const standaloneJobs: JobProgress[] = []

  for (const jp of activeJobs) {
    if (bulkModes.has(jp.job.mode)) {
      bulkJobsByTitle.set(jp.job.title, jp)
    } else {
      standaloneJobs.push(jp)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {/* Standalone job cards (new story creation) — shown first */}
        {standaloneJobs.map(jp => (
          <JobCard key={jp.job.id} jobProgress={jp} />
        ))}

        {/* Story covers — with optional bulk progress overlay */}
        {stories.map(story => {
          const bulkProgress = bulkJobsByTitle.get(story.title) ?? null
          return (
            <StoryCoverCard
              key={story.id}
              story={story}
              bulkProgress={bulkProgress}
              onLongPress={() => setMenuId(story.id)}
            />
          )
        })}
      </div>

      {/* Long-press action menu */}
      {menuId !== null && (
        <ActionMenu
          storyId={menuId}
          story={stories.find(s => s.id === menuId) ?? null}
          onClose={closeMenu}
          onDelete={onDelete}
          onToggleShare={onToggleShare}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// JobCard
// ---------------------------------------------------------------------------

interface JobCardProps {
  jobProgress: JobProgress
}

function JobCard({ jobProgress }: JobCardProps) {
  const { job, percent } = jobProgress
  const dashOffset = SVG_CIRCUMFERENCE * (1 - percent / 100)

  return (
    <div className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center px-3 py-4 overflow-hidden">
      {/* Circular SVG progress ring */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Background ring */}
        <circle
          cx="40"
          cy="40"
          r={SVG_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-300 dark:text-slate-600"
        />
        {/* Progress ring */}
        <circle
          cx="40"
          cy="40"
          r={SVG_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={SVG_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 40 40)"
          className="text-[#3D6AF2] transition-all duration-500"
        />
      </svg>

      {/* Percentage label */}
      <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {percent}%
      </p>

      {/* Job title */}
      <p className="mt-1 w-full truncate text-center text-xs text-slate-500 dark:text-slate-400 px-1">
        {job.title}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StoryCoverCard
// ---------------------------------------------------------------------------

interface StoryCoverCardProps {
  story: StoryItem
  bulkProgress?: JobProgress | null
  onLongPress: () => void
}

const OVERLAY_RING_R = 22
const OVERLAY_RING_C = 2 * Math.PI * OVERLAY_RING_R

function StoryCoverCard({ story, bulkProgress, onLongPress }: StoryCoverCardProps) {
  const { language } = useLanguage()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      onLongPress()
    }, LONG_PRESS_DELAY)
  }

  const cancelTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const isBulk = bulkProgress !== null && bulkProgress !== undefined
  const bulkLabel = isBulk
    ? bulkProgress.job.mode === 'bulk-illustrate'
      ? (language === 'zh' ? '插画生成中' : 'Illustrating')
      : (language === 'zh' ? '配音生成中' : 'Narrating')
    : ''

  return (
    <Link
      href={`/tools/story-studio/book/${story.slug}`}
      className="group block aspect-[3/4] rounded-xl overflow-hidden relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelTimer}
      onTouchCancel={cancelTimer}
      draggable={false}
    >
      {story.coverImageUrl ? (
        <Image
          src={story.coverImageUrl}
          alt={story.title}
          fill
          sizes="50vw"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        /* Placeholder when no cover image */
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700">
          <BookPlaceholderIcon />
        </div>
      )}

      {/* Status badges — top-right corner */}
      {(story.hasAudio || story.hasIllustrations) && !isBulk && (
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {story.hasIllustrations && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm" title={language === 'zh' ? '有插画' : 'Has illustrations'}>
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </span>
          )}
          {story.hasAudio && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm" title={language === 'zh' ? '有配音' : 'Has narration'}>
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            </span>
          )}
        </div>
      )}

      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6">
        <p className="truncate text-xs font-semibold leading-tight text-white drop-shadow-sm">
          {story.title}
        </p>
      </div>

      {/* Bulk progress overlay */}
      {isBulk && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5">
          {/* Mini progress ring */}
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r={OVERLAY_RING_R} fill="none" stroke="currentColor" strokeWidth="3" className="text-white/20" />
            <circle
              cx="26" cy="26" r={OVERLAY_RING_R} fill="none" stroke="currentColor" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={OVERLAY_RING_C}
              strokeDashoffset={OVERLAY_RING_C * (1 - bulkProgress.percent / 100)}
              transform="rotate(-90 26 26)"
              className="text-[#3D6AF2] transition-all duration-500"
            />
            <text x="26" y="26" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="12" fontWeight="600">
              {bulkProgress.percent}%
            </text>
          </svg>
          <span className="text-[10px] font-medium text-white/90 drop-shadow-sm">
            {bulkLabel}
          </span>
        </div>
      )}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// BookPlaceholderIcon
// ---------------------------------------------------------------------------

function BookPlaceholderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-slate-400 dark:text-slate-500"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// ActionMenu (long-press bottom sheet)
// ---------------------------------------------------------------------------

interface ActionMenuProps {
  storyId: string
  story: StoryItem | null
  onClose: () => void
  onDelete?: (id: string) => void
  onToggleShare?: (id: string, isPublic: boolean) => void
}

function ActionMenu({ storyId, story, onClose, onDelete, onToggleShare }: ActionMenuProps) {
  const { t } = useLanguage()

  const handleShare = () => {
    if (story) {
      onToggleShare?.(storyId, !story.isPublic)
    }
    onClose()
  }

  const handleDelete = () => {
    onDelete?.(storyId)
    onClose()
  }

  const shareLabel = story?.isPublic ? t.storyCard.makePrivate : t.storyCard.makePublic

  return (
    <>
      {/* Scrim overlay */}
      <div
        role="presentation"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        onTouchEnd={onClose}
      />

      {/* Bottom action sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Story actions"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-slate-900 shadow-2xl pb-safe"
      >
        {/* Handle */}
        <div className="mx-auto mt-3 mb-4 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />

        {/* Story title */}
        {story && (
          <p className="px-5 pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
            {story.title}
          </p>
        )}

        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {/* Share / Unshare */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-3 px-5 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-colors"
            style={{ minHeight: '44px' }}
          >
            <ShareIcon />
            <span className="text-base">{shareLabel}</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-3 px-5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors"
            style={{ minHeight: '44px' }}
          >
            <TrashIcon />
            <span className="text-base">{t.common.delete}</span>
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center px-5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 dark:active:bg-slate-700 transition-colors"
            style={{ minHeight: '44px' }}
          >
            <span className="text-base font-medium">{t.common.cancel}</span>
          </button>
        </div>

        {/* Bottom safe area spacer */}
        <div className="h-4" />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
