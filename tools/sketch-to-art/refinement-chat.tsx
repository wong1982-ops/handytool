'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MAX_REFINEMENTS, QUICK_REFINEMENTS } from './types'
import type { GeneratedVariation, RefinementMessage, SketchMode } from './types'

interface RefinementChatProps {
  currentImage: GeneratedVariation
  originalSketch: string
  style: string
  chatHistory: RefinementMessage[]
  onSendMessage: (msg: string) => void
  refinementCount: number
  loading: boolean
  error: string | null
  imageHistory: GeneratedVariation[]
  onRevert: (index: number) => void
  mode: SketchMode
  onDone: () => void
}

export default function RefinementChat({
  currentImage,
  originalSketch: _originalSketch,
  style: _style,
  chatHistory,
  onSendMessage,
  refinementCount,
  loading,
  error,
  imageHistory,
  onRevert,
  mode,
  onDone,
}: RefinementChatProps) {
  const isFun = mode === 'fun'
  const [inputValue, setInputValue] = useState('')
  const remaining = MAX_REFINEMENTS - refinementCount
  const limitReached = remaining <= 0

  const handleSend = () => {
    const msg = inputValue.trim()
    if (!msg || loading || limitReached) return
    onSendMessage(msg)
    setInputValue('')
  }

  const handleQuickRefinement = (value: string) => {
    if (loading || limitReached) return
    onSendMessage(value)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Current image */}
      <div className="mx-auto w-full max-w-md">
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <Image
            src={currentImage.imageUrl}
            alt="Current art version"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 448px"
          />
        </div>
      </div>

      {/* Refinement counter */}
      <p
        className={`text-center text-sm ${
          limitReached
            ? 'text-[var(--tk-color-error-500)] font-medium'
            : 'text-[var(--tk-color-text-secondary)]'
        }`}
      >
        {limitReached
          ? isFun
            ? 'All spells used! Your art is complete!'
            : 'All refinements used.'
          : isFun
            ? `${remaining}/${MAX_REFINEMENTS} spells left!`
            : `${remaining}/${MAX_REFINEMENTS} refinements remaining`}
      </p>

      {/* Quick suggestion pills */}
      {!limitReached && (
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_REFINEMENTS.map((q) => (
            <button
              key={q.value}
              type="button"
              onClick={() => handleQuickRefinement(q.value)}
              disabled={loading}
              className="min-h-[44px] rounded-full border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] px-4 py-2 text-sm text-[var(--tk-color-text-primary)] transition-colors hover:bg-[var(--tk-color-surface-100)] dark:hover:bg-[var(--tk-color-surface-700)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFun ? q.funLabel : q.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat history */}
      {chatHistory.length > 0 && (
        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto rounded-xl border border-[var(--tk-color-surface-200)] dark:border-[var(--tk-color-surface-700)] p-3">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[var(--tk-color-primary-500)] px-4 py-2 text-sm text-white">
                  {msg.content}
                </div>
              ) : (
                <div className="flex items-start gap-2 max-w-[80%]">
                  {msg.imageUrl && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={msg.imageUrl}
                        alt="Refined version"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="rounded-2xl rounded-bl-sm bg-[var(--tk-color-surface-100)] dark:bg-[var(--tk-color-surface-700)] px-4 py-2 text-sm text-[var(--tk-color-text-primary)]">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-center text-sm text-[var(--tk-color-error-500)]">{error}</p>
      )}

      {/* Chat input */}
      {!limitReached && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={
              isFun ? 'Tell me what to change...' : 'Describe your refinement...'
            }
            disabled={loading || limitReached}
            className="min-h-[44px] flex-1 rounded-xl border border-[var(--tk-color-surface-300)] dark:border-[var(--tk-color-surface-600)] bg-[var(--tk-color-surface-50)] dark:bg-[var(--tk-color-surface-800)] px-4 py-3 text-sm text-[var(--tk-color-text-primary)] placeholder:text-[var(--tk-color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !inputValue.trim() || limitReached}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[var(--tk-color-primary-500)] text-white transition-colors hover:bg-[var(--tk-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send refinement"
          >
            {loading ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Image history row */}
      {imageHistory.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--tk-color-text-secondary)]">
            {isFun ? 'Previous versions' : 'Version history'}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {imageHistory.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onRevert(index)}
                className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--tk-color-surface-300)] dark:ring-[var(--tk-color-surface-600)] transition-all hover:ring-2 hover:ring-[var(--tk-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)]"
                aria-label={`Revert to version ${index + 1}`}
              >
                <Image
                  src={img.imageUrl}
                  alt={`Version ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="56px"
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
        className="min-h-[44px] w-full rounded-xl bg-[var(--tk-color-primary-500)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--tk-color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--tk-color-primary-500)] focus:ring-offset-2"
      >
        {isFun ? 'Done — Save & Share!' : 'Done — Save & Share'}
      </button>
    </div>
  )
}
