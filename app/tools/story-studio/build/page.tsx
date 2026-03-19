'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { useStoryBook } from '@/tools/story-studio/use-story-book'
import { PlotInput } from '@/tools/story-studio/plot-input'
import { RefinementChat } from '@/tools/story-studio/refinement-chat'
import { GenerationProgress } from '@/tools/story-studio/generation-progress'
import { signInWithOAuth } from '@/lib/supabase/auth'
import type { StoryConcept } from '@/tools/story-studio/types'

const QUICK_SPELLS = [
  { label: 'More giggles & sunshine', value: 'Make it funnier and more lighthearted', icon: '\u2728' },
  { label: 'Epic quests & daring feats', value: 'Add more action and adventure', icon: '\u2694\uFE0F' },
  { label: 'Whispers in the dark', value: 'Make it more mysterious and suspenseful', icon: '\u{1F319}' },
  { label: 'A twist nobody sees coming', value: 'Add a surprise twist ending', icon: '\u{1F3AD}' },
  { label: 'Characters you\'ll remember', value: 'Make the characters more relatable', icon: '\u{1F4AB}' },
  { label: 'A lesson from the heart', value: 'Add a moral lesson for kids', icon: '\u{1F31F}' },
  { label: 'A world that breathes', value: 'Make the world more detailed and immersive', icon: '\u{1F3F0}' },
  { label: 'A magical companion', value: 'Add a magical companion or sidekick', icon: '\u{1F98A}' },
]

/** Speed mode: concept preview + spell radio cards + async Generate */
function SpeedModeConfirm({ concept, loading, error, onGenerate, onBack }: {
  concept: StoryConcept
  loading: boolean
  error: string | null
  onGenerate: (refinementInstruction?: string) => void
  onBack: () => void
}) {
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null)

  const SECTIONS: { key: keyof StoryConcept['sections']; label: string; icon: string }[] = [
    { key: 'premise', label: 'The Story', icon: '\u{1F4D6}' },
    { key: 'narrativeArc', label: 'How It Unfolds', icon: '\u{1F5FA}\uFE0F' },
    { key: 'tone', label: 'The Voice', icon: '\u{1F3B5}' },
    { key: 'visualStyle', label: 'The Look', icon: '\u{1F3A8}' },
  ]

  return (
    <div className="space-y-4">
      {/* Concept card — read-only display */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 via-purple-400/15 to-indigo-400/20 dark:from-amber-400/10 dark:via-purple-400/5 dark:to-indigo-400/10" />
        <div className="relative bg-white/95 dark:bg-slate-900/95 border-2 border-amber-400/60 dark:border-amber-600/40 rounded-2xl shadow-lg shadow-amber-500/5 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                {concept.title}
              </h3>
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/30">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selected
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">{concept.tags.style}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">{concept.tags.audience}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">{concept.tags.pageCount} pages</span>
            </div>
            <div className="space-y-3">
              {SECTIONS.map(({ key, label, icon }) => (
                <div key={key}>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    <span className="text-sm">{icon}</span> {label}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                    {concept.sections[key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cast a Spell — optional radio cards */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cast a Spell</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Optional — pick an enchantment to shape your story</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {QUICK_SPELLS.map((spell) => {
            const isSelected = selectedSpell === spell.value
            return (
              <button
                key={spell.value}
                type="button"
                onClick={() => setSelectedSpell(isSelected ? null : spell.value)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-900/20 shadow-sm'
                    : 'border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
                style={{ minHeight: '44px' }}
              >
                <span className="text-lg shrink-0">{spell.icon}</span>
                <span className={`text-sm font-medium ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>{spell.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-purple-500 shrink-0 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate button */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.836A.75.75 0 002.75 12h6.572l-1.305 10.093a.75.75 0 001.292.657l8.5-9.836A.75.75 0 0017.25 12h-6.572l1.305-10.093z" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Quick Story</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Your story will be generated in the background. You can add pictures and sound later.
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Credits are refunded if generation fails</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">10 credits</span>
        </div>
        {error && (
          <div className="mb-3 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" style={{ minHeight: '44px' }}>
            Back
          </button>
          <button
            type="button"
            onClick={() => onGenerate(selectedSpell ?? undefined)}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:shadow-none"
            style={{ minHeight: '44px' }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.836A.75.75 0 002.75 12h6.572l-1.305 10.093a.75.75 0 001.292.657l8.5-9.836A.75.75 0 0017.25 12h-6.572l1.305-10.093z" />
                </svg>
                Generate Story
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BuildPage() {
  return (
    <Suspense>
      <BuildContent />
    </Suspense>
  )
}

function BuildContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlMode = searchParams.get('mode') as 'speed' | 'professional' | null
  const urlSeriesId = searchParams.get('seriesId')

  const storyBook = useStoryBook()

  // Auto-set mode from URL
  useEffect(() => {
    if (urlMode && !storyBook.mode) {
      storyBook.reset()
      storyBook.setMode(urlMode)
      if (urlSeriesId) storyBook.setSeriesId(urlSeriesId)
    }
  }, [urlMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    storyBook.reset()
    router.push('/tools/story-studio')
  }

  // Auth gate
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Sign in to create stories</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Your magical stories await.</p>
        <button onClick={() => signInWithOAuth('google')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer" style={{ minHeight: '44px' }}>
          Sign in with Google
        </button>
      </div>
    )
  }

  const { phase, plot, selectedConcept, book, progressEvents, loading, error,
    activeJobId, fetchConcepts, startGeneration,
    setPhase, setSelectedConcept,
    selectedCharacterIds, setSelectedCharacterIds,
    selectedArtStyle, setSelectedArtStyle } = storyBook

  // If generation is complete, go back to stories
  if (phase === 'viewer' && book?.status === 'complete') {
    handleBack()
    return null
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Back to stories"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generate with AI</h2>
      </div>

      {phase === 'input' && (
        <>
          <PlotInput
            onSubmit={fetchConcepts}
            loading={loading}
            initialPlot={plot || undefined}
            selectedCharacterIds={selectedCharacterIds}
            onCharacterIdsChange={setSelectedCharacterIds}
            selectedArtStyle={selectedArtStyle}
            onArtStyleChange={setSelectedArtStyle}
          />
          {error && (
            <div className="mt-3 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
        </>
      )}

      {phase === 'refine' && selectedConcept && storyBook.mode === 'speed' && (
        <SpeedModeConfirm
          concept={selectedConcept}
          loading={loading}
          error={error}
          onGenerate={async (refinementInstruction) => {
            await startGeneration(plot || '', selectedConcept, { skipIllustration: true, skipAudio: true, skipValidation: true, refinementInstruction })
            router.push('/tools/story-studio')
          }}
          onBack={() => setPhase('input')}
        />
      )}

      {phase === 'refine' && selectedConcept && storyBook.mode !== 'speed' && (
        <RefinementChat
          concept={selectedConcept}
          onConceptUpdate={setSelectedConcept}
          onGenerate={(concept, options) => startGeneration(plot || '', concept, options)}
          onBack={() => setPhase('input')}
          loading={loading}
          mode={storyBook.mode}
        />
      )}

      {phase === 'generating' && (
        <GenerationProgress
          events={progressEvents}
          totalPages={storyBook.book?.pages?.length ?? null}
          activeJobId={activeJobId}
          mode={storyBook.mode}
        />
      )}
    </div>
  )
}
