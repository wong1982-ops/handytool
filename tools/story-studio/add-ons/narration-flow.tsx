'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { NarratorVoiceSelector } from '@/tools/story-studio/narration/narrator-voice-selector'

interface PageAudio {
  id: string
  sequence: number
  narrativeText: string
  dialogue: { speaker: string; line: string }[] | null
  audio: {
    audioUrl: string | null
    status: 'pending' | 'generating' | 'done' | 'error'
    durationSeconds: number | null
  } | null
}

interface NarrationFlowProps {
  bookId: string
  onBack: () => void
}

const CREDIT_PER_PAGE = 3

export function NarrationFlow({ bookId, onBack }: NarrationFlowProps) {
  const [pages, setPages] = useState<PageAudio[]>([])
  const [loading, setLoading] = useState(true)
  const [narratorVoice, setNarratorVoice] = useState('Kore')
  const [voiceMap, setVoiceMap] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAudio = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/audio`)
      if (!res.ok) return
      const { data } = await res.json()
      setPages(data?.pages ?? [])
    } catch { /* silent */ }
  }, [bookId])

  // Initial load
  useEffect(() => {
    fetchAudio().finally(() => setLoading(false))
  }, [fetchAudio])

  // Initialize selected pages (all without completed audio)
  useEffect(() => {
    if (pages.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(
        pages.filter(p => p.audio?.status !== 'done').map(p => p.id)
      ))
    }
  }, [pages, selectedIds.size])

  // Extract unique speakers for voice mapping
  const uniqueSpeakers = Array.from(new Set(
    pages.flatMap(p => (p.dialogue ?? []).map(d => d.speaker)).filter(Boolean)
  ))

  // Polling during generation
  useEffect(() => {
    if (!generating) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }
    pollRef.current = setInterval(fetchAudio, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [generating, fetchAudio])

  // Stop polling when all done
  useEffect(() => {
    if (!generating) return
    const selected = pages.filter(p => selectedIds.has(p.id))
    const allDone = selected.length > 0 && selected.every(
      p => p.audio?.status === 'done' || p.audio?.status === 'error'
    )
    if (allDone) setGenerating(false)
  }, [generating, pages, selectedIds])

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds(new Set(pages.map(p => p.id)))
  }

  const handleSelectNone = () => {
    setSelectedIds(new Set())
  }

  const handleGenerate = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    setGenerating(true)

    // Chunk into batches of 20
    for (let i = 0; i < ids.length; i += 20) {
      const chunk = ids.slice(i, i + 20)
      try {
        await fetch(`/api/v1/story/books/${bookId}/narrate/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageIds: chunk,
            narratorVoice,
            voiceMap: Object.keys(voiceMap).length > 0 ? voiceMap : undefined,
          }),
        })
      } catch (err) {
        console.error('[narration-flow] Batch submit failed:', err)
      }
    }

    await fetchAudio()
  }

  const handleRetryFailed = async () => {
    const failedIds = pages
      .filter(p => selectedIds.has(p.id) && p.audio?.status === 'error')
      .map(p => p.id)

    if (failedIds.length === 0) return
    setGenerating(true)

    for (let i = 0; i < failedIds.length; i += 20) {
      const chunk = failedIds.slice(i, i + 20)
      try {
        await fetch(`/api/v1/story/books/${bookId}/narrate/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageIds: chunk, narratorVoice, voiceMap }),
        })
      } catch { /* silent */ }
    }

    await fetchAudio()
  }

  const selectedCount = selectedIds.size
  const totalCost = selectedCount * CREDIT_PER_PAGE
  const doneCount = pages.filter(p => p.audio?.status === 'done').length
  const errorCount = pages.filter(p => selectedIds.has(p.id) && p.audio?.status === 'error').length
  const allComplete = generating === false && doneCount > 0 && pages.filter(p => selectedIds.has(p.id)).every(
    p => p.audio?.status === 'done' || p.audio?.status === 'error'
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-8 h-8 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
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
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Narration</h2>
      </div>

      {/* All complete message */}
      {allComplete && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 p-5 text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">All done!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{doneCount} pages narrated successfully.</p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Back to Editor
          </button>
        </div>
      )}

      {/* Voice selection */}
      {!allComplete && (
        <div className="space-y-6">
          {/* Narrator voice */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Narrator Voice</h3>
            <NarratorVoiceSelector selectedVoice={narratorVoice} onSelect={setNarratorVoice} />
          </div>

          {/* Character voice mapping */}
          {uniqueSpeakers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Character Voices</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Optional — assign voices to dialogue speakers</p>
              <div className="space-y-2">
                {uniqueSpeakers.map(speaker => (
                  <div key={speaker} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-28 truncate flex-shrink-0">{speaker}</span>
                    <select
                      value={voiceMap[speaker] || ''}
                      onChange={e => setVoiceMap(prev => {
                        const next = { ...prev }
                        if (e.target.value) next[speaker] = e.target.value
                        else delete next[speaker]
                        return next
                      })}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600
                        bg-white dark:bg-slate-800 text-sm
                        focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="">Use narrator voice</option>
                      <option value="Puck">Puck (male, bright)</option>
                      <option value="Charon">Charon (male, deep)</option>
                      <option value="Kore">Kore (female, warm)</option>
                      <option value="Fenrir">Fenrir (male, gruff)</option>
                      <option value="Aoede">Aoede (female, gentle)</option>
                      <option value="Leda">Leda (female, clear)</option>
                      <option value="Enceladus">Enceladus (male, calm)</option>
                      <option value="Iapetus">Iapetus (male, sturdy)</option>
                      <option value="Umbriel">Umbriel (male, mysterious)</option>
                      <option value="Algieba">Algieba (male, smooth)</option>
                      <option value="Despina">Despina (female, bright)</option>
                      <option value="Erinome">Erinome (female, soft)</option>
                      <option value="Gacrux">Gacrux (male, mature)</option>
                      <option value="Pulcherrima">Pulcherrima (female, rich)</option>
                      <option value="Vindemiatrix">Vindemiatrix (female, elegant)</option>
                      <option value="Zubenelgenubi">Zubenelgenubi (male, wise)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pages</h3>
              <div className="flex gap-2">
                <button onClick={handleSelectAll} className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer">Select all</button>
                <button onClick={handleSelectNone} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">None</button>
              </div>
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              {pages.map(page => {
                const isSelected = selectedIds.has(page.id)
                const status = page.audio?.status
                const speakers = (page.dialogue ?? []).map(d => d.speaker).filter(Boolean)
                const uniquePageSpeakers = Array.from(new Set(speakers))

                return (
                  <label
                    key={page.id}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-purple-50/50 dark:bg-purple-900/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(page.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-6 text-center flex-shrink-0">
                      {page.sequence}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">
                      {page.narrativeText?.slice(0, 80) || 'No text'}
                      {(page.narrativeText?.length ?? 0) > 80 ? '...' : ''}
                    </span>
                    {uniquePageSpeakers.length > 0 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {uniquePageSpeakers.join(', ')}
                      </span>
                    )}
                    {/* Status */}
                    {status === 'done' && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </span>
                    )}
                    {status === 'generating' && (
                      <svg className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {status === 'error' && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                    {/* Audio player */}
                    {status === 'done' && page.audio?.audioUrl && (
                      <audio
                        src={page.audio.audioUrl}
                        controls
                        className="h-7 w-28 flex-shrink-0"
                        preload="none"
                      />
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Retry failed */}
          {errorCount > 0 && (
            <button
              onClick={handleRetryFailed}
              className="w-full py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Retry Failed ({errorCount})
            </button>
          )}

          {/* Bottom bar */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedCount} page{selectedCount !== 1 ? 's' : ''} x {CREDIT_PER_PAGE} credits
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{totalCost} credits</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={selectedCount === 0 || generating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ minHeight: '44px' }}
            >
              {generating ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                `Generate All (${selectedCount})`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
