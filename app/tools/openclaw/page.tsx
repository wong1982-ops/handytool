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
    <div className="flex flex-col h-[100dvh]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t.header.title}
          </h1>
        </div>
        <FavoriteButton slug="openclaw" name="OpenClaw Chat" />
      </header>

      {/* Connection bar */}
      <ChatHeader />

      {/* Not configured state */}
      {!config ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto px-4">
            <p className="text-5xl mb-4" aria-hidden="true">🤖</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t.setup.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t.setup.description}
            </p>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.setup.openSettings}
            </button>
          </div>
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
