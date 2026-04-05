'use client'

import { ChatMessage } from './types'

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-[#3D6AF2]/15 border border-[#3D6AF2]/20 rounded-xl p-4">
          <p className="text-[14px] text-white whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-[#131a23] border border-[#1e2631] rounded-xl p-4">
        <p className="text-[14px] text-[#a6abb5] whitespace-pre-wrap">{message.content}</p>

        {message.sources.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] text-[#70767f] mb-2">Sources:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#1e2631] px-2.5 py-1 text-xs text-[#3D9DF2] hover:bg-[#3D6AF2]/20 transition-colors"
                >
                  {getDomain(source.url)}
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-[#70767f] italic mt-3">
          ⚠️ This is general information only, not professional tax advice. Please consult a qualified accountant for your specific situation.
        </p>
      </div>
    </div>
  )
}
