# Story Studio: Queue + Mobile — Implementation Plan

**Design doc**: `2026-03-11-story-studio-queue-mobile-design.md`
**Date**: 2026-03-11

---

## Phase 1: Core Queue Infrastructure (Priority A — Resilience)

### Step 1.1 — Database Migration
- Create `book_jobs` table with indexes
- Add RPC helpers: `get_user_active_jobs(p_user_id)`, `update_job_state(p_job_id, p_step, p_state, p_status)`
- Enable Realtime on `book_jobs` table (`ALTER PUBLICATION supabase_realtime ADD TABLE book_jobs`)

**Files:**
- `supabase/migrations/XXX_book_jobs.sql` (new)

### Step 1.2 — QStash Integration
- Install `@upstash/qstash` package
- Add env vars: `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
- Create helper: `lib/story/queue.ts` — publish step, verify signature, retry config
- QStash signature verification middleware for all job step routes

**Files:**
- `lib/story/queue.ts` (new)
- `.env.local` (add QStash vars)

### Step 1.3 — R2 Seed Buffer Helpers
- Create helper: `lib/story/r2-seeds.ts` — upload/download seed buffers to R2 under `jobs/{jobId}/seed-{page}`
- Cleanup helper: delete all seeds for a job on completion or expiry

**Files:**
- `lib/story/r2-seeds.ts` (new)

### Step 1.4 — Job Creation Endpoint
- `POST /api/v1/story/jobs` — validates input, checks concurrent job limit (max 3), reserves credits, creates `book_jobs` row, publishes first step to QStash
- Returns `{ jobId }` immediately (no SSE)

**Files:**
- `app/api/v1/story/jobs/route.ts` (new)

### Step 1.5 — Refactor Generation Into Step Routes
Extract existing logic from `app/api/v1/story/generate/route.ts` into separate step routes. Each step follows the idempotent pattern: read state → check if done → do work → write state → trigger next.

**Routes (all new):**
- `app/api/v1/story/jobs/[id]/story-bible/route.ts` — extracts from existing `generateStoryBible()` in `lib/story/enrich.ts`
- `app/api/v1/story/jobs/[id]/story-draft/route.ts` — extracts from existing `generateStoryDraft()`
- `app/api/v1/story/jobs/[id]/validate/route.ts` — extracts from existing validation logic
- `app/api/v1/story/jobs/[id]/character-ref/route.ts` — extracts from existing character ref generation
- `app/api/v1/story/jobs/[id]/cover/route.ts` — extracts from existing cover illustration logic in `lib/story/illustrate.ts`
- `app/api/v1/story/jobs/[id]/illustrate-page/route.ts` — extracts per-page illustration logic, reads seed from R2, writes seed to R2, triggers next page or TTS batch
- `app/api/v1/story/jobs/[id]/tts-page/route.ts` — extracts per-page TTS logic from `lib/story/tts.ts`, checks if last TTS to trigger save
- `app/api/v1/story/jobs/[id]/save/route.ts` — assembles final book from state JSONB, inserts into `books` table, confirms credits, sets job `status: 'completed'`

**Shared step helpers:**
- `lib/story/job-step.ts` (new) — `withJobStep(jobId, stepName, handler)` wrapper that handles: read job, idempotency check, error handling, state write, QStash signature verification

### Step 1.6 — Job Status Endpoint
- `GET /api/v1/story/jobs` — list user's active/recent jobs (for initial page load)
- `GET /api/v1/story/jobs/[id]` — get single job detail (state, progress)
- `POST /api/v1/story/jobs/[id]/retry` — re-publish failed step to QStash, reset retry count

**Files:**
- `app/api/v1/story/jobs/route.ts` (extend GET)
- `app/api/v1/story/jobs/[id]/route.ts` (new)
- `app/api/v1/story/jobs/[id]/retry/route.ts` (new)

### Step 1.7 — Client-Side: Realtime + Progress Hook
- Create `useJobProgress(userId)` hook — fetches active jobs on mount, subscribes to Supabase Realtime on `book_jobs`, exposes: `jobs[]`, `isSubscribed`
- Parse `current_step` + `state` into human-readable progress (e.g., "Illustrating page 4 of 12")
- Toast notification when a job's status changes to `completed`

**Files:**
- `tools/story-studio/use-job-progress.ts` (new)

### Step 1.8 — Bookshelf: In-Progress Section
- Add "In Progress" section above existing book grid on bookshelf page
- Each card shows: title (from `input.concept`), progress bar, current step label, status badge
- Failed jobs show retry button
- Completed jobs auto-disappear (book appears in main grid)
- Tap card → drill into job detail (Phase 3, for now just show progress)

**Files:**
- `app/tools/story-studio/bookshelf/page.tsx` (modify)
- `tools/story-studio/job-card.tsx` (new)

### Step 1.9 — Update Generation Flow in Main Page
- Replace SSE streaming with job submission: wizard "Generate" button calls `POST /api/v1/story/jobs`, receives `jobId`, redirects to bookshelf or shows "Generation started" state
- Remove SSE client code from `useStoryBook` hook
- Keep wizard phases 1-2 (Input + Refine) as-is — they are pre-generation and stay client-side
- Phase 3 (Generating) becomes: "Your book is being generated in the background. You can leave this page."
- Phase 4 (Viewer) loads from DB once job completes

**Files:**
- `app/tools/story-studio/page.tsx` (modify)
- `tools/story-studio/use-story-book.ts` (modify — remove SSE, add job submission)

### Step 1.10 — Deprecate SSE Generation Route
- Mark `app/api/v1/story/generate/route.ts` as deprecated
- Keep temporarily for rollback safety
- Remove after queue is stable

**Files:**
- `app/api/v1/story/generate/route.ts` (add deprecation warning, eventually remove)

---

## Phase 2: Mobile UX (Priority D)

### Step 2.1 — MobileShell Opt-Out
- Add Story Studio paths to an exclusion list in MobileShell/ToolsTab
- When pathname starts with `/tools/story-studio`, skip ToolsTab wrapping — render children directly

**Files:**
- `components/mobile/tools-tab.tsx` (modify — add FULL_SCREEN_PATHS check)
- `components/mobile/mobile-shell.tsx` (modify if needed)

### Step 2.2 — Story Studio Custom Mobile Header
- Create a Story Studio-specific mobile header component
- Back chevron (left) + page title (center) + hamburger menu icon (right)
- Hamburger opens sidebar as full-height left overlay (z-30+)
- Sidebar contains: Home, Bookshelf, Series, New Book links

**Files:**
- `tools/story-studio/mobile-header.tsx` (new)
- `tools/story-studio/mobile-sidebar.tsx` (new)

### Step 2.3 — Apply Custom Layout to All Story Studio Pages
- Wrap Story Studio pages with the custom mobile header
- Full viewport height, no bottom tab bar padding
- Respect device safe-area-inset only

**Files:**
- `app/tools/story-studio/layout.tsx` (new or modify)
- `app/tools/story-studio/page.tsx` (modify)
- `app/tools/story-studio/bookshelf/page.tsx` (modify)
- `app/tools/story-studio/series/page.tsx` (modify)
- `app/tools/story-studio/series/[id]/page.tsx` (modify)

---

## Phase 3: Nice-to-Haves (B + C)

### Step 3.1 — Concurrent Job Limit
- Already built into Step 1.4 (job creation checks active count)
- UI: if limit reached, show message "You have 3 books generating. Wait for one to finish."

### Step 3.2 — Job Detail View
- New page: `/tools/story-studio/jobs/[id]` — detailed step-by-step progress
- Show completed illustrations as preview thumbnails
- Show step timeline: completed (green), current (blue/spinning), pending (gray)
- Retry button for failed step

**Files:**
- `app/tools/story-studio/jobs/[id]/page.tsx` (new)
- `tools/story-studio/job-detail.tsx` (new)

---

## Phase 4: Notifications V2 (Future)

### Step 4.1 — Browser Push Notifications
- Service worker registration
- Permission request UX
- Send push on job completion via web-push

### Step 4.2 — Email Notifications
- SMTP/SES integration
- Email template for book completion
- User preference toggle

---

## Implementation Order

```
1.1  Database migration          ← start here
1.2  QStash integration
1.3  R2 seed helpers
1.4  Job creation endpoint
1.5  Step routes (biggest task — refactor generation logic)
1.6  Job status endpoints
1.7  Client realtime hook
1.8  Bookshelf in-progress UI
1.9  Update wizard flow
1.10 Deprecate SSE
---
2.1  MobileShell opt-out
2.2  Custom mobile header
2.3  Apply to all Story Studio pages
---
3.1  Concurrent limit UI
3.2  Job detail view
```

## Key Dependencies

- **QStash account** — Sign up at upstash.com, get tokens
- **Supabase Realtime** — Must be enabled on `book_jobs` table
- **R2** — Already configured (existing env vars)
- **Vercel** — No new infra needed, step routes are regular API routes
