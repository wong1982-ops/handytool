# Casino Slots Visual Overhaul — Implementation Plan

**Date:** 2026-03-31
**Design:** [2026-03-31-casino-slots-reskin-design.md](./2026-03-31-casino-slots-reskin-design.md)
**Status:** READY

---

## Phase 1: Asset Generation

### 1.1 — Image generation script
- Create `scripts/generate-slot-assets.py`
- Uses Gemini Imagen API to generate all artwork
- Converts to WebP, compresses to target size
- Saves to `public/images/slots/{lobby,backgrounds,symbols}/`

### 1.2 — Generate lobby cards (10 images)
- Run script for 10 game card artworks (400x600)
- Review quality, regenerate any that don't meet standard

### 1.3 — Generate backgrounds (10 images)
- Run script for 10 game backgrounds (1920x1080)
- Review and adjust

### 1.4 — Generate symbols (110 images)
- Run script for all 10 games × 11 symbols (200x200)
- Ensure visual consistency within each game
- Review all symbols

### 1.5 — Update game configs
- Add `imagePath` to SymbolConfig in slots-types.ts
- Add `backgroundImage` and `lobbyImage` to ThemeConfig
- Update all 10 game config files with image paths

**Checkpoint:** All 130 images generated, reviewed, and referenced in configs.

---

## Phase 2: Color Theme & Global Styles

### 2.1 — Purple/gold theme
- Define CSS custom properties for casino theme:
  - `--casino-bg-dark: #0d0519`
  - `--casino-bg: #1a0a2e`
  - `--casino-purple: #2d1052`
  - `--casino-gold: #d4a052`
  - `--casino-gold-light: #f0d080`
  - `--casino-green: #22c55e`
- Apply to all slots components

### 2.2 — Restyle social tabs + shop
- Update friends-tab, leaderboard-tab, gifts-tab, events-banner, coin-shop
- Replace gray backgrounds with purple, gray text with gold accents
- Green buy buttons in shop

**Checkpoint:** All components use purple/gold theme. No more flat gray.

---

## Phase 3: Lobby Overhaul

### 3.1 — Horizontal carousel
- Replace grid in `app/tools/slots/page.tsx` with Framer Motion carousel
- `drag="x"` with snap-to-card behavior
- Navigation arrows on sides (desktop), swipe on mobile

### 3.2 — Game card redesign
- Update `game-card.tsx`: flat card → tall artwork thumbnail (400x600 WebP)
- Gold border, glow on hover, scale-up (1.05)
- Game name overlay at bottom with gradient fade

### 3.3 — Header & coin display
- Gold coin icon, gold balance text, green "Store" button
- "TOOLK1T CASINO" in gold with subtle text shadow

### 3.4 — Daily bonus restyle
- Gold/purple gradient banner
- Spin wheel icon

### 3.5 — Bottom nav restyle
- Purple glass-morphism background
- Gold active tab indicator
- Subtle gold text for active, muted purple for inactive

**Checkpoint:** Lobby looks like a premium casino app with carousel browsing.

---

## Phase 4: Reel & Symbol Overhaul

### 4.1 — Symbol cell redesign
- Update `symbol-cell.tsx`: emoji → Next.js Image component
- Dark purple container with inner shadow, gold border on win
- Gold glow pulse animation for winning symbols

### 4.2 — Reel strip animation
- Rewrite `reel-strip.tsx` with vertical translateY scrolling
- Build a tall strip of 20+ symbols, scroll upward during spin
- Motion blur during fast spin, removed on stop
- Bounce easing on stop: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Sequential stop stagger (200ms per reel)

### 4.3 — Reel board frame
- Update `reel-board.tsx`: add gold metallic frame border
- Game background image behind reels (darkened overlay)
- Inner shadow for depth

### 4.4 — Bet controls restyle
- Three gold-framed info counters: CREDIT / BET / WIN
- Green SPIN button with glow effect, pulses when idle
- Gold bet adjustment arrows
- Purple Auto button

### 4.5 — Paytable modal restyle
- Image symbols instead of emoji in paytable
- Purple/gold theme on modal

**Checkpoint:** Game screen looks like a real slot machine with realistic reel animation.

---

## Phase 5: Win Effects

### 5.1 — Coin shower (canvas)
- Create `tools/slots/components/effects/coin-shower.tsx`
- Canvas overlay, gold coin particles with gravity
- Configurable intensity: small (20 coins), big (60 coins), mega (100 coins)
- requestAnimationFrame loop, auto-cleanup

### 5.2 — Fireworks (canvas)
- Create `tools/slots/components/effects/fireworks.tsx`
- Canvas bursts at random positions
- Gold/red/purple palette, expand outward with trails
- Only triggered on mega wins

### 5.3 — Win banner (Framer Motion)
- Create `tools/slots/components/effects/win-banner.tsx`
- "BIG WIN!" / "MEGA WIN!" text with gold gradient
- Slides in from top, scales up with spring physics
- Escalating counter (0 → win amount over ~2s)
- Auto-dismiss after 3-4 seconds

### 5.4 — Wire effects into game page
- Update `[gameId]/page.tsx` to trigger effects based on win tier
- Small: symbol glow only
- Big: coin shower + win banner
- Mega: coin shower + fireworks + win banner

**Checkpoint:** Wins feel exciting with escalating visual feedback.

---

## Phase 6: Polish

### 6.1 — Lobby animations
- Card entrance animation on page load (stagger fade-in)
- Smooth carousel momentum scrolling

### 6.2 — Game transitions
- Fade transition entering/leaving a game
- Loading state while game background image loads

### 6.3 — Mobile optimization
- Carousel touch-swipe tuning
- Symbol images sized appropriately for mobile (smaller grid)
- SPIN button thumb-friendly (min 56px)

### 6.4 — Build verification
- Verify all images load correctly
- Check WebP browser support (fallback not needed — universal support)
- Performance check: Lighthouse on lobby and game pages

**Checkpoint:** Production-ready, polished, performant.
