# Story Studio Redesign — Design Document

**Date:** 2026-03-08
**Status:** Approved — ready for implementation

---

## Understanding Summary

- **What:** Redesign Story Studio from a multi-step wizard into a simplified 3-phase flow: plot input -> concept selection -> one-shot full book generation with interactive viewer
- **Why:** The current wizard (audience/style/page-count pickers, separate review and illustration steps) has too much friction. Users should just describe an idea and get a book.
- **Who:** Anyone wanting to create illustrated story books with zero creative/technical expertise
- **Key constraints:** Gemini 2.5 Flash for text, Imagen 3 for illustrations, Web Speech API for TTS, browser-based page-flip (no 3D), single flat credit cost
- **Non-goals:** No manual pickers, no multi-step wizard, no concept editing, no 3D page flip, no paid TTS API

---

## User Journey

```
[Plot Input] --> [2 Concept Cards] --> [Generation Progress] --> [Book Viewer <-> Editor]
```

1. User types a plot idea (single textarea)
2. Gemini generates 2 concept cards (title + summary + tags: style, audience, page count, tone)
3. User picks one concept
4. Full storybook generates in one shot (text + all illustrations) with streaming progress
5. User lands in Book Viewer with page-flip and TTS
6. User can switch to Editor for text editing, regeneration, image regen, PDF export
7. "Start Over" returns to plot input

---

## Data Structures

### StoryConcept

```typescript
interface StoryConcept {
  id: string              // "concept_1" | "concept_2"
  title: string           // "The Brave Little Firefly"
  summary: string         // 2-3 sentence story summary
  mission: string         // "A story about finding courage in darkness"
  tags: {
    style: string         // "Watercolor"
    audience: string      // "Ages 5-7"
    pageCount: number     // 10
    tone: string          // "Adventurous & Heartwarming"
  }
}
```

### GenerateRequest

```typescript
interface GenerateRequest {
  plot: string            // original user plot
  concept: StoryConcept   // the chosen concept
}
```

### StoryBook (updated)

- Remove `format` field (always picture book)
- Remove `BookStyle` — style embedded in concept/pages
- Add `concept: StoryConcept` to preserve what user picked
- Status simplifies to: `'generating' | 'complete'`

### ProgressEvent (SSE streaming)

```typescript
type ProgressEvent =
  | { type: 'status'; message: string }
  | { type: 'story-ready'; data: StoryBook }
  | { type: 'image-done'; page: number; url: string }
  | { type: 'complete'; data: StoryBook }
```

### Client State

```typescript
type AppPhase = 'input' | 'concepts' | 'generating' | 'viewer'

interface AppState {
  phase: AppPhase
  plot: string | null
  concepts: [StoryConcept, StoryConcept] | null
  book: StoryBook | null
  editorOpen: boolean
  progress: ProgressEvent[]
}
```

---

## API Routes

### POST /api/v1/story/concepts (new)

- Input: `{ plot: string }`
- Output: `{ data: [StoryConcept, StoryConcept] }`
- Model: Gemini 2.5 Flash
- Credits: Free (encourages exploration)
- Expected latency: ~2-3 seconds

### POST /api/v1/story/generate (new, SSE)

- Input: `{ plot: string, concept: StoryConcept }`
- Output: Server-Sent Events stream
- Sequence:
  1. Deduct flat credits upfront
  2. Gemini 2.5 Flash generates full story text -> emit `story-ready`
  3. Gemini Imagen 3 generates all page illustrations in parallel -> emit `image-done` per page
  4. Upload images to Supabase storage
  5. Emit `complete` with final StoryBook
- On failure: refund credits, return partial results with error
- Credit cost: single flat fee (e.g., 50 credits)

### Removed routes

- `/api/v1/story/enrich` — replaced by `/concepts` + `/generate`
- `/api/v1/story/illustrate` — illustrations happen inside `/generate`

### Kept routes

- `/api/v1/story/regenerate-story` — editor regeneration
- `/api/v1/story/regenerate-image` — single image regen in editor
- `/api/v1/story/export-pdf` — PDF download

---

## Components

### New

| Component | Purpose |
|---|---|
| `plot-input.tsx` | Single textarea + "Generate Ideas" button |
| `concept-cards.tsx` | 2 side-by-side cards with title, summary, tags, "Pick This" button |
| `generation-progress.tsx` | Full-screen progress indicator with streaming status updates |
| `book-viewer.tsx` | Page-flip preview (swipe/click, arrow keys) with TTS controls |

### Modified

| Component | Changes |
|---|---|
| `book-editor.tsx` | Add "Start Over" button, add "Preview" button to switch to viewer |

### Removed

| Component | Reason |
|---|---|
| `story-input-form.tsx` | Replaced by `plot-input.tsx` |
| `style-picker.tsx` | AI decides style |
| `wizard-progress.tsx` | No more wizard steps |
| `story-review.tsx` | No separate review step |
| `illustration-grid.tsx` | Illustrations generate automatically |

---

## Book Viewer

- Full-width card, one page at a time
- Layout: illustration on top, narrative text + dialogue below
- Navigation: left/right arrows + swipe + keyboard arrow keys
- Page indicator: "3 / 10" at bottom
- First page = cover (title + illustration), last page = back cover
- CSS transition between pages (~300ms slide or fade)

## Text-to-Speech

- Play/Pause button in viewer toolbar
- `window.speechSynthesis` API
- Auto-advances to next page when narration finishes
- Default English voice, rate 1.0
- Nice-to-have: visual highlight on text being read

---

## Credits

- Concept generation: free
- Full book generation: single flat fee (e.g., 50 credits)
- Story regeneration (editor): 10 credits
- Image regeneration (editor): 5 credits
- PDF export: 5 credits

---

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Plot-only input, AI decides everything | Keep manual pickers | Zero friction |
| 2 | 2 concept cards with visible tags | 3+ concepts, minimal cards, rich preview | Fast + transparent |
| 3 | Zero control after picking | Editable concept, light touch tweaks | "Pick and go" philosophy |
| 4 | All-in-one generation -> Book Viewer | Text first then illustrations | Most seamless UX |
| 5 | Single flat credit cost | Granular charges, no credits | Simpler billing |
| 6 | Simple swipe/click navigation | 3D page flip | Lighter, mobile-friendly |
| 7 | Browser Web Speech API | Google Cloud TTS | Free, no extra dependency |
| 8 | Single streaming API for generation | Client-orchestrated sequential calls | Simpler client + billing |
| 9 | Keep regen + edit + export + Start Over | Drop regeneration | Full power + easy restart |
| 10 | Concepts are free | Charge for concepts | Encourages exploration |

---

## Implementation Order

1. Update `types.ts` — new types (StoryConcept, GenerateRequest, ProgressEvent, AppPhase, AppState)
2. `plot-input.tsx` — simple textarea component
3. `POST /api/v1/story/concepts` — Gemini concept generation
4. `concept-cards.tsx` — concept selection UI
5. `POST /api/v1/story/generate` — SSE streaming full generation
6. `generation-progress.tsx` — progress UI consuming SSE
7. `book-viewer.tsx` — page-flip viewer with TTS
8. Update `book-editor.tsx` — add Start Over + Preview toggle
9. Update `page.tsx` — new flow assembly
10. Update `use-story-book.ts` — simplified state management
11. Remove old components (story-input-form, style-picker, wizard-progress, story-review, illustration-grid)
12. Remove old API routes (enrich, illustrate)
13. Update credit costs in validation.ts
