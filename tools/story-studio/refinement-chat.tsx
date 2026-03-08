'use client'

import { useState } from 'react'
import type { StoryConcept, ChatMessage } from './types'
import { CREDIT_COSTS } from './types'

const MAX_ROUNDS = 1

const QUICK_REFINEMENTS = [
  'Make it funnier and more lighthearted',
  'Add more action and adventure',
  'Make it more mysterious and suspenseful',
  'Add a surprise twist ending',
  'Make the characters more relatable',
  'Add a moral lesson for kids',
  'Make the world more detailed and immersive',
  'Add a magical companion or sidekick',
]

const SECTION_LABELS: { key: keyof StoryConcept['sections']; label: string }[] = [
  { key: 'premise', label: 'The Story' },
  { key: 'authorIntent', label: 'What It Provokes' },
  { key: 'messageToAudience', label: 'The Takeaway' },
  { key: 'narrativeArc', label: 'How It Unfolds' },
  { key: 'tone', label: 'The Voice' },
  { key: 'visualStyle', label: 'The Look' },
]

interface RefinementChatProps {
  concept: StoryConcept
  onConceptUpdate: (concept: StoryConcept) => void
  onGenerate: (concept: StoryConcept) => void
  onBack: () => void
  loading: boolean
}

export function RefinementChat({ concept, onConceptUpdate, onGenerate, onBack, loading }: RefinementChatProps) {
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [refining, setRefining] = useState(false)
  const [streamingReply, setStreamingReply] = useState('')

  const roundsUsed = history.filter(m => m.role === 'user').length
  const roundsLeft = MAX_ROUNDS - roundsUsed

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          style={{ minHeight: '44px' }}
        >
          &larr; Back to concepts
        </button>
        {roundsLeft <= 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            No refinements left
          </span>
        )}
      </div>

      {/* Current concept */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {concept.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {concept.tags.style}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            {concept.tags.audience}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            {concept.tags.pageCount} pages
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            {concept.tags.tone}
          </span>
        </div>

        <div className="space-y-3">
          {SECTION_LABELS.map(({ key, label }) => (
            <div key={key}>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                {label}
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {concept.sections[key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat history */}
      {history.length > 0 && (
        <div className="space-y-3 mb-4">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-[var(--tk-color-primary-500,#3D6AF2)]/10 text-slate-800 dark:text-slate-200 ml-8'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-8'
              }`}
            >
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                {msg.role === 'user' ? 'You' : 'Creative Director'}
              </span>
              {msg.content}
            </div>
          ))}
        </div>
      )}

      {/* Streaming reply */}
      {refining && streamingReply && (
        <div className="mb-4">
          <div className="rounded-xl p-3 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-8">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Creative Director
            </span>
            <span className="animate-pulse">Refining...</span>
          </div>
        </div>
      )}

      {/* Quick refinement options */}
      {roundsLeft > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            {refining ? 'Refining your story...' : 'Quick Refinements'}
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REFINEMENTS.map((option) => (
              <button
                key={option}
                onClick={async () => {
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
                }}
                disabled={refining}
                className="px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
                style={{ minHeight: '36px' }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cost estimate + Generate button */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800/50 p-4 mb-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Estimated Cost</span>
          <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{CREDIT_COSTS.generate} credits</span>
        </div>
        <div className="text-[11px] text-indigo-500/70 dark:text-indigo-400/50 mb-3 space-y-0.5">
          <p>Includes: story writing + {concept.tags.pageCount} illustrations + {concept.tags.pageCount} narrations + cover</p>
          <p>Credits are refunded if generation fails</p>
        </div>
        <button
          onClick={() => onGenerate(concept)}
          disabled={loading || refining}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default"
          style={{ minHeight: '44px' }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.824 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Book...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate Book — {CREDIT_COSTS.generate} credits
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
