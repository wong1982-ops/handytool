# Stress Relief Studio — Design Spec

**Date**: 2026-04-11
**Status**: APPROVED (brainstorming complete)

---

## Understanding Summary

- **What**: A unified "Stress Relief Studio" — a hub of 6 wellness modalities for releasing pressure
- **Why**: Give users a one-stop sanctuary to decompress, calm anxiety, vent frustration, or just play with fidget toys
- **Who**: Anyone feeling stressed — students, workers, anyone needing a quick mental break
- **Key features**:
  1. Hub page with 6 modality tiles (no gate, direct access)
  2. Breathing exercises — 5+ patterns with animated visual + timer
  3. Meditation timer — pre-recorded library of 10-20 guided audio tracks
  4. Vent journal — empathetic AI loop: validate → reframe → suggest action; privacy-conscious
  5. Fidget toys — 5+ interactive web toys
  6. Sound therapy — full sound library + multi-layer mixer with per-track volume sliders
  7. Light mood tracking — silent post-session check-in
- **PWA** — installable, full offline support including audio caching
- **Bilingual** EN + ZH throughout
- **Privacy-conscious** — vent journal content never logged server-side, mood logs encrypted-at-rest
- **Performance**: Vent journal AI streamed, 3–8s response

## Non-Goals

- No professional therapy or medical advice (clear disclaimer)
- No social/community features
- No gamification (no streaks, no rewards)
- No subscription / paywall

## Assumptions

1. Pre-recorded meditation tracks: 10-20 royalty-free MP3s, sourced from CC0 libraries or generated once via TTS, stored as static assets in `public/stress-relief/audio/`
2. Sound therapy ambient files: similar — royalty-free loops stored as static assets
3. Vent journal uses Gemini server-side (streamed) but never logs the content
4. Mood entries stored in localStorage as JSON; Supabase table for logged-in users with row-level security
5. PWA implementation via Next.js manifest + service worker
6. Bilingual via the same i18n pattern used by tarot/formatter
7. The studio lives at `/tools/stress-relief` with tabs (URL hash for state)

---

## Architecture

### Tabbed Studio (Single Page)

```
/tools/stress-relief             → defaults to #hub
/tools/stress-relief#hub
/tools/stress-relief#breathe
/tools/stress-relief#meditate
/tools/stress-relief#vent
/tools/stress-relief#fidget
/tools/stress-relief#sounds
```

Single page = single bundle = fast PWA caching. Tab switching is instant. Sound therapy uses a persistent context provider so audio survives tab switches.

### Persistent Layout

Top bar on every tab:
- Title + language toggle (EN ↔ 中文)
- Tab navigation (icons + labels desktop, icons-only mobile)
- "Sound playing" indicator + quick mute when ambient sound is active
- 📊 Trends mini-link (optional mood history)

Bottom of every modality tab:
- Subtle mood check-in card: "How do you feel now? 😢 😟 😐 🙂 😌"
- Tap → silent log + 1-sec confirmation toast → fade away

---

## Modality Specs

### Breathing Tab

**Patterns (static data):**
- Box (4-4-4-4) — focus
- 4-7-8 (4-7-8-0) — calming
- Resonant (5-0-5-0) — balance
- Energizing (6-0-2-0) — alertness
- Wim Hof (custom — power breaths + hold)
- Custom — user sets each phase 1-10s

**UI:** Pattern picker (chip row), animated circle scaling with breath, phase label, cycle counter, start/pause/stop, optional ambient sound toggle.

### Meditate Tab

**Track manifest** (static JSON):
```typescript
interface MeditationTrack {
  id: string
  title: BilingualText
  description: BilingualText
  duration: number      // seconds
  category: 'sleep' | 'anxiety' | 'focus' | 'morning' | 'body-scan'
  audioUrl: string
}
```

**UI:** Category filter chips, track list (duration, title, description, ⭐ favorite button), player with play/pause, scrub bar, time display.

Favorites stored in `localStorage` — works for all users.

### Vent Journal Tab

**Empathetic AI loop:**
- Validate ("I hear you")
- Reframe ("A different angle")
- Action ("Try this" — often a link to another modality)

**UI:** Large textarea, "Get response" button → streamed AI reply in 3 sections, past entries section (localStorage only), "Clear all entries" button.

**Privacy:** API never logs entry content. Entries stored in `localStorage` under `stress-relief:vent-entries`. Visible notice: "Your entries stay on this device."

### Fidget Tab

**6 toys** (each self-contained):
- Bubble wrap — click bubbles, satisfying pop sound
- Zen garden — drag to rake patterns in sand
- Squishy ball — click and hold to squish
- Fidget spinner — drag to spin, momentum decay
- Kinetic sand — drag to mound/scoop
- Rubber band — click and drag to stretch

Toy picker row + canvas area. Optional sound effects (toggleable).

