# Story Studio: Background Queue Generation + Mobile UX Redesign

**Date**: 2026-03-11
**Status**: Approved (brainstorming complete)
**Priority**: A (resilience) + D (mobile UI) are must-haves; B (concurrency) + C (progress tracking) are nice-to-haves

---

## Understanding Summary

- **What**: Redesign Story Studio's generation pipeline from synchronous SSE-streaming to a background queue with checkpoint/resume, plus fix mobile UI where the sidebar FAB is hidden behind the MobileShell tab bar
- **Why**: If generation fails mid-way (SSE connection drop or illustration timeout), all progress is lost — user wastes time and credits. Mobile UI is partially unusable due to tab bar overlap.
- **Who**: Toolk1t users creating AI picture books on desktop and mobile
- **Key constraints**: Must work within existing Vercel serverless + Supabase stack. In-house Postgres queue + Vercel Cron (no external queue service). Minimal rewrite of existing generation logic.
- **Priorities**: Resilience/checkpoint-resume and mobile UI are must-haves. Concurrent books and progress tracking are nice-to-haves that fall out naturally from the queue architecture.
- **Non-goals**: Push notifications and email notifications are Phase 2. No change to the 4-phase wizard UX itself.

---

## Assumptions

1. ~50-500 books/month initially, scaling to 2,500+
2. Max 3 retries per step before parking as "needs attention"
3. In-house Postgres queue + Vercel Cron ($0 — no external queue service)
4. In-progress jobs retained 30 days
5. Credits released if generation permanently fails
6. Soft limit of 3 concurrent generating books per user
7. Users accept 5-15 min generation time
8. Mobile Story Studio should feel like a dedicated app (full-screen, not constrained by generic tool shell)

---

## Architecture Overview

### Current Flow (Being Replaced)

```
User stays on page → SSE stream for 5-15 min → if connection drops, all work lost
```

### New Flow

```
User submits → job created in DB → credits reserved → step routes self-chain via fetch()
→ each step: read state from DB → do work → write state to DB → fire-and-forget next step
→ Vercel Cron (every 1 min) picks up any stuck jobs as safety net
→ user can leave and return → realtime updates via Supabase → notification on completion
```

---

## Part 1: Job State Machine + Database Schema

### State Machine

```
scheduled → running → completed
                ↘ retrying → running (retry)
                         ↘ failed (parked after 3 retries)
```

### New Table: `book_jobs`

```sql
CREATE TABLE book_jobs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id),
  book_id                 UUID REFERENCES books(id),           -- NULL until save step
  series_id               UUID REFERENCES series(id),           -- optional
  status                  TEXT NOT NULL DEFAULT 'scheduled',    -- scheduled|running|completed|failed
  current_step            TEXT NOT NULL DEFAULT 'story_bible',  -- which step is active
  input                   JSONB NOT NULL,                       -- original concept, plot, tags, series context
  state                   JSONB NOT NULL DEFAULT '{}',          -- accumulated outputs per step
  credits_reservation_id  UUID,                                 -- existing credit reservation
  retry_count             INT DEFAULT 0,
  error_message           TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_book_jobs_user_status ON book_jobs(user_id, status);
```

### State JSONB Structure (accumulated step-by-step)

```jsonc
{
  "bible": "...",                                               // after story_bible
  "draft": { "pages": [...] },                                  // after story_draft
  "validated": true,                                             // after validate
  "characterRefUrl": "https://r2.../...",                        // after character_ref
  "coverUrl": "https://r2.../...",                               // after cover
  "pages": [
    { "seq": 1, "imageUrl": "...", "seedBufferKey": "jobs/{id}/seed-1" },
    { "seq": 2, "imageUrl": "...", "seedBufferKey": "jobs/{id}/seed-2" }
  ],
  "audio": [
    { "seq": 1, "audioUrl": "..." }
  ]
}
```

Seed buffers (binary, potentially >4MB) stored in **R2** under `jobs/{job_id}/seed-{page}`, not in JSONB.

