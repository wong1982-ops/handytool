'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Conversation, ChatMessage } from './types'

interface UseChatReturn {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
  error: string | null
  loadConversations: () => Promise<void>
  selectConversation: (id: string) => Promise<void>
  newConversation: () => void
  sendMessage: (content: string) => Promise<void>
}

export function useChat(): UseChatReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/v1/accountant-ai/conversations')
      if (!res.ok) throw new Error(`Failed to load conversations: ${res.statusText}`)
      const json = await res.json()
      const data: Conversation[] = json.data ?? json
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const selectConversation = useCallback(async (id: string) => {
    try {
      setActiveConversationId(id)
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/v1/accountant-ai/conversations/${id}`)
      if (!res.ok) throw new Error(`Failed to load conversation: ${res.statusText}`)
      const json = await res.json()
      const data: ChatMessage[] = json.data ?? json
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }, [])

  const newConversation = useCallback(() => {
    setActiveConversationId(null)
    setMessages([])
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    const optimisticMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content,
      sources: [],
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      setSending(true)
      setError(null)
      const res = await fetch('/api/v1/accountant-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConversationId, content }),
      })
      if (!res.ok) throw new Error(`Failed to send message: ${res.statusText}`)
      const json = await res.json()
      const data = json.data ?? json

      const assistantMessage: ChatMessage = data.message ?? data
      const newConversationId: string | undefined = data.conversationId

      setMessages(prev => [...prev, assistantMessage])

      if (newConversationId && newConversationId !== activeConversationId) {
        setActiveConversationId(newConversationId)
      }

      await loadConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
    } finally {
      setSending(false)
    }
  }, [activeConversationId, loadConversations])

  return {
    conversations,
    activeConversationId,
    messages,
    loading,
    sending,
    error,
    loadConversations,
    selectConversation,
    newConversation,
    sendMessage,
  }
}
