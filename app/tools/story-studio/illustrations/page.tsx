'use client'

import { useState, useCallback } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'
import { useIllustrations } from '@/tools/story-studio/use-illustrations'
import { useCharacterList } from '@/tools/story-studio/use-characters'
import { PageGrid } from '@/tools/story-studio/illustrations/page-grid'
import { IllustrationControls } from '@/tools/story-studio/illustrations/illustration-controls'
import { PageIllustrationDetail } from '@/tools/story-studio/illustrations/page-illustration-detail'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

type View = 'grid' | 'detail'

export default function IllustrationsPage() {
  const { user, loading: authLoading } = useAuth()
  const { activeBook } = useBookContext()
  const { pages, cover, loading, generateOne, generateBatch, refresh } = useIllustrations()
  const { characters } = useCharacterList()

  const [view, setView] = useState<View>('grid')
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [qualityMode, setQualityMode] = useState<'fast' | 'quality'>('quality')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggleSelect = useCallback((pageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(pageId) ? next.delete(pageId) : next.add(pageId)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(pages.map(p => p.id)))
  }, [pages])

  const handleDeselectAll = useCallback(() => setSelectedIds(new Set()), [])

  const handlePageClick = useCallback((pageId: string | null) => {
    if (pageId) {
      setSelectedPageId(pageId)
      setView('detail')
    }
  }, [])

  const handleGenerateOne = useCallback(async (
    imagePrompt: string,
    mode: 'fast' | 'quality',
    characterIds: string[],
  ) => {
    setGenerating(true)
    setError(null)
    try {
      await generateOne(selectedPageId, imagePrompt, mode, characterIds)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }, [generateOne, selectedPageId])

  const handleGenerateBatch = useCallback(async () => {
    if (selectedIds.size === 0) return
    setGenerating(true)
    setError(null)
    try {
      const batchPages = pages
        .filter(p => selectedIds.has(p.id))
        .map(p => ({
          pageId: p.id,
          imagePrompt: p.imagePrompt || p.sceneDescription || '',
          characterIds: undefined,
        }))
      await generateBatch(batchPages, qualityMode)
      const interval = setInterval(async () => {
        await refresh()
      }, 5000)
      setTimeout(() => clearInterval(interval), 120000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Batch failed')
    } finally {
      setGenerating(false)
    }
  }, [selectedIds, pages, qualityMode, generateBatch, refresh])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to illustrate books</h2>
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

  // No book selected
  if (!activeBook) {
    return (
      <div className="text-center py-20">
        <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Select a book to start illustrating</h2>
        <p className="text-sm text-slate-400">Choose a book from the dropdown above.</p>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  // Detail view
  if (view === 'detail' && selectedPageId) {
    const page = pages.find(p => p.id === selectedPageId)
    if (!page) { setView('grid'); return null }

    return (
      <PageIllustrationDetail
        page={page}
        characters={characters}
        qualityMode={qualityMode}
        onGenerate={handleGenerateOne}
        onBack={() => { setView('grid'); refresh() }}
        generating={generating}
      />
    )
  }

  // Grid view (default)
  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <IllustrationControls
        selectedCount={selectedIds.size}
        qualityMode={qualityMode}
        onQualityChange={setQualityMode}
        onGenerateSelected={handleGenerateBatch}
        generating={generating}
      />

      <PageGrid
        pages={pages}
        cover={cover}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onPageClick={handlePageClick}
      />
    </div>
  )
}
