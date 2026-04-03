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
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* Left: Image + version history */}
      <div className="w-full lg:w-[260px] lg:min-w-[220px] lg:shrink-0">
        <div className="relative aspect-square overflow-hidden rounded-2xl mb-3">
          <Image
            src={currentImage.imageUrl}
            alt="Current art version"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 260px"
          />
        </div>

        {/* Image history row */}
        {imageHistory.length > 1 && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#70767f]">
              {isFun ? 'Previous versions' : 'Version History'}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {imageHistory.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onRevert(index)}
                  className="relative h-[52px] w-[52px] flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent transition-all hover:ring-[#3D6AF2] focus:outline-none focus:ring-[#3D6AF2]"
                  aria-label={`Revert to version ${index + 1}`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={`Version ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="52px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Chat panel */}
      <div className="flex-1 min-w-0 bg-[#131a23] rounded-2xl p-4 flex flex-col gap-3">
        {/* Chat header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-[18px] h-[18px] text-[#af88ff]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            <span className="text-sm font-bold text-white">AI Refinement</span>
          </div>
          <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            limitReached
              ? 'bg-red-500/15 text-red-400'
              : 'bg-[#af88ff]/15 text-[#af88ff]'
          }`}>
            {limitReached
              ? isFun ? 'All spells used!' : 'All used'
              : `${remaining} / ${MAX_REFINEMENTS} ${isFun ? 'spells' : 'refinements'} left`}
          </div>
        </div>

        {/* Chat messages */}
        {chatHistory.length > 0 && (
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#3D6AF2]/20 px-3.5 py-2.5 text-[13px] text-white">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="rounded-2xl rounded-bl-sm bg-[#1e2631] px-3.5 py-2.5 text-[13px] text-[#a6abb5]">
                      {msg.content}
                      {msg.imageUrl && (
                        <div className="relative h-[72px] w-[72px] overflow-hidden rounded-lg mt-2">
                          <Image
                            src={msg.imageUrl}
                            alt="Refined version"
                            fill
                            className="object-cover"
                            sizes="72px"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick chips */}
        {!limitReached && (
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-1.5 pb-1">
              {QUICK_REFINEMENTS.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => handleQuickRefinement(q.value)}
                  disabled={loading}
                  className="inline-flex items-center min-h-[32px] rounded-full bg-[#1e2631] px-3 py-1.5 text-xs text-[#a6abb5] whitespace-nowrap transition-colors hover:bg-[#3D6AF2]/15 hover:text-[#93aaff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFun ? q.funLabel : q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        {/* Chat input */}
        {!limitReached && (
          <div className="flex gap-2 items-end">
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
                isFun ? 'Describe how to refine the art...' : 'Describe your refinement...'
              }
              disabled={loading || limitReached}
              className="min-h-[44px] flex-1 rounded-xl border border-[#1e2631] bg-[#090f16] px-3.5 py-3 text-sm text-white placeholder:text-[#70767f] focus:outline-none focus:border-[#3D6AF2] transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !inputValue.trim() || limitReached}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#3D6AF2] text-white transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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

        {/* Done button — green per design */}
        <button
          type="button"
          onClick={onDone}
          className="min-h-[44px] w-full rounded-xl bg-[#10B981] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2 inline-flex items-center justify-center gap-1.5"
        >
          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
          {isFun ? 'Done \u2014 Looks Great!' : 'Done \u2014 Save & Share'}
        </button>
      </div>
    </div>
  )
}
