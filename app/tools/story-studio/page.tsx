'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { PlotInput } from '@/tools/story-studio/plot-input'
import { ConceptCards } from '@/tools/story-studio/concept-cards'
import { RefinementChat } from '@/tools/story-studio/refinement-chat'
import { GenerationProgress } from '@/tools/story-studio/generation-progress'
import { BookViewer } from '@/tools/story-studio/book-viewer'
import { BookEditor } from '@/tools/story-studio/book-editor'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import type { StoryConcept } from '@/tools/story-studio/types'

export default function StoryStudioPage() {
  const { user, loading: authLoading } = useAuth()
  const {
    phase, setPhase,
    plot, concepts,
    selectedConcept, setSelectedConcept,
    book,
    editorOpen, setEditorOpen,
    progressEvents,
    loading, error, setError,
    fetchConcepts, selectConcept, startGeneration,
    updateBook, updatePage, reset,
  } = useStoryBook()

  const handlePlotSubmit = useCallback(async (plotText: string) => {
    await fetchConcepts(plotText)
  }, [fetchConcepts])

  const handlePickConcept = useCallback((concept: StoryConcept) => {
    selectConcept(concept)
  }, [selectConcept])

  const handleConceptUpdate = useCallback((concept: StoryConcept) => {
    setSelectedConcept(concept)
  }, [setSelectedConcept])

  const handleGenerate = useCallback(async (concept: StoryConcept) => {
    if (!plot) return
    await startGeneration(plot, concept)
  }, [plot, startGeneration])

  // Auth gate — bypassed in development
  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && !authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in Required</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Sign in to create AI-illustrated story books.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />

        <div className="mt-4 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Story Studio
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Describe your story idea, pick a direction, and get a fully illustrated book
            </p>
          </div>
          <Link
            href="/tools/story-studio/bookshelf"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
          >
            My Bookshelf
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {phase === 'input' && (
          <PlotInput onSubmit={handlePlotSubmit} loading={loading} />
        )}

        {phase === 'concepts' && concepts && (
          <ConceptCards concepts={concepts} onPick={handlePickConcept} loading={loading} />
        )}

        {phase === 'refine' && selectedConcept && (
          <RefinementChat
            concept={selectedConcept}
            onConceptUpdate={handleConceptUpdate}
            onGenerate={handleGenerate}
            onBack={() => setPhase('concepts')}
            loading={loading}
          />
        )}

        {phase === 'generating' && (
          <GenerationProgress
            events={progressEvents}
            totalPages={book?.pages.length ?? null}
          />
        )}

        {phase === 'viewer' && book && !editorOpen && (
          <BookViewer
            book={book}
            onEdit={() => setEditorOpen(true)}
            onStartOver={reset}
          />
        )}

        {phase === 'viewer' && book && editorOpen && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>
            <BookEditor
              book={book}
              onUpdateBook={updateBook}
              onUpdatePage={updatePage}
              onPreview={() => setEditorOpen(false)}
              onStartOver={reset}
            />
          </div>
        )}
      </div>
    </div>
  )
}
