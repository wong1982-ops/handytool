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
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-3" aria-hidden="true">💬</p>
          <p className="text-sm">{t.chat.empty}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
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
