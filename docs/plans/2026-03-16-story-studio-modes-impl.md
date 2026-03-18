# Story Studio — Speed Mode & Professional Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two creation modes (Speed & Professional) to Story Studio with mode-dependent pipeline steps, post-generation routing, and bulk-generate buttons for Speed Mode.

**Architecture:** Single pipeline with a `mode` field on `book_jobs` and `books`. The queue orchestrator skips steps based on mode. `CreateStoryModal` becomes a mode selector. Speed Mode books get bulk-generate UI on the book view page. Professional Mode routes to the existing `StoryEditor`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase (RLS + RPCs), Tailwind CSS v4, pnpm

**Design Doc:** `docs/plans/2026-03-16-story-studio-modes.md`

---

## Task 1: Database Migration — Add `mode` column

**Files:**
- Create: `supabase/migrations/020_story_modes.sql`

**Step 1: Write the migration**

```sql
-- Add mode column to book_jobs
ALTER TABLE public.book_jobs
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'speed';

ALTER TABLE public.book_jobs
  ADD CONSTRAINT book_jobs_mode_check CHECK (mode IN ('speed', 'professional'));

-- Add mode column to books
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'speed';

ALTER TABLE public.books
  ADD CONSTRAINT books_mode_check CHECK (mode IN ('speed', 'professional'));

-- Update create_book_job RPC to accept mode
CREATE OR REPLACE FUNCTION public.create_book_job(
  p_user_id UUID,
  p_series_id UUID DEFAULT NULL,
  p_total_pages INT DEFAULT 0,
  p_input JSONB DEFAULT '{}',
  p_mode TEXT DEFAULT 'speed'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO public.book_jobs (user_id, series_id, status, current_step, total_pages, input, state, mode)
  VALUES (p_user_id, p_series_id, 'scheduled', 'story_bible', p_total_pages, p_input, '{}', p_mode)
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;
```

**Step 2: Apply migration via Supabase MCP**

Run: `mcp__supabase__apply_migration` with name `story_modes` and the SQL above.

**Step 3: Commit**

```bash
git add supabase/migrations/020_story_modes.sql
git commit -m "feat(story-studio): add mode column to book_jobs and books tables"
```

---

## Task 2: Update TypeScript types and Zod schema

**Files:**
- Modify: `lib/story/types.ts` (line 38–47, `generateRequestSchema`)
- Modify: `tools/story-studio/types.ts` (add StudioMode type)

**Step 1: Add mode to generateRequestSchema**

In `lib/story/types.ts`, add `mode` field to `generateRequestSchema`:

```typescript
export const generateRequestSchema = z.object({
  plot: z.string().min(10).max(2000),
  concept: storyConceptSchema,
  seriesId: z.string().uuid().optional(),
  characterIds: z.array(z.string().uuid()).optional(),
  artStyle: z.string().max(100).optional(),
  skipIllustration: z.boolean().optional(),
  skipAudio: z.boolean().optional(),
  skipValidation: z.boolean().optional(),
  mode: z.enum(['speed', 'professional']).default('speed'),
})
```

**Step 2: Add StudioMode type**

In `tools/story-studio/types.ts`, add:

```typescript
export type StudioMode = 'speed' | 'professional'
```

**Step 3: Commit**

```bash
git add lib/story/types.ts tools/story-studio/types.ts
git commit -m "feat(story-studio): add mode to generation schema and types"
```

---

## Task 3: Update queue orchestrator — mode-aware step routing

**Files:**
- Modify: `lib/story/queue.ts` (lines 169–225, `getNextStep`)

**Step 1: Add mode to getNextStep context**

Update the `context` parameter of `getNextStep` to include `mode`:

```typescript
export function getNextStep(
  currentStep: PipelineStep,
  context: {
    totalPages: number
    currentPage?: number
    completedTtsCount?: number
    skipIllustration?: boolean
    skipAudio?: boolean
    mode?: 'speed' | 'professional'  // NEW
  },
): { step: PipelineStep; params?: Record<string, string> } | 'tts_batch' | null {
```

