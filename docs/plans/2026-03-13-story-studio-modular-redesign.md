# Story Studio Modular Redesign

**Date**: 2026-03-13
**Status**: Design Complete — Ready for Implementation

---

## Understanding Summary

- **What**: Redesign Story Studio from a monolithic pipeline into 4 modular, user-driven tabs: Stories, Characters, Illustrations, Narration
- **Why**: Current pipeline is rigid (all-or-nothing), prone to Vercel timeouts, gives users limited control over what gets generated
- **Who**: Hundreds of active users creating children's storybooks with AI assistance
- **Key constraint**: Story must exist before illustrations or narration (media is optional add-on)
- **Non-goals**: Not a real-time collaborative editor, not forcing users through a fixed pipeline, no hard character limits

### Assumptions

- Existing Supabase DB + Vercel deployment stays
- Nano Banana (Gemini 3.1 Flash Image) is the primary image provider
- Gemini TTS remains the primary audio provider
- Credit system stays but pricing changes to per-action
- Existing book reader/viewer can be reused
- Credit cost numbers are placeholders — easy to tune via config

---

## Architecture: Modular Tabs (Approach A)

Single-page app with 4 tab-based menus. A book selector at the top sets context for Illustrations and Narration tabs. Characters exist independently.

### Navigation Structure

```
/tools/story-studio/
├── (default)          → Stories tab (list + create/edit)
├── characters/        → Characters tab (manage + reference images)
├── illustrations/     → Illustrations tab (generate per-page)
├── narration/         → Narration tab (generate per-page audio)
├── bookshelf/         → Bookshelf (existing — completed books)
└── book/[slug]/       → Book reader (existing — public view)
```

### Layout

```
┌─────────────────────────────────────────────────┐
│  Story Studio          [Book: My Dragon Tale ▾] │
├──────────┬────────────┬───────────┬─────────────┤
│ Stories  │ Characters │ Illustr.  │ Narration   │
├──────────┴────────────┴───────────┴─────────────┤
│  (Active tab content)                           │
└─────────────────────────────────────────────────┘
```

- Book selector (top-right) sets active book context for Illustrations and Narration
- Stories and Characters tabs work independently (not book-scoped)
- Mobile: Tabs become horizontal scrollable bar, book selector in collapsible header

---

## Tab 1: Stories

### List View

Grid/list of user's stories. Each card: title, page count, date, status (Draft|Complete), series tag. Quick actions: Edit, Delete. "+ New Story" button.

### Two Entry Paths

1. **"Generate with AI"** — plot prompt → AI generates full draft (concept → story bible → draft → validate). Stops after text — no illustrations/audio.
2. **"Write from scratch"** — blank story with title and empty pages.

### Story Editor

- Page strip for quick navigation
- Per-page fields: scene description, narrative text, dialogue lines, image prompt
- "AI Help" dropdown: Rewrite, Expand, Shorten, Fix grammar, Suggest dialogue
- "+ Add Page" appends pages (charged per page beyond default 10-12)
- Characters in scene auto-detected from dialogue speakers + scene text
- Image prompts auto-generated from scene descriptions, user-editable
- Auto-save (debounced) + manual save button
- AI-generated stories land as Draft — user edits before moving to media

---

## Tab 2: Characters

### Two Sections

1. **My Characters** — all standalone characters in a grid
2. **Series** — collapsible list, expand to see assigned characters

### Character Creator/Editor

- Portrait: Generate via AI (from physical description) or upload manually
- Fields: name, age, role, personality, physical description
- Voice picker: filterable by gender/age/style, audio preview
- Series assignment: multi-select, character linked (not copied) to multiple series
- Status: Draft → Approved (only approved characters available for illustration)
- "Refine with AI": improves description + regenerates portrait, 1 credit, max 3 refinements
- AI context fields (personality, age, role) fed into story prompts; physical description used for images

### Series Management

Inline within Characters tab:
- Title, description, setting, art style
- Linked characters (quick add/remove)
- Books using this series
- Soft limit warning at 6+ characters

---

## Tab 3: Illustrations

### Requires Active Book

Empty state if no book selected: "Select a book to start illustrating."

