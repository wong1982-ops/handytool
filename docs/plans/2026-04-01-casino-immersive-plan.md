# Casino Immersive Game Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the casino slot game screen to match Heart of Vegas quality — full-screen immersive, portrait-first, ornate themed cabinets, progressive jackpots, and redesigned controls.

**Architecture:** Reskin existing game page (`app/tools/slots/[gameId]/page.tsx`) to full-screen portrait container. Add 4 new UI components (jackpot tickers, bonus meter, HUD overlay, spin controls). Extend slot engine with jackpot logic. Update all 10 game configs with cabinet theme values. No game logic changes.

**Tech Stack:** React, Tailwind CSS, CSS gradients/shadows for cabinet frames, requestAnimationFrame for ticker animation, localStorage for jackpot state.

---

### Task 1: Update Types & Game Configs

**Files:**
- Modify: `tools/slots/slots-types.ts`
- Modify: `tools/slots/games/wild-stampede.ts` (and all 9 other game configs)
- Modify: `tools/slots/games/index.ts`

- [ ] **Step 1: Add cabinet theme fields and jackpot types to slots-types.ts**

Add to `ThemeConfig`:
```typescript
cabinetFrame: string     // CSS gradient for frame border
cabinetAccent: string    // Glow/highlight color for wins
meterName?: string       // Bonus meter label (free-spin games only)
```

Add to `PlayerState`:
```typescript
jackpots: {
  grand: number
  major: number
  minor: number
}
```

Add constants:
```typescript
export const JACKPOT_CONFIG = {
  grand: { seed: 1000000, contribution: 0.005, odds: 50000 },
  major: { seed: 100000, contribution: 0.01, odds: 5000 },
  minor: { seed: 10000, contribution: 0.02, odds: 500 },
} as const

export type JackpotTier = 'grand' | 'major' | 'minor'
```

- [ ] **Step 2: Update all 10 game configs with cabinet theme values**

Each game file gets these additions to `theme`:

| Game | cabinetFrame | reelBackground | cabinetAccent | meterName |
|---|---|---|---|---|
| wild-stampede | `linear-gradient(180deg, #8B0000, #d4a052, #8B0000)` | `#3a0a0a` | `#d4a052` | `STAMPEDE METER` |
| nile-queen | `linear-gradient(180deg, #1a1a5a, #c9a84c, #1a1a5a)` | `#0a0a2a` | `#c9a84c` | `PHARAOH'S POWER` |
| golden-dragon | `linear-gradient(180deg, #5a0a0a, #cc3333, #5a0a0a)` | `#2a0505` | `#cc3333` | (none — wheel) |
| tiki-fire | `linear-gradient(180deg, #3a1f0a, #e87830, #3a1f0a)` | `#1a0f05` | `#e87830` | `TIKI BLAZE` |
| ocean-treasure | `linear-gradient(180deg, #0a3a3a, #40c4c4, #0a3a3a)` | `#051a1a` | `#40c4c4` | `DEEP DIVE METER` |
| lucky-88 | `linear-gradient(180deg, #5a0a0a, #cc0000, #5a0a0a)` | `#2a0505` | `#cc0000` | (none — wheel) |
| sakura-garden | `linear-gradient(180deg, #3a0a2a, #e88cba, #3a0a2a)` | `#1a0515` | `#e88cba` | `BLOSSOM METER` |
| chilli-fiesta | `linear-gradient(180deg, #4a1a0a, #e85020, #4a1a0a)` | `#2a0f05` | `#e85020` | (none — pick) |
| fortune-clover | `linear-gradient(180deg, #0a3a1a, #30b060, #0a3a1a)` | `#051a0a` | `#30b060` | (none — pick) |
| safari-king | `linear-gradient(180deg, #3a2a0a, #d4a030, #3a2a0a)` | `#1a0f00` | `#d4a030` | `SAFARI TRACKER` |

- [ ] **Step 3: Update slots-provider.tsx — add jackpot to player state**

Add `jackpots: { grand: 1000000, major: 100000, minor: 10000 }` to `defaultPlayer()`.

