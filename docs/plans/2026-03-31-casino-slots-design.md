# Casino Slots Tool — Design Document

**Date:** 2026-03-31
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Understanding Summary

- **What:** A free-to-play social casino slots game for Toolk1t, faithfully recreating the Heart of Vegas experience
- **Why:** Entertainment/engagement tool with IAP monetization via coin purchases
- **Who:** Toolk1t users who enjoy casual casino/slots gaming
- **Scale:** Moderate (hundreds to low thousands of concurrent players)

### Key Constraints
- 10 slot machine themes, all unlocked from start
- Research-based math models (approximate real Aristocrat RTP ~95.5-96.5%)
- Config-driven slot engine — one engine, 10 game configs
- Full social: friends, gifting, leaderboards, community events/tournaments
- Free-to-play with IAP (Stripe) for coin purchases
- Sound effects only (no background music)
- Hybrid storage: economy in Supabase (server-authoritative), RNG client-side
- CSS animations for reel spinning (React DOM, not canvas)

### Non-Goals (v1)
- No background music
- No real-money gambling / cash-out
- No progressive jackpots across players
- No admin UI for events (managed via Supabase directly)
- No exact Aristocrat branding (original themes inspired by, not copying IP)

### Assumptions
- Original themes inspired by popular Aristocrat titles, with original names/art
- RNG uses `crypto.getRandomValues()` client-side
- Stripe integration already exists in the project
- Each slot game defined as a TS config file
- Supabase auth for user identity
- Anti-cheat: coin balance server-authoritative, API validates every spin

---

## Architecture: Config-Driven Slot Engine

One universal `SlotEngine` reads game definitions from config files. Each slot machine is a config (symbols, weights, reels, paylines, bonus rules). Adding a new game = creating a new config file.

---

## Casino Lobby

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Toolk1t Casino"           🪙 1,250,000  [⚙]  │
├─────────────────────────────────────────────────────────┤
│  Daily Bonus Banner                                     │
│  "Day 5 streak! Claim 50,000 coins"  [Claim!]          │
├─────────────────────────────────────────────────────────┤
│  Game Grid (5-col desktop, 3 tablet, 2 mobile)         │
│  10 game cards with theme icon + name                   │
├─────────────────────────────────────────────────────────┤
│  [🎰 Lobby] [👥 Friends] [🏆 Leaderboard]              │
│  [🎁 Gifts] [🛒 Shop]                                  │
└─────────────────────────────────────────────────────────┘
```

### Bottom Nav Tabs

| Tab | Content |
|---|---|
| Lobby | Game grid |
| Friends | Friend list, add friends, online status |
| Leaderboard | Weekly/all-time/friends-only rankings |
| Gifts | Send/receive daily coin gifts |
| Shop | Buy coin packs with Stripe |

---

## Slot Machine Game Screen

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]  Wild Stampede          🪙 1,250,000          │
├─────────────────────────────────────────────────────────┤
│           5×3 Reel Grid                                 │
│           (CSS animated reel strips)                    │
│           Winning paylines highlighted                  │
│           Win amount with count-up animation            │
├─────────────────────────────────────────────────────────┤
│  Lines: [25]  Bet/Line: [◄ 100 ►]  Total: 2,500       │
│  [Auto]          [ SPIN ]          [Max Bet]            │
│  [ℹ️ Paytable]                                          │
└─────────────────────────────────────────────────────────┘
```

### Win Celebrations

| Win Size | Effect |
|---|---|
| Small (< 10x bet) | Brief highlight on winning symbols |
| Medium (10-50x) | Animated payline, coin shower, count-up |
| Big (50-200x) | Full-screen "BIG WIN" banner |
| Mega (200x+) | "MEGA WIN" with screen shake, particles |

---

## Slot Engine & Config System

