'use client'

import { useState } from 'react'
import type {
  GeneratedDesign,
  ChatMessage,
} from '@/tools/ecard-studio/ai-card/types'
import { MAX_REFINEMENTS } from '@/tools/ecard-studio/ai-card/types'

interface RefinementChatProps {
  currentDesign: GeneratedDesign
  chatHistory: ChatMessage[]
  onSendMessage: (message: string) => void
  refinementCount: number
  loading: boolean
  error: string | null
  designHistory: GeneratedDesign[]
  onRevert: (index: number) => void
  onDone: () => void
}

const QUICK_SUGGESTIONS = [
  'Darker colors',
  'Lighter colors',
  'More modern',
  'More classic',
  'Bigger text',
  'Add border',
  'Simpler layout',
  'More colorful',
]

export function RefinementChat({
  currentDesign,
  chatHistory,
  onSendMessage,
  refinementCount,
  loading,
  error,
  designHistory,
  onRevert,
  onDone,
}: RefinementChatProps) {
  const [input, setInput] = useState('')
  const limitReached = refinementCount >= MAX_REFINEMENTS

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading || limitReached) return
    onSendMessage(trimmed)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Current card preview */}
      <div className="mx-auto w-full max-w-lg">
        <div className="aspect-[3.5/2] w-full overflow-hidden rounded-xl bg-slate-100 shadow-lg dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentDesign.imageUrl}
            alt="Current card design"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Refinement counter */}
      <p className="text-center text-xs font-medium text-[var(--tk-color-text-muted)]">
        {refinementCount}/{MAX_REFINEMENTS} refinements used
      </p>

      {/* Quick suggestion pills */}
      {!limitReached && (
        <div className="flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSendMessage(suggestion)}
              disabled={loading}
              className="min-h-[36px] rounded-full border border-[var(--tk-color-border)]
                bg-[var(--tk-color-bg-secondary)] px-3 py-1.5 text-xs font-medium
                text-[var(--tk-color-text-secondary)] transition-colors
                hover:border-[var(--tk-color-primary-500)] hover:text-[var(--tk-color-primary-500)]
                disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Chat history */}
      {chatHistory.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--tk-color-border)] bg-[var(--tk-color-bg-secondary)] p-4 max-h-64 overflow-y-auto">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[80%] rounded-xl bg-[var(--tk-color-primary-500)] px-4 py-2 text-sm text-white">
                  {msg.content}
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-w-[80%]">
                  {msg.imageUrl && (
                    <div className="w-32 aspect-[3.5/2] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.imageUrl}
                        alt="Refined design"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {msg.content && (
                    <div className="rounded-xl bg-[var(--tk-color-bg-tertiary)] px-4 py-2 text-sm text-[var(--tk-color-text-primary)]">
                      {msg.content}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Chat input */}
      {limitReached ? (
        <p className="text-center text-sm font-medium text-[var(--tk-color-text-secondary)]">
          Refinement limit reached. Download your card or start over.
        </p>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a change..."
            disabled={loading || limitReached}
            className="min-h-[44px] flex-1 rounded-xl border border-[var(--tk-color-border)]
              bg-[var(--tk-color-bg-secondary)] px-4 py-2.5 text-sm
              text-[var(--tk-color-text-primary)] placeholder:text-[var(--tk-color-text-muted)]
              focus:border-[var(--tk-color-primary-500)] focus:outline-none focus:ring-2
              focus:ring-[var(--tk-color-primary-500)]/20 transition-colors
              disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || limitReached || !input.trim()}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[var(--tk-color-primary-500)]
              px-3 text-white transition-colors hover:bg-[var(--tk-color-primary-600)]
              disabled:opacity-40"
            aria-label="Send message"
          >
            {loading ? (
              <svg
                className="h-5 w-5 animate-spin mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19V5m0 0l-7 7m7-7l7 7"
                />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Design history */}
      {designHistory.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--tk-color-text-muted)]">
            Previous Versions
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {designHistory.map((design, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onRevert(i)}
                className="flex-shrink-0 w-20 aspect-[3.5/2] overflow-hidden rounded-lg
                  border-2 border-[var(--tk-color-border)] bg-slate-100 dark:bg-slate-800
                  transition-colors hover:border-[var(--tk-color-primary-500)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design.imageUrl}
                  alt={`Version ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Done button */}
      <button
        type="button"
        onClick={onDone}
        className="min-h-[44px] w-full rounded-xl bg-gradient-to-r
          from-[var(--tk-color-primary-500)] to-[var(--tk-color-primary-600)]
          px-6 py-3 text-sm font-semibold text-white shadow-md
          transition-all hover:shadow-lg hover:brightness-110"
      >
        Done — Download
      </button>
    </div>
  )
}
