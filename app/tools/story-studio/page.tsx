'use client'

import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { useBookshelf } from '@/tools/story-studio/use-bookshelf'
import { useSeriesList, useSeriesDetail } from '@/tools/story-studio/use-series'
import { PlotInput } from '@/tools/story-studio/plot-input'
import { RefinementChat } from '@/tools/story-studio/refinement-chat'
import { GenerationProgress } from '@/tools/story-studio/generation-progress'
import { BookViewer } from '@/tools/story-studio/book-viewer'
import { BookEditor } from '@/tools/story-studio/book-editor'
import type { StoryConcept, AppPhase } from '@/tools/story-studio/types'
import { signInWithOAuth } from '@/lib/supabase/auth'
import Link from 'next/link'

export default function StoryStudioPage() {
  return (
    <Suspense>
      <StoryStudioContent />
    </Suspense>
  )
}

function StoryStudioContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const urlSeriesId = searchParams.get('seriesId')
  const {
    phase, setPhase,
    plot,
    selectedConcept, setSelectedConcept,
    book,
    editorOpen, setEditorOpen,
    progressEvents,
    loading, error, setError, errorCode, setErrorCode,
    creditsUsed,
    seriesId, setSeriesId,
    activeJobId,
    fetchConcepts, startGeneration,
    updateBook, updatePage, reset,
  } = useStoryBook()

  // Load user's series for the picker
  const { series: allSeries, loading: seriesLoading } = useSeriesList()

  // Active series ID: from URL param or user-picked
  const activeSeriesId = seriesId || urlSeriesId || ''
  const { detail: seriesDetail } = useSeriesDetail(activeSeriesId)

  useEffect(() => {
    if (urlSeriesId) setSeriesId(urlSeriesId)
  }, [urlSeriesId, setSeriesId])

  const { addBook } = useBookshelf()

  const [completionCredits, setCompletionCredits] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [scannedPlot, setScannedPlot] = useState<string | null>(null)

  // Read scanned plot from sessionStorage when arriving from Scan page
  useEffect(() => {
    if (searchParams.get('fromScan') === 'true') {
      try {
        const plot = sessionStorage.getItem('toolk1t-story-scanned-plot')
        if (plot) {
          setScannedPlot(plot)
          sessionStorage.removeItem('toolk1t-story-scanned-plot')
          window.history.replaceState(null, '', '/tools/story-studio')
        }
      } catch { /* ignore */ }
    }
  }, [searchParams])

  // When generation completes, save to bookshelf
  const prevPhaseRef = useRef(phase)
  useEffect(() => {
    if (prevPhaseRef.current === 'generating' && phase === 'viewer' && book?.status === 'complete') {
      addBook(book, seriesId, seriesDetail?.title ?? null)
      if (creditsUsed) setCompletionCredits(creditsUsed)
      setTimeout(() => setCompletionCredits(null), 8000)
    }
    prevPhaseRef.current = phase
  }, [phase, book, creditsUsed, addBook, reset])

  // Track the highest phase the user has reached (for wizard step navigation)
  const [highestPhase, setHighestPhase] = useState<AppPhase>('input')
  const phaseOrder: AppPhase[] = ['input', 'refine', 'generating', 'viewer']
  useEffect(() => {
    const currentIdx = phaseOrder.indexOf(phase)
    const highestIdx = phaseOrder.indexOf(highestPhase)
    if (currentIdx > highestIdx) setHighestPhase(phase)
  }, [phase])

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
    await fetchConcepts(plotText, seriesId ?? undefined)
  }, [fetchConcepts, isDev, user, seriesId])


  const handleConceptUpdate = useCallback((concept: StoryConcept) => {
    setSelectedConcept(concept)
  }, [setSelectedConcept])

  const handleGenerate = useCallback(async (concept: StoryConcept) => {
    if (!plot) return
    await startGeneration(plot, concept)
  }, [plot, startGeneration])


  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
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

      {error && errorCode === 'JOB_LIMIT_REACHED' ? (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-1">Queue Full</h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-3">
                You already have 3 books being generated. Please wait for one to finish before starting a new one.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="/tools/story-studio/bookshelf"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
                  style={{ minHeight: '40px' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  View Bookshelf
                </a>
                <button
                  onClick={() => { setError(null); setErrorCode(null) }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : error && errorCode === 'INSUFFICIENT_CREDITS' ? (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Not Enough Credits</h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">{error}</p>
              <div className="flex items-center gap-3">
                <a
                  href="/billing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
                  style={{ minHeight: '40px' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Top Up Credits
                </a>
                <button
                  onClick={() => { setError(null); setErrorCode(null) }}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline cursor-pointer">Dismiss</button>
        </div>
      ) : null}

      {/* Wizard step indicator — clickable to jump between steps */}
      <div className="mb-6">
        <div className="flex items-center gap-1">
          {([
            { id: 'input' as const, label: 'Write Plot', icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            )},
            { id: 'refine' as const, label: 'Refine', icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            )},
            { id: 'generating' as const, label: 'Generate', icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            )},
            { id: 'viewer' as const, label: 'Review', icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            )},
          ]).map((step, i, arr) => {
            const phaseOrder = ['input', 'refine', 'generating', 'viewer']
            const currentIndex = phaseOrder.indexOf(phase)
            const stepIndex = phaseOrder.indexOf(step.id)
            const highestIndex = phaseOrder.indexOf(highestPhase)
            const isActive = step.id === phase
            const isCompleted = stepIndex < currentIndex
            const isReachable = stepIndex <= highestIndex
            const isGenerating = phase === 'generating'
            const isClickable = (isReachable || step.id === 'input') && !isActive && !isGenerating

            return (
              <div key={step.id} className="flex items-center gap-1 flex-1">
                {i > 0 && (
                  <div className={`flex-1 h-px transition-colors ${isCompleted || isActive ? 'bg-purple-400/50 dark:bg-purple-500/30' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
                <button
                  onClick={() => {
                    if (!isClickable || loading || isGenerating) return
                    // Jump to any previously reached phase — preserve data
                    if (step.id === 'input') {
                      setPhase('input')
                    } else if (step.id === 'refine' && selectedConcept) {
                      setPhase('refine')
                    } else if (step.id === 'viewer' && book) {
                      setPhase('viewer')
                    }
                  }}
                  disabled={!isClickable || loading}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/15 to-amber-500/10 dark:from-purple-500/20 dark:to-amber-500/10 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300/50 dark:ring-purple-700/50'
                      : isCompleted
                        ? 'text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer'
                        : 'text-slate-400 dark:text-slate-600'
                  } ${isClickable && !isActive ? 'cursor-pointer' : ''}`}
                >
                  {isCompleted ? (
                    <div className="w-4 h-4 rounded-full bg-purple-500 dark:bg-purple-400 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                  ) : (
                    <span className={isActive ? 'text-purple-600 dark:text-purple-400' : ''}>{step.icon}</span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-px transition-colors ${isCompleted ? 'bg-purple-400/50 dark:bg-purple-500/30' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Series picker — flat select / deselect cards */}
      {phase === 'input' && (
        <>
          {seriesLoading ? (
            <div className="mb-4 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-3" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-56 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                  </div>
                ))}
              </div>
            </div>
          ) : allSeries.length > 0 ? (
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">
                Use a series <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {allSeries.map((s) => {
                  const approvedChars = s.characters.filter(c => c.status === 'approved')
                  const isSelected = seriesId === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (isSelected) {
                          setSeriesId(null)
                          window.history.replaceState(null, '', '/tools/story-studio')
                        } else {
                          setSeriesId(s.id)
                        }
                      }}
                      className={`relative shrink-0 w-56 text-left rounded-xl border p-3 transition-all duration-150 cursor-pointer group ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      {/* Selected indicator — top-right checkmark */}
                      <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150 ${
                        isSelected
                          ? 'bg-indigo-500 dark:bg-indigo-400 border-indigo-500 dark:border-indigo-400'
                          : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>

                      <p className={`text-sm font-semibold truncate pr-7 transition-colors ${
                        isSelected
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {s.artStyle}
                      </p>
                      {approvedChars.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex -space-x-1.5">
                            {approvedChars.slice(0, 4).map((c) => (
                              c.referenceImageUrl ? (
                                <img key={c.name} src={c.referenceImageUrl} alt={c.name} className="w-6 h-6 rounded-full object-cover border border-white dark:border-slate-800" />
                              ) : (
                                <div key={c.name} className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center border border-white dark:border-slate-800">
                                  <span className="text-[9px] font-bold text-indigo-500">{c.name.charAt(0)}</span>
                                </div>
                              )
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">
                            {approvedChars.length} {approvedChars.length === 1 ? 'character' : 'characters'}
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </>
      )}

      {phase === 'input' && (
        <PlotInput onSubmit={handlePlotSubmit} loading={loading} initialPlot={scannedPlot ?? undefined} />
      )}

      {phase === 'refine' && selectedConcept && (
        <RefinementChat
          concept={selectedConcept}
          onConceptUpdate={handleConceptUpdate}
          onGenerate={handleGenerate}
          onBack={() => { setPhase('input') }}
          loading={loading}
        />
      )}

      {phase === 'generating' && (
        <GenerationProgress
          events={progressEvents}
          totalPages={book?.pages.length ?? null}
          activeJobId={activeJobId}
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

      {/* Delete confirmation dialog */}
      {deleteConfirm && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Delete Book</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                    style={{ minHeight: '44px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
