# Story Video Generator — Design Specification

## Overview

AI cartoon video generator for Story Studio books. Takes a completed storybook and generates a full animated cartoon video — AI-generated scenes from text descriptions, character voices, narrator, sound effects, background music, assembled into a downloadable MP4. Pluggable video provider interface (Gemini now, Kling/Runway later).

## User Flow

1. Select a completed Story Studio book
2. Choose art style (cartoon, anime, Pixar, watercolor) + duration preference
3. Click "Generate Video" (5/10/20 credits)
4. Pipeline runs in background (7 steps, 20-50 min)
5. Watch progress per-scene
6. Preview, download, or share the finished video

## Pipeline Steps

7-step async pipeline. Each step produces artifacts in R2, retryable independently.

```
Step 1: SCRIPT     → Convert book pages into video screenplay
Step 2: SCENES     → Generate video clips per scene via VideoProvider
Step 3: VOICES     → Generate character dialogue audio via TTS
Step 4: NARRATION  → Generate narrator voiceover
Step 5: SFX        → Generate/select sound effects per scene
Step 6: MUSIC      → Generate background music track
Step 7: ASSEMBLY   → FFmpeg composites everything → final.mp4
```

Steps 3-6 run in parallel (no dependencies between audio tracks). Step 7 waits for Steps 2-6.

## Step 1: Screenplay Generation

Gemini converts book pages + character info into structured screenplay:

```json
{
  "scenes": [
    {
      "sceneIndex": 0,
      "description": "A cozy cottage kitchen at sunrise...",
      "characters": ["Lily"],
      "dialogue": [
        { "character": "Lily", "text": "Just one cookie..." }
      ],
      "narration": "In a little village by the sea...",
      "mood": "warm, playful",
      "sfxHints": ["birds chirping", "wooden floor creaking"],
      "duration": 8,
      "cameraDirection": "slow zoom into kitchen window",
      "transition": "dissolve"
    }
  ],
  "totalDuration": 180,
  "musicMood": "whimsical, adventure, orchestral"
}
```

Long books (20+ pages) may consolidate pages into fewer scenes. Max 30 scenes per video.

## Step 2: Scene Generation — Video Provider Interface

```ts
interface VideoProvider {
  id: string
  name: string
  generateScene(params: {
    description: string
    characterRefs: { name: string; portraitUrl: string }[]
    mood: string
    cameraDirection: string
    duration: number
    aspectRatio: '16:9'
    style?: string
  }): Promise<Buffer>
}
```

### Gemini Provider (v1)
- Uses Gemini video generation with text + image reference prompts
- Character portraits sent as inline image data
- Art style prefix locked after first scene
- Each scene = one API call → 3-15s video clip
- Generated sequentially (rate limits)

### Future Providers (v2+)
- `KlingProvider` — same interface, Kling API
- `RunwayProvider` — same interface, Runway Gen-3 API
- Provider selected per-job in settings

### Fallback
If video generation fails: fall back to image generation + Ken Burns animation as degraded mode.

## Step 3: Character Voices

- Read dialogue from screenplay
- Match character to Story Studio voice profile
- Cloned voice → voice clone TTS
- Preset voice → Gemini/OpenAI TTS
- One audio clip per dialogue line
- Parallel with scene generation

## Step 4: Narration

- Read narration text from screenplay per scene
- Use book's narrator voice setting
- One clip per scene's narration
- Parallel with scene generation

## Step 5: Sound Effects

- Read `sfxHints` from screenplay
- Gemini audio generation: "Generate a sound effect of {hint}"
- Fallback: match against built-in SFX library (common sounds in R2)
- 1-5s each, timed to scene

## Step 6: Background Music

- Read `musicMood` from screenplay
- Option A: Lyria (Music Studio integration) for continuous track
- Option B: Royalty-free library from R2
- Option C: Gemini audio generation
- Single track matching total video duration
- Volume ducked during dialogue/narration (handled in assembly)

## Step 7: Assembly

FFmpeg composites per scene:
1. Video clip
2. Dialogue audio — character speaking
3. Narration audio — non-dialogue moments
4. SFX — layered at scene-appropriate timestamps
5. Background music — continuous, ducked during speech

**Transitions:** crossfade (default), cut, fade, dissolve, wipe — specified in screenplay.

**Bookend content:**
- Title card (3s): book title + author
- End credits (5s): "Made with Story Studio" + characters

**Output:** 1080p (1920x1080), 24fps, H.264, AAC stereo.

Reuses VBlog FFmpeg infrastructure (local processing server or Vercel function).

## UI Layout

```
/tools/story-video

┌─────────────────────────────────────────────────┐
│  Story Video Generator       [My Videos]         │
├─────────────────────────────────────────────────┤
│  Book Selector (horizontal scroll of covers)     │
│  Settings (art style, duration, provider)        │
│  Estimate: ~8 min · 10 credits                   │
│  [Generate Video — 10 credits]                   │
├─────────────────────────────────────────────────┤
│  Job cards with 7-step progress + scene grid     │
│  Completed: [Watch] [Download] [Share]           │
└─────────────────────────────────────────────────┘
```

**Completed video view:** Player with chapter markers per scene, download button, share link.