### Sounds Tab

**Sound library** (12 tracks, static MP3s):
- Nature: rain, forest, ocean, fire, wind, thunderstorm
- Noise: white, pink, brown
- Binaural: alpha, theta, delta

**Mixer UI:**
- Grid of sound tiles
- Each tile: icon, label, volume slider (0-100), play/pause toggle
- Multiple sounds can play simultaneously
- "Save preset" — save current mix to localStorage
- Master volume + "Stop all" button

**Persistence across tabs:** A `SoundMixerProvider` context wraps the entire studio so audio elements survive tab switches.

---

## Mood Tracking

```typescript
interface MoodEntry {
  modality: 'breathe' | 'meditate' | 'vent' | 'fidget' | 'sounds'
  mood: 1 | 2 | 3 | 4 | 5
  timestamp: number
}
```

- Anonymous: localStorage
- Logged-in: localStorage + optional cloud sync to Supabase
- Trends view (modal): last 7 days timeline, most-used modality, session count
- No gamification

---

## PWA Implementation

```
public/stress-relief/
  audio/                                → 10-20 meditation MP3s
  sounds/                               → 12 ambient sound MP3s
  icons/                                → 192x192 + 512x512 PNG
```

- Next.js manifest pattern
- Service worker caches: page shell, all audio, all images
- "Install app" prompt shown once if user revisits 3+ times

---

## Privacy Architecture

**Vent journal:**
- API receives `{ entry: string, language: 'en' | 'zh' }`
- Server-side: builds Gemini prompt, streams response, no `console.log` of entry, no DB write
- Visible notice in vent tab

**Mood logs:**
- localStorage by default
- Cloud sync requires explicit opt-in (toggle in settings)
- Supabase row-level security
- No analytics events containing mood data

---

## API Routes

```
POST /api/v1/stress-relief/vent       → streamed empathetic AI (SSE)
POST /api/v1/stress-relief/mood/sync  → cloud sync moods (logged-in)
GET  /api/v1/stress-relief/mood/list  → fetch cloud-synced moods
```

---

## File Structure

```
tools/stress-relief/
  stress-relief-types.ts
  stress-relief-studio.tsx              → top-level container, tab routing
  hub-tab.tsx
  i18n/{en,zh}.ts

  shared/
    sound-mixer-context.tsx             → persistent audio context
    mood-checkin.tsx
    mood-storage.ts
    pwa-install-prompt.tsx

  breathing/
    breathing-tab.tsx
    breathing-patterns.ts
    breathing-circle.tsx

  meditate/
    meditate-tab.tsx
    meditate-tracks.ts
    meditate-player.tsx
    meditate-favorites.ts

  vent/
    vent-tab.tsx
    vent-entry-list.tsx

  fidget/
    fidget-tab.tsx
    toys/
      bubble-wrap.tsx
      zen-garden.tsx
      squishy-ball.tsx
      fidget-spinner.tsx
      kinetic-sand.tsx
      rubber-band.tsx

  sounds/
    sounds-tab.tsx
    sound-tracks.ts
    sound-mixer-tile.tsx
    sound-presets.ts

app/tools/stress-relief/
  page.tsx
  layout.tsx

app/api/v1/stress-relief/
  vent/route.ts
  mood/sync/route.ts
  mood/list/route.ts

supabase/migrations/
  047_stress_relief_moods.sql

public/stress-relief/
  audio/
  sounds/
  icons/
```

---

## Decision Log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| 1 | All 6 modalities in one tool | Several individual tools, phased | User wanted comprehensive |
| 2 | Hub page, no gating | Mood routing, slider, brief questions | Frictionless |
| 3 | 5+ breathing patterns | One, three, custom only | Comprehensive variety |
| 4 | Pre-recorded meditation | Live TTS, AI-generated | Reliable, cacheable |
| 5 | Empathetic AI loop | Validation only, journaling | Most therapeutic |
| 6 | 5+ fidget toys | One, three, polished single | User wanted variety |
| 7 | Full sound library + mixer | Nature only, simple presets | Premium experience |
| 8 | Light post-session mood check | Mood log tab, none | Subtle, no friction |
| 9 | Vent entries localStorage-only | Ephemeral, encrypted cloud | Most private |
| 10 | Meditation favorites localStorage | Login-only, none | Works for everyone |
| 11 | PWA with full offline | Online only, partial | Returning users |
| 12 | Privacy-conscious | Standard logging, strict | User chose B |
| 13 | Streamed AI (3-8s) | Fast (<3s) | Empathetic UX |
| 14 | Bilingual EN + ZH | English-only | Toolk1t convention |
| 15 | Tabbed Studio (single page) | Subroutes, dashboard | Sound persists across tabs |
| 16 | Persistent SoundMixerProvider | Remount per tab | Sound keeps playing |
