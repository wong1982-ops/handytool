# Casino Slots Tool — Implementation Plan

**Date:** 2026-03-31
**Design:** [2026-03-31-casino-slots-design.md](./2026-03-31-casino-slots-design.md)
**Status:** READY

---

## Phase 1: Foundation (Types, Engine, State)

### 1.1 — Types & i18n
- Create `tools/slots/slots-types.ts` — all interfaces (SlotGameConfig, SymbolConfig, BonusConfig, PlayerState, etc.)
- Create `tools/slots/i18n/en.ts` and `zh.ts`

### 1.2 — Slot engine core
- Create `tools/slots/engine/reel-generator.ts` — generate random stops from weighted reel strips using `crypto.getRandomValues()`
- Create `tools/slots/engine/slot-engine.ts` — spin(), evaluatePaylines(), checkScatters(), calculateWin()
- Create `tools/slots/engine/rtp-calculator.ts` — dev utility: simulate 1M spins, report actual RTP

### 1.3 — Player state
- Create `tools/slots/slots-provider.tsx` — PlayerContext (coins, level, XP, settings)
- Load from Supabase on mount (if logged in), fallback to localStorage for guests

### 1.4 — Database migration
- Create `supabase/migrations/036_casino_slots.sql` — all 7 tables with RLS

**Checkpoint:** Engine can spin and evaluate wins. RTP calculator confirms ~96% over 1M simulations.

---

## Phase 2: First Game Config (Wild Stampede)

### 2.1 — Game config
- Create `tools/slots/games/wild-stampede.ts` — full config with symbols, weighted reel strips, 243-ways evaluation, payout table, free spins bonus config
- Research Buffalo slot math from public analysis sources for symbol weights

### 2.2 — RTP verification
- Run rtp-calculator against Wild Stampede config
- Adjust reel strip weights until RTP is in 95.5-96.5% range

**Checkpoint:** Wild Stampede config validated at target RTP.

---

## Phase 3: Slot Machine UI

### 3.1 — Reel components
- Create `components/machine/symbol-cell.tsx` — single symbol display
- Create `components/machine/reel-strip.tsx` — single reel column with CSS spin animation (translateY)
- Create `components/machine/reel-board.tsx` — 5×3 grid, orchestrates sequential reel stops

### 3.2 — Controls
- Create `components/machine/bet-controls.tsx` — lines, bet/line, total, spin button, auto, max bet
- Create `components/machine/auto-spin-dialog.tsx` — auto-spin count + stop conditions

### 3.3 — Win display
- Create `components/machine/payline-overlay.tsx` — SVG/CSS lines highlighting winning paylines
- Create `components/machine/win-display.tsx` — win amount count-up, big/mega win banners
- Create `components/machine/paytable-modal.tsx` — symbol payouts + rules modal

### 3.4 — Game page
- Create `app/tools/slots/[gameId]/page.tsx` — loads game config, renders machine
- Create `tools/slots/hooks/use-spin.ts` — orchestrator: engine spin → animation → API balance update

### 3.5 — Sound effects
- Create `tools/slots/hooks/use-sound.ts` — preload + play sounds, respect mute setting
- Source/generate 8 SFX files (spin, reel-stop, win-small, win-big, win-mega, bonus-trigger, coin-credit, button-click)

**Checkpoint:** Wild Stampede is fully playable — spin, see animated reels, win detection, payline highlights, sound effects, bet controls.

---

## Phase 4: Bonus Rounds

### 4.1 — Bonus overlay
- Create `components/bonus/bonus-overlay.tsx` — "BONUS!" entrance animation + transition

### 4.2 — Free spins bonus
- Create `components/bonus/free-spins-bonus.tsx` — auto-spins with multiplier, retrigger logic, running total

### 4.3 — Pick-a-prize bonus
- Create `components/bonus/pick-prize-bonus.tsx` — grid of hidden items, pick N, reveal animation

### 4.4 — Wheel bonus
- Create `components/bonus/wheel-bonus.tsx` — CSS animated prize wheel, spin + land on segment

### 4.5 — Expanding wilds bonus
- Create `components/bonus/expanding-wilds-bonus.tsx` — free spins where wilds animate to fill reel