**Step 2: Update the switch cases for Speed Mode**

Speed Mode pipeline: `story_draft` → `cover` → `save` (skip bible, validate, character_ref)

The first step triggered is `story_bible`. For Speed Mode, the `story_bible` step route needs to skip itself and trigger `story_draft` directly. This is handled by the step route (Task 5), but `getNextStep` also needs updating:

```typescript
case 'story_bible':
  if (context.mode === 'speed') {
    // Speed mode: story_bible was skipped, go straight to cover after draft
    return { step: 'story_draft' }
  }
  return { step: 'story_draft' }

case 'story_draft':
  if (context.mode === 'speed') {
    // Speed mode: skip validate, character_ref — go straight to cover
    return { step: 'cover' }
  }
  return { step: 'validate' }

case 'validate':
  if (context.skipIllustration) {
    return context.skipAudio ? { step: 'save' } : 'tts_batch'
  }
  return { step: 'character_ref' }

case 'cover':
  if (context.mode === 'speed' || context.skipIllustration) {
    // Speed mode: no page illustrations — skip to save (or TTS if not skipped)
    if (context.skipAudio !== false && context.mode === 'speed') return { step: 'save' }
    if (context.skipIllustration) {
      return context.skipAudio ? { step: 'save' } : 'tts_batch'
    }
  }
  return { step: 'illustrate_page', params: { page: '1' } }
```

Wait — let's simplify. Speed Mode always does: `story_draft` → `cover` → `save`. Illustrations and TTS are always skipped at generation time (added later via bulk). So:

```typescript
case 'story_draft':
  if (context.mode === 'speed') return { step: 'cover' }
  return { step: 'validate' }

case 'cover':
  if (context.mode === 'speed') return { step: 'save' }
  // Start sequential illustration chain with page 1
  return { step: 'illustrate_page', params: { page: '1' } }
```

The `validate` and `character_ref` cases stay unchanged (only reached in Professional Mode).

**Step 3: Commit**

```bash
git add lib/story/queue.ts
git commit -m "feat(story-studio): mode-aware step routing in queue orchestrator"
```

---

## Task 4: Update job creation API — pass mode through

**Files:**
- Modify: `app/api/v1/story/jobs/route.ts` (lines 30, 69–74, 95)

**Step 1: Extract mode from parsed data**

At line 30, add `mode` to destructuring:

```typescript
const { plot, concept, seriesId, characterIds, artStyle, skipIllustration, skipAudio, skipValidation, mode } = parsed.data
```

**Step 2: Pass mode to create_book_job RPC**

At lines 69–74, add `p_mode`:

```typescript
const { data: job, error: insertError } = await supabase.rpc('create_book_job', {
  p_user_id: userId,
  p_series_id: seriesId ?? null,
  p_total_pages: concept.tags.pageCount,
  p_input: { plot, concept, seriesId, characterIds, artStyle, skipIllustration, skipAudio, skipValidation, mode } as unknown as undefined,
  p_mode: mode ?? 'speed',
})
```

**Step 3: Change first triggered step based on mode**

At line 95, Speed Mode should skip `story_bible` and start with `story_draft`:

```typescript
const firstStep = mode === 'speed' ? 'story_draft' : 'story_bible'
const p = triggerNextStep(jobId, firstStep)
if (IS_DEV && p) await p
```

**Step 4: Commit**

```bash
git add app/api/v1/story/jobs/route.ts
git commit -m "feat(story-studio): pass mode to job creation and first step"
```

---

## Task 5: Update step routes — pass mode to getNextStep

**Files:**
- Modify: Each step route under `app/api/v1/story/jobs/[id]/` that calls `getNextStep`

The step routes use a `withJobStep` helper or call `getNextStep` directly. Each needs to read `mode` from the job's `input` JSONB and pass it to `getNextStep`.

