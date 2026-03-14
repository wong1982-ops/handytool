# Story Studio Add-Ons: Post-Generation Illustration & Narration

**Date:** 2026-03-14
**Status:** Draft
**Scope:** Add-on flows for adding illustrations and narration to text-only storybooks after generation.

## Problem

After generating a text-only storybook (with illustrations and narration skipped), users have no way to selectively add illustrations or narration. The existing illustration and narration tabs exist but are separate from the editor flow and don't offer a guided page-by-page review experience.

## Solution Overview

Two add-on flows accessible from the story editor:

1. **Illustration Review Flow** — Page-by-page walkthrough where the user reads each page's content, edits the image prompt if needed, and decides to generate or skip. Generation is async (non-blocking).
2. **Narration Batch Flow** — Voice selection + batch generation for all (or selected) pages in one action.

Both flows reuse existing API routes, hooks, and credit infrastructure. No new backend work required.

## Entry Points

### Banner (First-Time CTA)

Shown at the top of `StoryEditor` when the book has 0 illustrations:

> "Your story is ready! Add illustrations to bring it to life." → [Add Illustrations]

Dismisses when:
- User has at least 1 illustration, OR
- User explicitly closes the banner (persist dismissal via `sessionStorage` keyed by bookId so it survives in-page navigation but resets on new sessions)

### Persistent Add-Ons Section

Rendered below the page editor area. Two cards:

- **Illustrations** — Progress text ("3 of 12 pages illustrated"), progress bar, [Add / Continue] button → opens Illustration Review Flow
- **Narration** — Progress text ("0 of 12 pages narrated"), progress bar, [Add Narration] button → opens Narration Flow

Both cards always visible. Button label changes based on state:
- 0 done → "Add Illustrations" / "Add Narration"
- Partially done → "Continue"
- All done → "Review" (can still regenerate individual pages)

## Illustration Review Flow

### Layout

Full-width panel that replaces editor content (not a modal). Back button returns to editor.

**Mobile layout:** Stacked vertically — page content on top, controls below. Controls collapse into a compact bar with prompt field and Generate/Skip buttons.

### Top Bar

- Back arrow
- Title: "Add Illustrations — Page 3 of 12"
- Progress indicator: dots or segmented bar, color-coded per page status
- Credit running total: "15 credits queued" (updates as user selects pages)

### Per-Page View

**Left panel (60%, full-width on mobile):** Read-only page content
- Narrative text (styled like book viewer)
- Dialogue with speaker attribution
- Mood tag

**Right panel (40%, below content on mobile):** Generation controls
- Image prompt textarea (pre-filled from story draft `imagePrompt` field, editable)
- Character selector (approved characters as toggleable chips)
- Quality mode toggle (Fast 3cr / Quality 5cr)
- Action buttons:
  - **"Generate & Next"** — collects this page for batch generation, advances to next page immediately
  - **"Skip"** — advances without generating
- If page already has illustration: show thumbnail + "Regenerate" option

### Navigation

- Previous / Next arrows
- Clickable progress dots to jump to any page
- Page status colors: green (generated/generating), gray (skipped), white (not yet reviewed)
- Navigating back to a generating page shows spinner overlay on thumbnail area

### Async Behavior

The single-page `POST /books/:id/illustrate` route is synchronous (awaits full generation). To achieve non-blocking UX, the illustration review flow uses a **collect-then-batch** pattern:

1. User walks through pages, clicking "Generate & Next" or "Skip" for each
2. Each "Generate & Next" click records the page's `{pageId, imagePrompt, characterIds}` into a local `pendingPages` array — no API call yet
3. On the Summary screen, all pending pages are submitted via the existing **batch illustration route** (`POST /books/:id/illustrate/batch`), which marks pages as "generating" and fires individual requests async (fire-and-forget)
4. Status updates via polling `useIllustrations().refresh()` on 5s interval
5. The batch route has a 20-page limit — for books >20 pages, the flow chunks into multiple batch requests

This avoids blocking the user on each page while reusing the existing batch infrastructure.

### Summary Screen

Shown after reviewing the last page or clicking "Finish":

1. Shows summary: "8 pages to illustrate, 4 skipped" with credit cost confirmation
2. **"Generate All" button** — submits the collected pages to the batch route
3. After submission: thumbnail grid showing completed / in-progress / skipped status per page. "Retry Failed" button appears if any pages errored.
4. Narration prompt: **"Add narration too?"** with:
   - [Yes, Add Narration] → opens Narration Flow
   - [Done] → returns to editor

## Narration Flow

### Layout

Same full-width panel as illustrations.

### Single Screen (Not Page-by-Page)

**Top section — Voice Selection:**
- Narrator voice picker (reuses existing `VoicePicker` component)
- Character voice mapping: auto-detected unique speakers from dialogue across all pages. Each speaker gets a `VoicePicker` dropdown. This is a new composite section (the existing `NarratorVoiceSelector` handles narrator only, not per-character mapping).

**Middle section — Page List:**
- Scrollable list of all pages
- Each row: checkbox, page number, narrative text preview (truncated), dialogue speaker names
- All checked by default. User can uncheck pages to exclude.

