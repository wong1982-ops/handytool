'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoriesList } from '@/tools/story-studio/use-stories-list'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { useJobProgress } from '@/tools/story-studio/use-job-progress'
import { StoryList } from '@/tools/story-studio/stories/story-list'
import { CreateStoryModal } from '@/tools/story-studio/stories/create-story-modal'
import { StoryEditor } from '@/tools/story-studio/stories/story-editor'
import { PlotInput } from '@/tools/story-studio/plot-input'
import { RefinementChat } from '@/tools/story-studio/refinement-chat'
import { GenerationProgress } from '@/tools/story-studio/generation-progress'
import { InProgressSection } from '@/tools/story-studio/job-card'
import { signInWithOAuth } from '@/lib/supabase/auth'

type View = 'list' | 'create-ai' | 'editor'

export default function StoriesPage() {
  return (
    <Suspense>
      <StoriesContent />
    </Suspense>
  )
}

function StoriesContent() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const urlSeriesId = searchParams.get('seriesId')

  // Stories list
  const storiesList = useStoriesList()

  // AI creation flow (reuses existing hook)
  const storyBook = useStoryBook()

  // Job progress
  const { jobs: activeJobs, retryJob } = useJobProgress(user?.id)

  // View state
  const [view, setView] = useState<View>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)

  // Handlers
  const handleCreateAI = useCallback(() => {
    setShowCreateModal(false)
    storyBook.reset()
    if (urlSeriesId) storyBook.setSeriesId(urlSeriesId)
    setView('create-ai')
  }, [storyBook, urlSeriesId])

  const handleWriteFromScratch = useCallback(async () => {
    setShowCreateModal(false)
    try {
      const res = await fetch('/api/v1/story/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Story',
          status: 'draft',
          seriesId: urlSeriesId || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      const { data } = await res.json()
      setEditingBookId(data.id)
      setView('editor')
      storiesList.refresh()
    } catch {
      // show error
    }
  }, [urlSeriesId, storiesList])

  const handleEdit = useCallback((id: string) => {
    setEditingBookId(id)
    setView('editor')
  }, [])

  const handleBackToList = useCallback(() => {
    setView('list')
    setEditingBookId(null)
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
      setPhase, setSelectedConcept } = storyBook

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
            onGenerate={(concept) => startGeneration(plot || '', concept)}
            onBack={() => setPhase('input')}
            loading={loading}
          />
        )}
        {phase === 'generating' && (
          <GenerationProgress
            events={progressEvents}
            totalPages={storyBook.book?.pages?.length ?? null}
            activeJobId={activeJobId}
          />
        )}
      </div>
    )
  }

  // Story editor
  if (view === 'editor' && editingBookId) {
    return (
      <StoryEditorWrapper
        bookId={editingBookId}
        onBack={handleBackToList}
      />
    )
  }

  // Default: Story list
  return (
    <div>
      {/* In-progress jobs */}
      {activeJobs.length > 0 && (
        <div className="mb-6">
          <InProgressSection jobs={activeJobs} onRetry={retryJob} />
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
        onCreateNew={() => setShowCreateModal(true)}
        onEdit={handleEdit}
        onDelete={storiesList.deleteStory}
        onToggleShare={storiesList.toggleShare}
      />

      <CreateStoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGenerateWithAI={handleCreateAI}
        onWriteFromScratch={handleWriteFromScratch}
      />
    </div>
  )
}

/**
 * Wrapper that fetches book data and renders StoryEditor.
 * Separated to avoid fetching when editor is not shown.
 */
interface PageData {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}

function StoryEditorWrapper({ bookId, onBack }: { bookId: string; onBack: () => void }) {
  const [bookData, setBookData] = useState<{ title: string; pages: PageData[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/v1/story/books/${bookId}`)
        if (!res.ok) throw new Error('Not found')
        const { data } = await res.json()
        if (cancelled) return
        setBookData({
          title: data.title,
          pages: (data.pages ?? []).map((p: Record<string, unknown>) => ({
            sequence: p.sequence as number,
            sceneDescription: (p.sceneDescription as string) || '',
            narrativeText: (p.narrativeText as string) || '',
            dialogue: (p.dialogue as { speaker: string; line: string }[]) || [],
            mood: (p.mood as string) || '',
            imagePrompt: (p.imagePrompt as string) || '',
          })),
        })
      } catch {
        // show error
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [bookId])

  if (loading || !bookData) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  async function handleSave(pages: PageData[]) {
    await Promise.all(pages.map(page =>
      fetch(`/api/v1/story/books/${bookId}/pages/${page.sequence}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrativeText: page.narrativeText,
          sceneDescription: page.sceneDescription,
          dialogue: page.dialogue,
          mood: page.mood,
          imagePrompt: page.imagePrompt,
        }),
      })
    ))
  }

  return (
    <StoryEditor
      bookId={bookId}
      title={bookData.title}
      pages={bookData.pages}
      onSave={handleSave}
      onBack={onBack}
    />
  )
}
