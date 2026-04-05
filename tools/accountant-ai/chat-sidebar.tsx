'use client'

import { Conversation } from './types'

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'Just now'
  if (diffHours < 1) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'

  return date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })
}

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  loading: boolean
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  loading,
}: ChatSidebarProps) {
  return (
    <aside className="flex flex-col h-full">
      {/* New Chat button */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <button
          onClick={onNew}
          className="w-full h-[44px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-white text-[14px] font-medium transition-opacity hover:opacity-90"
        >
          {/* Sparkle icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-[#1e2631] flex-shrink-0" />

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-[#1e2631] rounded-lg h-12"
              />
            ))}
          </>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[80px]">
            <p className="text-[13px] text-[#70767f] text-center">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#1e2631] text-white'
                    : 'text-[#a6abb5] hover:bg-[#1e2631]'
                }`}
              >
                <p className="text-[14px] truncate leading-snug">
                  {conv.title ?? 'Untitled conversation'}
                </p>
                <p className="text-[11px] text-[#70767f] mt-0.5">
                  {formatRelativeDate(conv.updatedAt)}
                </p>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}
