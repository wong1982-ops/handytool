'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { useBookshelf } from '@/tools/story-studio/use-bookshelf'
import { PlotInput } from '@/tools/story-studio/plot-input'
import { RefinementChat } from '@/tools/story-studio/refinement-chat'
import { GenerationProgress } from '@/tools/story-studio/generation-progress'
import { BookViewer } from '@/tools/story-studio/book-viewer'
import { BookEditor } from '@/tools/story-studio/book-editor'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import type { StoryConcept } from '@/tools/story-studio/types'
import { signInWithOAuth } from '@/lib/supabase/auth'
import Link from 'next/link'

type SidebarView = 'create' | 'bookshelf'

export default function StoryStudioPage() {
  const { user } = useAuth()
  const {
    phase, setPhase,
    plot,
    selectedConcept, setSelectedConcept,
    book,
    editorOpen, setEditorOpen,
    progressEvents,
    loading, error, setError,
    creditsUsed,
    fetchConcepts, startGeneration,
    updateBook, updatePage, reset,
  } = useStoryBook()

  const { books, loading: booksLoading, addBook, removeBook, toggleShare } = useBookshelf()

  const [activeView, setActiveView] = useState<SidebarView>('create')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [completionCredits, setCompletionCredits] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // When generation completes, save to bookshelf and switch view
  const prevPhaseRef = useRef(phase)
  useEffect(() => {
    if (prevPhaseRef.current === 'generating' && phase === 'viewer' && book?.status === 'complete') {
      addBook(book)
      setActiveView('bookshelf')
      if (creditsUsed) setCompletionCredits(creditsUsed)
      setTimeout(() => reset(), 500)
      setTimeout(() => setCompletionCredits(null), 8000)
    }
    prevPhaseRef.current = phase
  }, [phase, book, creditsUsed, addBook, reset])

  const isDev = process.env.NODE_ENV === 'development'

  // After OAuth redirect: restore saved plot and auto-submit
  useEffect(() => {
    if (!user) return
    try {
      const pendingPlot = localStorage.getItem('toolk1t-story-pending-plot')
      if (pendingPlot && phase === 'input') {
        localStorage.removeItem('toolk1t-story-pending-plot')
        fetchConcepts(pendingPlot)
      }
    } catch { /* ignore */ }
  }, [user, phase, fetchConcepts])

  const handlePlotSubmit = useCallback(async (plotText: string) => {
    // In production, require sign-in before generating
    if (!isDev && !user) {
      // Save plot to localStorage so it survives the OAuth redirect
      try {
        localStorage.setItem('toolk1t-story-pending-plot', plotText)
      } catch { /* ignore */ }
      await signInWithOAuth('google')
      return
    }
    await fetchConcepts(plotText)
  }, [fetchConcepts, isDev, user])


  const handleConceptUpdate = useCallback((concept: StoryConcept) => {
    setSelectedConcept(concept)
  }, [setSelectedConcept])

  const handleGenerate = useCallback(async (concept: StoryConcept) => {
    if (!plot) return
    await startGeneration(plot, concept)
  }, [plot, startGeneration])


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Fantasy header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 20%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 25% 60%, #c4b5fd, transparent),
              radial-gradient(1px 1px at 40% 15%, #fff, transparent),
              radial-gradient(2px 2px at 55% 45%, #fbbf24, transparent),
              radial-gradient(1px 1px at 70% 75%, #c4b5fd, transparent),
              radial-gradient(1.5px 1.5px at 85% 30%, #fff, transparent),
              radial-gradient(1px 1px at 95% 80%, #fbbf24, transparent),
              radial-gradient(2px 2px at 15% 85%, #a78bfa, transparent),
              radial-gradient(1px 1px at 50% 90%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 75% 10%, #fbbf24, transparent)
            `,
            animation: 'starfield-drift 12s ease-in-out infinite alternate',
          }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 5% 50%, #fff, transparent),
              radial-gradient(2px 2px at 30% 35%, #a78bfa, transparent),
              radial-gradient(1px 1px at 60% 65%, #fbbf24, transparent),
              radial-gradient(1.5px 1.5px at 80% 50%, #c4b5fd, transparent),
              radial-gradient(1px 1px at 45% 25%, #fff, transparent)
            `,
            animation: 'starfield-drift 16s ease-in-out 3s infinite alternate-reverse',
          }} />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-24 bg-gradient-to-t from-amber-500/10 via-purple-500/5 to-transparent blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-5 pb-6 md:pt-6 md:pb-8">
          <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />

          <div className="mt-4 flex items-center gap-3">
            <div className="relative">
              <svg className="w-9 h-9 md:w-10 md:h-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Story Studio
              </h1>
              <p className="text-purple-300/70 text-sm mt-0.5">
                Where imagination becomes illustrated tales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="max-w-7xl mx-auto flex">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 left-4 z-30 md:hidden w-12 h-12 rounded-full bg-indigo-900 text-white shadow-lg flex items-center justify-center cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left sidebar */}
        <aside className={`
          fixed md:sticky top-0 md:top-0 left-0 z-20 md:z-0
          w-64 md:w-56 lg:w-64 shrink-0 h-screen md:h-auto
          bg-white dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent
          border-r border-slate-200 dark:border-slate-800 md:border-r-0
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          px-3 md:px-4 pt-4 md:pt-6
        `}>
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveView('create'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'create'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{ minHeight: '44px' }}
            >
              <svg className={`w-5 h-5 ${activeView === 'create' ? 'text-indigo-500' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Build Story
            </button>
            <button
              onClick={() => { setActiveView('bookshelf'); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'bookshelf'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{ minHeight: '44px' }}
            >
              <svg className={`w-5 h-5 ${activeView === 'bookshelf' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              My Bookshelf
              {books.length > 0 && (
                <span className="ml-auto text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                  {books.length}
                </span>
              )}
            </button>
          </nav>

        </aside>

        {/* Main content */}
        <main className={`flex-1 min-w-0 px-4 md:px-6 py-6 md:py-8 ${
          activeView === 'create' && phase === 'viewer' ? '' : 'max-w-4xl'
        }`}>
          {activeView === 'create' ? (
            <>
              {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  {error}
                  <button onClick={() => setError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
                </div>
              )}

              {phase === 'input' && (
                <PlotInput onSubmit={handlePlotSubmit} loading={loading} />
              )}

              {phase === 'refine' && selectedConcept && (
                <RefinementChat
                  concept={selectedConcept}
                  onConceptUpdate={handleConceptUpdate}
                  onGenerate={handleGenerate}
                  onBack={() => { setPhase('input'); setSelectedConcept(null) }}
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
            </>
          ) : (
            /* Bookshelf view */
            <div>
              {completionCredits && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">
                      Book created! <span className="font-semibold">{completionCredits} credits</span> used
                    </span>
                  </div>
                  <button onClick={() => setCompletionCredits(null)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer" aria-label="Dismiss">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">My Bookshelf</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Your collection of AI-illustrated tales</p>
                </div>
                <button
                  onClick={() => { setActiveView('create'); reset() }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Create New
                </button>
              </div>

              {booksLoading ? (
                <div className="text-center py-16 text-slate-400">Loading...</div>
              ) : books.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-amber-500/20 flex items-center justify-center">
                    <svg className="w-9 h-9 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Your bookshelf is empty</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Create your first AI-illustrated story!</p>
                  <button
                    onClick={() => { setActiveView('create'); reset() }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Create Your First Story
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                  {books.map((bookItem) => (
                    <div
                      key={bookItem.id}
                      className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                    >
                      <Link href={`/tools/story-studio/book/${bookItem.slug}`} className="block relative">
                        {bookItem.coverImageUrl ? (
                          <img
                            src={bookItem.coverImageUrl}
                            alt={bookItem.title}
                            className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                            <svg className="w-12 h-12 text-purple-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                            </svg>
                          </div>
                        )}
                        {bookItem.style && (
                          <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 text-white px-2 py-0.5 rounded">
                            {bookItem.style}
                          </span>
                        )}
                      </Link>

                      <div className="p-3 flex-1 flex flex-col">
                        <Link href={`/tools/story-studio/book/${bookItem.slug}`}>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2">
                            {bookItem.title}
                          </h3>
                        </Link>
                        {bookItem.authors.length > 0 && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                            by {bookItem.authors.join(' & ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-1">
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {new Date(bookItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {bookItem.pageCount} pages
                          </p>
                        </div>
                      </div>

                      <div className="px-3 pb-3 flex gap-1.5">
                        <button
                          onClick={() => toggleShare(bookItem)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          style={{ minHeight: '36px' }}
                        >
                          {bookItem.isPublic ? 'Unshare' : 'Share'}
                        </button>
                        {deleteConfirm === bookItem.id ? (
                          <button
                            onClick={() => { removeBook(bookItem.id); setDeleteConfirm(null) }}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                            style={{ minHeight: '36px' }}
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(bookItem.id)}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            style={{ minHeight: '36px' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Create New card */}
                  <button
                    onClick={() => { setActiveView('create'); reset() }}
                    className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-3 aspect-[3/5] hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                      <svg className="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Create New</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Start a fresh tale</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes starfield-drift {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to { transform: translateY(-6px) scale(1.05); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
