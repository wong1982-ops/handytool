'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from './openclaw-provider'
import { ChatBubble } from './chat-bubble'

export function ChatMessages() {
  const { state, t } = useChat()
  const { messages } = state
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to bottom on new messages (unless user scrolled up)
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    // If within 100px of bottom, enable auto-scroll
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 100)
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: '#090f16' }}>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4" style={{ width: 56, height: 56, borderRadius: 16, background: '#131a23', border: '1px solid #1e2631' }}>
            <svg style={{ width: 28, height: 28, color: '#70767f' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: '#70767f' }}>{t.chat.empty}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      style={{ background: '#090f16' }}
      onScroll={handleScroll}
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
    </div>
  )
}