```typescript
interface SlotGameConfig {
  id: string
  name: string
  theme: ThemeConfig
  reels: number                   // typically 5
  rows: number                    // typically 3
  symbols: SymbolConfig[]
  reelStrips: number[][]          // weighted symbol indices per reel
  paylines: number[][]            // payline patterns
  specialSymbols: {
    wild?: string
    scatter?: string
  }
  bonusConfig: BonusConfig
  rtp: number                     // target 0.955-0.965
}

interface SymbolConfig {
  id: string
  name: string
  icon: string
  payouts: Record<number, number> // count → multiplier
  isWild?: boolean
  isScatter?: boolean
}

interface BonusConfig {
  type: 'free_spins' | 'pick_prize' | 'wheel' | 'expanding_wilds'
  triggerCount: number
  freeSpinsCount?: number
  multiplier?: number
  retriggerable?: boolean
}
```

### Spin Resolution (Client-Side)
1. Generate random stop positions per reel via `crypto.getRandomValues()`
2. Map stops to symbols using weighted reel strips
3. Evaluate all active paylines
4. Check scatter count for bonus triggers
5. Calculate total win
6. Send result to server API for balance update

---

## Bonus Round System (Plugin Pattern)

| Type | Mechanic | Games |
|---|---|---|
| free_spins | N free spins with multiplier, retriggerable | Wild Stampede, Nile Queen, Safari King, Ocean Treasure |
| pick_prize | Pick hidden items for coins/multipliers | Chilli Fiesta, Fortune Clover |
| wheel | Spin prize wheel | Lucky 88, Golden Dragon |
| expanding_wilds | Wilds expand to fill reel during free spins | Sakura Garden, Tiki Fire |

Each bonus type is a self-contained React component: `FreeSpinsBonus`, `PickPrizeBonus`, `WheelBonus`, `ExpandingWildsBonus`.

---

## The 10 Slot Games

| # | Game Name | Inspired By | Paylines | Bonus | Key Feature |
|---|---|---|---|---|---|
| 1 | Wild Stampede | Buffalo | 243 ways | free_spins | Stacked wilds, retrigger |
| 2 | Nile Queen | Queen of the Nile | 25 | free_spins | 15 spins, 3x multiplier |
| 3 | Golden Dragon | 50 Dragons | 50 | wheel | Wheel multiplier |
| 4 | Tiki Fire | Tiki Torch | 20 | expanding_wilds | Expanding wilds |
| 5 | Ocean Treasure | Dolphin Treasure | 20 | free_spins | Extra wilds in free spins |
| 6 | Lucky 88 | Lucky 88 | 25 | wheel | Choose spins vs multiplier |
| 7 | Sakura Garden | Geisha | 25 | expanding_wilds | Expanding wilds + choice |
| 8 | Chilli Fiesta | More Chilli | 25 | pick_prize | Pick chillies |
| 9 | Fortune Clover | Where's the Gold | 25 | pick_prize | Pick characters for wilds |
| 10 | Safari King | 50 Lions | 50 | free_spins | Stacked wilds reels 2-5 |

Symbol tiers per game: 4-5 high-value (theme icons), 4 low-value (A/K/Q/J/10), 1 wild, 1 scatter. Target RTP: 95.5-96.5%.

---

## Virtual Economy

### Sources & Sinks
- **Sources:** Welcome bonus (500k), daily streak (5k-100k), level-up rewards, friend gifts, event prizes, IAP
- **Sinks:** Spin bets (house edge ~4% over time)

### Daily Bonus Streak
Day 1: 5k → Day 2: 10k → Day 3: 15k → Day 4: 25k → Day 5: 50k → Day 6: 75k → Day 7: 100k. Miss a day → reset to Day 1.

### Level System
- XP per spin: `totalBet * 0.1`
- Exponential thresholds: 1000, 3000, 7000, 15000, 30000...
- Level-up reward: `level * 5000` coins

### IAP Coin Packs (Stripe)

| Pack | Coins | Price | Bonus |
|---|---|---|---|
| Starter | 100,000 | $0.99 | — |
| Popular | 500,000 | $3.99 | +10% |
| Best Value | 1,500,000 | $9.99 | +20% |
| High Roller | 5,000,000 | $24.99 | +30% |
| Whale | 15,000,000 | $49.99 | +50% |

---

## Social Features

### Friends
- Add by username or share link
- Accept/decline requests
- See online status, current game, level, coins

### Daily Gifting
- 1,000 coins per gift per friend per day
- "Claim All" button
- Unclaimed gifts expire after 7 days

