# VBlog Studio — Design Specification

## Overview

Fully automated marketing video generator for Toolk1t tools. One-click generates a complete video: AI-written script, automated Playwright screen recording, TTS voiceover (cloned voice or AI voice), your pre-recorded intro/outro face clips, assembled into a polished talking-head + demo video. Auto-published to YouTube, TikTok, Instagram Reels, Twitter/X, and Toolk1t blog.

## User Flow

1. Select a tool from dropdown
2. Choose script style (Feature Walkthrough / Problem-Solution)
3. Choose voice (Cloned / AI Library)
4. Choose target duration (60s / 120s / 180s)
5. Click "Generate" → pipeline starts
6. Monitor progress on dashboard
7. Preview finished video, auto-published to all platforms

## Pipeline Steps

7-step async pipeline. Each step produces an artifact in R2, retryable independently.

```
Step 1: SCRIPT        → Gemini generates structured script with actions
Step 2: SCREEN_RECORD → Playwright records tool walkthrough as video
Step 3: VOICE         → TTS generates voiceover from script (clone or AI)
Step 4: ASSETS        → Generate title card, lower third, end card graphics
Step 5: ASSEMBLY      → FFmpeg combines intro + title + demo + voice + outro → master.mp4
Step 6: ADAPT         → FFmpeg crops/resizes for TikTok (9:16), Reels (9:16), Twitter (1:1)
Step 7: PUBLISH       → Upload to YouTube, TikTok, Instagram, Twitter/X, create blog post
```

## Step 1: Script Generation

Gemini writes the script from tool metadata.

**Input:** Tool name, description, URL, extracted features, script style, target duration.

**Output:**
```json
{
  "title": "Create Professional Logos in Minutes",
  "hook": "Tired of paying designers hundreds for a logo?",
  "sections": [
    {
      "type": "intro",
      "text": "Hey, I'm going to show you...",
      "duration": 8,
      "visualNote": "talking-head"
    },
    {
      "type": "demo",
      "text": "First, enter your business name...",
      "duration": 15,
      "visualNote": "screen-recording",
      "actions": ["click input#businessName", "type 'Bright Spark'", "click #industry"]
    }
  ],
  "hashtags": ["#aitools", "#logodesign"],
  "description": "YouTube/social description text..."
}
```

Two script styles:
- **Feature Walkthrough**: structured (what it does, 3-5 features, step-by-step, CTA)
- **Problem-Solution**: narrative ("Have you ever struggled with X? Meet [Tool]...")

## Step 2: Screen Recording

Playwright launches 1920x1080 browser, navigates to tool, executes `actions` from script.

- Built-in Playwright video recording
- Natural timing: 500ms pauses, 80ms/char typing, smooth scrolls
- Custom CSS cursor overlay for visibility
- Each demo section recorded separately, trimmed to match duration
- Output: `.webm` files per section → R2

## Step 3: Voice Generation

Runs in parallel with Step 2 (no dependency).

- Cloned voice: uses Story Studio TTS infrastructure with user's voice profile
- AI voice: TTS API with selected voice from library
- Full audio file generated, split by section timestamps for sync
- Output: `voiceover.mp3` + per-section clips → R2

## Step 4: Asset Preparation

- **Title card**: Tool name + tagline on branded `#090f16` background, 3s
- **Lower third**: Name/title overlay for talking-head sections
- **End card**: "Try it free at toolk1t.com" + URL + QR code, 5s
- **Intro/outro clips**: Pre-recorded face clips from R2 (`vblog/templates/intro.mp4`, `outro.mp4`)
- **Background music**: Royalty-free track at low volume (`vblog/templates/bgm.mp3`)

## Step 5: Video Assembly

FFmpeg combines all assets:

```
[Intro clip 3-5s] → [Title card 3s] → [Demo 1 + voice] → [Demo 2 + voice] → ... → [End card 5s] → [Outro clip 3-5s]
```

