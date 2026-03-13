'use client'

import { useState, useCallback, useMemo } from 'react'
import { useBookContext } from '@/tools/story-studio/use-book-context'
import { useNarration } from '@/tools/story-studio/use-narration'
import { useCharacterList } from '@/tools/story-studio/use-characters'
import { NarratorVoiceSelector } from '@/tools/story-studio/narration/narrator-voice-selector'
import { VoiceMapEditor } from '@/tools/story-studio/narration/voice-map-editor'
import { PageNarrationList } from '@/tools/story-studio/narration/page-narration-list'
import { useAuth } from '@/lib/hooks/use-auth'
import { signInWithOAuth } from '@/lib/supabase/auth'

const CREDIT_PER_PAGE = 3

export default function NarrationPage() {
  const { user, loading: authLoading } = useAuth()
  const { activeBook } = useBookContext()
  const { pages, loading, generateOne, generateBatch, refresh } = useNarration()
  const { characters } = useCharacterList()

  const [narratorVoice, setNarratorVoice] = useState('Enceladus')
  const [voiceMap, setVoiceMap] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Detect unique speakers across all pages
  const bookSpeakers = useMemo(() => {
    const speakers = new Set<string>()
    for (const page of pages) {
      for (const d of page.dialogue ?? []) {
        speakers.add(d.speaker)
      }
    }
    return Array.from(speakers)
  }, [pages])

  // Characters that appear as speakers in this book
  const bookCharacters = useMemo(() => {
    return characters.filter(c =>
      bookSpeakers.some(s => s.toLowerCase() === c.name.toLowerCase())
    )
  }, [characters, bookSpeakers])

  // Pre-populate voice map from character defaults
  const effectiveVoiceMap = useMemo(() => {
    const defaults: Record<string, string> = {}
    for (const char of bookCharacters) {
      if (char.voice) defaults[char.name] = char.voice
    }
    return { ...defaults, ...voiceMap }
  }, [bookCharacters, voiceMap])

  const unassignedSpeakers = bookSpeakers.filter(s => !effectiveVoiceMap[s])

  const handleToggleSelect = useCallback((pageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(pageId) ? next.delete(pageId) : next.add(pageId)
      return next
    })
  }, [])

  const handlePageClick = useCallback(async (pageId: string) => {
    setGenerating(true)
    setError(null)
    try {
      await generateOne(pageId, narratorVoice, effectiveVoiceMap)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Narration failed')
    } finally {
      setGenerating(false)
    }
  }, [generateOne, narratorVoice, effectiveVoiceMap])

  const handleGenerateBatch = useCallback(async () => {
    if (selectedIds.size === 0) return
    if (unassignedSpeakers.length > 0) {
      setError(`Assign voices to: ${unassignedSpeakers.join(', ')}`)
      return
    }
    setGenerating(true)
    setError(null)
    try {
      await generateBatch(Array.from(selectedIds), narratorVoice, effectiveVoiceMap)
      const interval = setInterval(async () => { await refresh() }, 5000)
      setTimeout(() => clearInterval(interval), 120000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Batch failed')
    } finally {
      setGenerating(false)
    }
  }, [selectedIds, unassignedSpeakers, narratorVoice, effectiveVoiceMap, generateBatch, refresh])

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to add narration</h2>
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Select a book to start narrating</h2>
        <p className="text-sm text-slate-400">Choose a book from the dropdown above.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <NarratorVoiceSelector
        selectedVoice={narratorVoice}
        onSelect={setNarratorVoice}
      />

      {bookCharacters.length > 0 && (
        <VoiceMapEditor
          characters={bookCharacters}
          voiceMap={effectiveVoiceMap}
          onChange={setVoiceMap}
        />
      )}

      {unassignedSpeakers.length > 0 && (
        <div className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm">
          Unassigned speakers: {unassignedSpeakers.join(', ')}. Select voices above before generating.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const allSelected = pages.every(p => selectedIds.has(p.id))
              setSelectedIds(allSelected ? new Set() : new Set(pages.map(p => p.id)))
            }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            {pages.every(p => selectedIds.has(p.id)) ? 'Deselect all' : 'Select all'}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-slate-500">{selectedIds.size} selected</span>
          )}
        </div>

        <button
          onClick={handleGenerateBatch}
          disabled={selectedIds.size === 0 || generating}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          {generating
            ? 'Generating...'
            : selectedIds.size > 0
              ? `Generate Selected (${selectedIds.size}) — ${selectedIds.size * CREDIT_PER_PAGE} credits`
              : 'Select pages to generate'}
        </button>
      </div>

      <PageNarrationList
        pages={pages}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onPageClick={handlePageClick}
      />
    </div>
  )
}