**Checkpoint:** All 4 bonus types functional. Wild Stampede free spins trigger and play correctly.

---

## Phase 5: Remaining 9 Game Configs

### 5.1 — Research & configure
- Create game configs for: Nile Queen, Golden Dragon, Tiki Fire, Ocean Treasure, Lucky 88, Sakura Garden, Chilli Fiesta, Fortune Clover, Safari King
- Each config: symbols, reel strips, paylines, payout table, bonus config

### 5.2 — RTP verification
- Run rtp-calculator on each game
- Adjust weights until all games are in 95.5-96.5% range

### 5.3 — Games index
- Create `tools/slots/games/index.ts` — barrel export ALL_GAMES array

**Checkpoint:** All 10 games configured and RTP-verified.

---

## Phase 6: Casino Lobby

### 6.1 — Lobby components
- Create `components/lobby/coin-display.tsx` — persistent coin balance in header
- Create `components/lobby/game-card.tsx` — game thumbnail with theme icon + name
- Create `components/lobby/daily-bonus.tsx` — streak banner, claim button, countdown timer
- Create `components/lobby/bottom-nav.tsx` — 5-tab navigation

### 6.2 — Lobby page
- Create `app/tools/slots/page.tsx` — game grid + daily bonus + bottom nav
- Create `app/tools/slots/layout.tsx` — SEO metadata + JSON-LD

**Checkpoint:** Lobby shows all 10 games, daily bonus claimable, navigation works.

---

## Phase 7: Economy API

### 7.1 — Player API
- Create `app/api/v1/slots/player/route.ts` — GET: load player state (coins, level, XP, streak)

### 7.2 — Spin API
- Create `app/api/v1/slots/spin/route.ts` — POST: validate bet ≤ balance, deduct bet, credit win, log transaction, update XP/level

### 7.3 — Daily bonus API
- Create `app/api/v1/slots/daily-bonus/route.ts` — POST: validate streak, credit coins, update streak + timestamp

### 7.4 — Shop API
- Create `app/api/v1/slots/shop/route.ts` — POST: create Stripe checkout session for coin pack, webhook to credit coins

**Checkpoint:** Server-authoritative economy working. Spins deduct/credit correctly. Daily bonus validates streak. Shop creates Stripe session.

---

## Phase 8: Social Features

### 8.1 — Friends
- Create `app/api/v1/slots/friends/route.ts` — GET list, POST add, PATCH accept/decline
- Create `components/social/friends-tab.tsx` — friend list, add form, pending requests

### 8.2 — Gifting
- Create `app/api/v1/slots/gifts/route.ts` — GET received, POST send, PATCH claim
- Create `components/social/gifts-tab.tsx` — inbox, send to friend, claim all

### 8.3 — Leaderboard
- Create `app/api/v1/slots/leaderboard/route.ts` — GET weekly/alltime/friends rankings
- Create `components/social/leaderboard-tab.tsx` — ranked list with avatar, level, coins

### 8.4 — Events
- Create `app/api/v1/slots/events/route.ts` — GET active events + user progress
- Create `components/social/events-banner.tsx` — lobby banner for active event
- Create `components/social/event-detail.tsx` — tournament/challenge detail + progress

**Checkpoint:** Full social features functional. Friends, gifts, leaderboard, events all working.

---

## Phase 9: Polish & Homepage

### 9.1 — Add to homepage
- Add "Toolk1t Casino" to `lib/tools.tsx`

### 9.2 — Mobile responsive
- Lobby: 2-column grid on mobile
- Machine: scaled reel board, stacked controls
- Bottom nav: sticky, 44px touch targets

### 9.3 — Accessibility
- ARIA labels on all controls
- Keyboard: spacebar to spin, arrow keys for bet
- Screen reader: announce wins

### 9.4 — Loading & error states
- Skeleton for lobby and game loading
- Network error handling for API calls
- Insufficient coins warning

### 9.5 — Guest mode
- Allow guest play with localStorage-only coins
- Show "Sign in to save progress" prompt

**Checkpoint:** Production-ready, accessible, responsive, listed on homepage.
