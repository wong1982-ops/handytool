'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from './types'
import { ActionGate } from '@/components/auth/action-gate'

interface ChatBarProps {
  chatHistory: ChatMessage[]
  versionIndex: number
  totalVersions: number
  refining: boolean
  onSend: (instruction: string) => void
  onUndo: () => void
  onRedo: () => void
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatBar({
  chatHistory,
  versionIndex,
  totalVersions,
  refining,
  onSend,
  onUndo,
  onRedo,
}: ChatBarProps) {
  const [input, setInput] = useState('')
  const [logOpen, setLogOpen] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat log to bottom when new messages arrive
  useEffect(() => {
    if (logOpen && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [chatHistory, logOpen])

  // Auto-open chat log when new messages arrive
  useEffect(() => {
    if (chatHistory.length > 0) {
      setLogOpen(true)
    }
  }, [chatHistory.length])

  const handleSend = () => {
    const text = input.trim()
    if (!text || refining) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentVersion = versionIndex + 1
  const canUndo = versionIndex > 0
  const canRedo = versionIndex < totalVersions - 1

  return (
    <div className="border-t border-[#1e2631] bg-[#090f16]">
      {/* Collapsible chat log */}
      {chatHistory.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setLogOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-[#70767f] hover:text-[#a6abb5] transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
              Chat history ({chatHistory.length})
            </span>
            <svg
              className={['w-3.5 h-3.5 transition-transform', logOpen ? 'rotate-180' : ''].join(
                ' ',
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          {logOpen && (
            <div
              ref={logRef}
              className="max-h-48 overflow-y-auto px-4 pb-2 space-y-2 scroll-smooth"
            >
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={['flex flex-col gap-0.5', msg.role === 'user' ? 'items-end' : 'items-start'].join(' ')}
                >
                  <div
                    className={[
                      'max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-[#3D6AF2]/20 text-[#93aaff]'
                        : 'bg-[#131a23] text-[#a6abb5]',
                    ].join(' ')}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-[#4a5060]">{formatTime(msg.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Version controls: ← v{n} → */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || refining}
            title="Undo version"
            aria-label="Previous version"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#70767f] hover:text-white hover:bg-[#1e2631] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <span className="text-[10px] text-[#70767f] font-medium w-10 text-center select-none">
            {totalVersions > 0 ? `v${currentVersion}` : '—'}
          </span>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || refining}
            title="Redo version"
            aria-label="Next version"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#70767f] hover:text-white hover:bg-[#1e2631] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        {/* Text input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={refining}
          placeholder="Describe changes... (e.g. make the button larger, add a shadow)"
          className="flex-1 min-h-[44px] rounded-xl bg-[#131a23] border border-[#1e2631] text-white text-[13px] px-4 py-2.5 placeholder:text-[#4a5060] focus:border-[#3D6AF2] focus:ring-1 focus:ring-[#3D6AF2] outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />

        {/* Send button */}
        <ActionGate cost={1}>{() => (
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || refining}
            aria-label="Send refinement instruction"
            className={[
              'w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none',
              refining
                ? 'bg-[#3D6AF2] animate-pulse'
                : 'bg-[#3D6AF2] hover:bg-[#3D79F2]',
            ].join(' ')}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        )}</ActionGate>
      </div>
    </div>
  )
}