Add reducer actions:
```typescript
| { type: 'ADD_JACKPOT'; payload: { tier: JackpotTier; amount: number } }
| { type: 'RESET_JACKPOT'; payload: { tier: JackpotTier } }
```

- [ ] **Step 4: Commit**

```bash
git add tools/slots/slots-types.ts tools/slots/slots-provider.tsx tools/slots/games/
git commit -m "feat(slots): add cabinet theme fields, jackpot types, and meter names to all 10 games"
```

---

### Task 2: Jackpot Tickers Component

**Files:**
- Create: `tools/slots/components/machine/jackpot-tickers.tsx`

- [ ] **Step 1: Create jackpot-tickers.tsx**

Component renders three tier displays (GRAND/MAJOR/MINOR) with animated counters.

Requirements:
- Uses `requestAnimationFrame` to add tiny random increments (0.01-0.99) every frame for "live counting" feel
- Three metallic gradient backgrounds matching tier:
  - GRAND: red gradient (`#8B0000` → `#cc0000`)
  - MAJOR: blue gradient (`#1a1a5a` → `#3333cc`)
  - MINOR: green gradient (`#0a3a1a` → `#30b060`)
- Monospace font, gold text with glow
- Reads jackpot values from `useSlots().player.jackpots`
- Container: horizontal row, each ticker takes equal width
- Small label above number (GRAND / MAJOR / MINOR)

Props: none (reads from context)

- [ ] **Step 2: Commit**

```bash
git add tools/slots/components/machine/jackpot-tickers.tsx
git commit -m "feat(slots): add animated jackpot ticker displays"
```

---

### Task 3: Bonus Progress Meter Component

**Files:**
- Create: `tools/slots/components/machine/bonus-meter.tsx`

- [ ] **Step 1: Create bonus-meter.tsx**

Props:
```typescript
interface BonusMeterProps {
  meterName: string          // e.g. "STAMPEDE METER"
  scatterCount: number       // scatters seen in current/recent context (0-3+)
  triggerCount: number       // scatters needed (usually 3)
  accentColor: string        // game's cabinet accent
}
```

Requirements:
- Progress bar: `(scatterCount / triggerCount) * 100%` fill
- Fill gradient: accent color → lighter shade
- Metallic frame border matching accent
- Label (meterName) on the left
- "BONUS!" text on the right that glows when fill > 66%
- Height: compact (~28px)
- Only rendered when `meterName` exists in config

- [ ] **Step 2: Commit**

```bash
git add tools/slots/components/machine/bonus-meter.tsx
git commit -m "feat(slots): add themed bonus progress meter"
```

---

### Task 4: Game HUD Overlay Component

**Files:**
- Create: `tools/slots/components/machine/game-hud.tsx`

- [ ] **Step 1: Create game-hud.tsx**

Top bar overlay with back button, level, coins, store.

Props:
```typescript
interface GameHudProps {
  gameName: string
  onBack: () => void
  onStore: () => void
}
```

Requirements:
- `position: absolute; top: 0; left: 0; right: 0; z-index: 30`
- `bg-black/30 backdrop-blur-sm`
- Back button: round circle 36px, `bg-black/40`, "←" white text, calls `onBack`
- Level badge: rounded pill `bg-{accent}`, "LV {level}" white text
- Coin display: gold coin icon + balance, `bg-black/40` rounded pill
- Store button: small green pill "STORE", calls `onStore`
- Flex layout: back + level on left, coins + store on right

- [ ] **Step 2: Commit**

```bash
git add tools/slots/components/machine/game-hud.tsx
git commit -m "feat(slots): add game HUD overlay with back, level, coins, store"
```

---

### Task 5: Spin Controls Component

**Files:**
- Create: `tools/slots/components/machine/spin-controls.tsx`

- [ ] **Step 1: Create spin-controls.tsx**

Replaces `bet-controls.tsx`. New layout matching reference screenshot.