**Step 1: Find where getNextStep is called**

Search for `getNextStep` usage in step route files. Each step route reads the job row, does its work, then calls `getNextStep(step, context)` to determine what to trigger next.

The `mode` is stored in the job's `input` JSONB (as `input.mode`) AND as a top-level column. Read it from the job row:

```typescript
const mode = (job.mode as string) || (job.input as Record<string, unknown>)?.mode as string || 'speed'
```

Then pass `mode` in the context:

```typescript
const next = getNextStep(currentStep, {
  totalPages: job.total_pages,
  currentPage,
  skipIllustration: input.skipIllustration,
  skipAudio: input.skipAudio,
  mode,  // NEW
})
```

**Step 2: Update each step route that calls getNextStep**

Files to update (add `mode` to the context object passed to `getNextStep`):
- `app/api/v1/story/jobs/[id]/story-bible/route.ts`
- `app/api/v1/story/jobs/[id]/story-draft/route.ts`
- `app/api/v1/story/jobs/[id]/validate/route.ts`
- `app/api/v1/story/jobs/[id]/character-ref/route.ts`
- `app/api/v1/story/jobs/[id]/cover/route.ts`
- `app/api/v1/story/jobs/[id]/illustrate-page/route.ts`
- `app/api/v1/story/jobs/[id]/tts-page/route.ts`
- `app/api/v1/story/jobs/[id]/save/route.ts`

For each file, find the `getNextStep` call and add `mode` to the context. The mode can be read from the job input: `(job.input as Record<string, unknown>)?.mode as string || 'speed'`.

**Step 3: Update save route — copy mode to books table**

In `app/api/v1/story/jobs/[id]/save/route.ts`, when the book is created/saved, include `mode`:

```typescript
// When inserting into books table, include mode
mode: (job.input as Record<string, unknown>)?.mode as string || 'speed'
```

**Step 4: Commit**

```bash
git add app/api/v1/story/jobs/
git commit -m "feat(story-studio): pass mode through all pipeline step routes"
```

---

## Task 6: Replace CreateStoryModal with mode selection

**Files:**
- Modify: `tools/story-studio/stories/create-story-modal.tsx`

**Step 1: Rewrite modal to be mode selector**

Replace the current "Generate with AI" / "Write from scratch" two-button modal with a three-option modal:

1. **Speed Mode** — lightning bolt icon, "Quick story with cover. Add illustrations & narration later.", credit cost
2. **Professional Mode** — palette icon, "Full creative control. Edit each page, fine-tune illustrations & narration.", credit cost
3. **Write from scratch** — pen icon (keep existing), "Free"

Update props:

```typescript
interface CreateStoryModalProps {
  open: boolean
  onClose: () => void
  onSelectMode: (mode: 'speed' | 'professional') => void
  onWriteFromScratch: () => void
}
```

The modal layout: title "Create a New Story", three vertically stacked cards with the same styling as the current buttons but with mode-specific icons, descriptions, and credit indicators.

**Step 2: Commit**

```bash
git add tools/story-studio/stories/create-story-modal.tsx
git commit -m "feat(story-studio): replace create modal with mode selection"
```

---

## Task 7: Wire mode through the creation flow

**Files:**
- Modify: `tools/story-studio/use-story-book.ts` (add mode state)
- Modify: `app/tools/story-studio/page.tsx` (pass mode through flow)
- Modify: `tools/story-studio/refinement-chat.tsx` (carry mode to onGenerate)

**Step 1: Add mode state to useStoryBook hook**

In `tools/story-studio/use-story-book.ts`:

```typescript
// Add after line 103
const [mode, setMode] = useState<'speed' | 'professional'>('speed')
```

Update `startGeneration` (line 159) to include mode in the POST body:

```typescript
body: JSON.stringify({
  plot: plotText,
  concept,
  mode,  // NEW
  ...(seriesId ? { seriesId } : {}),
  // ... rest stays the same
})
```

