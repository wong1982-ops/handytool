# Casino Slots Visual Overhaul — Design Document

**Date:** 2026-03-31
**Status:** DESIGN COMPLETE — Ready for implementation

---

## Understanding Summary

- **What:** Full visual overhaul of the Casino Slots tool to match Heart of Vegas aesthetic
- **Why:** Current implementation looks like a utility tool, not a casino game. Users expect rich, immersive visuals.
- **Who:** Same users, premium visual experience
- **Scope:** Purely visual/UX — no gameplay logic changes

### Key Changes
- Deep purple/gold color scheme replacing flat dark gray
- AI-generated artwork (Gemini) for all symbols, game cards, backgrounds — realistic/photographic style
- Horizontal scrolling carousel lobby (replacing grid)
- Gold metallic reel frame, vertical strip scroll animation with bounce easing
- Green glowing SPIN button
- Canvas particle effects (coin showers, fireworks) for win celebrations
- Framer Motion for carousel and UI transitions
- WebP images, lazy-loaded per game, ~50-100KB each

### Non-Goals
- No gameplay logic changes (engine, configs, paylines, bonus rounds stay the same)
- No new features
- No sound changes

### Assumptions
- Gemini Imagen API available and can generate slot-quality artwork
- Generated images manually reviewed before committing
- Consistent art style prompts across all 10 games

---

## Image Asset Pipeline

### Directory Structure
```
public/images/slots/
├── lobby/           (10 game cards, 400x600, ~80KB each)
├── backgrounds/     (10 game backgrounds, 1920x1080, ~100KB each)
└── symbols/         (10 games × 11 symbols = 110 images, 200x200, ~50KB each)
```

### Generation Prompts
- **Game cards:** "Tall vertical slot machine game poster for [theme], rich detailed artwork, casino game cover art style, dark purple border, gold accents, photorealistic, 400x600"
- **Symbols:** "Slot machine symbol icon of [subject], photorealistic, semi-3D rendered, glossy, dark background, centered, game asset style, 200x200"
- **Backgrounds:** "Casino slot machine background for [theme], deep purple gradient, subtle texture, atmospheric, wide format, 1920x1080"

### Script
`scripts/generate-slot-assets.py` — Python script using Gemini API, converts to WebP, compresses.

---

## Lobby Redesign

- **Background:** Deep purple gradient (#1a0a2e → #0d0519) with subtle sparkle
- **Header:** Gold coin icon + balance in gold, "TOOLK1T CASINO" in gold, green "Store" button
- **Carousel:** Framer Motion `drag="x"` with snap points. Tall cards (2:3 aspect), gold border glow on hover, scale-up on hover
- **Daily bonus:** Gold/purple gradient strip with "SPIN" button
- **Bottom nav:** Purple glass-morphism bar with gold active indicator

---

## Game Screen Redesign

- **Background:** Full-bleed game-specific artwork, darkened overlay
- **Reel frame:** Gold metallic border with inner bevel shadow
- **Symbol cells:** 200x200 WebP images in glass containers, gold glow on win
- **Info bar:** Three gold-framed counters (CREDIT / BET / WIN) — gold text on dark purple
- **SPIN button:** Large green circle with glow, pulses when idle
- **Bet controls:** Gold arrow buttons, compact

---

## Reel Animation

- Tall vertical strip of symbols, CSS translateY scroll
- Fast spin with motion blur (`filter: blur(1.5px)`)
- Sequential stop (200ms stagger) with bounce easing
- `cubic-bezier(0.34, 1.56, 0.64, 1)` for landing overshoot

---

## Win Celebrations

| Tier | Trigger | Effects |
|---|---|---|
| Small (< 10x) | Gold glow on symbols, counter counts up | Subtle shimmer |
| Big (10-200x) | "BIG WIN!" banner, coin shower | Gold coins from top, escalating counter |
| Mega (200x+) | "MEGA WIN!" takeover, fireworks + coin shower | Dense particles, screen flash, 3s celebration |

### Effect Components
- `coin-shower.tsx` — Canvas particles, gold coins with gravity
- `fireworks.tsx` — Canvas bursts, gold/red/purple palette
- `win-banner.tsx` — Framer Motion animated banner with escalating counter

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | Full visual overhaul | Partial, cosmetic | Faithful Heart of Vegas recreation |
| 2 | Upfront batch image generation | On-the-fly | Predictable quality |
| 3 | Realistic/photographic style | Illustrated, 3D cartoon | Real casino aesthetic |
| 4 | WebP, lazy-loaded, 50-100KB | PNG, preload all | Fast load performance |
| 5 | Framer Motion + canvas particles | Pure CSS, Framer only | Best of both |
| 6 | Purple + gold color scheme | Keep gray | Heart of Vegas signature |
| 7 | Horizontal carousel lobby | Keep grid | Matches HoV cabinet UX |
| 8 | Vertical strip scroll reels | Emoji swap | Realistic reel feel |
| 9 | Gold metallic reel frame | Flat border | Casino cabinet look |
| 10 | Green SPIN button with glow | Red/blue | HoV convention |
| 11 | Three-tier win celebrations | Single display | Escalating excitement |
| 12 | Canvas particle system | CSS-only | Performant for 100+ particles |
| 13 | Gemini API for images | Stock, manual | Consistent, customizable |