Props:
```typescript
interface SpinControlsProps {
  totalBet: number
  totalWin: number
  onSpin: () => void
  onIncreaseBet: () => void
  onDecreaseBet: () => void
  onMaxBet: () => void
  onOpenPaytable: () => void
  spinning: boolean
  canSpin: boolean
}
```

Requirements:
- **TOTAL BET / TOTAL WIN:** Two metallic LCD panels side by side
  - Dark LCD background (`#050208`), scanline overlay
  - Gold bezel (2px gradient border)
  - Monospace gold glowing numbers
  - TOTAL WIN pulses when > 0
- **SPIN button:** Green oval 140×56px
  - Gradient: `#34d058` → `#16a34a`
  - 3D shadow: `0 4px 0 #0a6a2a`
  - White bold "▶ SPIN" text (or "■ STOP" during spin)
  - Pulses with green glow when idle + canSpin
  - `active:translate-y-[2px]` press effect
- **+/− buttons:** Round circles 48px
  - Blue gradient: `#2563eb` → `#1d4ed8`
  - 3D shadow: `0 3px 0 #1e3a8a`
  - White +/− text, bold
  - Positioned at left/right edges, vertically aligned with SPIN
- **ℹ button:** Small dark circle 32px, "i" text, bottom-left area
- **MAX BET:** Rectangular gold button, bottom-right area

- [ ] **Step 2: Commit**

```bash
git add tools/slots/components/machine/spin-controls.tsx
git commit -m "feat(slots): add casino-style spin controls with LCD displays"
```

---

### Task 6: Reskin Symbol Cell & Reel Strip

**Files:**
- Modify: `tools/slots/components/machine/symbol-cell.tsx`
- Modify: `tools/slots/components/machine/reel-strip.tsx`

- [ ] **Step 1: Update symbol-cell.tsx**

Changes:
- Remove padding (`p-1` → no padding), symbols fill the cell completely
- Remove rounded corners on individual cells
- Remove individual cell background — cells are transparent, reel background shows through
- Remove inner box-shadow
- Keep highlight glow for winning symbols: use `cabinetAccent` color (passed as prop)
- Image: `object-cover` (not `object-contain`), fill the cell

New props:
```typescript
interface SymbolCellProps {
  icon: string
  imagePath?: string
  highlighted: boolean
  accentColor?: string     // for win highlight glow
}
```

- [ ] **Step 2: Update reel-strip.tsx**

Changes:
- Remove `gap-1` between cells — cells are seamless
- During spin: use themed reel background color (passed as prop)
- Spin cells also have no gaps, seamless strip

New prop: `reelBackground: string`

- [ ] **Step 3: Commit**

```bash
git add tools/slots/components/machine/symbol-cell.tsx tools/slots/components/machine/reel-strip.tsx
git commit -m "feat(slots): seamless symbol cells with themed reel backgrounds"
```

---

### Task 7: Reskin Reel Board with Ornate Cabinet Frame

**Files:**
- Modify: `tools/slots/components/machine/reel-board.tsx`

- [ ] **Step 1: Update reel-board.tsx**

Changes:
- Outer frame: use `config.theme.cabinetFrame` CSS gradient for border (6px)
- Add metallic inner bevel: `box-shadow: inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.5)`
- Corner ornaments: CSS `::before`/`::after` with small radial gradient circles at corners (accent color glow)
- Inner reel area: `config.theme.reelBackground`, no padding between reels
- Subtle vertical separators between reels: 1px line at `cabinetAccent` 15% opacity
- Remove the old gold gradient border
- Remove background image overlay (background is now behind the whole game, not inside the reel frame)
- Grid gap: 0 (seamless cells), with 1px accent-colored column separators via CSS

- [ ] **Step 2: Commit**

```bash
git add tools/slots/components/machine/reel-board.tsx
git commit -m "feat(slots): ornate themed cabinet frame with seamless reel grid"
```

---

### Task 8: Jackpot Logic in use-spin Hook

**Files:**
- Modify: `tools/slots/hooks/use-spin.ts`

- [ ] **Step 1: Add jackpot contribution and trigger logic**