### Page Grid View

- Cover card at top + page cards in grid
- Each card shows: thumbnail (or empty), page number, auto-detected characters, status
- Checkbox selection for batch mode
- "Quality ▾" toggle (Quality | Fast) and "Generate Selected (N)" button
- Cost shown upfront: per-page credits × selected count

### Single Page View (click a card)

- Scene description + editable image prompt
- Auto-detected characters with portraits (add/remove override)
- Continuity indicator: "← Uses Page N as reference"
- Mode toggle: Quality / Fast
- Generate → preview → Accept or Regenerate
- Only approved characters shown in picker; draft characters greyed out

### Key Behaviors

- **Auto-detect characters**: parse scene + dialogue, match against book/series characters, user overrides
- **Visual continuity**: previous illustrated page automatically used as style reference
- **Batch mode**: multiple pages fire in parallel, progress per-page
- **Regenerate**: old image kept until user accepts new one
- **Cover**: same as page but uses `concept.coverDescription`

---

## Tab 4: Narration

### Requires Active Book

Empty state if no book selected.

### Page List View

- Narrator voice selector at top (curated storytelling voices, separate from character voices)
- Voice map: book-level character → voice mapping, pre-populated from character definitions
- Page list with: preview text, speakers, duration (if generated), status
- Checkbox selection for batch mode
- "Generate Selected (N)" with cost shown

### Single Page View (click a row)

- Script preview: narrative segments labeled "Narrator", dialogue labeled by character
- Voice assignment per speaker (overridable from book-level voice map)
- Audio player for generated result
- Generate → preview → Accept or Regenerate

### Key Behaviors

- **Narrator voice**: curated storytelling set, applied to all narrative text
- **Character voices**: auto-populated from Characters tab, overridable per-book
- **Multi-voice TTS**: single audio file per page, narrator for narrative, character voices for dialogue
- **Batch**: parallel generation, per-page progress
- **Unassigned characters**: "Select voice" prompt before generation

---

## Data Model

### New Tables

```sql
-- Characters promoted to top-level
characters (
  id UUID PK,
  user_id UUID FK auth.users,
  name TEXT,
  age TEXT,
  role TEXT,                    -- protagonist, antagonist, supporting
  personality TEXT,
  physical_description TEXT,
  reference_image_url TEXT,
  voice TEXT,                   -- voice name from curated list
  status TEXT CHECK (draft, approved),
  refinement_count INT DEFAULT 0,
  created_at, updated_at
)

-- Many-to-many: characters ↔ series
character_series (
  character_id UUID FK characters ON DELETE CASCADE,
  series_id UUID FK series ON DELETE CASCADE,
  PRIMARY KEY (character_id, series_id)
)

-- Books — lighter, text-focused
books (
  id UUID PK,
  user_id UUID FK auth.users,
  slug TEXT UNIQUE,
  title TEXT,
  series_id UUID FK series (optional),
  style TEXT,
  audience TEXT,
  status TEXT CHECK (draft, complete),
  concept JSONB,                -- AI metadata, nullable for manual stories
  created_at, updated_at
)

-- Normalized pages (currently embedded in books.data JSONB)
book_pages (
  id UUID PK,
  book_id UUID FK books ON DELETE CASCADE,
  sequence INT,
  scene_description TEXT,
  narrative_text TEXT,
  image_prompt TEXT,
  dialogue JSONB,               -- [{speaker, line}]
  mood TEXT,
  UNIQUE (book_id, sequence)
)

-- Per-page illustration (optional)
page_illustrations (
  id UUID PK,
  book_page_id UUID FK book_pages ON DELETE CASCADE,
  image_url TEXT,
  status TEXT CHECK (pending, generating, done, error),
  quality_mode TEXT CHECK (fast, quality),
  generation_config JSONB,
  created_at
)

-- Per-page audio (optional)
page_audio (
  id UUID PK,
  book_page_id UUID FK book_pages ON DELETE CASCADE,
  audio_url TEXT,
  status TEXT CHECK (pending, generating, done, error),
  voice_map JSONB,
  duration_seconds FLOAT,
  created_at
)

-- Book cover (optional)
book_cover (
  id UUID PK,
  book_id UUID FK books ON DELETE CASCADE,
  image_url TEXT,
  status TEXT CHECK (pending, generating, done, error),
  prompt TEXT,
  created_at
)
```