Update `reset` (line 85) to reset mode:

```typescript
setMode('speed')
```

Add `mode` and `setMode` to the return object (line 212).

**Step 2: Update stories page to handle mode selection**

In `app/tools/story-studio/page.tsx`:

Replace `handleCreateAI` (line 69) with `handleSelectMode`:

```typescript
const handleSelectMode = useCallback((selectedMode: 'speed' | 'professional') => {
  setShowCreateModal(false)
  storyBook.reset()
  storyBook.setMode(selectedMode)
  if (urlSeriesId) storyBook.setSeriesId(urlSeriesId)
  setView('create-ai')
}, [storyBook, urlSeriesId])
```

Update `CreateStoryModal` usage (line 217):

```tsx
<CreateStoryModal
  open={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onSelectMode={handleSelectMode}
  onWriteFromScratch={handleWriteFromScratch}
/>
```

**Step 3: Update job completion handler for mode-based routing**

In `app/tools/story-studio/page.tsx`, the completion handler (line 46–66) currently always routes to the editor. For Speed Mode, route to the bookshelf instead:

```typescript
useEffect(() => {
  if (!completedJobId) return
  let cancelled = false
  async function openCompletedBook() {
    try {
      const res = await fetch(`/api/v1/story/jobs/${completedJobId}`)
      if (!res.ok) return
      const { job } = await res.json()
      if (cancelled) return
      if (job?.book_id) {
        storiesList.refresh()
        storyBook.reset()
        const jobMode = job.input?.mode || 'speed'
        if (jobMode === 'professional') {
          router.push(`/tools/story-studio/edit/${job.book_id}`)
        } else {
          // Speed mode: go to bookshelf (book is ready to view)
          router.push('/tools/story-studio/bookshelf')
        }
      }
    } catch { /* ignore */ }
    finally { if (!cancelled) clearCompletion() }
  }
  openCompletedBook()
  return () => { cancelled = true }
}, [completedJobId, clearCompletion, storiesList, storyBook, router])
```

**Step 4: Update RefinementChat — hide generation options table for Speed Mode**

In `tools/story-studio/refinement-chat.tsx`, the options table (showing toggles for illustrations, narration, etc.) should be hidden for Speed Mode since those are always skipped. Pass mode as a prop:

```typescript
interface RefinementChatProps {
  concept: StoryConcept
  onConceptUpdate: (concept: StoryConcept) => void
  onGenerate: (concept: StoryConcept, options?: { skipIllustration?: boolean; skipAudio?: boolean; skipValidation?: boolean }) => void
  onBack: () => void
  loading: boolean
  mode?: 'speed' | 'professional'  // NEW
}
```

For Speed Mode: auto-set `skipIllustration=true`, `skipAudio=true`, `skipValidation=true` when calling `onGenerate`. Hide or simplify the options table.

In `page.tsx`, pass mode to RefinementChat:

```tsx
<RefinementChat
  concept={selectedConcept}
  onConceptUpdate={setSelectedConcept}
  onGenerate={(concept, options) => startGeneration(plot || '', concept, options)}
  onBack={() => setPhase('input')}
  loading={loading}
  mode={storyBook.mode}
/>
```

**Step 5: Commit**

```bash
git add tools/story-studio/use-story-book.ts app/tools/story-studio/page.tsx tools/story-studio/refinement-chat.tsx
git commit -m "feat(story-studio): wire mode through creation flow and routing"
```

---

## Task 8: Bulk generate buttons for Speed Mode books

**Files:**
- Modify: `app/tools/story-studio/book/[slug]/page.tsx` (or the client component it renders)
- Create: `tools/story-studio/bulk-generate-actions.tsx`

**Step 1: Create BulkGenerateActions component**

New component that shows two buttons for Speed Mode books:

