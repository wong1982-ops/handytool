'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { IllustrationReviewPage } from './illustration-review-page'
import { IllustrationSummary } from './illustration-summary'

interface PageData {
  id: string
  sequence: number
  sceneDescription: string
  narrativeText: string
  imagePrompt: string | null
  dialogue: { speaker: string; line: string }[] | null
  mood: string | null
  illustration: {
    imageUrl: string | null
    status: 'pending' | 'generating' | 'done' | 'error'
  } | null
}

interface CharacterItem {
  id: string
  name: string
}

interface IllustrationReviewFlowProps {
  bookId: string
  onBack: () => void
  onNarration: () => void
}

const CREDIT_COST = { fast: 3, quality: 5 } as const

export function IllustrationReviewFlow({ bookId, onBack, onNarration }: IllustrationReviewFlowProps) {
  const [pages, setPages] = useState<PageData[]>([])
  const [characters, setCharacters] = useState<CharacterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [qualityMode, setQualityMode] = useState<'fast' | 'quality'>('quality')
  const [generating, setGenerating] = useState(false)

  // Per-page decisions and edits
  const [decisions, setDecisions] = useState<Map<string, 'generate' | 'skip'>>(new Map())
  const [editedPrompts, setEditedPrompts] = useState<Map<string, string>>(new Map())
  const [selectedChars, setSelectedChars] = useState<Map<string, string[]>>(new Map())

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch pages with illustration status
  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/illustrations`)
      if (!res.ok) return
      const { data } = await res.json()
      setPages(data?.pages ?? [])
    } catch { /* silent */ }
  }, [bookId])

  // Fetch approved characters
  useEffect(() => {
    async function loadChars() {
      try {
        const res = await fetch('/api/v1/story/characters')
        if (!res.ok) return
        const { data } = await res.json()
        setCharacters(
          (data ?? [])
            .filter((c: { status: string }) => c.status === 'approved')
            .map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))
        )
      } catch { /* silent */ }
    }
    loadChars()
  }, [])

  // Initial load
  useEffect(() => {
    fetchPages().finally(() => setLoading(false))
  }, [fetchPages])

  // Polling during generation
  useEffect(() => {
    if (!generating) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }
    pollRef.current = setInterval(fetchPages, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [generating, fetchPages])

  // Stop polling when all generating pages complete
  useEffect(() => {
    if (!generating) return
    const generatedPages = pages.filter(p => decisions.get(p.id) === 'generate')
    const allDone = generatedPages.length > 0 && generatedPages.every(
      p => p.illustration?.status === 'done' || p.illustration?.status === 'error'
    )
    if (allDone) setGenerating(false)
  }, [generating, pages, decisions])

  const currentPage = pages[currentIndex]

  const getDecision = (pageId: string) => decisions.get(pageId) ?? 'pending'
  const getPrompt = (pageId: string, fallback: string | null) => editedPrompts.get(pageId) ?? fallback ?? ''
  const getChars = (pageId: string) => selectedChars.get(pageId) ?? []

  const handleGenerate = () => {
    if (!currentPage) return
    setDecisions(prev => new Map(prev).set(currentPage.id, 'generate'))
    if (!editedPrompts.has(currentPage.id)) {
      setEditedPrompts(prev => new Map(prev).set(currentPage.id, currentPage.imagePrompt ?? ''))
    }
    // Advance
    if (currentIndex < pages.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setShowSummary(true)
    }
  }

  const handleSkip = () => {
    if (!currentPage) return
    setDecisions(prev => new Map(prev).set(currentPage.id, 'skip'))
    if (currentIndex < pages.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setShowSummary(true)
    }
  }

  const handleBatchGenerate = async () => {
    const toGenerate = pages
      .filter(p => decisions.get(p.id) === 'generate')
      .map(p => ({
        pageId: p.id,
        imagePrompt: editedPrompts.get(p.id) ?? p.imagePrompt ?? '',
        characterIds: selectedChars.get(p.id),
      }))

    if (toGenerate.length === 0) return

    setGenerating(true)

    // Chunk into batches of 20
    for (let i = 0; i < toGenerate.length; i += 20) {
      const chunk = toGenerate.slice(i, i + 20)
      try {
        await fetch(`/api/v1/story/books/${bookId}/illustrate/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pages: chunk, qualityMode }),
        })
      } catch (err) {
        console.error('[illustration-review] Batch submit failed:', err)
      }
    }

    // Refresh to get initial status
    await fetchPages()
  }

  const handleRetryFailed = async () => {
    const failed = pages
      .filter(p => decisions.get(p.id) === 'generate' && p.illustration?.status === 'error')
      .map(p => ({
        pageId: p.id,
        imagePrompt: editedPrompts.get(p.id) ?? p.imagePrompt ?? '',
        characterIds: selectedChars.get(p.id),
      }))

    if (failed.length === 0) return
    setGenerating(true)

    for (let i = 0; i < failed.length; i += 20) {
      const chunk = failed.slice(i, i + 20)
      try {
        await fetch(`/api/v1/story/books/${bookId}/illustrate/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pages: chunk, qualityMode }),
        })
      } catch { /* silent */ }
    }

    await fetchPages()
  }

  const generateCount = Array.from(decisions.values()).filter(d => d === 'generate').length
  const creditTotal = generateCount * CREDIT_COST[qualityMode]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={showSummary ? () => setShowSummary(false) : onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {showSummary ? 'Review & Generate' : `Add Illustrations — Page ${currentIndex + 1} of ${pages.length}`}
          </h2>
        </div>
        {!showSummary && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Quality toggle */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {(['fast', 'quality'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setQualityMode(mode)}
                  className={`px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    qualityMode === mode
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode === 'fast' ? 'Fast 3cr' : 'Quality 5cr'}
                </button>
              ))}
            </div>
            {/* Credit total */}
            {generateCount > 0 && (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {creditTotal} credits
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress dots */}
      {!showSummary && (
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {pages.map((p, i) => {
            const d = getDecision(p.id)
            const isActive = i === currentIndex
            return (
              <button
                key={p.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900'
                    : ''
                } ${
                  d === 'generate'
                    ? 'bg-emerald-500 text-white'
                    : d === 'skip'
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
          {/* Finish button */}
          <button
            onClick={() => setShowSummary(true)}
            className="px-3 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex-shrink-0 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
          >
            Finish
          </button>
        </div>
      )}

      {/* Content */}
      {showSummary ? (
        <IllustrationSummary
          pages={pages.map(p => ({
            sequence: p.sequence,
            decision: decisions.get(p.id) ?? 'skip',
            imageUrl: p.illustration?.imageUrl,
            status: p.illustration?.status,
          }))}
          qualityMode={qualityMode}
          generating={generating}
          onGenerate={handleBatchGenerate}
          onRetryFailed={handleRetryFailed}
          onAddNarration={onNarration}
          onDone={onBack}
        />
      ) : currentPage ? (
        <IllustrationReviewPage
          page={currentPage}
          characters={characters}
          decision={getDecision(currentPage.id)}
          editedPrompt={getPrompt(currentPage.id, currentPage.imagePrompt)}
          selectedCharacterIds={getChars(currentPage.id)}
          onPromptChange={prompt => setEditedPrompts(prev => new Map(prev).set(currentPage.id, prompt))}
          onCharacterToggle={id => {
            setSelectedChars(prev => {
              const next = new Map(prev)
              const curr = next.get(currentPage.id) ?? []
              next.set(currentPage.id, curr.includes(id) ? curr.filter(c => c !== id) : [...curr, id])
              return next
            })
          }}
          onGenerate={handleGenerate}
          onSkip={handleSkip}
        />
      ) : null}

      {/* Page navigation (when not in summary) */}
      {!showSummary && pages.length > 1 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (currentIndex < pages.length - 1) setCurrentIndex(i => i + 1)
              else setShowSummary(true)
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {currentIndex < pages.length - 1 ? 'Next' : 'Review'}
          </button>
        </div>
      )}
    </div>
  )
}
