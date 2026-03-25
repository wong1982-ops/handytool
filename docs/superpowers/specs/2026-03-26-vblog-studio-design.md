# VBlog Studio — Design Specification (v1 Simplified)

## Overview

Automated marketing video generator for Toolk1t tools. One-click generates a complete video: AI-written script, automated Playwright screen recording, TTS voiceover (cloned voice or AI voice), your pre-recorded intro/outro face clips, assembled into a polished talking-head + demo video. Downloads as ready-to-upload files for each platform. Manual upload by user in v1.

## User Flow

1. Select a tool from dropdown
2. Choose script style (Feature Walkthrough / Problem-Solution)
3. Choose voice (Cloned / AI Library)
4. Choose target duration (60s / 120s / 180s)
5. Click "Generate" → pipeline starts
6. Monitor progress on dashboard
7. Preview finished video, download master + platform variants

## Pipeline Steps

6-step async pipeline. Each step produces an artifact in R2, retryable independently.

```
Step 1: SCRIPT        → Gemini generates structured script with actions
Step 2: SCREEN_RECORD → Playwright records tool walkthrough as video
Step 3: VOICE         → TTS generates voiceover from script (clone or AI)
Step 4: ASSETS        → Generate title card, lower third, end card graphics
Step 5: ASSEMBLY      → FFmpeg combines intro + title + demo + voice + outro → master.mp4
Step 6: ADAPT         → FFmpeg crops/resizes for TikTok (9:16), Reels (9:16), Twitter (1:1)
```

Each step writes output to `vblog/{jobId}/`:
- `script.json` — generated script with timestamps
- `screen-*.webm` — raw Playwright capture per section
- `voiceover.mp3` — TTS audio
- `title-card.png`, `lower-third.png`, `end-card.png` — graphics
- `master.mp4` — final 16:9 video
- `tiktok.mp4`, `reels.mp4`, `twitter.mp4` — adapted variants

## Step 1: Script Generation

Gemini writes the script from tool metadata. Reads from `lib/tools.tsx` + crawls tool page for features.

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
      "actions": ["click input#businessName", "type 'Bright Spark'"]
    },
    {
      "type": "outro",
      "text": "Try it free at toolk1t.com.",
      "duration": 5,
      "visualNote": "talking-head"
    }
  ],
  "hashtags": ["#aitools", "#logodesign"],
  "description": "YouTube/social description text..."
}
```

Two script styles: Feature Walkthrough (structured) and Problem-Solution (narrative).

## Step 2: Screen Recording

Playwright launches 1920x1080, navigates to tool, executes `actions` from script.

- Built-in Playwright video recording
- Natural timing: 500ms pauses, 80ms/char typing, smooth scrolls
- Custom CSS cursor overlay for visibility
- Each demo section recorded separately
- Output: `.webm` per section → R2

## Step 3: Voice Generation

Runs in parallel with Step 2.

- Cloned voice: Story Studio TTS infrastructure
- AI voice: TTS API with selected voice from library
- Full audio + per-section splits for sync
- Output: `voiceover.mp3` → R2

## Step 4: Asset Preparation

- **Title card**: Tool name + tagline on `#090f16` background, 3s
- **Lower third**: Name/title overlay for talking-head sections
- **End card**: "Try it free at toolk1t.com" + URL, 5s
- **Intro/outro clips**: Pre-recorded, from `vblog/templates/`
- **Background music**: Royalty-free at low volume

## Step 5: Video Assembly

FFmpeg combines:
```
[Intro 3-5s] → [Title 3s] → [Demo sections + voice] → [End card 5s] → [Outro 3-5s]
```
- Crossfade transitions (0.5s)
- Lower-third during talking-head
- Background music under voice
- Output: `master.mp4` 1920x1080, H.264

## Step 6: Platform Adaptation

| Platform | Aspect | Resolution | Max Duration |
|----------|--------|-----------|-------------|
| YouTube | 16:9 | 1920x1080 | Full (master) |
| TikTok | 9:16 | 1080x1920 | 60s (highlight trim) |
| Instagram Reels | 9:16 | 1080x1920 | 90s |
| Twitter/X | 1:1 | 1080x1080 | 140s |

Short-form: extract highlight sections (hook + 1-2 features + CTA).

## Dashboard UI

Admin page at `/tools/vblog`.