### Migration from Current Schema

- `series_characters` → `characters` + `character_series`
- `books.data` JSONB → decompose into `book_pages` + `page_illustrations` + `page_audio`
- `book_jobs` retained but simplified to single-task jobs

---

## Generation Architecture: Single-Task Jobs

### Replaces Monolithic Pipeline

Instead of one 8-step chained pipeline, each generation is an independent, single-purpose job.

| Job Type | Scope | Duration | Trigger |
|---|---|---|---|
| `story_generate` | Full story text | ~30-60s | User clicks "Generate with AI" |
| `illustration` | ONE page or cover | ~30-90s | User clicks "Generate" in Illustrations tab |
| `audio` | ONE page | ~20-40s | User clicks "Generate" in Narration tab |

### How It Solves Timeouts

| Aspect | Old (pipeline) | New (single-task) |
|---|---|---|
| Job scope | 8 steps, all pages | 1 task, 1 page |
| Function duration | Minutes (cascading) | 30-90s per call |
| Failure blast radius | Entire book | Single page |
| Retry | Restart from failed step | Retry just that page |
| User control | Wait for everything | Generate what you want |

### Batch Generation

User selects 5 pages → creates 5 independent jobs → all fire in parallel → each resolves independently → UI updates per-page.

### Cron Safety Net

Same pattern: cron picks up stuck jobs (status=running, >2min stale). Each job is small and retriable without side effects.

---

## Credit System

### Per-Action Pricing

| Action | Cost | Notes |
|---|---|---|
| Generate story (AI) | 10 credits | Base 10-12 pages |
| Additional pages | 2 credits/page | Beyond default 10-12 |
| Illustration (fast) | 3 credits/page | Lighter model config |
| Illustration (quality) | 5 credits/page | Full references + larger config |
| Cover illustration | 5 credits | Same as quality page |
| Narration | 3 credits/page | Multi-voice TTS |
| Character refinement | 1 credit | Refine description + portrait |
| PDF export | 5 credits | Existing |
| Write from scratch | 0 credits | User-authored, no AI |

### Credit Flow

- No upfront reservation — deduct per action at generation time
- Check balance before each call
- Batch: check total upfront, deduct per-page as each completes
- If balance runs out mid-batch, remaining pages cancelled

### Examples

- Full book (12 pages, quality illustrations + narration): 10 + (12×5) + 5 + (12×3) = **111 credits**
- Text-only book: **10 credits**
- Illustrate 4 key pages (quality): **20 credits**
- Fast illustrations, all 12 pages: **36 credits**

---

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Modular tabs | Separate pages; Wizard flow | Least friction, matches independent workflow |
| 2 | Story first, media optional | All-in-one pipeline; Fully independent | Logical dependency without forcing pipeline |
| 3 | AI draft OR write from scratch | AI-only; Manual-only | Maximum flexibility |
| 4 | Characters as top-level entities | Owned by series; Duplicated | Eliminates duplication, enables reuse |
| 5 | Soft character limit (~6 with warning) | Hard 4; No limit | Guides without blocking |
| 6 | Per-page opt-in for media | All-or-nothing; Sequential | User pays for what they want |
| 7 | Auto-detect characters + manual override | Fully manual; Fully auto | Reduces friction, keeps control |
| 8 | Visual continuity from previous pages | Independent; Mandatory chain | Best quality, flexible order |
| 9 | Quality vs Fast mode | Single mode; Three tiers | Simple toggle, clear tradeoff |
| 10 | Curated narrator voices | Same as character voices | Storytelling voices are distinct |
| 11 | Single-task jobs | Keep pipeline; WebSocket | Solves timeouts, enables independence |
| 12 | Normalized tables | Keep JSONB; Hybrid | Independent status tracking, cleaner queries |
| 13 | Per-action credits | Flat rate; Subscription | Fairer — pay for what you use |
| 14 | No upfront reservation | Reserve full; Post-pay | Simpler, batch cancels gracefully |
