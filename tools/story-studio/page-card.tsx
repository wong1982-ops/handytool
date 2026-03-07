'use client'

import type { Page, Dialogue } from './types'

interface PageCardProps {
  page: Page
  onChange: (page: Page) => void
}

export default function PageCard({ page, onChange }: PageCardProps) {
  const update = (fields: Partial<Page>) => {
    onChange({ ...page, ...fields })
  }

  const updateDialogue = (index: number, fields: Partial<Dialogue>) => {
    const dialogues = [...(page.dialogue ?? [])]
    dialogues[index] = { ...dialogues[index], ...fields }
    update({ dialogue: dialogues })
  }

  const removeDialogue = (index: number) => {
    const dialogues = [...(page.dialogue ?? [])]
    dialogues.splice(index, 1)
    update({ dialogue: dialogues })
  }

  const addDialogue = () => {
    const dialogues = [...(page.dialogue ?? []), { speaker: '', line: '' }]
    update({ dialogue: dialogues })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 dark:border-slate-700 dark:bg-slate-800">
      {/* Sequence badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#3D6AF2] text-xs font-bold text-white">
          {page.sequence}
        </span>
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Page {page.sequence}
        </span>
      </div>

      {/* Scene Description */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Scene Description
        </label>
        <textarea
          value={page.sceneDescription}
          onChange={(e) => update({ sceneDescription: e.target.value })}
          rows={2}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors resize-y focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
          placeholder="Describe the scene..."
        />
      </div>

      {/* Narrative Text */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Narrative Text
        </label>
        <textarea
          value={page.narrativeText}
          onChange={(e) => update({ narrativeText: e.target.value })}
          rows={3}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors resize-y focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
          placeholder="The story text for this page..."
        />
      </div>

      {/* Mood */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Mood
        </label>
        <input
          type="text"
          value={page.mood}
          onChange={(e) => update({ mood: e.target.value })}
          className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
          placeholder="e.g. joyful, mysterious, tense"
        />
      </div>

      {/* Dialogue List */}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Dialogue
        </label>
        <div className="space-y-2">
          {(page.dialogue ?? []).map((d, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                type="text"
                value={d.speaker}
                onChange={(e) => updateDialogue(i, { speaker: e.target.value })}
                className="w-28 min-h-[44px] shrink-0 rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
                placeholder="Speaker"
              />
              <input
                type="text"
                value={d.line}
                onChange={(e) => updateDialogue(i, { line: e.target.value })}
                className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#3D6AF2] focus:ring-2 focus:ring-[#3D6AF2]/20 dark:border-slate-700 dark:text-white"
                placeholder="Dialogue line..."
              />
              <button
                type="button"
                onClick={() => removeDialogue(i)}
                className="min-h-[44px] min-w-[44px] shrink-0 rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-slate-700 dark:hover:border-red-500 dark:hover:text-red-400"
                aria-label={`Remove dialogue ${i + 1}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addDialogue}
          className="mt-2 min-h-[44px] rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 transition-colors hover:border-[#3D6AF2] hover:text-[#3D6AF2] dark:border-slate-600 dark:text-slate-400 dark:hover:border-[#3D6AF2] dark:hover:text-[#3D6AF2]"
        >
          + Add Dialogue
        </button>
      </div>
    </div>
  )
}
