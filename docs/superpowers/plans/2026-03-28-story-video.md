# Story Video Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI cartoon video generator that takes Story Studio books and produces full animated videos with scenes, character voices, narration, sound effects, and background music.

**Architecture:** 7-step pipeline job (screenplay → scenes → voices → narration → SFX → music → assembly). Pluggable `VideoProvider` interface (Gemini now, Kling/Runway later). Reuses Story Studio TTS for voices, Gemini for video/audio generation, FFmpeg for assembly (VBlog infra). Scene-by-scene generation with per-scene retry.

**Tech Stack:** Next.js 16, React 19, TypeScript, Gemini API (video + audio), Story Studio TTS, FFmpeg, Supabase, Cloudflare R2, Tailwind CSS v4.

---

## File Structure

| File | Purpose |
|------|---------|
| `tools/story-video/types.ts` | Types, VideoProvider interface, screenplay, job state |
| `tools/story-video/providers/gemini.ts` | Gemini video generation provider |
| `tools/story-video/providers/index.ts` | Provider registry + factory |
| `tools/story-video/screenplay-generator.ts` | Book pages → structured screenplay |
| `tools/story-video/audio-pipeline.ts` | Voice, narration, SFX, music generation |
| `tools/story-video/story-video-studio.tsx` | Main page: book selector, settings, jobs |
| `tools/story-video/book-selector.tsx` | Pick a completed book |
| `tools/story-video/settings-form.tsx` | Art style, duration, provider |
| `tools/story-video/job-progress.tsx` | Job progress with scene grid |
| `tools/story-video/video-player.tsx` | Preview + download + scene browser |
| `app/tools/story-video/page.tsx` | Page route |
| `app/api/v1/story-video/create/route.ts` | Create job |
| `app/api/v1/story-video/jobs/route.ts` | List jobs |
| `app/api/v1/story-video/jobs/[id]/route.ts` | Get job |
| `app/api/v1/story-video/jobs/[id]/retry/route.ts` | Retry step/scene |
| `app/api/cron/story-video-worker/route.ts` | Pipeline worker |
| `supabase/migrations/033_story_videos.sql` | DB table |

---

### Task 1: Types, Provider Interface & Screenplay Generator

**Files:**
- Create: `tools/story-video/types.ts`
- Create: `tools/story-video/providers/gemini.ts`
- Create: `tools/story-video/providers/index.ts`
- Create: `tools/story-video/screenplay-generator.ts`

- [ ] **Step 1: Create types**

Types and constants:
- `VideoProviderType = 'gemini' | 'kling' | 'runway'`
- `ArtStyle = 'cartoon' | 'anime' | 'pixar' | 'watercolor'`
- `DurationPreset = 'auto' | 'short' | 'medium' | 'long'`
- `PipelineStep = 'script' | 'scenes' | 'voices' | 'narration' | 'sfx' | 'music' | 'assembly'`
- `SceneStatus = { index: number, status: 'pending' | 'generating' | 'done' | 'failed', clipUrl?: string, error?: string }`
- `ScreenplayScene = { sceneIndex, description, characters, dialogue: { character, text }[], narration, mood, sfxHints, duration, cameraDirection, transition }`
- `Screenplay = { scenes: ScreenplayScene[], totalDuration, musicMood }`
- `VideoProvider` interface (from spec)
- `StoryVideoJob` interface matching DB schema
- Constants: `PIPELINE_STEPS`, `STEP_LABELS`, `ART_STYLES`, `CREDIT_TIERS`
- `estimateCredits(pageCount, duration)` helper

- [ ] **Step 2: Create VideoProvider interface and Gemini provider**

`providers/gemini.ts`:
- Implements `VideoProvider` interface
- `generateScene()`: builds prompt from description + mood + camera direction + art style
- Sends character portrait URLs as image references
- Calls Gemini video generation endpoint
- Returns video buffer
- Includes style consistency: first scene sets style prefix, subsequent scenes reference it
- Fallback: if video gen fails, generate image via Gemini image API + create Ken Burns video from still image using canvas/FFmpeg

`providers/index.ts`:
- `getProvider(type: VideoProviderType): VideoProvider`
- Registry pattern — returns Gemini for now, throws for unimplemented providers

- [ ] **Step 3: Create screenplay generator**

`screenplay-generator.ts`:
- `generateScreenplay(book: StoryBook, artStyle: ArtStyle, targetDuration: DurationPreset): Promise<Screenplay>`
- Sends book pages (text, dialogue, characters, mood) to Gemini text model
- Prompt asks for structured JSON screenplay matching `Screenplay` type
- Consolidates pages for long books (>20 pages → merge 2-3 per scene)
- Caps at 30 scenes max
- Estimates scene durations based on dialogue/narration text length

- [ ] **Step 4: Commit**

```bash
git add tools/story-video/types.ts tools/story-video/providers/ tools/story-video/screenplay-generator.ts
git commit -m "feat(story-video): add types, provider interface, and screenplay generator"
```

