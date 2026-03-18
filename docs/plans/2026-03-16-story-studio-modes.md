# Story Studio — Speed Mode & Professional Mode

**Date:** 2026-03-16
**Status:** Approved
**Branch:** TBD

---

## Summary

Add two distinct creation modes to Story Studio:

- **Speed Mode** — Quick end-to-end story generation (draft + cover). Illustrations and narration are optional, added later via bulk-generate buttons.
- **Professional Mode** — Full creative control. Generates draft + cover, then opens the page-by-page editor for text editing, emotional tuning, per-page illustration, and per-page narration.

Both modes share the same entry flow: **mode selection → plot input → refinement chat → generate**.

---

## User Flow

```
┌─────────────────────┐
│   Mode Selection     │  ← Two cards: Speed / Professional
└────────┬────────────┘
         │
┌────────▼────────────┐
│   Plot Input         │  ← Same for both modes
└────────┬────────────┘
         │
┌────────▼────────────┐
│   Refinement Chat    │  ← AI refines the concept (both modes)
└────────┬────────────┘
         │
┌────────▼────────────┐
│   Generate           │  ← Pipeline differs by mode
└────────┬────────────┘
         │
    ┌────┴─────┐
    │          │
Speed      Professional
    │          │
    ▼          ▼
 Bookshelf   StoryEditor
 (done)      (edit pages → generate per page)
```

---

## Pipeline Steps by Mode

| Step | Speed Mode | Professional Mode |
|------|-----------|-------------------|
| `story_bible` | Skip | Run |
| `story_draft` | Run | Run |
| `validate` | Skip | Run |
| `character_ref` | Skip | Run |
| `cover` | Run | Run |
| `illustrate_page` | Skip (optional later) | Skip (per-page from editor) |
| `tts_page` | Skip (optional later) | Skip (per-page from editor) |
| `save` | Run | Run |

**Speed Mode pipeline:** `story_draft` → `cover` → `save`
**Professional Mode pipeline:** `story_bible` → `story_draft` → `validate` → `character_ref` → `cover` → `save`

---

## Mode Selection UI

Two cards at the start of the creation flow (stacked on mobile, side by side on desktop):

### Speed Mode Card
- Icon: lightning bolt or rocket
- Title: "Speed Mode"
- Description: "Quick story with cover. Add illustrations & narration later."
- Credit cost indicator (flat rate)

### Professional Mode Card
- Icon: palette or pen tool
- Title: "Professional Mode"
- Description: "Full creative control. Edit each page, fine-tune illustrations & narration."
- Credit cost indicator (based on page count)

Selecting a mode proceeds to plot input. The comparison table (free vs premium) is removed from the creation flow.

---

## Post-Generation Experience

### Speed Mode
- Job completes → book appears on bookshelf
- Book view shows two action buttons:
  - **"Generate All Illustrations"** — bulk illustration for all pages, uses default art style, shows progress
  - **"Generate All Narration"** — pick narrator voice, then bulk TTS for all pages, shows progress
- Optional: "Open Editor" link to switch to the full StoryEditor for fine control

### Professional Mode
- Job completes → user is routed into the existing `StoryEditor`
- Edit narrative text, dialogue, mood, scene description per page
- AI help menu for text refinement
- Generate illustrations per page with prompt control
- Generate narration per page with voice mapping
- All existing editor capabilities apply

---

## Database Changes

### `book_jobs` table
```sql
ALTER TABLE public.book_jobs
  ADD COLUMN mode TEXT NOT NULL DEFAULT 'speed'
  CHECK (mode IN ('speed', 'professional'));
```

### `books` table
```sql
ALTER TABLE public.books
  ADD COLUMN mode TEXT NOT NULL DEFAULT 'speed'
  CHECK (mode IN ('speed', 'professional'));
```

### `create_book_job` RPC
Add `p_mode TEXT DEFAULT 'speed'` parameter, pass through to the insert.

---

## Credit Pricing

### Speed Mode
- **Upfront:** Flat cost for draft + cover (X credits)
- **Optional extras:** Per-page cost for illustrations and TTS, charged at bulk-generate time
- Uses existing `credits_reservation_id` for upfront cost
- New reservation created per bulk batch

### Professional Mode
- **Upfront:** Higher cost based on final page count
- Covers: draft + cover + all illustrations + all TTS
- Charged when user initiates full generation from the editor (not at story creation)
- Page count is flexible — cost calculated at generation time

Exact credit amounts are configurable, not hardcoded.

---

## Implementation Scope

### New Components
- Mode selection screen (two cards in creation flow)
- Bulk generate buttons (illustrations + TTS) on book view page
- Bulk generate progress indicator

### Modified Components
- `CreateStoryModal` — add mode selection as first step, pass mode through flow
- `PlotInput` / `RefinementChat` — carry mode through to job creation
- Queue orchestrator (`lib/story/queue.ts`) — conditional step execution based on mode
- `create_book_job` RPC — accept mode parameter
- Job completion handler — route to bookshelf (speed) or editor (professional)
- Book view page — show bulk generate buttons for speed mode books

### No Changes Needed
- `StoryEditor` — reused as-is for Professional Mode
- Step RPCs (`update_job_step`, `fail_job_step`, etc.) — mode-agnostic
- Realtime subscriptions — unchanged
- Bookshelf page — unchanged (shows all books regardless of mode)

---

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|----------|-------------|-----------|
| 1 | Two modes: Speed and Professional | Single mode, three modes | Covers quick and detailed use cases without overcomplicating |
| 2 | Mode selection at start of creation flow | After refinement, after generation | Clearest UX — user knows what they're getting into upfront |
| 3 | Single pipeline with mode field | Separate pipelines, post-generation routing only | Minimal code, genuine speed benefit from skipping steps, one pipeline to maintain |
| 4 | Speed Mode skips story_bible | Keep it hidden | Speed is the priority |
| 5 | Speed pipeline: draft → cover → save | Include validate/character_ref | Fastest possible generation |
| 6 | Reuse existing StoryEditor for Professional | Build new editor | Editor already has all needed capabilities |
| 7 | Bulk generate buttons on book view | Redirect to editor, auto-generate | Simple UX, user opts in explicitly |
| 8 | Speed: flat upfront + per-page extras | All-inclusive | Pay for what you use |
| 9 | Professional: cost based on final page count | Fixed page count | Flexible — user edits before committing |
| 10 | Mode stored on both book_jobs and books | Job only | Books need mode after job is gone for UI routing |
| 11 | Remove comparison table from creation flow | Keep alongside mode selection | Cleaner UX, mode cards communicate value |
