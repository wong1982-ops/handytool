'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { PageStrip } from '@/tools/story-studio/stories/page-strip'
import { AIHelpMenu, type AIAction } from '@/tools/story-studio/stories/ai-help-menu'

interface PageData {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}

interface StoryEditorProps {
  bookId: string
  title: string
  pages: PageData[]
  onSave: (pages: PageData[]) => Promise<void>
  onBack: () => void
}

export function StoryEditor({ bookId, title, pages: initialPages, onSave, onBack }: StoryEditorProps) {
  const [pages, setPages] = useState<PageData[]>(initialPages)
  const [activePage, setActivePage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPage = pages.find(p => p.sequence === activePage) ?? pages[0]

  // Auto-save (debounced 3s)
  useEffect(() => {
    if (!dirty) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true)
      try { await onSave(pages) } catch { /* silent */ }
      finally { setSaving(false); setDirty(false) }
    }, 3000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [dirty, pages, onSave])

  const updateCurrentPage = useCallback((updates: Partial<PageData>) => {
    setPages(prev => prev.map(p =>
      p.sequence === activePage ? { ...p, ...updates } : p
    ))
    setDirty(true)
  }, [activePage])

  const addPage = useCallback(() => {
    const newSeq = pages.length + 1
    setPages(prev => [...prev, {
      sequence: newSeq,
      sceneDescription: '',
      narrativeText: '',
      dialogue: [],
      mood: '',
      imagePrompt: '',
    }])
    setActivePage(newSeq)
    setDirty(true)
  }, [pages.length])

  const handleAIAction = useCallback(async (action: AIAction) => {
    if (!currentPage.narrativeText.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch(`/api/v1/story/books/${bookId}/ai-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: currentPage.narrativeText,
          pageSequence: activePage,
        }),
      })
      if (!res.ok) throw new Error('AI action failed')
      const { data } = await res.json()
      if (data.text) updateCurrentPage({ narrativeText: data.text })
      if (data.dialogue) updateCurrentPage({ dialogue: data.dialogue })
    } catch { /* show error toast */ }
    finally { setAiLoading(false) }
  }, [bookId, activePage, currentPage, updateCurrentPage])

  const handleManualSave = useCallback(async () => {
    setSaving(true)
    try { await onSave(pages) } catch { /* show error */ }
    finally { setSaving(false); setDirty(false) }
  }, [pages, onSave])

  const addDialogueLine = useCallback(() => {
    updateCurrentPage({
      dialogue: [...(currentPage?.dialogue ?? []), { speaker: '', line: '' }],
    })
  }, [currentPage, updateCurrentPage])

  const updateDialogueLine = useCallback((index: number, field: 'speaker' | 'line', value: string) => {
    const newDialogue = [...(currentPage?.dialogue ?? [])]
    newDialogue[index] = { ...newDialogue[index], [field]: value }
    updateCurrentPage({ dialogue: newDialogue })
  }, [currentPage, updateCurrentPage])

  const removeDialogueLine = useCallback((index: number) => {
    updateCurrentPage({
      dialogue: (currentPage?.dialogue ?? []).filter((_, i) => i !== index),
    })
  }, [currentPage, updateCurrentPage])

  if (!currentPage) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-xs text-slate-400">
              {saving ? 'Saving...' : 'Unsaved changes'}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={!dirty || saving}
            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '36px' }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Page strip */}
      <PageStrip
        totalPages={pages.length}
        activePage={activePage}
        onSelectPage={setActivePage}
        onAddPage={addPage}
      />

      {/* Page editor */}
      <div className="mt-4 space-y-4">
        {/* Scene description */}
        <div>
          <label className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Scene Description</span>
          </label>
          <textarea
            value={currentPage.sceneDescription}
            onChange={e => updateCurrentPage({ sceneDescription: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe what happens in this scene..."
          />
        </div>

        {/* Narrative text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Narrative Text</label>
            <AIHelpMenu onAction={handleAIAction} loading={aiLoading} />
          </div>
          <textarea
            value={currentPage.narrativeText}
            onChange={e => updateCurrentPage({ narrativeText: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm resize-y
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write the story text for this page..."
          />
        </div>

        {/* Dialogue */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dialogue</label>
            <button
              onClick={addDialogueLine}
              className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer"
            >
              + Add line
            </button>
          </div>
          <div className="space-y-2">
            {(currentPage.dialogue ?? []).map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  type="text"
                  value={d.speaker}
                  onChange={e => updateDialogueLine(i, 'speaker', e.target.value)}
                  placeholder="Speaker"
                  className="w-28 shrink-0 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={d.line}
                  onChange={e => updateDialogueLine(i, 'line', e.target.value)}
                  placeholder="What they say..."
                  className="flex-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeDialogueLine(i)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mood + Image prompt (inline) */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mood</label>
            <input
              type="text"
              value={currentPage.mood}
              onChange={e => updateCurrentPage({ mood: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. cheerful, mysterious, tense"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image Prompt</label>
            <input
              type="text"
              value={currentPage.imagePrompt}
              onChange={e => updateCurrentPage({ imagePrompt: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Auto-generated from scene (editable)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
