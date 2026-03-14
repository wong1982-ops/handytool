'use client'

interface PageInfo {
  id: string
  sequence: number
  narrativeText: string
  sceneDescription: string
  dialogue: { speaker: string; line: string }[] | null
  mood: string | null
  imagePrompt: string | null
  illustration: {
    imageUrl: string | null
    status: 'pending' | 'generating' | 'done' | 'error'
  } | null
}

interface CharacterItem {
  id: string
  name: string
}

interface IllustrationReviewPageProps {
  page: PageInfo
  characters: CharacterItem[]
  decision: 'generate' | 'skip' | 'pending'
  editedPrompt: string
  selectedCharacterIds: string[]
  onPromptChange: (prompt: string) => void
  onCharacterToggle: (id: string) => void
  onGenerate: () => void
  onSkip: () => void
}

export function IllustrationReviewPage({
  page, characters, decision, editedPrompt, selectedCharacterIds,
  onPromptChange, onCharacterToggle, onGenerate, onSkip,
}: IllustrationReviewPageProps) {
  const hasIllustration = page.illustration?.status === 'done' && page.illustration.imageUrl
  const isGenerating = page.illustration?.status === 'generating'

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Left: Page content */}
      <div className="md:col-span-3 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5">
          {/* Narrative */}
          <p
            className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}
          >
            {page.narrativeText || 'No narrative text yet.'}
          </p>

          {/* Dialogue */}
          {page.dialogue && page.dialogue.length > 0 && (
            <div className="mt-4 space-y-2">
              {page.dialogue.map((d, i) => (
                <div key={i} className="pl-3 border-l-2 border-indigo-300 dark:border-indigo-700">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{d.speaker}</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">&ldquo;{d.line}&rdquo;</p>
                </div>
              ))}
            </div>
          )}

          {/* Mood */}
          {page.mood && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
                {page.mood}
              </span>
            </div>
          )}
        </div>

        {/* Scene description (smaller, secondary) */}
        {page.sceneDescription && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Scene</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{page.sceneDescription}</p>
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="md:col-span-2 space-y-4">
        {/* Existing illustration */}
        {(hasIllustration || isGenerating) && (
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            {hasIllustration && (
              <img src={page.illustration!.imageUrl!} alt="" className="w-full h-full object-cover" />
            )}
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Image prompt */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Image Prompt
          </label>
          <textarea
            value={editedPrompt}
            onChange={e => onPromptChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
              bg-white dark:bg-slate-800 text-sm resize-y
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the illustration for this page..."
          />
        </div>

        {/* Character selector */}
        {characters.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Characters
            </label>
            <div className="flex flex-wrap gap-1.5">
              {characters.map(c => {
                const selected = selectedCharacterIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => onCharacterToggle(c.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                    style={{ minHeight: '32px' }}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {decision === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={onGenerate}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Generate & Next
            </button>
            <button
              onClick={onSkip}
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              style={{ minHeight: '44px' }}
            >
              Skip
            </button>
          </div>
        ) : decision === 'generate' ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Queued for generation</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Skipped</span>
          </div>
        )}
      </div>
    </div>
  )
}
