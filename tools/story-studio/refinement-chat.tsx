'use client'

import { useState } from 'react'
import type { StoryConcept, ChatMessage } from './types'
import { CREDIT_COSTS } from './types'

const MAX_ROUNDS = 1

const QUICK_REFINEMENTS = [
  { label: 'More giggles & sunshine', value: 'Make it funnier and more lighthearted', icon: '✨' },
  { label: 'Epic quests & daring feats', value: 'Add more action and adventure', icon: '⚔️' },
  { label: 'Whispers in the dark', value: 'Make it more mysterious and suspenseful', icon: '🌙' },
  { label: 'A twist nobody sees coming', value: 'Add a surprise twist ending', icon: '🎭' },
  { label: 'Characters you\'ll remember', value: 'Make the characters more relatable', icon: '💫' },
  { label: 'A lesson from the heart', value: 'Add a moral lesson for kids', icon: '🌟' },
  { label: 'A world that breathes', value: 'Make the world more detailed and immersive', icon: '🏰' },
  { label: 'A magical companion', value: 'Add a magical companion or sidekick', icon: '🦊' },
]

const SECTION_LABELS: { key: keyof StoryConcept['sections']; label: string; icon: string }[] = [
  { key: 'premise', label: 'The Story', icon: '📖' },
  { key: 'authorIntent', label: 'What It Provokes', icon: '💭' },
  { key: 'messageToAudience', label: 'The Takeaway', icon: '🎁' },
  { key: 'narrativeArc', label: 'How It Unfolds', icon: '🗺️' },
  { key: 'tone', label: 'The Voice', icon: '🎵' },
  { key: 'visualStyle', label: 'The Look', icon: '🎨' },
]

interface RefinementChatProps {
  concept: StoryConcept
  onConceptUpdate: (concept: StoryConcept) => void
  onGenerate: (concept: StoryConcept, options?: { skipIllustration?: boolean; skipAudio?: boolean; skipValidation?: boolean }) => void
  onBack: () => void
  loading: boolean
  mode?: 'speed' | 'professional'
}