---

## Part 2: QStash Step Orchestration

### Step Routes

```
POST /api/v1/story/jobs              → create job, reserve credits, publish first step
POST /api/v1/story/jobs/[id]/story-bible
POST /api/v1/story/jobs/[id]/story-draft
POST /api/v1/story/jobs/[id]/validate
POST /api/v1/story/jobs/[id]/character-ref
POST /api/v1/story/jobs/[id]/cover
POST /api/v1/story/jobs/[id]/illustrate-page?page=N
POST /api/v1/story/jobs/[id]/tts-page?page=N
POST /api/v1/story/jobs/[id]/save
```

### Step Pattern (each route follows this)

```
1. Read job from DB (input + state)
2. Check if this step's output already exists in state → skip if yes (idempotent)
3. Do work (call Gemini/Imagen/TTS)
4. Write result to state JSONB + update current_step + updated_at
5. Publish next step to QStash
```

### Sequential Illustration Chain

```
illustrate-page?page=1 completes → writes imageUrl + uploads seed to R2 → triggers illustrate-page?page=2
illustrate-page?page=2 completes → reads seed from R2 → writes imageUrl + uploads seed → triggers page=3
... repeat for all pages
```

### Parallel TTS (after all illustrations)

```
illustrate-page?page=N (last) completes
  → publishes batch to QStash:
      tts-page?page=1, tts-page?page=2, ... tts-page?page=N
  → each TTS step writes to state.audio[]
  → each checks: count(completed audio) == total pages?
  → last one triggers /save
```

### Retry Handling

- QStash built-in retry: 3 attempts, exponential backoff
- Each step is idempotent — safe to call twice
- After 3 failures: step writes `status: 'failed'` + `error_message` to DB
- Credits released via `release_reserved_credits()` on permanent failure

---

## Part 3: Realtime Progress + In-App Notification

### Supabase Realtime Subscription

```typescript
supabase
  .channel('my-jobs')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'book_jobs',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Update UI: current_step, status, completed page count
  })
  .subscribe()
```

### User Experience

- **On bookshelf**: "In Progress" section at top showing active jobs with progress bar + current step label
- **Drill-in**: Tap a generating job → step-by-step progress, preview completed illustrations
- **Completion**: Toast notification: "Your book [Title] is ready!" with link to viewer
- **Failed state**: "Generation paused — tap to retry" with retry button (re-publishes failed step)
- **On return visit**: Client loads active `book_jobs` via REST, subscribes to realtime for live updates

### Notification Phases

- **Phase 1 (launch)**: In-app badge/toast + Supabase Realtime live updates
- **Phase 2 (later)**: Browser push notifications + email notifications

---

## Part 4: Mobile UI — Full-Screen Story Studio Layout

### Problem

MobileShell wraps all `/tools/*` pages with a tab bar + ToolsTab. The Story Studio FAB/sidebar is hidden behind the tab bar.

### Solution: Route-Based MobileShell Opt-Out

Story Studio paths skip ToolsTab wrapping entirely:

```
/tools/story-studio       → custom full-screen layout
/tools/story-studio/*     → custom full-screen layout
```

### Story Studio Mobile Layout

- **Header bar** (sticky top): Back chevron + title + hamburger menu icon (replaces FAB)
- **Sidebar**: Triggered from hamburger in header, slides from left as full-height overlay (z-index above content)
- **Content area**: Full viewport height, no bottom tab bar padding
- **Bottom safe area**: Only device safe-area-inset (notch/home indicator)

### Mobile Navigation

```
Story Studio (home)   ← header: "< Home"
  → Bookshelf         ← header: "< Story Studio"
  → Series            ← header: "< Story Studio"
  → New Book wizard   ← header: "< Story Studio" + phase pills
  → Book viewer       ← header: "< Back" (existing)
  → Job progress      ← header: "< Story Studio" (new)
```

---

## Part 5: Nice-to-Haves (Concurrency + Progress Tracking)

These fall out naturally from the queue architecture:

