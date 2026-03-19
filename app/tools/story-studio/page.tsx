'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoriesList } from '@/tools/story-studio/use-stories-list'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { useJobProgress } from '@/tools/story-studio/use-job-progress'
import { StoryList } from '@/tools/story-studio/stories/story-list'
import { PlotInput } from '@/tools/story-studio/plot-input'
import { RefinementChat } from '@/tools/story-studio/refinement-chat'
import { GenerationProgress } from '@/tools/story-studio/generation-progress'
import { InProgressSection } from '@/tools/story-studio/job-card'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { StoryConcept } from '@/tools/story-studio/types'

type View = 'list' | 'create-ai'

/** Speed mode: show concept as read-only card + async Generate button */
function SpeedModeConfirm({ concept, loading, error, onGenerate, onBack }: {
  concept: StoryConcept
  loading: boolean
  error: string | null
  onGenerate: () => void
  onBack: () => void
}) {
  const SECTIONS: { key: keyof StoryConcept['sections']; label: string; icon: string }[] = [
    { key: 'premise', label: 'The Story', icon: '\u{1F4D6}' },
    { key: 'narrativeArc', label: 'How It Unfolds', icon: '\u{1F5FA}\uFE0F' },
    { key: 'tone', label: 'The Voice', icon: '\u{1F3B5}' },
    { key: 'visualStyle', label: 'The Look', icon: '\u{1F3A8}' },
  ]

  return (
    <div className="space-y-4">
      {/* Concept card — read-only display (radio-style selected state) */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 via-purple-400/15 to-indigo-400/20 dark:from-amber-400/10 dark:via-purple-400/5 dark:to-indigo-400/10" />
        <div className="relative bg-white/95 dark:bg-slate-900/95 border-2 border-amber-400/60 dark:border-amber-600/40 rounded-2xl shadow-lg shadow-amber-500/5 overflow-hidden">
          {/* Selected indicator bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500" />

          <div className="p-5">
            {/* Title + selected badge */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                {concept.title}
              </h3>
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selected
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                {concept.tags.style}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                {concept.tags.audience}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
                {concept.tags.pageCount} pages
              </span>
            </div>

            {/* Key sections (subset for speed mode) */}
            <div className="space-y-3">
              {SECTIONS.map(({ key, label, icon }) => (
                <div key={key}>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    <span className="text-sm">{icon}</span> {label}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                    {concept.sections[key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate button — async job submission */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.836A.75.75 0 002.75 12h6.572l-1.305 10.093a.75.75 0 001.292.657l8.5-9.836A.75.75 0 0017.25 12h-6.572l1.305-10.093z" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Quick Story</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Your story will be generated in the background. You can add pictures and sound later.
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Credits are refunded if generation fails</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">
            10 credits
          </span>
        </div>

        {error && (
          <div className="mb-3 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:shadow-none"
            style={{ minHeight: '44px' }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.836A.75.75 0 002.75 12h6.572l-1.305 10.093a.75.75 0 001.292.657l8.5-9.836A.75.75 0 0017.25 12h-6.572l1.305-10.093z" />
                </svg>
                Generate Story
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StoriesPage() {
  return (
    <Suspense>
      <StoriesContent />
    </Suspense>
  )
}

function StoriesContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSeriesId = searchParams.get('seriesId')
  const urlMode = searchParams.get('mode') as 'speed' | 'professional' | null

  // Stories list
  const storiesList = useStoriesList()

  // AI creation flow (reuses existing hook)
  const storyBook = useStoryBook()

  // Job progress
  const { jobs: activeJobs, retryJob, deleteJob, completedJobId, clearCompletion } = useJobProgress(user?.id)

  // View state
  const [view, setView] = useState<View>(urlMode ? 'create-ai' : 'list')

  // Auto-start AI creation when mode is set via URL (coming from /new page)
  useEffect(() => {
    if (urlMode && view === 'create-ai' && !storyBook.mode) {
      storyBook.reset()
      storyBook.setMode(urlMode)
      if (urlSeriesId) storyBook.setSeriesId(urlSeriesId)
    }
  }, [urlMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // When a job completes, fetch its book ID and open the editor
  useEffect(() => {
    if (!completedJobId) return
    let cancelled = false
    async function openCompletedBook() {
      try {
        const res = await fetch(`/api/v1/story/jobs/${completedJobId}`)
        if (!res.ok) return
        const { job } = await res.json()
        if (cancelled) return
        if (job?.book_id) {
          storiesList.refresh()
          storyBook.reset()
          const jobMode = job.input?.mode || 'speed'
          if (jobMode === 'professional') {
            router.push(`/tools/story-studio/edit/${job.book_id}`)
          } else {
            router.push('/tools/story-studio/bookshelf')
          }
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) clearCompletion() }
    }
    openCompletedBook()
    return () => { cancelled = true }
  }, [completedJobId, clearCompletion, storiesList, storyBook, router])

  // Handlers
  const handleEdit = useCallback((id: string) => {
    router.push(`/tools/story-studio/edit/${id}`)
  }, [router])

  const handleBackToList = useCallback(() => {
    setView('list')
    storyBook.reset()
    storiesList.refresh()
  }, [storyBook, storiesList])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to create stories</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Your magical stories await.</p>
        <button
          onClick={() => signInWithOAuth('google')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  // AI Creation flow
  if (view === 'create-ai') {
    const { phase, plot, selectedConcept, book, progressEvents, loading, error,
      activeJobId, fetchConcepts, startGeneration,
      setPhase, setSelectedConcept,
      selectedCharacterIds, setSelectedCharacterIds,
      selectedArtStyle, setSelectedArtStyle } = storyBook

    // If generation is complete, go back to list
    if (phase === 'viewer' && book?.status === 'complete') {
      handleBackToList()
      return null
    }

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackToList}
            className="w-9 h-9 flex items-center justify-center rounded-full
              hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Back to stories"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generate with AI</h2>
        </div>

        {phase === 'input' && (
          <>
            <PlotInput
              onSubmit={fetchConcepts}
              loading={loading}
              initialPlot={plot || undefined}
              selectedCharacterIds={selectedCharacterIds}
              onCharacterIdsChange={setSelectedCharacterIds}
              selectedArtStyle={selectedArtStyle}
              onArtStyleChange={setSelectedArtStyle}
            />
            {error && (
              <div className="mt-3 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </>
        )}
        {phase === 'refine' && selectedConcept && storyBook.mode === 'speed' && (
          <SpeedModeConfirm
            concept={selectedConcept}
            loading={loading}
            error={error}
            onGenerate={async () => {
              await startGeneration(plot || '', selectedConcept, { skipIllustration: true, skipAudio: true, skipValidation: true })
              // After job is submitted, go back to story list — job shows in InProgressSection
              handleBackToList()
            }}
            onBack={() => setPhase('input')}
          />
        )}
        {phase === 'refine' && selectedConcept && storyBook.mode !== 'speed' && (
          <RefinementChat
            concept={selectedConcept}
            onConceptUpdate={setSelectedConcept}
            onGenerate={(concept, options) => startGeneration(plot || '', concept, options)}
            onBack={() => setPhase('input')}
            loading={loading}
            mode={storyBook.mode}
          />
        )}
        {phase === 'generating' && (
          <GenerationProgress
            events={progressEvents}
            totalPages={storyBook.book?.pages?.length ?? null}
            activeJobId={activeJobId}
            mode={storyBook.mode}
          />
        )}
      </div>
    )
  }

  // Default: Story list
  return (
    <div>
      {/* In-progress jobs */}
      {activeJobs.length > 0 && (
        <div className="mb-6">
          <InProgressSection jobs={activeJobs} onRetry={retryJob} onDelete={deleteJob} />
        </div>
      )}

      <StoryList
        stories={storiesList.stories}
        loading={storiesList.loading}
        search={storiesList.search}
        onSearchChange={storiesList.setSearch}
        sortBy={storiesList.sortBy}
        onSortChange={storiesList.setSortBy}
        filterSeries={storiesList.filterSeries}
        onFilterSeriesChange={storiesList.setFilterSeries}
        onCreateNew={() => router.push('/tools/story-studio/new')}
        onEdit={handleEdit}
        onDelete={storiesList.deleteStory}
        onToggleShare={storiesList.toggleShare}
      />
    </div>
  )
}