```typescript
// tools/story-studio/bulk-generate-actions.tsx
'use client'

interface BulkGenerateActionsProps {
  bookId: string
  mode: string
  hasIllustrations: boolean  // already has illustrations
  hasNarration: boolean      // already has narration
}
```

The component renders:
- **"Generate All Illustrations"** button — POST to a new API endpoint (or reuse existing illustration batch endpoint)
- **"Generate All Narration"** button — shows voice selector first, then triggers batch TTS
- Progress indicators while generating
- Only visible when `mode === 'speed'`
- Buttons are disabled if already generated

**Step 2: Wire into book view page**

The book view page (`app/tools/story-studio/book/[slug]/page.tsx`) renders `BookReaderClient`. The bulk generate actions should appear above the reader when `book.mode === 'speed'` and illustrations/narration are missing.

Pass `mode` from the book data to the client component.

**Step 3: Create bulk illustration API endpoint**

Create: `app/api/v1/story/books/[id]/bulk-illustrate/route.ts`

This endpoint:
1. Authenticates user
2. Loads book data
3. Reserves credits (per-page cost × page count)
4. Triggers illustration generation for all pages
5. Returns job/progress ID

**Step 4: Create bulk narration API endpoint**

Create: `app/api/v1/story/books/[id]/bulk-narrate/route.ts`

This endpoint:
1. Authenticates user
2. Accepts narrator voice selection
3. Reserves credits
4. Triggers TTS for all pages
5. Returns job/progress ID

**Step 5: Commit**

```bash
git add tools/story-studio/bulk-generate-actions.tsx app/tools/story-studio/book/ app/api/v1/story/books/
git commit -m "feat(story-studio): add bulk generate buttons for speed mode books"
```

---

## Task 9: Update credit costs for mode-based pricing

**Files:**
- Modify: `lib/story/validation.ts` (CREDIT_COSTS)
- Modify: `app/api/v1/story/jobs/route.ts` (lines 45–66, credit reservation)

**Step 1: Add mode-specific credit costs**

In `lib/story/validation.ts`, update `CREDIT_COSTS`:

```typescript
export const CREDIT_COSTS = {
  generate: 50,        // Professional mode (legacy, kept for compat)
  speedGenerate: 20,   // Speed mode: draft + cover only
  professionalGenerate: 50,  // Professional mode: full pipeline
  illustratePage: 5,   // Per-page illustration (bulk add-on)
  narratePage: 3,      // Per-page narration (bulk add-on)
}
```

**Step 2: Use mode-specific cost in job creation**

In `app/api/v1/story/jobs/route.ts`, select credit cost based on mode:

```typescript
const creditCost = mode === 'speed' ? CREDIT_COSTS.speedGenerate : CREDIT_COSTS.professionalGenerate
```

Use `creditCost` instead of `CREDIT_COSTS.generate` in the reservation call.

**Step 3: Commit**

```bash
git add lib/story/validation.ts app/api/v1/story/jobs/route.ts
git commit -m "feat(story-studio): mode-specific credit pricing"
```

---

## Task 10: Update progress computation for Speed Mode

**Files:**
- Modify: `tools/story-studio/use-job-progress.ts` (lines 37–91, `computeProgress`)

**Step 1: Adjust progress weights for Speed Mode**

Speed Mode only has 3 steps (draft → cover → save). The current progress weights assume 8 steps. For Speed Mode jobs, rebalance:

```typescript
function computeProgress(job: ActiveJob): { percent: number; label: string } {
  const total = job.total_pages || 12
  // Detect speed mode from current_step progression
  // Speed mode jobs never hit story_bible, validate, or character_ref
  const isSpeedMode = job.current_step === 'story_draft' && !job.cover_url
    // Better: check if mode is available. For now, use step-based heuristic
    // or add mode to ActiveJob interface

  let percent = 0
  let label = getStepLabel(job.current_step, undefined, total)

  switch (job.current_step) {
    case 'story_bible':
      percent = 5
      break
    case 'story_draft':
      percent = 15   // same for both modes
      break
    case 'validate':
      percent = 25
      break
    case 'character_ref':
      percent = 35
      break
    case 'cover':
      percent = 50
      break
    // ... rest unchanged
  }
```

