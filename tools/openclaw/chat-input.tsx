'use client'

import { useState, useRef, useCallback } from 'react'
import { useChat } from './openclaw-provider'

interface ChatInputProps {
  onSend: (content: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const { state, t } = useChat()
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isDisabled = state.status !== 'connected'

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setValue('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, isDisabled, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-grow textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px' // max 4 lines ~120px
  }

  return (
    <div className="flex items-end gap-2 px-4 py-3 shrink-0" style={{ background: '#131a23', borderTop: '1px solid #1e2631' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={isDisabled ? 'Connect to send messages' : t.chat.placeholder}
        disabled={isDisabled}
        rows={1}
        className="flex-1 resize-none text-sm text-white outline-none disabled:opacity-45 disabled:cursor-not-allowed"
        style={{
          background: '#090f16',
          border: '1px solid #1e2631',
          borderRadius: 12,
          padding: '10px 14px',
          minHeight: 44,
          maxHeight: 120,
          lineHeight: 1.5,
          fontFamily: 'inherit',
          colorScheme: 'dark',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#3D6AF2' }}
        onBlur={(e) => { e.target.style.borderColor = '#1e2631' }}
        aria-label={t.chat.placeholder}
      />
      <button
        onClick={handleSend}
        disabled={isDisabled || !value.trim()}
        className="shrink-0 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ width: 44, height: 44, background: '#3D6AF2', borderRadius: 12 }}
        aria-label={t.chat.send}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: '#fff' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </button>
    </div>
  )
}