---

### Task 2: Audio Pipeline

**Files:**
- Create: `tools/story-video/audio-pipeline.ts`

- [ ] **Step 1: Create audio pipeline**

Exports 4 functions, all return R2 URLs:

`generateVoices(jobId, screenplay, book)`:
- For each dialogue line in each scene
- Look up character voice from book's voiceMap
- Call existing TTS infrastructure (`lib/story/tts.ts` pattern)
- Upload to R2: `story-video/{jobId}/voice-{sceneIndex}-{dialogueIndex}.mp3`
- Return map: `{ [sceneIndex]: { [dialogueIndex]: audioUrl } }`

`generateNarration(jobId, screenplay)`:
- For each scene's narration text
- Use default narrator voice (Gemini TTS 'Kore' or OpenAI 'onyx')
- Upload: `story-video/{jobId}/narration-{sceneIndex}.mp3`

`generateSfx(jobId, screenplay)`:
- For each scene's sfxHints array
- Call Gemini audio generation: "Generate a short sound effect of {hint}"
- Fallback: return null for that SFX (assembly skips it)
- Upload: `story-video/{jobId}/sfx-{sceneIndex}-{sfxIndex}.mp3`

`generateMusic(jobId, screenplay)`:
- Use Gemini audio generation with musicMood prompt
- Generate a track matching totalDuration
- Upload: `story-video/{jobId}/music.mp3`

All functions handle errors gracefully — log and continue, don't block the pipeline.

- [ ] **Step 2: Commit**

```bash
git add tools/story-video/audio-pipeline.ts
git commit -m "feat(story-video): add audio pipeline (voices, narration, SFX, music)"
```

---

### Task 3: Database Migration & API Routes

**Files:**
- Create: `supabase/migrations/033_story_videos.sql`
- Create: `app/api/v1/story-video/create/route.ts`
- Create: `app/api/v1/story-video/jobs/route.ts`
- Create: `app/api/v1/story-video/jobs/[id]/route.ts`
- Create: `app/api/v1/story-video/jobs/[id]/retry/route.ts`

- [ ] **Step 1: Create migration**

```sql
CREATE TABLE IF NOT EXISTS public.story_video_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  book_title TEXT NOT NULL,
  art_style TEXT DEFAULT 'cartoon',
  provider TEXT DEFAULT 'gemini',
  target_duration TEXT DEFAULT 'auto',
  status TEXT DEFAULT 'pending',
  current_step TEXT,
  steps JSONB DEFAULT '{}',
  screenplay JSONB,
  scene_status JSONB DEFAULT '[]',
  artifacts JSONB DEFAULT '{}',
  credits_charged INT DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_story_video_user ON story_video_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_video_status ON story_video_jobs (status) WHERE status IN ('pending', 'processing');

ALTER TABLE story_video_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own video jobs" ON story_video_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON story_video_jobs TO authenticated;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

- [ ] **Step 3: Create API routes**

`create/route.ts`: POST — auth + credit deduction. Body: `{ bookId, artStyle, targetDuration, provider }`. Fetch book from `book_jobs` table to get title. Calculate credits from page count + duration. Insert job with scene_status initialized from page count.

`jobs/route.ts`: GET — auth, list user's video jobs, limit 20.

`jobs/[id]/route.ts`: GET — auth, fetch single job including scene_status.

`jobs/[id]/retry/route.ts`: POST — auth. Body: `{ step?, sceneIndex? }`. If sceneIndex: reset that scene status to 'pending'. If step: reset step to 'pending'. Set job status to 'processing'.

Use `getSupabase()` pattern (admin client in dev for RLS bypass).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/033_story_videos.sql app/api/v1/story-video/
git commit -m "feat(story-video): add database migration and API routes"
```

---

### Task 4: Pipeline Worker

**Files:**
- Create: `app/api/cron/story-video-worker/route.ts`

- [ ] **Step 1: Create pipeline worker**

Cron-triggered GET handler (same pattern as vblog-worker).

Pipeline logic:
1. Auth via CRON_SECRET
2. Admin Supabase client
3. Fetch jobs with `status IN ('pending', 'processing')`, limit 3
4. For each job, determine next step:

**Step: script**
- Import `generateScreenplay` from screenplay-generator
- Fetch book data from `book_jobs` table
- Generate screenplay, store in job's `screenplay` JSONB
- Initialize `scene_status` array from screenplay scenes
- Upload screenplay JSON to R2

**Step: scenes**
- Import provider from `providers/index`
- Find next scene with `status = 'pending'` in scene_status
- Call `provider.generateScene()` with scene description + character portraits from book
- Upload clip to R2, update scene_status
- If all scenes done, mark step complete
- Process ONE scene per worker invocation (stay within timeout)

**Step: voices** (can run parallel with scenes)
- Import `generateVoices` from audio-pipeline
- Generate all voices in one call, update artifacts

