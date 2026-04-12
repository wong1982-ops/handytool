'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoriesList } from '@/tools/story-studio/use-stories-list'
import { useJobProgress } from '@/tools/story-studio/use-job-progress'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { LanguageProvider, useLanguage } from '@/tools/story-studio/use-language-context'
import { signInWithOAuth } from '@/lib/supabase/auth'
import MobileCoverGrid from './mobile-cover-grid'
import MobileSettingsPanel from './mobile-settings-panel'
import MobileProgress from './mobile-progress'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXAMPLE_PROMPTS_ZH = [
  '两只小猫发现了一扇魔法门，通向一个由糖果组成的世界',
  '一个小男孩和他的机器人朋友一起去太空探险',
  '森林里的小动物们一起准备新年晚会',
  '一条小鱼想要看看大海以外的世界',
]

const EXAMPLE_PROMPTS_EN = [
  'Two kittens discover a magic door leading to a candy world',
  'A boy and his robot friend go on a space adventure',
  'Forest animals prepare a New Year party together',
  'A little fish wants to see the world beyond the ocean',
]

const JOB_POLL_INTERVAL_MS = 3000

// ---------------------------------------------------------------------------
// Public export — wraps inner component with LanguageProvider
// ---------------------------------------------------------------------------

export function MobileHome() {
  return (
    <LanguageProvider>
      <HomeInner />
    </LanguageProvider>
  )
}

// ---------------------------------------------------------------------------
// HomeInner — actual page logic
// ---------------------------------------------------------------------------

