'use client'

import { useRef, useState } from 'react'

interface ChatInputProps {
  onSend: (content: string) => void
  sending: boolean
  disabled: boolean
}

export function ChatInput({ onSend, sending, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = input.trim().length > 0 && !sending && !disabled

  function handleSend() {
    if (!canSend) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="border-t border-[#1e2631] bg-[#0d1117] px-4 py-3">
      <div className="max-w-3xl mx-auto flex flex-col gap-1">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about NZ tax, GST, employment law..."
            disabled={disabled}
            className="flex-1 resize-none overflow-hidden bg-[#131a23] border border-[#1e2631] rounded-xl text-white placeholder-[#70767f] px-4 py-3 text-[14px] min-h-[44px] leading-snug focus:outline-none focus:border-[#3D6AF2]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ height: '44px' }}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3D6AF2] to-[#3D9DF2] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {sending ? (
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex justify-end">
          <span className="text-[12px] text-[#7C3AED]">1 credit</span>
        </div>
      </div>
    </div>
  )
}