export function RefinementChat({ concept, onConceptUpdate, onGenerate, onBack, loading, mode = 'professional' }: RefinementChatProps) {
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [refining, setRefining] = useState(false)
  const [streamingReply, setStreamingReply] = useState('')
  const [skipValidation, setSkipValidation] = useState(false)
  const [skipIllustration, setSkipIllustration] = useState(false)
  const [skipAudio, setSkipAudio] = useState(false)

  const roundsUsed = history.filter(m => m.role === 'user').length
  const roundsLeft = MAX_ROUNDS - roundsUsed

  const handleRefine = async (option: string) => {
    setRefining(true)
    setStreamingReply('')
    const updatedHistory: ChatMessage[] = [...history, { role: 'user', content: option }]
    setHistory(updatedHistory)

    try {
      const res = await fetch('/api/v1/story/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, message: option, history }),
      })

      if (!res.ok || !res.body) throw new Error(`Failed: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === 'chunk') {
              setStreamingReply(prev => prev + event.text)
            } else if (event.type === 'done') {
              onConceptUpdate(event.concept)
              setHistory([...updatedHistory, { role: 'assistant', content: event.reply }])
              setStreamingReply('')
            } else if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }
    } catch (err) {
      setStreamingReply('')
      setHistory([
        ...updatedHistory,
        { role: 'assistant', content: `Sorry, refinement failed. ${err instanceof Error ? err.message : ''} Please try again.` },
      ])
    } finally {
      setRefining(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to concepts
        </button>
        {roundsLeft <= 0 && (
          <span className="text-xs text-purple-400 dark:text-purple-500 italic">
            Spell has been cast
          </span>
        )}
      </div>

      {/* Current concept — magical card */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Magical glow border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 via-purple-400/10 to-indigo-400/20 dark:from-amber-400/10 dark:via-purple-400/5 dark:to-indigo-400/10" />
        <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-amber-200/50 dark:border-amber-700/30 shadow-lg shadow-amber-500/5 dark:shadow-amber-500/5 p-5 md:p-6">
          {/* Title with sparkle */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 dark:from-amber-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                {concept.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                  {concept.tags.style}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                  {concept.tags.audience}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
                  {concept.tags.pageCount} pages
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                  {concept.tags.tone}
                </span>
              </div>
            </div>
          </div>

          {/* Section content — storybook style */}
          <div className="space-y-4 mt-5">
            {SECTION_LABELS.map(({ key, label, icon }) => (
              <div key={key} className="group">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  <span className="text-sm">{icon}</span>
                  {label}
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                  {concept.sections[key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat history — enchanted messages */}
      {history.length > 0 && (
        <div className="space-y-3">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`rounded-2xl p-4 text-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-800/40 ml-6'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/15 border border-amber-200/50 dark:border-amber-800/30 mr-6'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                msg.role === 'user'
                  ? 'text-indigo-400 dark:text-indigo-500'
                  : 'text-amber-500 dark:text-amber-400'
              }`}>
                {msg.role === 'user' ? 'Your Wish' : 'Story Fairy'}
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Casting spell — enchanted loading */}
      {refining && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-purple-900/90 dark:from-purple-950 dark:via-indigo-950 dark:to-purple-950 border border-purple-500/30 p-6 text-center overflow-hidden relative">
          {/* Animated sparkle particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 left-[10%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.2s' }} />
            <div className="absolute top-4 left-[30%] w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.4s' }} />
            <div className="absolute top-3 left-[60%] w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1.1s' }} />
            <div className="absolute top-5 left-[80%] w-1 h-1 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '1.3s' }} />
            <div className="absolute top-1 left-[45%] w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.5s' }} />
            <div className="absolute bottom-3 left-[20%] w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.2s' }} />
            <div className="absolute bottom-4 left-[70%] w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '1.4s' }} />
          </div>
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400/30 to-purple-400/30 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-amber-300 mb-1" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
              Casting a spell on your story...
            </h3>
            <p className="text-sm text-purple-300/80 italic">
              {streamingReply ? 'The Story Fairy is rewriting your tale...' : 'The Story Fairy is weaving new magic into your tale'}
            </p>
          </div>
        </div>
      )}

      {/* Quick refinement spells */}
      {roundsLeft > 0 && !refining && (
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-amber-500/5" />
          <div className="relative rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-purple-200/40 dark:border-purple-800/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cast a Spell</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Choose an enchantment to transform your story</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_REFINEMENTS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRefine(option.value)}
                  disabled={refining}
                  className="group relative flex items-center gap-3 px-4 py-3 rounded-xl text-left border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-amber-50/50 dark:hover:from-purple-900/20 dark:hover:to-amber-900/10 hover:shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-default"
                  style={{ minHeight: '44px' }}
                >
                  <span className="text-lg shrink-0 group-hover:scale-110 transition-transform duration-200">{option.icon}</span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors block truncate">
                      {option.label}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                      {option.value}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-400 dark:group-hover:text-purple-500 shrink-0 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generation options + breakdown */}
      {mode === 'speed' ? (
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-orange-600/10 to-yellow-500/10 dark:from-amber-400/5 dark:via-orange-400/5 dark:to-yellow-400/5" />
          <div className="relative rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-amber-200/50 dark:border-amber-800/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.836A.75.75 0 002.75 12h6.572l-1.305 10.093a.75.75 0 001.292.657l8.5-9.836A.75.75 0 0017.25 12h-6.572l1.305-10.093z" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Quick Story</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Cast a spell and your story appears! You can add pictures and sound later.
            </p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Credits are refunded if generation fails</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">10 credits</span>
            </div>
            <button
              onClick={() => onGenerate(concept, { skipIllustration: true, skipAudio: true, skipValidation: true })}
              disabled={loading || refining}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:shadow-none"
              style={{ minHeight: '44px' }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.824 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Casting spell...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                  Cast a Spell!
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (() => {
        const pages = concept.tags.pageCount
        const isFullQuality = !skipValidation && !skipIllustration && !skipAudio
        const anySkipped = skipValidation || skipIllustration || skipAudio
        // Estimate total time in seconds
        const estSeconds = 10 + 15 + (skipValidation ? 0 : 10)
          + (skipIllustration ? 0 : 60 + 60 + pages * 60) // char_ref + cover + illustrations
          + (skipAudio ? 0 : pages * 15) + 1
        const estLabel = estSeconds >= 120
          ? `~${Math.round(estSeconds / 60)} min`
          : `~${estSeconds}s`

        return (
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-amber-500/10 dark:from-indigo-400/5 dark:via-purple-400/5 dark:to-amber-400/5" />
            <div className="relative rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-indigo-200/50 dark:border-indigo-800/30 p-5">
              {/* Header with presets */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Generation</span>
                <div className="flex gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => { setSkipValidation(false); setSkipIllustration(false); setSkipAudio(false) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isFullQuality
                        ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    style={{ minHeight: '36px' }}
                  >
                    All On
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSkipValidation(true); setSkipIllustration(true); setSkipAudio(true) }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      skipValidation && skipIllustration && skipAudio
                        ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    style={{ minHeight: '36px' }}
                  >
                    Text Only
                  </button>
                </div>
              </div>

              {/* Interactive breakdown table */}
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-700/50 overflow-hidden mb-4">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left px-3 py-2 font-semibold text-slate-500 dark:text-slate-400">Step</th>
                      <th className="text-center px-2 py-2 font-semibold text-slate-500 dark:text-slate-400 w-16">Time</th>
                      <th className="text-center px-2 py-2 font-semibold text-slate-500 dark:text-slate-400 w-12">On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Fixed steps — always on */}
                    {[
                      { step: 'Story Bible', desc: 'Characters, setting, rules', time: '~10s' },
                      { step: 'Story Draft', desc: 'Write all pages', time: '~15s' },
                    ].map((row) => (
                      <tr key={row.step}>
                        <td className="px-3 py-1.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{row.step}</span>
                          <span className="text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">— {row.desc}</span>
                        </td>
                        <td className="text-center px-2 py-1.5 text-slate-400 dark:text-slate-500 font-mono">{row.time}</td>
                        <td className="text-center px-2 py-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-500 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        </td>
                      </tr>
                    ))}
                    {/* Toggleable: Consistency Check */}
                    <tr
                      className={`cursor-pointer transition-colors ${skipValidation ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}
                      onClick={() => setSkipValidation(v => !v)}
                    >
                      <td className="px-3 py-1.5">
                        <span className={`font-medium ${skipValidation ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>Consistency Check</span>
                        <span className="text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">— Verify &amp; fix against rules</span>
                      </td>
                      <td className={`text-center px-2 py-1.5 font-mono ${skipValidation ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>~10s</td>
                      <td className="text-center px-2 py-1.5">
                        <input type="checkbox" checked={!skipValidation} onChange={() => setSkipValidation(v => !v)} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                      </td>
                    </tr>
                    {/* Character Ref & Cover Art — skipped when skipIllustration */}
                    {[
                      { step: 'Character Ref', desc: 'Visual reference sheet', time: '~60s' },
                      { step: 'Cover Art', desc: 'Book cover illustration', time: '~60s' },
                    ].map((row) => (
                      <tr key={row.step} className={skipIllustration ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}>
                        <td className="px-3 py-1.5">
                          <span className={`font-medium ${skipIllustration ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{row.step}</span>
                          <span className="text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">— {row.desc}</span>
                        </td>
                        <td className={`text-center px-2 py-1.5 font-mono ${skipIllustration ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{row.time}</td>
                        <td className="text-center px-2 py-1.5">
                          {skipIllustration ? (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">skip</span>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-emerald-500 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Toggleable: Illustrations */}
                    <tr
                      className={`cursor-pointer transition-colors ${skipIllustration ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}
                      onClick={() => setSkipIllustration(v => !v)}
                    >
                      <td className="px-3 py-1.5">
                        <span className={`font-medium ${skipIllustration ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{`Illustrations (x${pages})`}</span>
                        <span className="text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">— Per-page artwork</span>
                      </td>
                      <td className={`text-center px-2 py-1.5 font-mono ${skipIllustration ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{`~${pages} min`}</td>
                      <td className="text-center px-2 py-1.5">
                        <input type="checkbox" checked={!skipIllustration} onChange={() => setSkipIllustration(v => !v)} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                      </td>
                    </tr>
                    {/* Toggleable: Narration */}
                    <tr
                      className={`cursor-pointer transition-colors ${skipAudio ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}
                      onClick={() => setSkipAudio(v => !v)}
                    >
                      <td className="px-3 py-1.5">
                        <span className={`font-medium ${skipAudio ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{`Narration (x${pages})`}</span>
                        <span className="text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">— Voice-over per page</span>
                      </td>
                      <td className={`text-center px-2 py-1.5 font-mono ${skipAudio ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{`~${Math.ceil(pages * 0.25)} min`}</td>
                      <td className="text-center px-2 py-1.5">
                        <input type="checkbox" checked={!skipAudio} onChange={() => setSkipAudio(v => !v)} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 accent-indigo-600 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                      </td>
                    </tr>
                    {/* Save — always on */}
                    <tr>
                      <td className="px-3 py-1.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Save</span>
                        <span className="text-slate-400 dark:text-slate-500 ml-1 hidden sm:inline">— Finalize book</span>
                      </td>
                      <td className="text-center px-2 py-1.5 text-slate-400 dark:text-slate-500 font-mono">~1s</td>
                      <td className="text-center px-2 py-1.5">
                        <svg className="w-3.5 h-3.5 text-emerald-500 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </td>
                    </tr>
                    {/* Total row */}
                    <tr className="bg-slate-50/80 dark:bg-slate-800/30 font-semibold">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">Estimated total</td>
                      <td className="text-center px-2 py-2 text-indigo-600 dark:text-indigo-400 font-mono">{estLabel}</td>
                      <td className="text-center px-2 py-2" />
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Context hint for skipped validation */}
              {!skipValidation && (
                <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-900/15 border border-indigo-200/40 dark:border-indigo-800/30 px-3 py-2.5 mb-4">
                  <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Consistency check verifies:</p>
                  <ul className="text-[10px] text-indigo-600/80 dark:text-indigo-400/70 space-y-0.5 pl-3">
                    <li>Character descriptions match Story Bible on every page</li>
                    <li>Timeline &amp; causality — no plot holes or contradictions</li>
                    <li>Auto-fixes any issues found before illustration</li>
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Credits are refunded if generation fails</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40">{CREDIT_COSTS.generate} credits</span>
              </div>

              <button
                onClick={() => onGenerate(concept, anySkipped ? {
                  skipIllustration: skipIllustration || undefined,
                  skipAudio: skipAudio || undefined,
                  skipValidation: skipValidation || undefined,
                } : undefined)}
                disabled={loading || refining}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 hover:from-indigo-500 hover:via-purple-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:shadow-none"
                style={{ minHeight: '44px' }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.824 5.824 3 7.938l3-2.647z" />
                    </svg>
                    The magic is unfolding...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Bring This Story to Life
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 border border-white/30">{estLabel}</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

