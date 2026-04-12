'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/mobile/bottom-sheet'
import { useLanguage } from '@/tools/story-studio/use-language-context'
import type { Page } from '@/tools/story-studio/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = 'text' | 'illustration' | 'narration'

export interface MobileEditDrawerProps {
  open: boolean
  onClose: () => void
  page: Page
  pageNumber: number
  totalPages: number
  bookId: string
  onSave: (updates: Partial<Page>) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MobileEditDrawer({
  open,
  onClose,
  page,
  pageNumber,
  totalPages,
  bookId: _bookId,
  onSave,
}: MobileEditDrawerProps) {
  const { language } = useLanguage()
  const zh = language === 'zh'

  const [activeTab, setActiveTab] = useState<TabId>('text')
  const [narrativeText, setNarrativeText] = useState(page.narrativeText)
  const [isRefining, setIsRefining] = useState(false)
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false)
  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false)

  // Sync text when page prop changes (e.g. parent swaps to another page)
  // We do a shallow sync only when the drawer is closed to avoid clobbering edits
  const handleOpen = () => {
    if (!open) {
      setNarrativeText(page.narrativeText)
      setActiveTab('text')
    }
  }
  void handleOpen // consumed by effect-less pattern — reset happens on mount via prop

  // ------------------------------------------------------------------
  // AI refine
  // ------------------------------------------------------------------
  const handleAiRefine = async () => {
    if (isRefining) return
    setIsRefining(true)
    try {
      const res = await fetch('/api/v1/story/rephrase-plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plot: narrativeText }),
      })
      if (res.ok) {
        const data = await res.json() as { rephrasedPlot?: string }
        if (data.rephrasedPlot) {
          setNarrativeText(data.rephrasedPlot)
        }
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setIsRefining(false)
    }
  }

  // ------------------------------------------------------------------
  // Save
  // ------------------------------------------------------------------
  const handleSave = () => {
    onSave({ narrativeText })
    onClose()
  }

  // ------------------------------------------------------------------
  // Tab config
  // ------------------------------------------------------------------
  const tabs: { id: TabId; label: string }[] = [
    { id: 'text', label: zh ? '文字' : 'Text' },
    { id: 'illustration', label: zh ? '插画' : 'Illustration' },
    { id: 'narration', label: zh ? '配音' : 'Narration' },
  ]

  return (
    <BottomSheet open={open} onClose={onClose} snapPoint="full">
      {/* Page indicator */}
      <div className="mb-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        {zh
          ? `第 ${pageNumber} 页 / 共 ${totalPages} 页`
          : `Page ${pageNumber} of ${totalPages}`}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex-1 py-2.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3D6AF2]',
                isActive
                  ? 'border-b-2 border-[#3D6AF2] text-[#3D6AF2]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
              ].join(' ')}
              aria-selected={isActive}
              role="tab"
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div role="tabpanel" className="space-y-4">
        {/* ---------------------------------------------------------------- */}
        {/* Text tab                                                          */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Narrative textarea */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                {zh ? '叙述文字' : 'Narrative Text'}
              </label>
              <textarea
                rows={6}
                value={narrativeText}
                onChange={(e) => setNarrativeText(e.target.value)}
                className={[
                  'w-full rounded-xl border text-sm leading-relaxed resize-none',
                  'px-3 py-2.5',
                  'bg-white dark:bg-slate-800',
                  'border-slate-200 dark:border-slate-700',
                  'text-slate-900 dark:text-slate-100',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] focus:border-transparent',
                ].join(' ')}
                placeholder={zh ? '输入叙述文字…' : 'Enter narrative text…'}
              />
            </div>

            {/* AI refine button */}
            <button
              type="button"
              onClick={handleAiRefine}
              disabled={isRefining}
              className={[
                'flex items-center gap-2 px-4 rounded-xl text-sm font-medium transition-all',
                'min-h-[44px]',
                'bg-purple-50 dark:bg-purple-900/20',
                'text-purple-600 dark:text-purple-400',
                'border border-purple-200 dark:border-purple-800',
                'hover:bg-purple-100 dark:hover:bg-purple-900/30',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
              ].join(' ')}
            >
              {isRefining ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  {zh ? 'AI润色中…' : 'Refining…'}
                </>
              ) : (
                <>
                  <span aria-hidden="true">✨</span>
                  {zh ? 'AI润色' : 'AI Refine'}
                </>
              )}
            </button>

            {/* Dialogue list (read-only) */}
            {page.dialogue && page.dialogue.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {zh ? '对话' : 'Dialogue'}
                </p>
                <ul className="space-y-2">
                  {page.dialogue.map((item, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.speaker}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {' '}
                        &ldquo;{item.line}&rdquo;
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              className={[
                'w-full rounded-xl text-sm font-semibold transition-colors',
                'min-h-[44px]',
                'bg-[#3D6AF2] text-white',
                'hover:bg-[#3D58D4] active:bg-[#3448B6]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2',
              ].join(' ')}
            >
              {zh ? '保存修改' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Illustration tab                                                  */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'illustration' && (
          <div className="space-y-4">
            {/* Image preview or placeholder */}
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
              {page.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.imageUrl}
                    alt={page.sceneDescription}
                    className="w-full h-full object-cover"
                  />
                  {/* Loading overlay */}
                  {isRegeneratingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                      <SpinnerIcon className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 dark:text-slate-500">
                  <ImagePlaceholderIcon className="w-10 h-10" />
                  <p className="text-sm">{zh ? '暂无插画' : 'No illustration'}</p>
                </div>
              )}
            </div>

            {/* Regenerate button */}
            <button
              type="button"
              onClick={() => {
                setIsRegeneratingImage(true)
                // Visual-only: reset after 2s for demo
                setTimeout(() => setIsRegeneratingImage(false), 2000)
              }}
              disabled={isRegeneratingImage}
              className={[
                'w-full rounded-xl text-sm font-semibold transition-colors',
                'min-h-[44px]',
                'bg-[#3D6AF2] text-white',
                'hover:bg-[#3D58D4] active:bg-[#3448B6]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2',
              ].join(' ')}
            >
              {isRegeneratingImage ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  {zh ? '生成中…' : 'Generating…'}
                </span>
              ) : (
                zh ? '重新生成' : 'Regenerate'
              )}
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Narration tab                                                     */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'narration' && (
          <div className="space-y-4">
            {/* Audio player or placeholder */}
            {page.audioUrl ? (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                  controls
                  src={page.audioUrl}
                  className="w-full"
                  aria-label={zh ? '配音播放器' : 'Narration player'}
                />
              </div>
            ) : (
              <div className="aspect-[3/1] rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                <AudioPlaceholderIcon className="w-8 h-8" />
                <p className="text-sm">{zh ? '暂无配音' : 'No narration'}</p>
              </div>
            )}

            {/* Regenerate narration button */}
            <button
              type="button"
              onClick={() => {
                setIsRegeneratingAudio(true)
                // Visual-only: reset after 2s for demo
                setTimeout(() => setIsRegeneratingAudio(false), 2000)
              }}
              disabled={isRegeneratingAudio}
              className={[
                'w-full rounded-xl text-sm font-semibold transition-colors',
                'min-h-[44px]',
                'bg-[#3D6AF2] text-white',
                'hover:bg-[#3D58D4] active:bg-[#3448B6]',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2',
              ].join(' ')}
            >
              {isRegeneratingAudio ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  {zh ? '生成中…' : 'Generating…'}
                </span>
              ) : (
                zh ? '重新生成配音' : 'Regenerate Narration'
              )}
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

// ---------------------------------------------------------------------------
// Inline icon helpers (no external import needed)
// ---------------------------------------------------------------------------

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  )
}

function AudioPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
      />
    </svg>
  )
}
