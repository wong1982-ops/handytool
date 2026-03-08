# Multi-Voice TTS for Story Studio

**Date**: 2026-03-08
**Status**: Approved

## Understanding Summary

- **What**: Multi-voice TTS — each character gets a distinct voice, narrator gets its own voice, all stitched into one audio file per page
- **Why**: Current single-voice narration sounds flat; dialogue is indistinguishable from narration; should feel like a proper audiobook
- **Who**: Story Studio end users (children's book audience primarily)
- **Key constraint**: Gemini TTS = one voice per API call, so each speaking segment needs a separate call, then server-side audio stitching
- **Playback**: Pre-stitched single file per page — no client changes needed
- **Voice assignment**: Automatic from curated pool based on character role
- **Non-goal**: User voice selection UI (future enhancement)

## Assumptions

- Gemini TTS remains the primary provider (better voice variety than OpenAI)
- OpenAI fallback = single-voice (acceptable degradation)
- Narrator reads only scene/narrative text; character voices speak only their dialogue
- No attribution phrases ("he said") — voice switching conveys the speaker
- ~400ms silence gap between segments for natural pacing
- WAV stitching is buffer math (same sample rate, mono, 16-bit from Gemini)
- Voice map stored in book data for consistency across regeneration
- Quality matters more than speed — more TTS calls per page is acceptable

## Design

### 1. Voice Pool & Assignment

Curated voice pool mapping Gemini voices to archetypes:

```
Narrator:     Enceladus (calm, clear, storytelling tone)
Protagonist:  Aoede (warm, youthful)
Antagonist:   Charon (deeper, contrasting)
Supporting-1: Puck (playful, lighter)
Supporting-2: Fenrir (distinct, older)
Supporting-3: Kore (neutral, versatile)
```

New function `assignVoices(characters: Character[])` in `lib/story/tts.ts`:
- Returns `VoiceMap`: `Record<string, string>` mapping `"narrator"` + character names → Gemini voice names
- Protagonist → protagonist voice, antagonist → antagonist voice, supporting → round-robin from pool
- Stored as `voiceMap` field on `StoryBook` (optional, backward-compatible)

### 2. Page Segmentation

New function `segmentPageAudio(narrativeText, dialogue, voiceMap)` in `lib/story/tts.ts`.

Fixed segment order per page:
1. Full narrative text → narrator voice
2. Dialogue lines in order → each character's assigned voice

Output type:
```typescript
interface AudioSegment {
  speaker: string    // "narrator" | character name
  text: string
  voiceName: string  // resolved from VoiceMap
}
```

### 3. Audio Stitching

New function `stitchWavBuffers(buffers: Buffer[], silenceMs: number)` in `lib/story/tts.ts`.

All Gemini outputs are PCM 16-bit, mono, 24kHz:
1. Strip 44-byte WAV header from each buffer → raw PCM
2. Generate silence buffer: `silenceMs * 24 * 2` bytes of zeros
3. Concatenate: `[pcm1] [silence] [pcm2] [silence] [pcm3]`
4. Write new WAV header for total length
5. Return combined buffer

Default silence: 400ms.

### 4. Generation Pipeline Changes

In `app/api/v1/story/generate/route.ts` (Step 3 — TTS):

1. Call `assignVoices(book.characters)` → store `voiceMap` on book object
2. Per page:
   - `segmentPageAudio()` → list of segments
   - Generate TTS for each segment with its assigned voice (provider locking from page 1's first segment)
   - `stitchWavBuffers()` → single WAV
   - Upload stitched file (same path: `audio/{bookId}/page-{N}.wav`)
3. Concurrency: page 1 first (locks provider), remaining pages at concurrency 3. Segments within a page are sequential.
4. SSE events: unchanged — `audio-done` per page with one URL

### 5. Data Model Change

Add to `StoryBook` type:
```typescript
voiceMap?: Record<string, string>
```

Optional — existing books without it still work (single voice playback).

### 6. Files to Modify

| File | Change |
|------|--------|
| `lib/story/tts.ts` | Add `assignVoices()`, `segmentPageAudio()`, `stitchWavBuffers()`. Update `generatePageAudio()` to accept `voiceName` properly. Remove `buildPageNarration()` (replaced by segmentation). |
| `app/api/v1/story/generate/route.ts` | Replace single TTS call per page with segment-based multi-voice pipeline. Store `voiceMap` on book. |
| `tools/story-studio/types.ts` | Add `voiceMap?: Record<string, string>` to `StoryBook` |

### 7. No Changes Required

- `tools/story-studio/book-viewer.tsx` — plays one `audioUrl` per page (unchanged)
- `app/api/v1/story/export-pdf/route.ts` — no audio in PDF
- Client-side playback logic — unchanged

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|----------|-------------|-----------|
| 1 | Separate TTS calls per speaker segment | Multi-turn voice switching; ElevenLabs API | Gemini doesn't support mid-stream switching; ElevenLabs adds dependency |
| 2 | Automatic voice assignment from curated pool | User-selectable voices | Simpler; user picker is future enhancement |
| 3 | Pre-stitched single WAV per page | Sequential client-side playback | Keeps client unchanged; more reliable |
| 4 | Narrator reads only narrative text | Narrator attributes dialogue | Voice switching conveys speaker |
| 5 | Fixed order: narration then dialogue | Interleaved markup from LLM | Avoids data model change; natural for children's books |
| 6 | WAV buffer concatenation | FFmpeg; external service | Same format = trivial concat; no dependencies |
| 7 | 400ms silence between segments | No gap; 1s gap | Natural pacing |
| 8 | OpenAI fallback = single-voice | Multi-voice with OpenAI | MP3 stitching complex; acceptable degradation |
| 9 | VoiceMap stored on book data | Derive on-the-fly | Consistency across regeneration |
