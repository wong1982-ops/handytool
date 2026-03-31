'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { ConnectionStatus, InboundMessage } from './openclaw-types'

interface UseOpenClawSocketOptions {
  url: string | null
  token: string | null
  onMessage: (msg: InboundMessage) => void
  onStatusChange: (status: ConnectionStatus) => void
}

// Adapter: map raw Gateway frames to our InboundMessage type
function adaptMessage(raw: unknown): InboundMessage | null {
  if (typeof raw !== 'object' || raw === null) return null
  const msg = raw as Record<string, unknown>

  // OpenClaw Gateway protocol adaptation
  // The gateway may use different field names — this adapter normalizes them
  const type = (msg.type as string) || (msg.event as string) || ''

  if (type === 'assistant_message' || type === 'message' || type === 'response') {
    return {
      type: 'assistant_message',
      content: (msg.content as string) || (msg.text as string) || '',
      messageId: (msg.messageId as string) || (msg.id as string) || '',
      done: true,
    }
  }

  if (type === 'assistant_message_chunk' || type === 'chunk' || type === 'stream' || type === 'delta') {
    return {
      type: 'assistant_message_chunk',
      content: (msg.content as string) || (msg.text as string) || (msg.delta as string) || '',
      messageId: (msg.messageId as string) || (msg.id as string) || '',
      done: Boolean(msg.done) || Boolean(msg.finished) || Boolean(msg.complete),
    }
  }

  if (type === 'status') {
    return { type: 'status', content: (msg.content as string) || (msg.status as string) || '' }
  }

  if (type === 'error') {
    return { type: 'error', content: (msg.content as string) || (msg.message as string) || (msg.error as string) || 'Unknown error' }
  }

  // Fallback: treat as chunk if it has content
  if (msg.content || msg.text || msg.delta) {
    return {
      type: 'assistant_message_chunk',
      content: (msg.content as string) || (msg.text as string) || (msg.delta as string) || '',
      messageId: (msg.messageId as string) || (msg.id as string) || '',
      done: Boolean(msg.done),
    }
  }

  return null
}

export function useOpenClawSocket({ url, token, onMessage, onStatusChange }: UseOpenClawSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttempts = useRef(0)
  const intentionalClose = useRef(false)

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
    if (wsRef.current) {
      intentionalClose.current = true
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!url || !token) return
    cleanup()
    intentionalClose.current = false

    onStatusChange('connecting')

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        reconnectAttempts.current = 0
        // Send auth handshake
        ws.send(JSON.stringify({ type: 'auth', token }))
        onStatusChange('connected')
      }

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data)
          const adapted = adaptMessage(raw)
          if (adapted) onMessage(adapted)
        } catch {
          // Non-JSON message, ignore
        }
      }

      ws.onerror = () => {
        onStatusChange('error')
      }

      ws.onclose = () => {
        wsRef.current = null
        if (!intentionalClose.current) {
          onStatusChange('disconnected')
          // Auto-reconnect with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectAttempts.current++
          reconnectTimer.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          onStatusChange('idle')
        }
      }
    } catch {
      onStatusChange('error')
    }
  }, [url, token, onMessage, onStatusChange, cleanup])

  const send = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_message',
        content,
        id: crypto.randomUUID(),
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    cleanup()
    onStatusChange('idle')
  }, [cleanup, onStatusChange])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return { connect, send, disconnect }
}