function HomeInner() {
  const router = useRouter()
  const { user } = useAuth()
  const { language, toggleLanguage } = useLanguage()

  const storiesList = useStoriesList()
  const jobProgressHook = useJobProgress(user?.id)
  const storyBook = useStoryBook()

  const [input, setInput] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pageCount, setPageCount] = useState(6)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prompts = language === 'zh' ? EXAMPLE_PROMPTS_ZH : EXAMPLE_PROMPTS_EN

  // -------------------------------------------------------------------------
  // Auto-resize textarea
  // -------------------------------------------------------------------------

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }, [])

  // -------------------------------------------------------------------------
  // Job polling — check REST endpoint for completion
  // -------------------------------------------------------------------------

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    const activeJobId = storyBook.activeJobId
    if (!activeJobId || storyBook.phase !== 'generating') {
      stopPolling()
      return
    }

    const checkJob = async () => {
      try {
        const res = await fetch(`/api/v1/story/jobs/${activeJobId}`)
        if (!res.ok) return
        const data = await res.json()
        const job = data.job ?? data
        if (job?.status === 'complete' && job?.slug) {
          stopPolling()
          router.push(`/tools/story-studio/book/${job.slug}`)
        }
      } catch {
        // silently ignore transient fetch errors
      }
    }

    pollIntervalRef.current = setInterval(checkJob, JOB_POLL_INTERVAL_MS)
    return stopPolling
  }, [storyBook.activeJobId, storyBook.phase, router, stopPolling])

  // -------------------------------------------------------------------------
  // Realtime-based completion via useJobProgress
  // -------------------------------------------------------------------------

  useEffect(() => {
    const { completedJobId, clearCompletion } = jobProgressHook
    if (!completedJobId) return

    const matchingJob = jobProgressHook.jobs.find(j => j.job.id === completedJobId)
    clearCompletion()

    if (matchingJob) {
      // Navigate if we have a slug (look in job data), else fall through to polling
      const job = matchingJob.job as typeof matchingJob.job & { slug?: string }
      if (job.slug) {
        stopPolling()
        router.push(`/tools/story-studio/book/${job.slug}`)
      }
    }
  }, [jobProgressHook, router, stopPolling])

  // -------------------------------------------------------------------------
  // Auto-trigger generation after fetchConcepts sets phase to 'refine'
  // -------------------------------------------------------------------------

  const pendingInputRef = useRef<string | null>(null)

  useEffect(() => {
    if (
      storyBook.phase === 'refine' &&
      storyBook.selectedConcept !== null &&
      pendingInputRef.current !== null
    ) {
      const plotText = pendingInputRef.current
      pendingInputRef.current = null
      storyBook.startGeneration(plotText, storyBook.selectedConcept, {
        skipIllustration: true,
        skipAudio: true,
        skipValidation: true,
      })
    }
  }, [storyBook])

  // -------------------------------------------------------------------------
  // Send handler
  // -------------------------------------------------------------------------

  const handleSend = async () => {
    const trimmed = input.trim()
    if (trimmed.length < 10 || storyBook.loading) return

    if (!user) {
      await signInWithOAuth('google')
      return
    }

    pendingInputRef.current = trimmed
    await storyBook.fetchConcepts(trimmed)
  }

  // -------------------------------------------------------------------------
  // Background handler for MobileProgress
  // -------------------------------------------------------------------------

  const handleBackground = () => {
    storyBook.setPhase('input')
  }

  // -------------------------------------------------------------------------
  // Computed values
  // -------------------------------------------------------------------------

  const activeJobs = jobProgressHook.jobs.filter(
    jp =>
      storyBook.activeJobId
        ? jp.job.id === storyBook.activeJobId
        : true,
  )

  const currentJobProgress =
    storyBook.activeJobId
      ? jobProgressHook.jobs.find(jp => jp.job.id === storyBook.activeJobId) ?? null
      : null

  const isSendDisabled = input.trim().length < 10 || storyBook.loading

  // -------------------------------------------------------------------------
  // Render — generating phase
  // -------------------------------------------------------------------------

  if (storyBook.phase === 'generating') {
    return (
      <LanguageProvider>
        <MobileProgress jobProgress={currentJobProgress} onBackground={handleBackground} />
      </LanguageProvider>
    )
  }

  // -------------------------------------------------------------------------
  // Render — home page
  // -------------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-50 dark:bg-slate-950 pb-32">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🔖</span>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'zh' ? '故事工坊' : 'Story Studio'}
            </h1>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
            style={{ minHeight: '44px' }}
            aria-label="Toggle language"
          >
            {language === 'zh' ? '中文 ▾' : 'EN ▾'}
          </button>
        </div>
      </header>

      {/* Main scrollable content */}
      <main className="px-4 pt-2 pb-4 space-y-6">
        {/* Hero */}
        <section className="flex flex-col items-center text-center pt-4 pb-2" aria-label="Hero">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #a78bfa 50%, #3D6AF2 100%)',
            }}
            aria-hidden="true"
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {language === 'zh' ? '✨ 想要什么故事？' : '✨ What story do you want?'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'zh' ? '描述一下，AI帮你画' : 'Describe it, AI will illustrate it'}
          </p>
        </section>

        {/* Example prompt cards */}
        <section aria-label="Example prompts">
          <div className="grid grid-cols-2 gap-2">
            {prompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInput(prompt)
                  setTimeout(resizeTextarea, 0)
                }}
                className="text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:border-[#3D6AF2] hover:text-[#3D6AF2] dark:hover:border-indigo-400 dark:hover:text-indigo-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2]"
                style={{ minHeight: '44px' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        {/* Error banner */}
        {storyBook.error && (
          <div
            role="alert"
            className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300"
          >
            {storyBook.error}
          </div>
        )}

        {/* Bookshelf */}
        {(storiesList.loading || storiesList.allStories.length > 0) && (
          <section aria-label="My stories">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {language === 'zh' ? '我的绘本' : 'My Stories'}
                {!storiesList.loading && (
                  <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500 font-normal">
                    ({storiesList.allStories.length})
                  </span>
                )}
              </h2>
            </div>
            {storiesList.loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <MobileCoverGrid
                stories={storiesList.allStories}
                activeJobs={activeJobs}
                onDelete={storiesList.deleteStory}
                onToggleShare={storiesList.toggleShare}
              />
            )}
          </section>
        )}
      </main>

      {/* Fixed bottom input bar */}
      <div className="fixed bottom-0 inset-x-0 z-50">
        {/* Settings panel (slides up from bottom) */}
        <MobileSettingsPanel
          open={settingsOpen}
          artStyle={storyBook.selectedArtStyle}
          onArtStyleChange={storyBook.setSelectedArtStyle}
          pageCount={pageCount}
          onPageCountChange={setPageCount}
        />

        {/* Input row */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-end gap-2">
          {/* Settings toggle button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(prev => !prev)}
            aria-label="Toggle settings"
            aria-expanded={settingsOpen}
            className={[
              'shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              settingsOpen
                ? 'bg-[#3D6AF2] text-white focus-visible:ring-[#3D6AF2]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:ring-slate-400',
            ].join(' ')}
          >
            <GearIcon />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              resizeTextarea()
            }}
            onInput={resizeTextarea}
            placeholder={language === 'zh' ? '描述你的故事...' : 'Describe your story...'}
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3D6AF2] leading-relaxed"
            style={{ minHeight: '44px', maxHeight: '96px', overflowY: 'auto' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isSendDisabled}
            aria-label={language === 'zh' ? '发送' : 'Send'}
            className={[
              'shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6AF2] focus-visible:ring-offset-2',
              isSendDisabled
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-[#3D6AF2] text-white hover:bg-[#3D79F2] active:scale-95',
            ].join(' ')}
          >
            {storyBook.loading ? (
              <LoadingSpinner />
            ) : (
              <SendArrowIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------

function GearIcon() {
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
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function SendArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
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
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
