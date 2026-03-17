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

type View = 'list' | 'create-ai'

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
        {phase === 'refine' && selectedConcept && (
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

