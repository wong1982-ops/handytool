// ── Slot Game Config ────────────────────────────────

export interface ThemeConfig {
  backgroundColor: string
  accentColor: string
  reelBackground: string
  headerGradient: string
  cabinetFrame: string      // CSS gradient for frame border
  cabinetAccent: string     // Glow/highlight color for wins
  meterName?: string        // Bonus meter label (free-spin games only)
  lobbyImage?: string       // e.g. '/images/slots/lobby/wild-stampede.webp'
  backgroundImage?: string  // e.g. '/images/slots/backgrounds/wild-stampede-bg.webp'
}

export interface SymbolConfig {
  id: string
  name: string
  icon: string              // emoji
  imagePath?: string        // e.g. '/images/slots/symbols/wild-stampede/bison.webp'
  payouts: Record<number, number>  // match count → bet multiplier (e.g., {3: 5, 4: 20, 5: 100})
  isWild?: boolean
  isScatter?: boolean
}

export type BonusType = 'free_spins' | 'pick_prize' | 'wheel' | 'expanding_wilds'

export interface BonusConfig {
  type: BonusType
  triggerCount: number       // scatters needed
  freeSpinsCount?: number
  multiplier?: number
  retriggerable?: boolean
  pickCount?: number         // for pick_prize
  wheelSegments?: number     // for wheel
}

export interface SlotGameConfig {
  id: string
  name: string
  description: string
  icon: string               // emoji for lobby card
  theme: ThemeConfig
  reels: number              // typically 5
  rows: number               // typically 3
  symbols: SymbolConfig[]
  reelStrips: number[][]     // symbol indices per reel (weighted)
  paylines: number[][]       // payline patterns (row indices per reel) — empty for "ways" games
  useWays?: boolean          // true = 243 ways evaluation instead of paylines
  specialSymbols: {
    wild?: string            // symbol id
    scatter?: string         // symbol id
  }
  bonusConfig: BonusConfig
  rtp: number                // target RTP (e.g., 0.96)
  minBet: number
  maxBet: number
  betSteps: number[]         // available bet-per-line values
}

// ── Spin Result ─────────────────────────────────────

export interface PaylineWin {
  paylineIndex: number       // -1 for scatter wins
  symbolId: string
  count: number
  multiplier: number
  winAmount: number
  positions: [number, number][]  // [reel, row] pairs
}

export interface SpinResult {
  grid: string[][]           // symbol ids [reel][row]
  wins: PaylineWin[]
  totalWin: number
  bonusTriggered: boolean
  scatterCount: number
}

// ── Player State ────────────────────────────────────

export interface PlayerState {
  userId: string | null
  coins: number
  xp: number
  level: number
  dailyStreak: number
  lastDailyClaimAt: string | null
  soundEnabled: boolean
  jackpots: {
    grand: number
    major: number
    minor: number
  }
}

// ── Economy ─────────────────────────────────────────

export type TransactionType =
  | 'spin_bet'
  | 'spin_win'
  | 'daily_bonus'
  | 'level_up'
  | 'gift_sent'
  | 'gift_received'
  | 'iap_purchase'
  | 'event_prize'
  | 'welcome_bonus'

export interface CoinPack {
  id: string
  name: string
  coins: number
  price: number             // USD cents
  bonusPercent: number
}

export const COIN_PACKS: CoinPack[] = [
  { id: 'starter', name: 'Starter', coins: 100000, price: 99, bonusPercent: 0 },
  { id: 'popular', name: 'Popular', coins: 500000, price: 399, bonusPercent: 10 },
  { id: 'best-value', name: 'Best Value', coins: 1500000, price: 999, bonusPercent: 20 },
  { id: 'high-roller', name: 'High Roller', coins: 5000000, price: 2499, bonusPercent: 30 },
  { id: 'whale', name: 'Whale', coins: 15000000, price: 4999, bonusPercent: 50 },
]

// ── Daily Bonus ─────────────────────────────────────

export const DAILY_BONUS_AMOUNTS = [5000, 10000, 15000, 25000, 50000, 75000, 100000]

// ── Level System ────────────────────────────────────

export function getXpForLevel(level: number): number {
  // Exponential: 1000, 3000, 7000, 15000, 30000, 60000...
  return Math.floor(1000 * Math.pow(2, level - 1))
}

export function getLevelReward(level: number): number {
  return level * 5000
}

// ── Win Tiers ───────────────────────────────────────

export type WinTier = 'none' | 'small' | 'medium' | 'big' | 'mega'

export function getWinTier(winAmount: number, totalBet: number): WinTier {
  if (winAmount === 0) return 'none'
  const ratio = winAmount / totalBet
  if (ratio < 10) return 'small'
  if (ratio < 50) return 'medium'
  if (ratio < 200) return 'big'
  return 'mega'
}

// ── Social ──────────────────────────────────────────

export type FriendStatus = 'pending' | 'accepted'

export interface Friend {
  id: string
  friendId: string
  username: string
  level: number
  coins: number
  status: FriendStatus
  online: boolean
}

export interface Gift {
  id: string
  senderId: string
  senderName: string
  amount: number
  claimed: boolean
  createdAt: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  level: number
  coinsWon: number
  biggestWin: number
  spinsCount: number
}

export type EventType = 'tournament' | 'challenge' | 'happy_hour'

export interface CasinoEvent {
  id: string
  name: string
  type: EventType
  config: Record<string, unknown>
  startsAt: string
  endsAt: string
  userScore?: number
}

// ── Lobby ───────────────────────────────────────────

export type LobbyTab = 'lobby' | 'friends' | 'leaderboard' | 'gifts' | 'shop'

// ── Bonus Props ─────────────────────────────────────

export interface BonusProps {
  config: SlotGameConfig
  triggerScatterCount: number
  betAmount: number
  onComplete: (totalWin: number) => void
}

// ── Jackpot Config ─────────────────────────────────

export const JACKPOT_CONFIG = {
  grand: { seed: 1000000, contribution: 0.005, odds: 50000 },
  major: { seed: 100000, contribution: 0.01, odds: 5000 },
  minor: { seed: 10000, contribution: 0.02, odds: 500 },
} as const

export type JackpotTier = 'grand' | 'major' | 'minor'
