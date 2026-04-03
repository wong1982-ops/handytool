'use client'

import type { ChatMessage } from './openclaw-types'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div
        className="max-w-[80%] text-sm text-white"
        style={{
          background: isUser ? '#3D6AF2' : '#131a23',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
          lineHeight: 1.55,
        }}
      >
        {/* Message content with basic whitespace/newline preservation */}
        <div className="whitespace-pre-wrap break-words">
          {message.content || (message.streaming ? '' : '...')}
        </div>

        {/* Streaming indicator */}
        {message.streaming && (
          <div className="flex mt-2" style={{ gap: 5 }}>
            <span className="rounded-full animate-bounce" style={{ width: 6, height: 6, background: '#70767f', animationDelay: '0ms' }} />
            <span className="rounded-full animate-bounce" style={{ width: 6, height: 6, background: '#70767f', animationDelay: '150ms' }} />
            <span className="rounded-full animate-bounce" style={{ width: 6, height: 6, background: '#70767f', animationDelay: '300ms' }} />
          </div>
        )}

        {/* Timestamp on hover */}
        <div
          className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ fontSize: 10, color: '#70767f', textAlign: isUser ? 'right' : 'left' }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
