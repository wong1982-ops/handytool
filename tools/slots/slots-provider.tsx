'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PlayerState, LobbyTab } from './slots-types'
import { en } from './i18n/en'
import { zh } from './i18n/zh'
import type { I18nStrings } from './i18n/en'

// ── Player actions ──────────────────────────────────

type PlayerAction =
  | { type: 'SET_PLAYER'; payload: PlayerState }
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'DEDUCT_COINS'; payload: number }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'LEVEL_UP'; payload: { level: number; reward: number } }
  | { type: 'CLAIM_DAILY'; payload: { streak: number; amount: number } }
  | { type: 'TOGGLE_SOUND' }

const STORAGE_KEY = 'casino_player'

function loadPlayer(): PlayerState {
  if (typeof window === 'undefined') return defaultPlayer()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultPlayer()
  } catch { return defaultPlayer() }
}

function savePlayer(player: PlayerState) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(player)) } catch {}
}

function defaultPlayer(): PlayerState {
  return {
    userId: null,
    coins: 500000, // welcome bonus
    xp: 0,
    level: 1,
    dailyStreak: 0,
    lastDailyClaimAt: null,
    soundEnabled: true,
  }
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_PLAYER':
      return action.payload
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.payload }
    case 'DEDUCT_COINS':
      return { ...state, coins: Math.max(0, state.coins - action.payload) }
    case 'ADD_XP':
      return { ...state, xp: state.xp + action.payload }
    case 'LEVEL_UP':
      return { ...state, level: action.payload.level, coins: state.coins + action.payload.reward }
    case 'CLAIM_DAILY':
      return {
        ...state,
        dailyStreak: action.payload.streak,
        coins: state.coins + action.payload.amount,
        lastDailyClaimAt: new Date().toISOString(),
      }
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled }
    default:
      return state
  }
}

// ── Context ─────────────────────────────────────────

interface SlotsContextValue {
  player: PlayerState
  dispatch: React.Dispatch<PlayerAction>
  t: I18nStrings
  locale: 'en' | 'zh'
  setLocale: (l: 'en' | 'zh') => void
  activeTab: LobbyTab
  setActiveTab: (tab: LobbyTab) => void
}

const SlotsContext = createContext<SlotsContextValue | null>(null)

export function SlotsProvider({ children }: { children: ReactNode }) {
  const [player, dispatch] = useReducer(playerReducer, undefined, loadPlayer)
  const [locale, setLocale] = useState<'en' | 'zh'>('en')
  const [activeTab, setActiveTab] = useState<LobbyTab>('lobby')

  // Auto-save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playerRef = useRef(player)
  playerRef.current = player

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => savePlayer(playerRef.current), 500)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [player.coins, player.xp, player.level, player.dailyStreak, player.soundEnabled])

  useEffect(() => {
    const h = () => savePlayer(playerRef.current)
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [])

  const t = useMemo(() => (locale === 'zh' ? zh : en) as I18nStrings, [locale])

  const value = useMemo(() => ({
    player, dispatch, t, locale, setLocale, activeTab, setActiveTab,
  }), [player, t, locale, activeTab])

  return <SlotsContext.Provider value={value}>{children}</SlotsContext.Provider>
}

export function useSlots() {
  const ctx = useContext(SlotsContext)
  if (!ctx) throw new Error('useSlots must be used within SlotsProvider')
  return ctx
}
