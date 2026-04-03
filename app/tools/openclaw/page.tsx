'use client'

import { useCallback, useRef, useEffect } from 'react'
import { OpenClawProvider, useChat } from '@/tools/openclaw/openclaw-provider'
import { useOpenClawSocket } from '@/tools/openclaw/use-openclaw-socket'
import { ChatHeader } from '@/tools/openclaw/chat-header'
import { ChatMessages } from '@/tools/openclaw/chat-messages'
import { ChatInput } from '@/tools/openclaw/chat-input'
import { SettingsPanel } from '@/tools/openclaw/settings-panel'
import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'
import type { InboundMessage, ConnectionStatus } from '@/tools/openclaw/openclaw-types'

function OpenClawChatInner() {
  const { state, dispatch, t } = useChat()
  const { config, status } = state
  const currentAssistantId = useRef<string | null>(null)

  const handleMessage = useCallback((msg: InboundMessage) => {
    if (msg.type === 'assistant_message') {
      // Full message (non-streaming)
      const id = msg.messageId || crypto.randomUUID()
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id,
          role: 'assistant',
          content: msg.content || '',
          timestamp: new Date().toISOString(),
          streaming: false,
        },
      })
      currentAssistantId.current = null
    } else if (msg.type === 'assistant_message_chunk') {
      if (!currentAssistantId.current) {
        // Start new assistant message
        const id = msg.messageId || crypto.randomUUID()
        currentAssistantId.current = id
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id,
            role: 'assistant',
            content: msg.content || '',
            timestamp: new Date().toISOString(),
            streaming: true,
          },
        })
      } else {
        // Append to existing
        dispatch({
          type: 'APPEND_CHUNK',
          payload: {
            messageId: currentAssistantId.current,
            content: msg.content || '',
          },
        })
      }

      if (msg.done) {
        dispatch({ type: 'COMPLETE_MESSAGE', payload: { messageId: currentAssistantId.current! } })
        currentAssistantId.current = null
      }
    } else if (msg.type === 'error') {
      dispatch({ type: 'SET_ERROR', payload: msg.content || 'Unknown error' })
    }
  }, [dispatch])

  const handleStatusChange = useCallback((newStatus: ConnectionStatus) => {
    dispatch({ type: 'SET_STATUS', payload: newStatus })
  }, [dispatch])

  const { connect, send, disconnect } = useOpenClawSocket({
    url: config?.gatewayUrl || null,
    token: config?.authToken || null,
    onMessage: handleMessage,
    onStatusChange: handleStatusChange,
  })

  // Auto-connect if config exists on mount
  useEffect(() => {
    if (config && status === 'idle') {
      connect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback((content: string) => {
    const id = crypto.randomUUID()
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        streaming: false,
      },
    })
    send(content)
  }, [dispatch, send])

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-[#090f16]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 shrink-0 h-[52px] bg-slate-50 dark:bg-[#131a23] border-b border-slate-200 dark:border-[#1e2631]">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="font-semibold text-slate-900 dark:text-white text-base">
            {t.header.title}
          </h1>
        </div>
        <FavoriteButton slug="openclaw" name="OpenClaw Chat" />
      </header>

      {/* Connection bar */}
      <ChatHeader />

      {/* Not configured state */}
      {!config ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-white dark:bg-[#090f16]">
          {/* Icon box */}
          <div className="flex items-center justify-center mb-5 w-[72px] h-[72px] rounded-[20px] bg-slate-50 dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631]">
            <svg className="w-9 h-9 text-slate-400 dark:text-[#70767f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47M5 14.5l2.47-2.47m0 0a24.41 24.41 0 019.06 0" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2.5">
            {t.setup.title}
          </h2>
          <p className="text-sm mb-7 max-w-xs text-slate-500 dark:text-[#a6abb5] leading-relaxed">
            {t.setup.description}
          </p>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            className="font-semibold text-white text-sm transition-colors"
            style={{ height: 44, padding: '0 28px', background: '#3D6AF2', borderRadius: 10 }}
            onMouseOver={(e) => { (e.target as HTMLButtonElement).style.background = '#2f5be0' }}
            onMouseOut={(e) => { (e.target as HTMLButtonElement).style.background = '#3D6AF2' }}
          >
            {t.setup.openSettings}
          </button>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <ChatMessages />

          {/* Input bar */}
          <ChatInput onSend={handleSend} />
        </>
      )}

      {/* Settings modal */}
      <SettingsPanel onConnect={connect} onDisconnect={disconnect} />
    </div>
  )
}

export default function OpenClawPage() {
  return (
    <OpenClawProvider>
      <OpenClawChatInner />
    </OpenClawProvider>
  )
}
