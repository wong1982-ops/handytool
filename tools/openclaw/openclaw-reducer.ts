import type { ChatState, ChatMessage, OpenClawConfig, ConnectionStatus } from './openclaw-types'

export type ChatAction =
  | { type: 'SET_CONFIG'; payload: OpenClawConfig | null }
  | { type: 'SET_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'APPEND_CHUNK'; payload: { messageId: string; content: string } }
  | { type: 'COMPLETE_MESSAGE'; payload: { messageId: string } }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'LOAD_MESSAGES'; payload: ChatMessage[] }

export function createDefaultState(): ChatState {
  return {
    config: null,
    messages: [],
    status: 'idle',
    showSettings: false,
    error: null,
  }
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload }

    case 'SET_STATUS':
      return { ...state, status: action.payload, error: action.payload === 'error' ? state.error : null }

    case 'SET_ERROR':
      return { ...state, error: action.payload, status: action.payload ? 'error' : state.status }

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] }

    case 'APPEND_CHUNK': {
      const { messageId, content } = action.payload
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, content: m.content + content } : m
        ),
      }
    }

    case 'COMPLETE_MESSAGE': {
      const { messageId } = action.payload
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, streaming: false } : m
        ),
      }
    }

    case 'CLEAR_HISTORY':
      return { ...state, messages: [] }

    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings }

    case 'LOAD_MESSAGES':
      return { ...state, messages: action.payload }

    default:
      return state
  }
}