- Voiceover overlaid on screen recordings
- Crossfade transitions (0.5s dissolve)
- Lower-third overlay during talking-head sections
- Background music under voiceover
- Output: `master.mp4` at 1920x1080, H.264, AAC

## Step 6: Platform Adaptation

FFmpeg generates variants from master:

| Platform | Aspect | Resolution | Max Duration | Crop |
|----------|--------|-----------|-------------|------|
| YouTube | 16:9 | 1920x1080 | Full | None (master) |
| TikTok | 9:16 | 1080x1920 | 60s | Center-crop + trim highlights |
| Instagram Reels | 9:16 | 1080x1920 | 90s | Center-crop + trim |
| Twitter/X | 1:1 | 1080x1080 | 140s | Center-crop |

Short-form variants extract "highlight" sections from script (hook + 1-2 features + CTA).

## Step 7: Publishing

| Platform | API | Upload |
|----------|-----|--------|
| YouTube | YouTube Data API v3 | Video + title + description + tags + thumbnail |
| TikTok | TikTok Content Posting API | Video + caption + hashtags |
| Instagram | Instagram Graph API | Reels video + caption |
| Twitter/X | Twitter API v2 | Video + tweet text |
| Toolk1t Blog | Internal API | Blog post with embedded video |

Each platform independent — failures don't block others.

## Dashboard UI

Admin-only page at `/tools/vblog`.

```
┌─────────────────────────────────────────────────┐
│  VBlog Studio                    [+ New Video]   │
├─────────────────────────────────────────────────┤
│  Job cards with:                                 │
│  - Tool name + timestamp                         │
│  - Progress bar (Step N/7)                       │
│  - Step status icons (✅⏳❌)                     │
│  - Platform publish status                       │
│  - Preview / Stats / Regenerate buttons          │
└─────────────────────────────────────────────────┘
```

**New Video form:** Tool dropdown, script style, voice choice, duration, Generate button.

## Infrastructure

### Processing Server

Vercel serverless cannot run FFmpeg or headed Playwright. A dedicated processing server handles Steps 2, 5, 6:

- Small Fly.io or Railway instance with Chrome + FFmpeg installed
- Receives jobs via REST API from Vercel cron worker
- Returns artifacts to R2
- Always-on, minimal resources (1 vCPU, 1GB RAM, scales to 0 when idle)

### Cron Worker

Vercel cron (`/api/cron/vblog-worker`) runs every 30s:
- Picks up jobs with `status = 'processing'`
- Executes next pending step (or dispatches to processing server)
- Updates job status
- One step per invocation to stay within timeout

## File Structure

| File | Purpose |
|------|---------|
| `app/tools/vblog/page.tsx` | Dashboard page |
| `tools/vblog/types.ts` | Types, pipeline steps, job state |
| `tools/vblog/vblog-dashboard.tsx` | Main dashboard with job list |
| `tools/vblog/new-video-form.tsx` | Tool selector + options form |
| `tools/vblog/job-progress.tsx` | Individual job progress card |
| `tools/vblog/video-preview.tsx` | Video player + platform status |
| `lib/vblog/pipeline.ts` | Pipeline orchestrator |
| `lib/vblog/script-generator.ts` | Gemini script generation |
| `lib/vblog/screen-recorder.ts` | Playwright recording |
| `lib/vblog/voice-generator.ts` | TTS integration |
| `lib/vblog/video-assembler.ts` | FFmpeg assembly |
| `lib/vblog/platform-adapter.ts` | FFmpeg crop/resize |
| `lib/vblog/publishers/youtube.ts` | YouTube upload |
| `lib/vblog/publishers/tiktok.ts` | TikTok upload |
| `lib/vblog/publishers/instagram.ts` | Instagram upload |
| `lib/vblog/publishers/twitter.ts` | Twitter upload |
| `lib/vblog/publishers/blog.ts` | Blog post creation |
| `app/api/v1/vblog/create/route.ts` | Create job |
| `app/api/v1/vblog/jobs/route.ts` | List jobs |
| `app/api/v1/vblog/jobs/[id]/route.ts` | Get/update job |
| `app/api/v1/vblog/jobs/[id]/retry/route.ts` | Retry failed step |
| `app/api/cron/vblog-worker/route.ts` | Pipeline worker |
| `supabase/migrations/030_vblog_jobs.sql` | DB table |

