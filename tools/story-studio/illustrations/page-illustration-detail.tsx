'use client'

import { useState } from 'react'
import type { PageIllustration } from '@/tools/story-studio/use-illustrations'
import type { CharacterItem } from '@/tools/story-studio/use-characters'

interface PageIllustrationDetailProps {
  page: PageIllustration
  characters: CharacterItem[]
  qualityMode: 'fast' | 'quality'
  onGenerate: (imagePrompt: string, qualityMode: 'fast' | 'quality', characterIds: string[]) => Promise<void>
  onBack: () => void
  generating: boolean
}

export function PageIllustrationDetail({
  page, characters, qualityMode, onGenerate, onBack, generating,
}: PageIllustrationDetailProps) {
  const [prompt, setPrompt] = useState(page.imagePrompt || page.sceneDescription || '')
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(() => {
    const speakers = (page.dialogue ?? []).map(d => d.speaker.toLowerCase())
    return characters
      .filter(c => speakers.includes(c.name.toLowerCase()))
      .map(c => c.id)
  })
  const [mode, setMode] = useState(qualityMode)

  const ill = page.illustration
  const previousUrl = ill?.imageUrl

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Back to grid"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Page {page.sequence}
        </h2>
        {ill?.status && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            ill.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            ill.status === 'generating' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            ill.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-slate-100 text-slate-500'
          }`}>
            {ill.status}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Preview */}
        <div>
          <div className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {previousUrl ? (
              <img src={previousUrl} alt={`Page ${page.sequence}`} className="w-full h-full object-cover" />
            ) : generating ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-12 h-12 border-2 border-[#3D6AF2] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm mt-3">Generating illustration...</p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <p className="text-sm">No illustration yet</p>
              </div>
            )}
          </div>

          {page.sequence > 1 && (
            <p className="text-xs text-slate-400 mt-2">
              Uses Page {page.sequence - 1} as style reference for visual continuity
            </p>
          )}
        </div>

        {/* Right: Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Scene Description</label>
            <p className="text-sm text-slate-600 dark:text-slate-400">{page.sceneDescription || 'No scene description'}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Image Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-[#3D6AF2]"
              placeholder="Describe the illustration..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-1">
              Characters in Scene ({selectedCharacterIds.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {characters.filter(c => c.status === 'approved').map(char => {
                const isSelected = selectedCharacterIds.includes(char.id)
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacterIds(prev =>
                      isSelected ? prev.filter(id => id !== char.id) : [...prev, char.id]
                    )}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#3D6AF2]/15 dark:bg-[#3D6AF2]/15 text-[#3D6AF2] dark:text-[#93aaff] border border-[#1e2631] dark:border-[#1e2631]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {char.referenceImageUrl ? (
                      <img src={char.referenceImageUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                    )}
                    {char.name}
                  </button>
                )
              })}
              {characters.filter(c => c.status === 'approved').length === 0 && (
                <p className="text-xs text-slate-400 italic">No approved characters. Approve characters in the Characters tab.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Mode:</span>
            {(['quality', 'fast'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${
                  mode === m
                    ? 'bg-[#3D6AF2]/15 bg-[#3D6AF2]/15 text-[#3D6AF2] dark:text-[#93aaff]'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {m === 'quality' ? 'Quality (5 cr)' : 'Fast (3 cr)'}
              </button>
            ))}
          </div>

          <button
            onClick={() => onGenerate(prompt, mode, selectedCharacterIds)}
            disabled={!prompt.trim() || generating}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-[#3D6AF2] hover:bg-[#3560d8]
              disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            {generating ? 'Generating...' : previousUrl ? 'Regenerate' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}