**Bottom bar:**
- Credit cost summary: "12 pages x 3 credits = 36 credits" (updates dynamically as pages are checked/unchecked)
- **"Generate All"** button
- Note: Batch narration route has a 20-page limit. For books >20 pages, the flow chunks into multiple batch requests.

### After Generation

- Calls existing `POST /books/:id/narrate/batch` route
- Page list updates in-place with status badges: queued → generating → done
- Inline audio players appear as each page completes
- Polls `useNarration().refresh()` for status updates on 5s interval
- "Retry Failed" button appears if any pages errored

### Completion

- "All done!" state with [Back to Editor] button

## New Components

All placed in `tools/story-studio/add-ons/`:

| Component | Responsibility |
|---|---|
| `add-ons-banner.tsx` | CTA banner when 0 illustrations. Renders inside StoryEditor. |
| `add-ons-section.tsx` | Persistent status cards for illustrations + narration. Renders inside StoryEditor. |
| `illustration-review-flow.tsx` | Container: manages page index, decisions array, batch submission, polling. |
| `illustration-review-page.tsx` | Single page view: content left, controls right. |
| `illustration-summary.tsx` | End screen: batch generate button, results grid, retry failed, narration prompt. |
| `narration-flow.tsx` | Voice picker + character voice mapping + page checklist + batch generate + progress. |

## Existing Infrastructure Reused

| Concern | Existing Code |
|---|---|
| Batch illustration API | `POST /api/v1/story/books/:id/illustrate/batch` (marks "generating", fires async) |
| Single-page illustration API | `POST /api/v1/story/books/:id/illustrate` (called by batch internally) |
| Illustration status API | `GET /api/v1/story/books/:id/illustrations` |
| Illustration data hook | `useIllustrations()` in `tools/story-studio/use-illustrations.ts` |
| Batch narration API | `POST /api/v1/story/books/:id/narrate/batch` |
| Audio status API | `GET /api/v1/story/books/:id/audio` |
| Narration data hook | `useNarration()` in `tools/story-studio/use-narration.ts` |
| Voice picker UI | `VoicePicker` in `tools/story-studio/characters/voice-picker.tsx` |
| Character selector | Pattern from `PageIllustrationDetail` |
| Credit reservation | Handled inside existing API routes |
| Quality mode toggle | Pattern from `IllustrationControls` |

## Data Requirements

### Page IDs

The `StoryEditor` currently uses a `PageData` interface without an `id` field. The add-on flows require page UUIDs to call illustration/narration APIs. Fix: extend `PageData` to include `id: string` and ensure `StoryEditorWrapper` fetches page IDs from the `book_pages` table.

```typescript
// Current
interface PageData {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}

// Extended
interface PageData {
  id: string  // <-- added: book_pages UUID
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue: { speaker: string; line: string }[]
  mood: string
  imagePrompt: string
}
```

The `GET /api/v1/story/books/:id` endpoint must return page IDs. Check if `book_pages.id` is already included in the response; if not, add it.

## State Management

- `IllustrationReviewFlow` holds local state:
  - `currentPageIndex: number`
  - `decisions: Map<number, 'generate' | 'skip' | 'pending'>` — tracks per-page user decision
  - `pendingPages: { pageId: string; imagePrompt: string; characterIds?: string[] }[]` — collected for batch submission
  - `qualityMode: 'fast' | 'quality'` — applies to the whole batch
- Polls `useIllustrations().refresh()` on 5s interval after batch submission
- `NarrationFlow` holds local state:
  - `selectedVoice: string`
  - `voiceMap: Record<string, string>` — speaker → voice mapping
  - `selectedPageIds: Set<string>`
- Polls `useNarration().refresh()` on 5s interval after batch trigger

## Integration with StoryEditor

The `StoryEditor` component gains:
1. A `view` state: `'editor' | 'illustration-review' | 'narration'`
2. Conditionally renders the active view
3. Passes `bookId` and page data (including IDs) to add-on flows
4. Needs illustration/narration counts — fetched via existing hooks

No changes to `StoryEditorWrapper` or the page route (beyond adding page IDs to the data fetch).

## Batch Limits

Both the illustration and narration batch routes enforce a maximum of 20 items per request. For books exceeding 20 pages:
- The flow automatically chunks the request into multiple batch calls (e.g., pages 1-20, then 21-35)
- Each chunk is submitted sequentially (wait for 200 response before sending next chunk)
- Progress UI shows all pages regardless of chunking

## No Backend Changes

All API routes, database tables, RPC functions, and credit logic already exist. The only backend-adjacent change is ensuring `GET /api/v1/story/books/:id` returns `book_pages.id` in its response.

## Accessibility & UX

- All interactive elements meet 44px minimum touch target
- Progress indicators use both color and shape (not color-only)
- Keyboard navigation: arrow keys for page navigation, Enter for generate, Escape for back
- Loading states: spinner on generating thumbnails, disabled buttons during API calls
- Error handling: inline error per page if generation fails, "Retry Failed" bulk action on summary screen
- Mobile: stacked vertical layout for illustration review (content above, controls below)
