# Casino Slots — Immersive Game Screen Redesign

**Date:** 2026-04-01
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Summary

Full visual overhaul of the casino slot machine game screen to match Heart of Vegas quality. Full-screen immersive mode, portrait-first layout, ornate themed cabinet frames, progressive jackpots, and bottom controls matching real casino machines.

### Key Changes
- Full-screen immersive (no site header/footer), back button overlay
- Portrait-first (420px phone-sized container, centered on desktop)
- Unique cabinet frame + reel colors per game (CSS-built, 10 themes)
- Progressive jackpot (GRAND/MAJOR/MINOR) per-user, simulated
- Bonus progress meter for free-spin games (6 of 10 games)
- Redesigned bottom controls: TOTAL BET / TOTAL WIN LCD panels, large green oval SPIN, round +/− buttons, MAX BET
- Top bar HUD overlay: back, level badge, coins, store
- Symbols fill cells with no borders, dark themed reel backgrounds
- All 10 games reskinned at once (shared machine UI)

### Non-Goals
- No shared/global jackpot (per-user only)
- No landscape optimization
- No INBOX/Offers/Timers in HUD
- No game logic changes — engine and configs stay the same

---

## Game Screen Layout (Portrait)

```
┌────────────────────────────────┐
│ [←] [LV 12] 🪙 70,002 [STORE] │  Top bar (bg-black/30 backdrop-blur)
├────────────────────────────────┤
│  GRAND      MAJOR      MINOR  │  Jackpot tickers (animated counters)
│ 250,813,420  9,000,000  750,000│
├────────────────────────────────┤
│                                │
│   Full-bleed game background   │  Artwork fills entire container
│                                │
│  ┌──STAMPEDE METER──────────┐  │  Bonus meter (free spin games only)
│  │ ████████░░░░░░ BONUS     │  │
│  └──────────────────────────┘  │
│  ╔══════════════════════════╗  │
│  ║  Q  │  A  │ 🦬 │ 10 │  A ║  │  Ornate cabinet frame
│  ║  K  │ 🦅 │  A  │ 🐺 │  Q ║  │  Dark themed reel background
│  ║  9  │  K  │  J  │  A │ 🌄║  │  No cell borders
│  ╚══════════════════════════╝  │
│                                │
│  ┌─TOTAL BET─┐ ┌─TOTAL WIN──┐ │  Metallic LCD panels
│  │  120,000   │ │     0      │ │
│  └───────────┘ └────────────┘ │
│                                │
│  (−)      [ ▶ SPIN ]     (+)  │  Round blue +/−, green oval SPIN
│         [ℹ]        [MAX BET]  │  Info + max bet
└────────────────────────────────┘
```

**Container:** 420px wide, `100dvh` tall, centered on desktop with `bg-black` surround. On mobile fills viewport.

---

## Cabinet Frames (10 Themes)

| Game | Frame Color | Reel Background | Accent |
|---|---|---|---|
| Wild Stampede | Dark red/maroon + gold | `#3a0a0a` | `#d4a052` |
| Nile Queen | Dark navy + gold | `#0a0a2a` | `#c9a84c` |
| Golden Dragon | Dark crimson + red-gold | `#2a0505` | `#cc3333` |
| Tiki Fire | Dark brown + wood | `#1a0f05` | `#e87830` |
| Ocean Treasure | Deep teal + pearl | `#051a1a` | `#40c4c4` |
| Lucky 88 | Dark red + gold Chinese | `#2a0505` | `#cc0000` |
| Sakura Garden | Dark plum + pink | `#1a0515` | `#e88cba` |
| Chilli Fiesta | Dark terracotta + colorful | `#2a0f05` | `#e85020` |
| Fortune Clover | Dark forest + Celtic gold | `#051a0a` | `#30b060` |
| Safari King | Dark earth + tribal gold | `#1a0f00` | `#d4a030` |

Frames built with CSS gradients + box-shadow + pseudo-elements.

---

## Jackpot System

Per-user, localStorage-backed. Three tiers:

| Tier | Seed | Bet Contribution | Trigger Odds | Win |
|---|---|---|---|---|
| GRAND | 1,000,000 | 0.5% of bet | 1 in 50,000 | Full pool |
| MAJOR | 100,000 | 1% of bet | 1 in 5,000 | Full pool |
| MINOR | 10,000 | 2% of bet | 1 in 500 | Full pool |

Tickers animate with requestAnimationFrame to simulate live counting.

---

## Bonus Progress Meter

Free-spin games only (6 of 10). Tracks scatter count in rolling 10-spin window.

| Game | Meter Name |
|---|---|
| Wild Stampede | STAMPEDE METER |
| Nile Queen | PHARAOH'S POWER |
| Ocean Treasure | DEEP DIVE METER |
| Safari King | SAFARI TRACKER |
| Tiki Fire | TIKI BLAZE |
| Sakura Garden | BLOSSOM METER |

---

## Bottom Controls

- **TOTAL BET / TOTAL WIN:** Metallic LCD panels, gold bezel, monospace glowing numbers
- **SPIN:** Large green oval (140×56px), gradient, 3D shadow, pulses when idle
- **+/−:** Round blue circles (48px), white text, 3D depth
- **ℹ:** Small dark circle, opens paytable modal
- **MAX BET:** Rectangular gold button

---

## Top Bar HUD

- Semi-transparent overlay: `bg-black/30 backdrop-blur-sm`
- Back button (←): round dark circle, top-left
- Level badge: `LV {n}` pill with accent color
- Coin display: gold icon + balance
- Store button: small green pill, opens shop modal

---

## File Changes

**New (4):**
- `components/machine/jackpot-tickers.tsx`
- `components/machine/bonus-meter.tsx`
- `components/machine/game-hud.tsx`
- `components/machine/spin-controls.tsx`

**Modified (~12):**
- `slots-types.ts` — jackpot state, cabinet theme fields
- `slots-provider.tsx` — jackpot reducer actions
- `use-spin.ts` — jackpot contribution + trigger
- `10 × games/*.ts` — cabinet theme values + meter names
- `symbol-cell.tsx` — remove borders, fill cell
- `reel-strip.tsx` — dark themed reel bg
- `reel-board.tsx` — ornate cabinet frame
- `[gameId]/page.tsx` — full-screen immersive, portrait container

**Replaced:**
- `bet-controls.tsx` → `spin-controls.tsx`

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | All 10 games at once | One first | Shared UI |
| 2 | Functional jackpot | Visual only | Authentic feel |
| 3 | Full-screen immersive | Within site | Real game experience |
| 4 | Unique cabinet per game | Same for all | Visual variety |
| 5 | Meter for free-spin only | All or none | Relevant without clutter |
| 6 | Portrait-first | Responsive | Mobile casino convention |
| 7 | Per-user jackpot | Shared global | Simple, no RT DB |
| 8 | CSS cabinet frames | Generated images | Faster, theme-able |
| 9 | No INBOX/Offers | Full HUD | YAGNI for v1 |