After each spin resolves:
1. **Contribute:** Add `totalBet * JACKPOT_CONFIG[tier].contribution` to each jackpot tier
2. **Trigger check:** Generate random number (0 to `JACKPOT_CONFIG[tier].odds`). If 0, jackpot wins.
3. **On jackpot win:** Add jackpot amount to win, dispatch `RESET_JACKPOT` for that tier, set a `jackpotWin: { tier, amount }` state
4. **Jackpot win triggers:** Extended celebration (reuse mega-win effects but with "JACKPOT!" banner)

New state in useSpin return:
```typescript
jackpotWin: { tier: JackpotTier; amount: number } | null
```

Contribution happens on every spin. Trigger check happens after payline evaluation.

- [ ] **Step 2: Commit**

```bash
git add tools/slots/hooks/use-spin.ts
git commit -m "feat(slots): add progressive jackpot contribution and trigger logic"
```

---

### Task 9: Full-Screen Immersive Game Page

**Files:**
- Modify: `app/tools/slots/[gameId]/page.tsx`

- [ ] **Step 1: Rewrite game page as full-screen portrait container**

Complete restructure:
- Outer: `fixed inset-0 bg-black flex items-center justify-center`
- Portrait container: `w-[420px] max-w-full h-[100dvh] relative overflow-hidden`
- Full-bleed background: `absolute inset-0 bg-cover bg-center` with game background image
- Layer stack (bottom to top):
  1. Background image
  2. Dark overlay (`bg-black/20`)
  3. Jackpot tickers (top, below HUD)
  4. Bonus meter (above reels, if applicable)
  5. Reel board (cabinet frame)
  6. Spin controls (bottom)
  7. Effects (coin shower, fireworks, win banner)
  8. HUD overlay (top bar — highest z-index)
- Remove all site header/footer references
- Back button navigates to `/tools/slots` (lobby)
- Store button opens coin shop as a modal overlay

Wire new components:
- `<GameHud>` — top
- `<JackpotTickers>` — below HUD
- `<BonusMeter>` — above reels (if `config.theme.meterName` exists)
- `<ReelBoard>` — center
- `<SpinControls>` — bottom
- `<CoinShower>`, `<Fireworks>`, `<WinBanner>` — effects layer

- [ ] **Step 2: Commit**

```bash
git add app/tools/slots/[gameId]/page.tsx
git commit -m "feat(slots): full-screen immersive portrait game screen"
```

---

### Task 10: Wire Everything & Final Polish

**Files:**
- Modify: `app/tools/slots/[gameId]/page.tsx` (final wiring)
- Modify: `tools/slots/components/effects/win-banner.tsx` (add jackpot celebration)

- [ ] **Step 1: Add jackpot win celebration to win-banner**

New prop: `jackpotTier?: JackpotTier`

When `jackpotTier` is set:
- Show "GRAND JACKPOT!" / "MAJOR JACKPOT!" / "MINOR JACKPOT!" instead of "BIG WIN"
- Extended duration (5 seconds)
- Larger text, tier-specific color (GRAND=red+gold, MAJOR=blue+gold, MINOR=green+gold)

- [ ] **Step 2: Wire jackpot win in game page**

When `useSpin.jackpotWin` is non-null:
- Trigger mega coin shower
- Trigger fireworks
- Show win banner with `jackpotTier`

- [ ] **Step 3: Build verify**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(slots): wire jackpot celebrations and final polish"
```

---

### Task 11: Visual Test

**Files:**
- Create: `/tmp/test-immersive.py`

- [ ] **Step 1: Write Playwright E2E test**

Test that:
- Game page loads in full-screen mode (no site header visible)
- Jackpot tickers visible
- SPIN button visible and clickable
- Reels spin and stop
- TOTAL BET / TOTAL WIN displays update
- Back button returns to lobby
- Multiple games load correctly

- [ ] **Step 2: Run test and verify screenshots**

```bash
python3 ~/.claude/skills/webapp-testing/scripts/with_server.py \
  --server "pnpm dev" --port 3000 --timeout 60 \
  -- python3 /tmp/test-immersive.py
```

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "test(slots): verify immersive game screen E2E"
```
