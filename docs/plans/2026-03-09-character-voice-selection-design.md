# Character Voice Selection — Design

## Understanding Summary
- **What:** Add a voice field to series characters, letting users pick from all 30 Gemini TTS voices
- **Why:** So character voices match their age/gender (e.g., an 8-year-old girl shouldn't sound like an adult)
- **Who:** Story Studio series creators
- **Flow:** Browse voices by name + tone label, optional selection with auto-assign fallback
- **Editability:** Voice can be changed anytime; changing it offers to regenerate audio for existing books
- **Non-goals:** No audio preview in picker, no custom voice creation, no AI-suggested voices

## Assumptions
- All 30 Gemini voices work with `gemini-2.5-flash-preview-tts`
- Voice preference stored per character in `series_characters` table (new column)
- `voiceMap` in `StoryBook` data remains source of truth for already-generated books
- Regenerating audio for existing books is a separate explicit action
- Narrator voice remains auto-assigned (Enceladus), not tied to any character

## Decision Log

| # | Decision | Alternatives | Reason |
|---|---|---|---|
| 1 | TTS voice preset | Personality descriptor, Both | Core need is age/gender-appropriate voices for read-aloud |
| 2 | Mixed narration (narrator + character voices) | Dialogue only, Full page | Already implemented, most immersive |
| 3 | All 30 Gemini voices | Keep existing 6 | More options for age/gender matching |
| 4 | Browse by name + tone label | Curated categories, Audio preview | Simplest; audio preview can be added later |
| 5 | Optional with auto-assign fallback | Required | No friction, existing characters keep working |
| 6 | Always editable + offer audio regen | Locked, Edit without regen | Most flexible for users |
| 7 | Simple column approach | Voice profile table, AI-suggested | YAGNI — 30 static voices don't need a separate table |

## Available Voices (30 Gemini TTS voices)

| Voice | Tone |
|---|---|
| Zephyr | Bright |
| Puck | Upbeat |
| Charon | Informative |
| Kore | Firm |
| Fenrir | Excitable |
| Leda | Youthful |
| Orus | Firm |
| Aoede | Breezy |
| Callirrhoe | Easy-going |
| Autonoe | Bright |
| Enceladus | Breathy |
| Iapetus | Clear |
| Umbriel | Easy-going |
| Algieba | Smooth |
| Despina | Smooth |
| Erinome | Clear |
| Algenib | Gravelly |
| Rasalgethi | Informative |
| Laomedeia | Upbeat |
| Achernar | Soft |
| Alnilam | Firm |
| Schedar | Even |
| Gacrux | Mature |
| Pulcherrima | Forward |
| Achird | Friendly |
| Zubenelgenubi | Casual |
| Vindemiatrix | Gentle |
| Sadachbia | Lively |
| Sadaltager | Knowledgeable |
| Sulafat | Warm |

## Design

### Database
- Add `voice TEXT DEFAULT NULL` to `series_characters` table
- Valid values: any of the 30 Gemini voice names or `NULL` (auto-assign)
- Update `add_series_character` RPC: add optional `p_voice TEXT DEFAULT NULL`
- Update `update_series_character` RPC: add optional `p_voice TEXT DEFAULT NULL`
- `get_series_with_characters` and `get_user_series` RPCs return all columns via JSON — `voice` included automatically

### API Changes
- `POST /api/v1/story/series/[id]/characters` — add optional `voice` to Zod schema, validated against 30 voice names
- `PATCH /api/v1/story/series/[id]/characters/[charId]` — add optional `voice` to Zod schema
- Both pass `p_voice` to their respective RPCs

### Voice Assignment Override (`lib/story/tts.ts`)
- In `assignVoices()`: before auto-assigning by role, check if character has a `voice` set in series data
- If set, use it directly instead of role-based default
- Auto-assign remains the fallback for characters without a voice preference

### UI — Add Character Form (series detail page)
- Add "Voice" dropdown below description textarea
- Options: "Auto-assign (default)" + all 30 voices as "VoiceName — Tone"
- Default: "Auto-assign"

### UI — Edit Character Flow
- Same dropdown in edit mode
- Changing voice saves via existing PATCH endpoint

### UI — Audio Regeneration (series detail page)
- Compare book's `voiceMap` against current character voices
- Books with stale voice mappings show "Audio outdated" badge
- Click triggers audio regeneration (re-runs TTS for affected pages)
- Uses existing `generateMultiVoicePageAudio()` pipeline with updated voice map

### No Changes To
- Portrait generation flow
- Story text generation
- Book viewer / playback UI
