# Music Studio — Design Specification

## Overview

Real-time AI music studio powered by Google Lyria RealTime. Visual launchpad interface with three modes (background music, jingles, musical SFX). Users toggle mood/genre/instrument buttons to control live-streaming AI music, record clips they like, and download as MP3 or WAV.

## User Experience

Single-page studio layout with four zones:
1. **Mode toggle + Launchpad grid** — visual buttons to control music style
2. **Controls sidebar** — BPM, brightness, density, scale, prompt
3. **Waveform visualizer + Transport controls** — play/pause/record/stop
4. **Clips panel** — recorded clips with preview and download

No wizard flow — music tools should feel immediate. Everything on one page.

## Page Layout

```
┌─────────────────────────────────────────────┐
│  Mode Toggle: [Music] [Jingles] [SFX]       │
├──────────────────────┬──────────────────────┤
│                      │  Controls Sidebar     │
│   Launchpad Grid     │  - BPM slider         │
│   (mood/genre/       │  - Brightness slider   │
│    instrument        │  - Density slider      │
│    buttons)          │  - Scale picker        │
│                      │  - Mute bass/drums     │
│                      │  - Prompt textarea     │
├──────────────────────┴──────────────────────┤
│  Waveform Visualizer + Transport Controls    │
│  [Play] [Pause] [●Record] [Stop]  00:15     │
├─────────────────────────────────────────────┤
│  My Clips: [Clip 1 ▶ ⬇] [Clip 2 ▶ ⬇]      │
└─────────────────────────────────────────────┘
```

**Mobile**: Stacked vertically — mode toggle top, launchpad grid, collapsible controls drawer (gear icon), waveform + transport fixed at bottom, clips as slide-up sheet.

## Three Modes

Mode toggle changes the launchpad presets. All powered by Lyria.

### Music Mode
Genre buttons: Lo-fi, Electronic, Jazz, Classical, Rock, Ambient, Hip-hop, Cinematic

### Jingles Mode
Mood buttons: Upbeat, Inspiring, Playful, Corporate, Epic, Chill

### SFX Mode
Effect buttons: Riser, Drop, Hit, Stinger, Whoosh, Tension, Fanfare, Transition

## Launchpad Grid

- 2x4 grid (8 buttons) that changes based on active mode
- Each button: rounded-xl card with gradient background, icon/emoji, label
- Toggle behavior: click to activate (blue glow ring), click again to deactivate
- Multiple buttons active simultaneously — combine as weighted prompts to Lyria

### Instrument Row (always visible, shared across modes)
8 instrument toggles: Piano, Guitar, Synth, Drums, Bass, Strings, Brass, Flute
- Smaller pill-shaped buttons, combinable with genre/mood buttons
- Drums/Bass toggles map to Lyria's native mute controls

## Controls Sidebar

- **BPM**: slider 60-200, default 120
- **Brightness**: slider 0-100%, default 50%
- **Density**: slider 0-100%, default 50%
- **Scale**: dropdown — 12 keys (C-B) × major/minor = 24 options, default C Major
- **Generation mode**: Quality / Diversity / Vocalization radio buttons
- **Prompt**: textarea "Describe your sound..." for fine-tuning, debounced 500ms, sent to Lyria in real-time

All changes sent to Lyria WebSocket immediately — music adjusts in real-time.

## WebSocket Architecture

### Connection
```
Browser ←→ Lyria RealTime API (via @google/genai SDK)
```

Client connects directly using the Gemini JS SDK (`client.live.music.connect()`). API key provided via `NEXT_PUBLIC_` env var (acceptable for experimental tool with rate limiting).

### Audio Pipeline
1. Lyria streams 16-bit PCM stereo at 48kHz via WebSocket
2. Client buffers chunks using Web Audio API (`AudioContext` + `AudioWorkletNode`)
3. Waveform visualizer reads from `AnalyserNode` (canvas-based, 60fps)
4. When recording: PCM chunks also pushed to recording buffer
5. On stop recording: PCM → WAV (client-side), then WAV → MP3 via `lamejs`
6. Upload clip to R2 via `/api/v1/music-studio/save-clip`

### Model & Config
- Model: `models/lyria-realtime-exp` (experimental)
- Audio: 16-bit PCM, 48kHz, stereo
- Output is always watermarked by Google

## Recording & Clips

### Recording Flow
1. Click Record (red button) → recording indicator pulses, timer counts up
2. Audio plays normally — recording captures in background
3. Click Stop → clip appears in clips panel
4. Auto-named "Clip 1", "Clip 2", etc.

### Clips Panel
- Horizontal scrollable strip (desktop), slide-up sheet (mobile)
- Each clip: waveform thumbnail, name, duration, play/pause, download button
- Download popover: MP3 (1 credit) / WAV (2 credits total)
- Max 10 clips per session, max 3 min per clip
- Clips in memory until downloaded — on download, uploaded to R2 and persisted

### Limits
- 10 clips max per session
- 3 minutes max per clip (warning at 2:30, auto-stop at 3:00)
- Recordings < 1 second discarded

## File Structure

### New Files