## Data Model

### `vblog_jobs` table

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL
tool_slug       TEXT NOT NULL
tool_name       TEXT NOT NULL
script_style    TEXT NOT NULL
voice_type      TEXT NOT NULL
voice_id        TEXT
target_duration INT NOT NULL
status          TEXT NOT NULL DEFAULT 'pending'
current_step    TEXT
steps           JSONB NOT NULL DEFAULT '{}'
artifacts       JSONB NOT NULL DEFAULT '{}'
platforms       JSONB NOT NULL DEFAULT '{}'
script_data     JSONB
error           TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

## R2 Storage

```
vblog/templates/intro.mp4        — your face intro (uploaded once)
vblog/templates/outro.mp4        — your face outro (uploaded once)
vblog/templates/bgm.mp3          — background music (uploaded once)
vblog/{jobId}/script.json        — generated script
vblog/{jobId}/screen-*.webm      — screen recordings per section
vblog/{jobId}/voiceover.mp3      — TTS audio
vblog/{jobId}/title-card.png     — title graphic
vblog/{jobId}/lower-third.png    — overlay graphic
vblog/{jobId}/end-card.png       — end graphic
vblog/{jobId}/master.mp4         — final 16:9 video
vblog/{jobId}/tiktok.mp4         — 9:16 variant
vblog/{jobId}/reels.mp4          — 9:16 variant
vblog/{jobId}/twitter.mp4        — 1:1 variant
```

## One-Time Setup

1. Record intro clip (3-5s face to camera) → upload via dashboard
2. Record outro clip (3-5s) → upload via dashboard
3. Record voice sample (30-60s) → clone via Story Studio voice flow
4. Upload royalty-free background music
5. Set up OAuth tokens for YouTube, TikTok, Instagram, Twitter (settings page)

## Edge Cases

- **FFmpeg/Playwright on serverless**: Handled by dedicated processing server
- **Platform API rate limits**: YouTube ~6 uploads/day. Retry with exponential backoff.
- **Screen recording failure**: Tool page broken → job fails with error screenshot
- **Platform publish partial failure**: Others proceed. Retry individually.
- **Job expiry**: Artifacts deleted from R2 after 30 days
- **No intro/outro uploaded**: Skip those sections, video starts with title card

## Non-Goals (v1)

- Live streaming
- Manual video editing timeline
- User-facing video creation (admin-only)
- Real-time preview during generation
- A/B testing different video versions
- Analytics dashboard (use native platform analytics)

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Fully automated one-click | Manual, semi-automated | Maximum efficiency |
| 2 | Talking head + demo clips | Avatar, slides, graphics | Personal, authentic |
| 3 | Voice clone + AI fallback | AI only, record each time | Personal + flexible |
| 4 | Playwright screen recording | Screenshots, AI mockups | Real interactions |
| 5 | Two script styles | Single, template | Variety |
| 6 | One master, auto-adapt | Per-platform | Efficient |
| 7 | Multi-platform distribution | Single, download | Maximum reach |
| 8 | Pipeline job system | Monolithic, external | Proven, resilient |
| 9 | Dedicated processing server | Serverless WASM | FFmpeg + Playwright need real runtime |
| 10 | Cron worker (30s) | WebSocket | Simple, fits Vercel |
| 11 | Per-step retry | All-or-nothing | Resilient |
| 12 | Admin-only dashboard | Separate admin app | Stays in main app |
