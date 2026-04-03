'use client'

import { useState, useCallback } from 'react'
import type { Page, Character } from '@/tools/story-studio/types'

interface PageEditorProps {
  bookId: string
  page: Page
  characters: Character[]
  onSave: (updates: Partial<Page>) => void
  onCancel: () => void
}

export function PageEditor({ bookId, page, characters, onSave, onCancel }: PageEditorProps) {
  const [narrativeText, setNarrativeText] = useState(page.narrativeText)
  const [dialogue, setDialogue] = useState(page.dialogue || [])
  const [imagePrompt, setImagePrompt] = useState(page.imagePrompt)
  const [imageUrl, setImageUrl] = useState(page.imageUrl)
  const [saving, setSaving] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [regeneratingImage, setRegeneratingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showImagePrompt, setShowImagePrompt] = useState(false)

  const handleEnrich = useCallback(async () => {
    setEnriching(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/story/enrich-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrativeText,
          dialogue: dialogue.length > 0 ? dialogue : undefined,
          mood: page.mood,
          sceneDescription: page.sceneDescription,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Enrichment failed')
      }
      const { data } = await res.json()
      if (data.narrativeText) setNarrativeText(data.narrativeText)
      if (data.dialogue?.length) setDialogue(data.dialogue)
      if (data.imagePrompt) setImagePrompt(data.imagePrompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrichment failed')
    } finally {
      setEnriching(false)
    }
  }, [narrativeText, dialogue, page.mood, page.sceneDescription])

  const handleRegenerateImage = useCallback(async () => {
    setRegeneratingImage(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/story/regenerate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePrompt,
          characters: characters.map(c => ({ name: c.name, description: c.description })),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        if (err?.code === 'INSUFFICIENT_CREDITS') {
          throw new Error('Insufficient credits for image regeneration')
        }
        throw new Error(err?.error || 'Image regeneration failed')
      }
      const { data } = await res.json()
      if (data.imageUrl) setImageUrl(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image regeneration failed')
    } finally {
      setRegeneratingImage(false)
    }
  }, [imagePrompt, characters])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSequence: page.sequence,
          narrativeText,
          dialogue,
          imagePrompt,
          imageUrl,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Save failed')
      }
      onSave({ narrativeText, dialogue, imagePrompt, imageUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [bookId, page.sequence, narrativeText, dialogue, imagePrompt, imageUrl, onSave])

  const handleDialogueChange = (index: number, field: 'speaker' | 'line', value: string) => {
    setDialogue(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const addDialogue = () => setDialogue(prev => [...prev, { speaker: '', line: '' }])
  const removeDialogue = (index: number) => setDialogue(prev => prev.filter((_, i) => i !== index))

  const hasChanges = narrativeText !== page.narrativeText
    || JSON.stringify(dialogue) !== JSON.stringify(page.dialogue || [])
    || imagePrompt !== page.imagePrompt
    || imageUrl !== page.imageUrl

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Edit Page {page.sequence}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--tk-color-primary-500,#3D6AF2)] text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-default"
            style={{ minHeight: '44px' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Image panel */}
        <div className="lg:w-[45%] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          <div className="relative bg-slate-100 dark:bg-slate-800/50">
            {imageUrl ? (
              <img src={imageUrl} alt={page.sceneDescription} className="w-full object-cover" />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-4 space-y-3">
            <button
              onClick={handleRegenerateImage}
              disabled={regeneratingImage || !imagePrompt}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
              style={{ minHeight: '44px' }}
            >
              {regeneratingImage ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Regenerating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                  </svg>
                  Regenerate Image
                </>
              )}
            </button>
            <button
              onClick={() => setShowImagePrompt(v => !v)}
              className="w-full text-left text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors"
              style={{ minHeight: '44px' }}
            >
              {showImagePrompt ? 'Hide' : 'Show'} image prompt
            </button>
            {showImagePrompt && (
              <textarea
                value={imagePrompt}
                onChange={e => setImagePrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500,#3D6AF2)] focus:border-transparent"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Text editing panel */}
        <div className="flex-1 p-5 space-y-5">
          {/* Narrative text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Narrative Text</label>
              <button
                onClick={handleEnrich}
                disabled={enriching || narrativeText.trim().length < 5}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                style={{ minHeight: '44px' }}
              >
                {enriching ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Enriching...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                    Enrich with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              value={narrativeText}
              onChange={e => setNarrativeText(e.target.value)}
              disabled={enriching}
              className="w-full px-4 py-3 rounded-xl text-base bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500,#3D6AF2)] focus:border-transparent disabled:opacity-50"
              rows={6}
            />
          </div>

          {/* Dialogue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dialogue</label>
              <button
                onClick={addDialogue}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Line
              </button>
            </div>
            {dialogue.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No dialogue on this page</p>
            ) : (
              <div className="space-y-2">
                {dialogue.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <input
                      value={d.speaker}
                      onChange={e => handleDialogueChange(i, 'speaker', e.target.value)}
                      placeholder="Speaker"
                      className="w-28 shrink-0 px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500,#3D6AF2)] focus:border-transparent"
                    />
                    <input
                      value={d.line}
                      onChange={e => handleDialogueChange(i, 'line', e.target.value)}
                      placeholder="Dialogue line"
                      className="flex-1 px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500,#3D6AF2)] focus:border-transparent"
                    />
                    <button
                      onClick={() => removeDialogue(i)}
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                      aria-label="Remove dialogue"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