### B — Multiple Concurrent Books

- Each generation request creates a separate `book_jobs` row
- Soft limit: reject if user has >= 3 active jobs (`status IN ('scheduled', 'running')`)
- Jobs run independently — no shared state between jobs

### C — Progress Tracking Dashboard

Bookshelf layout with in-progress section:

```
┌─────────────────────────────┐
│ In Progress (2)             │
│ ┌─────────┐ ┌─────────┐    │
│ │ Title A  │ │ Title B  │   │
│ │ Page 4/12│ │ Failed   │   │
│ │ ████░░░░ │ │ [Retry]  │   │
│ └─────────┘ └─────────┘    │
├─────────────────────────────┤
│ My Books (12)               │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│ │   │ │   │ │   │ │   │   │
│ └───┘ └───┘ └───┘ └───┘   │
└─────────────────────────────┘
```

---

## Decision Log

| # | Decision | Alternatives Considered | Why |
|---|---|---|---|
| 1 | **In-house Postgres queue + Vercel Cron** | QStash ($0-1/mo, managed retry), Inngest ($50/mo, built-in checkpointing) | Zero external dependencies. Cron self-heals (never gives up, unlike QStash's finite retries). Sequential chaining requires DB writes anyway. $0 cost. |
| 2 | **Supabase Realtime** replaces SSE | SSE (current, fragile), Polling (wasteful) | SSE conflicts with queue arch (no long-lived connection). Realtime gives instant updates, already in stack |
| 3 | **In-app + Realtime** for launch notifications | Push notifications, email | Push needs service worker + permission UX. Email needs SMTP. Both deferred to Phase 2 |
| 4 | **Story Studio opts out of MobileShell** | Adjust FAB position, hide tab bar conditionally | Full-screen custom layout gives native-app feel for content creation tool |
| 5 | **Separate API route per step** | Single monolithic function, edge functions | Each step independently retryable/idempotent. Fits Vercel serverless timeout limits. Reuses existing Node.js code |
| 6 | **R2 for seed buffers** | Store in JSONB, Inngest step cache | Binary buffers can exceed 4MB. R2 already configured |
| 7 | **Soft limit 3 concurrent jobs** | No limit, hard limit | Prevents abuse while allowing multi-book workflow |
| 8 | **Idempotent steps** | Rely on retry count only | If QStash delivers twice, step checks existing state and skips. Prevents duplicate work/charges |

---

## Risk Register

| Risk | Mitigation |
|---|---|
| QStash outage blocks all generation | Retry with backoff. Manual re-trigger via admin if extended. QStash 99.99% SLA |
| Seed buffer lost in R2 mid-chain | Illustration step checks R2 for previous seed. If missing, regenerate previous page (extra time, not credits) |
| Realtime subscription missed during mobile sleep | On app resume, fetch current job state via REST. Realtime is supplementary |
| User submits then deletes account | Cleanup cron: delete orphaned jobs + R2 assets after 30 days |

---

## Implementation Phases

### Phase 1 — Core Queue (Priority A: Resilience)
1. Create `book_jobs` table + migration
2. Set up QStash integration (publish/verify)
3. Refactor generation into step routes (reuse existing `lib/story/` code)
4. Implement idempotent step pattern
5. R2 seed buffer storage
6. Job creation endpoint with credit reservation
7. Realtime progress subscription on client
8. In-progress cards on bookshelf
9. Retry/resume UI for failed jobs
10. Remove SSE generation flow

### Phase 2 — Mobile UX (Priority D)
1. MobileShell opt-out for Story Studio routes
2. Story Studio custom mobile header with hamburger sidebar
3. Full-screen layout (no tab bar)
4. Mobile navigation hierarchy

### Phase 3 — Nice-to-Haves (B + C)
1. Concurrent job soft limit (3)
2. Progress tracking dashboard with drill-in
3. Job detail view with illustration previews

### Phase 4 — Notifications V2
1. Browser push notifications (service worker)
2. Email notifications on completion
