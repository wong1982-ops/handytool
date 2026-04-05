'use client'

import { useRef, useEffect, useState } from 'react'
import { ToolFrame } from '@/components/layout/tool-frame'
import { ChatInput } from './chat-input'
import { ChatSidebar } from './chat-sidebar'
import { ChatMessageBubble } from './chat-message'
import { useChat } from './use-chat'

const calculatorIcon = (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M17 3h4m0 0v4m0-4l-6 6M13 11l-4 4"
    />
  </svg>
)

const EXAMPLE_CHIPS = [
  "What's the current GST rate?",
  'How do I register a company in NZ?',
  'What are the minimum wage rates?',
]

export default function ChatPage() {
  const { conversations, activeConversationId, messages, loading, sending, error, selectConversation, newConversation, sendMessage } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const inputArea = (
    <ChatInput
      onSend={sendMessage}
      sending={sending}
      disabled={sending}
    />
  )

  return (
    <ToolFrame
      toolName="Accountant AI"
      toolSlug="accountant-ai"
      category="utility"
      variant="compact"
      icon={calculatorIcon}
      actions={inputArea}
    >
      <div className="flex h-full min-h-0 relative">
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-shrink-0 md:border-r md:border-[#1e2631] md:bg-[#0d1117] overflow-y-auto">
          <div className="w-full">
            <ChatSidebar
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={selectConversation}
              onNew={newConversation}
              loading={loading}
            />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            {/* Sidebar panel */}
            <div className="relative z-50 w-72 bg-[#0d1117] border-r border-[#1e2631] flex flex-col h-full overflow-y-auto">
              <ChatSidebar
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={(id) => { selectConversation(id); setSidebarOpen(false) }}
                onNew={() => { newConversation(); setSidebarOpen(false) }}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0d1117]">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[#1e2631] flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open conversation history"
              className="w-[44px] h-[44px] flex items-center justify-center rounded-xl text-[#a6abb5] hover:bg-[#1e2631] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="text-[14px] font-medium text-white">Accountant AI</span>
          </div>

          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Error banner */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <p className="text-[13px] text-red-400">{error}</p>
                </div>
              )}

              {/* Empty state */}
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#3D6AF2]/10 border border-[#3D6AF2]/20 flex items-center justify-center mb-6">
                    <svg
                      className="w-8 h-8 text-[#3D6AF2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M17 3h4m0 0v4m0-4l-6 6M13 11l-4 4"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Ask me anything about NZ tax, accounting, or business compliance
                  </h2>
                  <p className="text-[14px] text-[#70767f] mb-8 max-w-sm">
                    I&apos;m trained on official NZ government sources including IRD, Companies Office, and MBIE.
                  </p>

                  {/* Example chips */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EXAMPLE_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        className="rounded-full bg-[#131a23] border border-[#1e2631] px-4 py-2 text-[13px] text-[#a6abb5] hover:bg-[#1e2631] hover:text-white transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}

              {/* Sending indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#131a23] border border-[#1e2631] rounded-xl px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3D6AF2] animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-[#3D6AF2] animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-[#3D6AF2] animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </ToolFrame>
  )
}
