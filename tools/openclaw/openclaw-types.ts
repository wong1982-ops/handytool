export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface OpenClawConfig {
  gatewayUrl: string   // e.g. ws://192.168.1.50:18789
  authToken: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  streaming: boolean
}

// Outbound
export interface OutboundMessage {
  type: 'user_message'
  content: string
  id: string
}

// Inbound (from Gateway)
export interface InboundMessage {
  type: 'assistant_message' | 'assistant_message_chunk' | 'status' | 'error'
  content?: string
  messageId?: string
  done?: boolean
}

export interface ChatState {
  config: OpenClawConfig | null
  messages: ChatMessage[]
  status: ConnectionStatus
  showSettings: boolean
  error: string | null
}