**Step: narration** (parallel)
- Import `generateNarration`, update artifacts

**Step: sfx** (parallel)
- Import `generateSfx`, update artifacts

**Step: music** (parallel)
- Import `generateMusic`, update artifacts

**Step: assembly**
- All previous steps must be complete
- Dispatch to VBlog processing server (`/assemble` endpoint) OR handle via FFmpeg if available
- For v1: create a simple concat of scene clips with audio overlay
- Upload final.mp4 + thumbnail to R2
- Mark job complete

Parallel steps: voices, narration, sfx, music can all run in the same worker invocation if scenes step is also in progress. Check each independently.

- [ ] **Step 2: Add cron to vercel.json**

Add entry: `{ "path": "/api/cron/story-video-worker", "schedule": "* * * * *" }`

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/story-video-worker/route.ts vercel.json
git commit -m "feat(story-video): add pipeline worker with 7-step processing"
```

---

### Task 5: UI Components

**Files:**
- Create: `tools/story-video/book-selector.tsx`
- Create: `tools/story-video/settings-form.tsx`
- Create: `tools/story-video/job-progress.tsx`
- Create: `tools/story-video/video-player.tsx`

- [ ] **Step 1: Create book selector**

'use client' component. Fetches user's completed books from Story Studio.

Props: `{ onSelect: (bookId: string, bookTitle: string, pageCount: number) => void }`

- Fetch books from an API (or reuse existing story-studio API)
- Horizontal scrollable grid of book cover cards
- Each card: cover image, title, page count
- Only show books with status='complete'
- Selected state with blue glow ring

- [ ] **Step 2: Create settings form**

Props: `{ selectedBook: { id, title, pageCount } | null, onGenerate: (settings) => void, generating: boolean }`

- Art style pills: Cartoon / Anime / Pixar / Watercolor (from `ART_STYLES`)
- Duration pills: Auto / Short / Medium / Long
- Provider dropdown (Gemini only for v1)
- Credit estimate display (calculated from page count + duration)
- "Generate Video" button with credit cost badge
- Disabled when no book selected or generating

- [ ] **Step 3: Create job progress card**

Props: `{ job: StoryVideoJob, onRetry: (jobId, step?, sceneIndex?) => void }`

- 7-step progress bar (same pattern as VBlog)
- Scene status grid: grid of small dots/squares, each representing a scene
  - ✅ green = done, ⏳ blue pulse = generating, ❌ red = failed, ⚪ gray = pending
- Click failed scene → retry button
- When complete: show Watch/Download/Share buttons
- Relative timestamp

- [ ] **Step 4: Create video player**

Props: `{ job: StoryVideoJob }`

- `<video>` element with controls, poster=thumbnail
- Scene chapter markers (click to seek to scene start time)
- Download button (full video)
- Share link generation
- Individual scene clip download (expandable list)

- [ ] **Step 5: Commit**

```bash
git add tools/story-video/book-selector.tsx tools/story-video/settings-form.tsx tools/story-video/job-progress.tsx tools/story-video/video-player.tsx
git commit -m "feat(story-video): add UI components (book selector, settings, progress, player)"
```

---

### Task 6: Main Studio & Page Route

**Files:**
- Create: `tools/story-video/story-video-studio.tsx`
- Create: `app/tools/story-video/page.tsx`

- [ ] **Step 1: Create main studio**

'use client' default export composing all components.

State:
- `selectedBook: { id, title, pageCount } | null`
- `jobs: StoryVideoJob[]`
- `generating: boolean`

On mount: fetch jobs from `/api/v1/story-video/jobs`. Poll every 10s for active jobs.

Handlers:
- `handleGenerate(settings)`: POST `/api/v1/story-video/create`, add to jobs list
- `handleRetry(jobId, step?, sceneIndex?)`: POST retry endpoint

Layout:
```
Title: "Story" + gradient "Video Generator"
BookSelector
SettingsForm
Job list (JobProgress cards)
VideoPlayer (for selected completed job)
```

- [ ] **Step 2: Create page route**

Standard page with ToolBreadcrumb, dark theme, max-w-4xl.

- [ ] **Step 3: Commit**

```bash
git add tools/story-video/story-video-studio.tsx app/tools/story-video/page.tsx
git commit -m "feat(story-video): add main studio and page route"
```

---

### Task 7: Tool Registration

**Files:**
- Modify: `lib/tools.tsx`
- Modify: `components/home/bento-showcase.tsx`

- [ ] **Step 1: Add to tools list**

```ts
{
  name: 'Story Video',
  href: '/tools/story-video',
  description: 'Turn storybooks into AI cartoon videos',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125m1.5 3.75c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125" />
    </svg>
  ),
  color: 'from-violet-500 to-fuchsia-500',
}
```

- [ ] **Step 2: Add to bento showcase**

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add lib/tools.tsx components/home/bento-showcase.tsx
git commit -m "feat(story-video): register tool in navigation and homepage"
```
