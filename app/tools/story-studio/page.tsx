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
      {/* Magical gradient hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        {/* Animated sparkle overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 70% 60%, white, transparent), radial-gradient(1px 1px at 40% 80%, white, transparent), radial-gradient(1px 1px at 80% 20%, white, transparent), radial-gradient(2px 2px at 50% 50%, white, transparent), radial-gradient(1px 1px at 10% 70%, white, transparent), radial-gradient(1px 1px at 90% 40%, white, transparent)',
          animation: 'sparkle-float 6s ease-in-out infinite alternate',
        }} />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(1px 1px at 15% 50%, white, transparent), radial-gradient(2px 2px at 55% 25%, white, transparent), radial-gradient(1px 1px at 85% 75%, white, transparent), radial-gradient(2px 2px at 35% 90%, white, transparent), radial-gradient(1px 1px at 65% 10%, white, transparent)',
          animation: 'sparkle-float 8s ease-in-out 2s infinite alternate-reverse',
        }} />

        <div className="relative max-w-4xl mx-auto px-4 md:px-6 pt-6 pb-8 md:pt-8 md:pb-10">
          <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />

          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                {/* Magic wand / sparkle icon */}
                <svg className="w-7 h-7 md:w-8 md:h-8 text-white/90" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Story Studio
                </h1>
              </div>
              <p className="text-white/70 text-sm md:text-base">
                Describe your story idea, pick a direction, and get a fully illustrated book
              </p>
            </div>
            <Link
              href="/tools/story-studio/bookshelf"
              className="shrink-0 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/25 transition-colors"
              style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
            >
              My Bookshelf
            </Link>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
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

      {/* Sparkle animation */}
      <style jsx>{`
        @keyframes sparkle-float {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-8px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}
