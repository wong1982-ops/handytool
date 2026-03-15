# Voice Cloning for Story Studio — Design Spec

## Understanding Summary

- **What**: Voice cloning feature that lets parents record their child reading a ~30-second fixed script, clone the voice via AI, and use it as the character's voice for storybook narration
- **Why**: Personalize storybooks — kids hear their own voice (or their sibling's) reading their character's dialogue and optionally narrating the whole story
- **Who**: Parents of young children using Story Studio
- **Key constraints**: Children's voice data requires careful privacy handling; raw audio stored in R2 (user-controlled), sent to provider only on demand; English only; credit model TBD based on actual API costs
- **Approach**: Multi-provider with fallback (like illustration pipeline), start with ElevenLabs as primary
- **Scope**: Recording UI lives in Character detail page; cloned voice usable for dialogue AND full narration
- **Non-goals**: Multi-language support, real-time streaming, voice editing/effects

## Assumptions

- Parents will manage recording on behalf of children (consent is implicit in the parent's action)
- A single 30-second recording is sufficient quality for the primary provider
- The existing `character.voice` field continues to work for presets; custom voice takes priority when available
- The existing multi-voice TTS pipeline (segment → generate → stitch) can route individual segments to different providers
- No legal/compliance review needed beyond in-app consent (family tool, not enterprise)

---

## Data Model

### New table: `character_voices`

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid PK | |
| `character_id` | uuid FK → characters | Which character this voice belongs to |
| `user_id` | uuid FK → users | Owner |
| `recording_url` | text | Raw audio file in R2 |
| `provider` | text | 'elevenlabs', 'fish_audio', 'cartesia' |
| `provider_voice_id` | text | The cloned voice ID from the provider |
| `status` | text | 'recorded', 'cloning', 'ready', 'error' |
| `created_at` | timestamptz | |

- One character → one custom voice (1:1 for now)
- Raw audio always stored in R2 regardless of provider
- `provider_voice_id` populated lazily on first narration, not at recording time
- When `character_voices` has a `ready` row, it takes priority over `character.voice` preset

---

## Voice Clone Service (`lib/story/voice-clone.ts`)

### Interface

```typescript
interface CloneVoiceInput {
  audioBuffer: Buffer
  characterName: string
}

interface CloneVoiceResult {
  provider: 'elevenlabs' | 'fish_audio' | 'cartesia'
  providerVoiceId: string
}

async function cloneVoice(input: CloneVoiceInput): Promise<CloneVoiceResult>

async function synthesizeWithClonedVoice(
  text: string,
  provider: string,
  providerVoiceId: string,
): Promise<Buffer>
```

### Provider cascade

1. ElevenLabs → 2. Fish Audio → 3. Cartesia

### Cloning lifecycle

1. User records audio → uploaded to R2 → `character_voices` row created with status `recorded`
2. On first narration request, `cloneVoice()` is called → sends R2 audio to provider → stores `provider_voice_id` → status becomes `ready`
3. Subsequent narrations reuse the stored `provider_voice_id`
4. If a provider fails, cascade tries the next one and updates the stored provider

---

## Recording UI (Character Detail Page)

### States

- **No recording**: "Record Voice" button with mic icon
- **Recording flow** (inline):
  1. Display fixed script: *"Once upon a time, in a land far away, a brave adventurer set out on a magical journey through enchanted forests and sparkling rivers, meeting wonderful friends along the way."*
  2. "Start Recording" button → browser `MediaRecorder` API
  3. Live timer showing recording progress (target ~30s)
  4. "Stop" → playback with "Re-record" and "Save" buttons
  5. On save → upload WAV to R2 via API
- **Voice saved**: Playback of recording, "Re-record" option, "Delete Voice" button
- **Voice ready** (cloned): Green badge "Custom voice active", playback, delete option

When a custom voice exists, preset voice picker remains visible with note: *"Custom voice will be used instead. Remove custom voice to use a preset."*

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/v1/story/characters/[id]/voice` | `POST` | Upload recording (multipart WAV), create `character_voices` row |
| `/api/v1/story/characters/[id]/voice` | `GET` | Get custom voice status |
| `/api/v1/story/characters/[id]/voice` | `DELETE` | Delete recording from R2, remove provider clone, delete row |

---

## TTS Pipeline Integration

### Updated flow

```
Page text → segment by speaker → resolve voice per speaker
  ├─ Preset voice → Gemini TTS (unchanged)
  └─ Custom voice → ensure cloned → synthesizeWithClonedVoice()
→ stitch WAV → upload
```

### Voice resolution order

1. Check `character_voices` for status `ready` → use cloned voice
2. Check `character_voices` for status `recorded` → trigger `cloneVoice()` first, then use it
3. Fall back to `character.voice` preset
4. Fall back to role-based voice pool (existing behavior)

### Segment generation

- Split segments into preset-voice and custom-voice groups
- Generate preset segments via Gemini (batch, unchanged)
- Generate custom segments via `synthesizeWithClonedVoice()` (individually)
- Merge all segment buffers back in order → stitch as before

### Narrator override

When user selects a cloned voice as narrator, `narratorVoice` references the character ID. Resolution follows the same path above.

### Unchanged

- WAV stitching logic
- R2 upload
- `page_audio` table schema
- Audio playback UI

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| 1 | ~30s fixed script recording | 10s sentence, AI-generated script, multiple options | Balances quality with ease; fixed script is simplest and consistent |
| 2 | Full character voice (dialogue + narrator) | Dialogue only, narration only | Maximum flexibility for users |
| 3 | Multi-provider with fallback | Single provider (ElevenLabs only) | Matches illustration pipeline pattern; resilience |
| 4 | Credit model TBD | Free, fixed cost, premium narration | Depends on actual API costs; defer until integration complete |
| 5 | Recording UI in Character detail page | Story creation, separate tab, both | Keeps voice as character attribute; simplest UX |
| 6 | Store raw audio in R2, clone on demand | Clone immediately, provider-only, both | User controls data; can re-clone; privacy-friendly for children |
| 7 | Lazy cloning (on first narration) | Clone at upload time | Avoids unnecessary API calls; no wait during recording |
| 8 | English only | Multi-language from start | Simplicity; matches current user base |
| 9 | Separate `character_voices` table | Extend character model | Cleaner separation; supports provider metadata |
| 10 | Provider-agnostic service module | Direct ElevenLabs in TTS | Familiar pattern; easy to swap/add providers |