### Leaderboards
- Weekly (resets Monday, top 10 get prizes) and All-time
- Tabs: Weekly / All-Time / Friends Only

### Events
- **Tournament:** Highest total win in time window
- **Challenge:** Progress-bar goals (e.g., "win 50 free spin rounds")
- **Happy Hour:** 2x XP or bonus coins for limited time
- Created via Supabase directly (no admin UI)

---

## Database Schema

```sql
casino_players       (user_id PK, coins, xp, level, daily_streak, last_daily)
casino_transactions  (id PK, user_id FK, type, amount, metadata JSONB)
casino_friends       (id PK, user_id FK, friend_id FK, status)
casino_gifts         (id PK, sender_id FK, receiver_id FK, amount, claimed)
casino_leaderboard   (id PK, user_id FK, period, coins_won, biggest_win, spins_count)
casino_events        (id PK, name, type, config JSONB, starts_at, ends_at)
casino_event_entries (id PK, event_id FK, user_id FK, score)
```

All tables with RLS: users can only read/write their own data.

---

## Sound Effects

| Sound | Trigger |
|---|---|
| spin.mp3 | Spin button pressed |
| reel-stop.mp3 | Each reel stops (played 5x staggered) |
| win-small.mp3 | Small win |
| win-big.mp3 | Big win |
| win-mega.mp3 | Mega win |
| bonus-trigger.mp3 | Bonus round triggered |
| coin-credit.mp3 | Coins added to balance |
| button-click.mp3 | UI button press |

Toggle on/off in settings. Stored in localStorage.

---

## File Structure

```
app/tools/slots/
├── layout.tsx
├── page.tsx                        # Lobby
└── [gameId]/page.tsx               # Game screen

tools/slots/
├── slots-types.ts
├── slots-provider.tsx
├── engine/ (slot-engine.ts, reel-generator.ts, rtp-calculator.ts)
├── games/ (10 configs + index.ts)
├── components/
│   ├── lobby/ (game-card, daily-bonus, coin-display, bottom-nav)
│   ├── machine/ (reel-board, reel-strip, symbol-cell, payline-overlay,
│   │            bet-controls, win-display, paytable-modal, auto-spin-dialog)
│   ├── bonus/ (bonus-overlay, free-spins, pick-prize, wheel, expanding-wilds)
│   ├── social/ (friends-tab, leaderboard-tab, gifts-tab, events-banner, event-detail)
│   └── shop/ (coin-shop.tsx)
├── sounds/ (8 mp3 files)
├── hooks/ (use-sound.ts, use-spin.ts)
└── i18n/ (en.ts, zh.ts)

app/api/v1/slots/
├── spin/route.ts
├── daily-bonus/route.ts
├── player/route.ts
├── shop/route.ts
├── friends/route.ts
├── gifts/route.ts
├── leaderboard/route.ts
└── events/route.ts

supabase/migrations/036_casino_slots.sql
```

~55 components + 10 game configs + 8 API routes + 8 sounds + 1 migration.

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | Config-driven slot engine | Per-game components, Phaser | Max reuse, one engine serves 10 games |
| 2 | 10 games all unlocked | Progressive, mixed | No artificial gating |
| 3 | Research-based RTP | Own math, generous | Authentic feel |
| 4 | 4 bonus types as plugins | Single type, custom per game | Covers variety with reusable components |
| 5 | Hybrid storage | Full server, full client | Anti-cheat on coins, instant spin feedback |
| 6 | CSS animations | Canvas/WebGL, Phaser | Consistent tech stack |
| 7 | Free-to-play + Stripe IAP | Fully free, credit-based | Revenue model |
| 8 | Full social features | None, light | Faithful recreation, retention |
| 9 | SFX only | Full audio, none | Good feedback without intrusion |
| 10 | Original inspired themes | Direct copies, fully original | Appeal without IP infringement |
| 11 | 243 ways for Wild Stampede | Fixed paylines | Matches real Buffalo |
| 12 | Daily streak bonus | Flat daily, weekly | Proven retention mechanic |
| 13 | Server-authoritative coins | Client-only | Anti-cheat, required for IAP |
| 14 | Events via Supabase directly | Admin UI | YAGNI for v1 |