## File Structure

| File | Purpose |
|------|---------|
| `tools/story-video/types.ts` | Types, provider interface, screenplay, job state |
| `tools/story-video/providers/gemini.ts` | Gemini video provider |
| `tools/story-video/providers/index.ts` | Provider registry + factory |
| `tools/story-video/screenplay-generator.ts` | Book → screenplay conversion |
| `tools/story-video/audio-pipeline.ts` | Voice, narration, SFX, music |
| `tools/story-video/story-video-studio.tsx` | Main page |
| `tools/story-video/job-progress.tsx` | Job progress card |
| `tools/story-video/video-player.tsx` | Preview + download + scene browser |
| `tools/story-video/book-selector.tsx` | Pick a completed book |
| `tools/story-video/settings-form.tsx` | Art style, duration, provider |
| `app/tools/story-video/page.tsx` | Page route |
| `app/api/v1/story-video/create/route.ts` | Create job |
| `app/api/v1/story-video/jobs/route.ts` | List jobs |
| `app/api/v1/story-video/jobs/[id]/route.ts` | Get job |
| `app/api/v1/story-video/jobs/[id]/retry/route.ts` | Retry step/scene |
| `app/api/cron/story-video-worker/route.ts` | Pipeline worker |
| `supabase/migrations/033_story_videos.sql` | DB table |

## API Design

### POST /api/v1/story-video/create
- Auth: Required
- Credits: 5/10/20 based on duration
- Input: `{ bookId, artStyle, duration, provider }`
- Output: `{ jobId }`

### GET /api/v1/story-video/jobs
- Auth: Required
- Output: `{ entries: [...] }`

### GET /api/v1/story-video/jobs/[id]
- Auth: Required
- Output: `{ job: {...} }` including scene_status array

### POST /api/v1/story-video/jobs/[id]/retry
- Auth: Required
- Input: `{ step?, sceneIndex? }`
- Retries a failed step or specific scene

## Data Model

### `story_video_jobs` table

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL
book_id         UUID NOT NULL
book_title      TEXT NOT NULL
art_style       TEXT DEFAULT 'cartoon'
provider        TEXT DEFAULT 'gemini'
target_duration TEXT DEFAULT 'auto'
status          TEXT DEFAULT 'pending'
current_step    TEXT
steps           JSONB DEFAULT '{}'
screenplay      JSONB
scene_status    JSONB DEFAULT '[]'
artifacts       JSONB DEFAULT '{}'
credits_charged INT DEFAULT 0
error           TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

RLS: users read/update own rows.

## R2 Storage

```
story-video/{jobId}/screenplay.json
story-video/{jobId}/scene-{index}.mp4
story-video/{jobId}/voice-{sceneIndex}-{dialogueIndex}.mp3
story-video/{jobId}/narration-{sceneIndex}.mp3
story-video/{jobId}/sfx-{sceneIndex}-{sfxIndex}.mp3
story-video/{jobId}/music.mp3
story-video/{jobId}/final.mp4
story-video/{jobId}/thumbnail.jpg
```

## Credit Model

| Duration | Pages | Credits |
|----------|-------|---------|
| Short (1-3 min) | ≤5 pages | 5 |
| Medium (3-10 min) | 6-15 pages | 10 |
| Long (10+ min) | 16+ pages | 20 |

- Scene regeneration within same job: free
- Download: included in credit cost
- Individual scene clips: free

## Edge Cases

- **Character consistency**: portraits as reference, style prompt locked after first scene
- **Long stories**: consolidate pages into fewer scenes, max 30
- **Video gen failure**: auto-retry once, fallback to Ken Burns animation
- **Audio sync**: assembly adjusts video/audio length mismatch (extend frame or trim)
- **Job timeout**: 2 hour max, stalled if no progress for 10 min
- **Partial results**: individual scene clips downloadable even if assembly fails
- **No illustrations in book**: still works — scenes generated purely from text descriptions

## Non-Goals (v1)

- Manual timeline editing
- Scene reordering
- Custom transition editor
- Lip sync animation
- Real-time preview during generation
- Multi-language audio tracks
- Subtitle generation

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Full cartoon from text | Slideshow, simple animation | Most engaging |
| 2 | Scene-by-scene generation | img2vid, layered | Creative freedom |
| 3 | Flexible duration | Fixed | Adapts to content |
| 4 | Full audio production | Reuse narration | Richest experience |
| 5 | Character portraits as ref | Style guide, best effort | Practical consistency |
| 6 | Gemini + pluggable interface | Single provider | Future-proof |
| 7 | Separate tool | Tab, add-on | Independent workflow |
| 8 | Flat rate credits | Per-scene, per-minute | Simple |
| 9 | Pipeline job (7 steps) | Monolithic | Proven, retryable |
| 10 | Provider interface | Hardcoded | Easy to swap |
| 11 | Sequential scenes | Parallel | Rate limits |
| 12 | Parallel audio | Sequential | Independent tracks |
| 13 | Ken Burns fallback | No fallback | Degraded > failure |
| 14 | Max 30 scenes | Unlimited | Reasonable time |
| 15 | Reuse VBlog FFmpeg | New server | DRY |
