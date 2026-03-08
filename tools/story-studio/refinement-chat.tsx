'use client'

import { useState } from 'react'
import type { StoryConcept, ChatMessage } from './types'

const MAX_ROUNDS = 3

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
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [refining, setRefining] = useState(false)

  const roundsUsed = history.filter(m => m.role === 'user').length
  const roundsLeft = MAX_ROUNDS - roundsUsed
  const canRefine = roundsLeft > 0 && message.trim().length > 0 && !refining

  const handleRefine = async () => {
    if (!canRefine) return
    const userMessage = message.trim()
    setMessage('')
    setRefining(true)

    const updatedHistory: ChatMessage[] = [...history, { role: 'user', content: userMessage }]
    setHistory(updatedHistory)

    try {
      const res = await fetch('/api/v1/story/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept,
          message: userMessage,
          history,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`)
      }

      const { data } = await res.json()
      onConceptUpdate(data.concept)
      setHistory([...updatedHistory, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setHistory([
        ...updatedHistory,
        { role: 'assistant', content: `Sorry, refinement failed. ${err instanceof Error ? err.message : ''} Please try again or generate the book.` },
      ])
    } finally {
      setRefining(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleRefine()
    }
  }

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
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {roundsLeft > 0 ? `${roundsLeft} refinement${roundsLeft !== 1 ? 's' : ''} remaining` : 'No refinements left'}
        </span>
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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
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

      {/* Input area */}
      {roundsLeft > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 mb-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Make it funnier... Add a dragon sidekick... Change the tone to mysterious..."
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none h-20 focus:border-[var(--tk-color-primary-500,#3D6AF2)] focus:outline-none placeholder:text-slate-400"
            maxLength={1000}
            disabled={refining}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleRefine}
              disabled={!canRefine}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default"
              style={{ minHeight: '44px' }}
            >
              {refining ? 'Refining...' : 'Refine'}
            </button>
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={() => onGenerate(concept)}
        disabled={loading || refining}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-default"
        style={{ minHeight: '44px' }}
      >
        {loading ? 'Generating Book...' : 'Generate Book'}
      </button>
    </div>
  )
}
