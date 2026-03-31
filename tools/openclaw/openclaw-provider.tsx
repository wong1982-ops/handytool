'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { chatReducer, createDefaultState, type ChatAction } from './openclaw-reducer'
import type { ChatState, OpenClawConfig, ChatMessage } from './openclaw-types'
import { en } from './i18n/en'
import { zh } from './i18n/zh'
import type { I18nStrings } from './i18n/en'

// localStorage keys
const CONFIG_KEY = 'openclaw_config'
const HISTORY_KEY = 'openclaw_history'

function loadConfig(): OpenClawConfig | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveConfig(config: OpenClawConfig | null) {
  if (typeof window === 'undefined') return
  if (config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } else {
    localStorage.removeItem(CONFIG_KEY)
  }
}

function loadHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages))
  } catch { /* storage full */ }
}

// Context
interface ChatContextValue {
  state: ChatState
  dispatch: React.Dispatch<ChatAction>
  t: I18nStrings
  locale: 'en' | 'zh'
  setLocale: (l: 'en' | 'zh') => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

export function OpenClawProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, () => {
    const config = loadConfig()
    const messages = loadHistory()
    return { ...createDefaultState(), config, messages }
  })

  const [locale, setLocaleState] = useState<'en' | 'zh'>('en')

  // Persist config
  useEffect(() => {
    saveConfig(state.config)
  }, [state.config])

  // Persist history (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesRef = useRef(state.messages)
  messagesRef.current = state.messages

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveHistory(messagesRef.current)
    }, 1000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state.messages.length])

  // Save on unload
  useEffect(() => {
    const handleUnload = () => saveHistory(messagesRef.current)
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  const t = useMemo(() => (locale === 'zh' ? zh : en) as I18nStrings, [locale])

  const setLocale = useCallback((l: 'en' | 'zh') => setLocaleState(l), [])

  const value = useMemo(() => ({ state, dispatch, t, locale, setLocale }), [state, t, locale, setLocale])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within OpenClawProvider')
  return ctx
}