| File | Purpose |
|------|---------|
| `app/tools/music-studio/page.tsx` | Page route with metadata |
| `tools/music-studio/types.ts` | Types, mode presets, launchpad configs, constants |
| `tools/music-studio/music-studio.tsx` | Main studio orchestrator |
| `tools/music-studio/launchpad.tsx` | Genre/mood/SFX button grid + instrument row |
| `tools/music-studio/controls-panel.tsx` | BPM, brightness, density, scale, prompt |
| `tools/music-studio/waveform-visualizer.tsx` | Canvas-based audio visualizer |
| `tools/music-studio/transport-bar.tsx` | Play/pause/record/stop + timer |
| `tools/music-studio/clips-panel.tsx` | Recorded clips list with preview/download |
| `tools/music-studio/my-clips.tsx` | History tab for past clips |
| `tools/music-studio/use-lyria.ts` | Custom hook: WebSocket, audio pipeline, recording |
| `tools/music-studio/audio-encoder.ts` | PCM → WAV/MP3 conversion utilities |
| `app/api/v1/music-studio/save-clip/route.ts` | Upload clip to R2 + credit deduction |
| `app/api/v1/music-studio/history/route.ts` | Save/fetch clip history |
| `supabase/migrations/028_music_clips.sql` | DB table + RLS |

## API Design

### POST /api/v1/music-studio/save-clip
- Auth: Required
- Credits: 1 (MP3) or 2 (WAV)
- Input: `{ audioBlob (multipart), name, durationSeconds, format, mode, promptSummary, bpm, scale }`
- Output: `{ id, clipUrl }`

### GET /api/v1/music-studio/history
- Auth: Required
- Output: `{ entries: [{ id, name, duration_seconds, format, clip_url, mode, prompt_summary, bpm, scale, created_at }] }`

### POST /api/v1/music-studio/history
- Auth: Required
- Input: clip metadata (saved after upload)

## Data Model

### `music_clips` table

```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID NOT NULL
name              TEXT NOT NULL DEFAULT 'Untitled'
duration_seconds  INT NOT NULL
format            TEXT NOT NULL  -- 'mp3' | 'wav'
clip_url          TEXT NOT NULL  -- R2 URL
mode              TEXT           -- 'music' | 'jingles' | 'sfx'
prompt_summary    TEXT
bpm               INT
scale             TEXT
created_at        TIMESTAMPTZ DEFAULT now()
```

- RLS: users read/update own rows only
- Index on (user_id, created_at DESC)

## Credit Model

| Operation | Cost |
|-----------|------|
| Stream/play music | Free |
| Record clips | Free |
| Preview clips | Free |
| Download MP3 | 1 credit |
| Download WAV | 2 credits |

## `use-lyria.ts` Hook Interface

```ts
interface UseLyriaReturn {
  status: 'idle' | 'connecting' | 'playing' | 'paused' | 'error'
  isRecording: boolean
  recordingDuration: number
  clips: Clip[]
  connect: () => Promise<void>
  disconnect: () => void
  play: () => void
  pause: () => void
  startRecording: () => void
  stopRecording: () => Clip
  updateConfig: (config: LyriaConfig) => void
  updatePrompts: (prompts: WeightedPrompt[]) => void
  analyserNode: AnalyserNode | null
}
```

## Edge Cases

- **Connection failure**: "Unable to connect to music engine" + retry button. Disable launchpad/transport.
- **Connection drop**: Auto-reconnect (exponential backoff, max 3). Pause recording, resume on reconnect. "Reconnecting..." banner.
- **Lyria unavailable**: Friendly message "Music studio is busy, try again in a moment."
- **No Web Audio API**: Show unsupported browser message.
- **AudioContext blocked**: "Tap to start" overlay — browsers require user gesture.
- **iOS audio**: Call AudioContext.resume() on user gesture.
- **Memory limit**: 10 clips, 3 min max. Warning at 2:30, auto-stop at 3:00.
- **Page leave with unsaved clips**: beforeunload confirmation dialog.
- **Empty recording**: < 1 second discarded with toast.

## Dependencies

- `@google/genai` — Gemini JS SDK for Lyria WebSocket connection
- `lamejs` — client-side MP3 encoding from PCM/WAV

## Constraints

- Lyria is experimental — may have availability issues
- Instrumental only — no vocals
- Output always watermarked by Google
- WebSocket-based — requires modern browser
- Client-side audio processing — requires Web Audio API
- Mobile-first responsive
- WCAG 2.1 AA compliance

## Non-Goals (v1)

- Vocals or singing
- Realistic sound effects (door slam, rain)
- Multi-track DAW / timeline editing
- MIDI export
- Server-side audio processing
- WAV as separate export (included in credit-gated download)

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | All-in-one (music + jingles + SFX) | Separate tools | Single tool with mode toggle |
| 2 | Google Lyria RealTime | Replicate, ElevenLabs | Gemini ecosystem, existing key |
| 3 | Real-time studio | Generate-and-download | Unique, leverages Lyria's strength |
| 4 | Visual launchpad | DJ mixer, prompt-first | Intuitive, fun, less typing |
| 5 | Lyria for all modes | Lyria + Freesound | Simple, musical SFX reasonable |
| 6 | Manual record button | Always recording, snapshots | Simple, user controls capture |
| 7 | Free streaming, credit downloads | Per-session, all free | Maximizes engagement |
| 8 | MP3 1cr, WAV 2cr | Single format | Tiered quality |
| 9 | Single-page studio | Wizard, tabs | Immediate feel |
| 10 | Client-side audio pipeline | Server-side | Lower latency |
| 11 | lamejs for MP3 | Server ffmpeg | Lightweight, no server dep |
| 12 | use-lyria hook | Spread across components | Single source of truth |
| 13 | 10 clips, 3 min max | Unlimited | Memory management |
| 14 | Client direct Lyria connection | Server proxy | SDK requires direct; rate limit mitigates |