Actually — the simplest approach is to add `mode` to the `ActiveJob` interface and the `get_user_active_jobs` RPC, then branch on it.

**Step 2: Add mode to get_user_active_jobs RPC**

Apply migration to add `mode` to the RPC return:

```sql
CREATE OR REPLACE FUNCTION public.get_user_active_jobs(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  status TEXT,
  current_step TEXT,
  total_pages INT,
  title TEXT,
  cover_url TEXT,
  pages_completed INT,
  audio_completed INT,
  error_message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  mode TEXT  -- NEW
)
```

Add `bj.mode` to the SELECT.

**Step 3: Update ActiveJob interface**

In `tools/story-studio/use-job-progress.ts`, add `mode` to `ActiveJob`:

```typescript
export interface ActiveJob {
  // ... existing fields
  mode: 'speed' | 'professional'
}
```

**Step 4: Update computeProgress for speed mode**

```typescript
function computeProgress(job: ActiveJob): { percent: number; label: string } {
  const total = job.total_pages || 12
  let percent = 0
  let label = getStepLabel(job.current_step, undefined, total)

  if (job.mode === 'speed') {
    // Speed: story_draft(33%) → cover(66%) → save(90%) → done(100%)
    switch (job.current_step) {
      case 'story_draft': percent = 15; break
      case 'cover': percent = 50; break
      case 'save': percent = 90; break
      case 'done': percent = 100; label = 'Complete!'; break
      default: percent = 0
    }
  } else {
    // Professional: existing weights (unchanged)
    // ... keep existing switch
  }

  return { percent: Math.min(Math.round(percent), 100), label }
}
```

**Step 5: Commit**

```bash
git add supabase/migrations/ tools/story-studio/use-job-progress.ts
git commit -m "feat(story-studio): mode-aware progress computation"
```

---

## Task 11: Update bookshelf page — show mode badge

**Files:**
- Modify: `app/tools/story-studio/bookshelf/page.tsx`

**Step 1: Add mode to BookItem interface**

```typescript
interface BookItem {
  // ... existing fields
  mode: 'speed' | 'professional'
}
```

**Step 2: Show mode badge on book cards**

Add a small badge (like the existing style badge) showing "Speed" or "Pro" on each book card. This helps users identify which books can have illustrations/narration added.

**Step 3: Add "Open Editor" link for Speed Mode books**

For Speed Mode books on the bookshelf, add an "Edit" button alongside Share/Delete that opens the StoryEditor, letting users switch to full editing if desired.

**Step 4: Commit**

```bash
git add app/tools/story-studio/bookshelf/page.tsx
git commit -m "feat(story-studio): show mode badge and editor link on bookshelf"
```

---

## Task Summary

| Task | Description | Files | Estimated |
|------|-------------|-------|-----------|
| 1 | DB migration — mode columns + RPC | 1 new SQL | Small |
| 2 | TypeScript types — mode in schema | 2 modified | Small |
| 3 | Queue orchestrator — mode routing | 1 modified | Medium |
| 4 | Job creation API — pass mode | 1 modified | Small |
| 5 | Step routes — pass mode to getNextStep | 8 modified | Medium |
| 6 | CreateStoryModal — mode selector UI | 1 modified | Medium |
| 7 | Wire mode through flow | 3 modified | Large |
| 8 | Bulk generate buttons + APIs | 1 new component, 2 new API routes | Large |
| 9 | Credit pricing by mode | 2 modified | Small |
| 10 | Progress computation | 1 migration, 1 modified | Medium |
| 11 | Bookshelf mode badge | 1 modified | Small |

**Critical path:** Tasks 1–5 (backend) → Task 6–7 (UI flow) → Task 8 (bulk generate) → Tasks 9–11 (polish)