```
┌─────────────────────────────────────────────────┐
│  VBlog Studio                    [+ New Video]   │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ Logo Generator Demo          2 min ago   │    │
│  │ ████████████░░░░  Step 5/6: Assembly     │    │
│  │ ✅Script ✅Record ✅Voice ✅Assets ⏳Asm  │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Font Generator Demo          1 day ago   │    │
│  │ ✅ Complete · 4 files ready              │    │
│  │ [▶ Preview] [⬇ Download All]            │    │
│  │ master.mp4 · tiktok.mp4 · reels · x     │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

Download options:
- **Download All** — ZIP of master + all platform variants + script + description text
- **Individual downloads** — click each variant filename

## Infrastructure

### Processing Server (Fly.io)

FFmpeg + Playwright need real runtime. A small Fly.io app:
- Node.js 20 + Chrome + FFmpeg
- Receives jobs via REST API
- Returns artifacts to R2
- Scales to 0 when idle (~$3-5/month active)
- I'll provide the Dockerfile

### Cron Worker

Vercel cron (`/api/cron/vblog-worker`) every 30s:
- Picks up pending jobs
- Executes next step (or dispatches to Fly.io for heavy steps)
- Updates status
- One step per invocation

## File Structure

| File | Purpose |
|------|---------|
| `app/tools/vblog/page.tsx` | Dashboard page |
| `tools/vblog/types.ts` | Types, pipeline steps, job state |
| `tools/vblog/vblog-dashboard.tsx` | Dashboard with job list |
| `tools/vblog/new-video-form.tsx` | Tool selector + options |
| `tools/vblog/job-progress.tsx` | Job progress card |
| `tools/vblog/video-preview.tsx` | Video player + download links |
| `lib/vblog/pipeline.ts` | Pipeline orchestrator |
| `lib/vblog/script-generator.ts` | Gemini script generation |
| `lib/vblog/screen-recorder.ts` | Playwright recording |
| `lib/vblog/voice-generator.ts` | TTS integration |
| `lib/vblog/video-assembler.ts` | FFmpeg assembly |
| `lib/vblog/platform-adapter.ts` | FFmpeg crop/resize |
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
script_data     JSONB
error           TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

## R2 Storage

```
vblog/templates/intro.mp4        — face intro (uploaded once)
vblog/templates/outro.mp4        — face outro (uploaded once)
vblog/templates/bgm.mp3          — background music
vblog/{jobId}/script.json
vblog/{jobId}/screen-*.webm
vblog/{jobId}/voiceover.mp3
vblog/{jobId}/title-card.png
vblog/{jobId}/lower-third.png
vblog/{jobId}/end-card.png
vblog/{jobId}/master.mp4
vblog/{jobId}/tiktok.mp4
vblog/{jobId}/reels.mp4
vblog/{jobId}/twitter.mp4
```

## One-Time Setup

1. Record intro clip (3-5s) → upload via dashboard
2. Record outro clip (3-5s) → upload via dashboard
3. Record voice sample (30-60s) → clone via Story Studio
4. Upload royalty-free background music
5. Deploy Fly.io processing server

## Edge Cases

- **No intro/outro uploaded**: Skip those sections, start with title card
- **Screen recording failure**: Job fails with error screenshot, retryable
- **Voice generation failure**: Fall back to AI voice if clone fails
- **FFmpeg failure**: Retry from assembly step (recordings preserved)
- **Job expiry**: Artifacts deleted from R2 after 30 days

## Non-Goals (v1)

- Auto-upload to platforms (manual upload by user)
- Platform OAuth integration
- Live streaming
- Manual video editing timeline
- A/B testing video versions
- Analytics dashboard
- User-facing video creation (admin-only)

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Fully automated generation | Manual, semi-automated | Maximum efficiency |
| 2 | Talking head + demo | Avatar, slides, graphics | Personal, authentic |
| 3 | Voice clone + AI fallback | AI only, record each time | Personal + flexible |
| 4 | Playwright screen recording | Screenshots, AI mockups | Real interactions |
| 5 | Two script styles | Single, template | Variety |
| 6 | One master, auto-adapt | Per-platform | Efficient |
| 7 | Manual upload v1 | Auto-publish | Simpler, no OAuth setup needed |
| 8 | Pipeline job system | Monolithic | Proven, resilient |
| 9 | Fly.io processing server | Serverless WASM | FFmpeg + Playwright need runtime |
| 10 | Cron worker (30s) | WebSocket | Simple, fits Vercel |
| 11 | Download ZIP with all variants | Individual only | Convenient for manual upload |
