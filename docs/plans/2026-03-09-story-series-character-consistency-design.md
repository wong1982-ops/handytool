# Story Studio — Series & Cross-Book Character Consistency

**Date**: 2026-03-09
**Status**: Design Approved — Ready for Implementation

---

## Understanding Summary

- **What**: A "Series" feature for Story Studio — users define a small cast of characters (2-4) with a shared art style and setting, then generate multiple story books within that series with visual consistency across books
- **Why**: Enable serial storytelling where characters (e.g., Katherine & Sophone) look the same across every book
- **Who**: Story Studio users who want recurring character stories (e.g., parents making a book series for their kids)
- **How characters are created**: Text description -> AI generates portrait -> conversational refinement ("make her hair longer") until user approves
- **How consistency works**: Approved character reference sheet is stored persistently and passed as Imagen 3 subject reference for every page in every book in the series
- **Series locks**: Characters + art style + shared setting. Only the plot changes per book.
- **Credits**: Series creation is free, character sheet generation/refinement costs 10 credits, each book costs 50 credits (standard)
- **Access**: Private by default, optionally public for reading (not creating)

---

## Assumptions

- Max 4 characters per series (hard limit)
- Single reference image per character (not multiple poses)
- Art style chosen once during series creation (locked for all books)
- Setting is a text description injected into every book's prompts
- Existing standalone book creation flow is untouched — series is opt-in
- No collaboration — only the series creator can add books
- Imagen 3 accepts one subject reference per call; primary character's reference is used, secondary characters rely on text descriptions

---

## Data Model

### New Tables

#### `series`
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| user_id | UUID, FK auth.users | |
| title | text | e.g., "Katherine & Sophone Adventures" |
| description | text | Short summary of the series universe |
| setting | text | Shared setting injected into all book prompts |
| art_style | text | Locked art style (e.g., "watercolor") |
| is_public | boolean, default false | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `series_characters`
| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| series_id | UUID, FK series | |
| name | text | e.g., "Katherine" |
| description | text | Detailed physical + personality description |
| reference_image_url | text, nullable | Approved portrait in Supabase Storage |
| status | text: 'draft', 'approved' | Must be approved before book generation |
| refinement_count | int, default 0 | Max 5 free refinements |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `books` table — modification
| Column | Type | Notes |
|---|---|---|
| series_id | UUID, nullable, FK series | null for standalone books |

### Constraints
- Max 4 `series_characters` per `series_id` (enforced via RPC)
- At least 1 approved character required to generate a book in a series

---

## Character Refinement Flow

### API Endpoint: `POST /api/v1/story/series/refine-character`

**Input**: `{ seriesId, characterId, description, feedback? }`
- First call: `description` only (initial generation)
- Subsequent calls: `description` + `feedback` (conversational refinement)

**Process**:
1. If `feedback` provided: use Gemini to merge feedback into existing description (e.g., "make her hair longer" -> updated description with longer hair detail)
2. Generate character portrait using Imagen 3 with the updated description
3. Upload portrait to Supabase Storage: `series/{seriesId}/characters/{characterId}.png`
4. Return `{ updatedDescription, referenceImageUrl }`

**Credit Model**:
- 10 credits on first generation (uses reserve/confirm pattern)
- Up to 5 free refinement iterations
- Starting over (reset) costs another 10 credits

### User Flow
1. Create series (title, setting, art style) -> free
2. Add character (name + text description) -> free
3. System generates portrait -> displayed
4. User approves OR gives feedback -> refine -> repeat (max 5 rounds)
5. Once approved, character is locked for use in books
6. Repeat for up to 4 characters

---

## Book Generation Within a Series

### Changes to Existing Pipeline

**Concept generation (`/api/v1/story/concepts`)**:
- When `seriesId` is provided:
  - Series setting injected: "This story takes place in: {setting}"
  - Characters injected: "The story MUST feature these characters with EXACTLY these descriptions: {name}: {description}"
  - Art style pre-locked from series (not user-selectable)

**Book generation (`/api/v1/story/generate`)**:
- When `seriesId` is provided:
  - Skip character reference sheet generation (existing step)
  - Load approved reference images from Supabase Storage
  - Use primary character's reference as Imagen 3 subject reference
  - Inject setting + full character descriptions into every `imagePrompt`
  - Seed, style reference, and page chaining work the same as standalone books

### Request Schema Change
```typescript
generateRequest: {
  plot: string
  concept: StoryConcept
  seriesId?: string  // optional — if present, load series data
}
```

---

## API Endpoints

| Endpoint | Method | Purpose | Cost |
|---|---|---|---|
| `/api/v1/story/series` | GET | List user's series | Free |
| `/api/v1/story/series` | POST | Create new series | Free |
| `/api/v1/story/series/[id]` | GET | Series detail + characters + books | Free |
| `/api/v1/story/series/[id]` | PATCH | Update title, setting, public toggle | Free |
| `/api/v1/story/series/[id]` | DELETE | Delete series | Free |
| `/api/v1/story/series/[id]/characters` | POST | Add character (draft) | Free |
| `/api/v1/story/series/[id]/characters/[charId]` | PATCH | Update description | Free |
| `/api/v1/story/series/[id]/characters/[charId]` | DELETE | Remove character | Free |
| `/api/v1/story/series/refine-character` | POST | Generate/refine portrait | 10 credits (first time) |
| `/api/v1/story/series/[id]/characters/[charId]/approve` | POST | Lock character | Free |

---

## UI & Navigation

### New Pages

**Series List** — `/tools/story-studio/series`
- Card grid of user's series
- Each card: title, character avatars, book count, art style badge
- "Create New Series" dashed card

**Series Detail** — `/tools/story-studio/series/[id]`
- Header: title, setting, art style
- Character section: portrait cards with status badges, "Add Character" button
- Character refinement panel (inline): portrait display, description textarea, feedback input, approve button, refinement counter
- Books section: grid of books in series, "Create New Story" button
- Settings: edit title/setting, toggle public

### Existing Page Modifications

**Story Studio** — `/tools/story-studio`
- When loaded with `?seriesId=xxx`: banner "Creating a story in: {series title}"
- Characters and style pre-filled from series (not editable)
- Plot input remains free-form

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| No approved characters, user tries to generate book | Block: "At least one character must be approved" |
| User tries to add 5th character | Block: "Maximum 4 characters per series" |
| User deletes character with existing books | Allow. Existing books keep generated images. Future books won't include that character. |
| User changes setting/style after books exist | Allow. Existing books unaffected. New books use updated values. Show warning. |
| Series deletion | Books become standalone (series_id = null). Character images deleted from storage. Requires confirmation. |
| Character refinement fails | Character stays in draft with last reference (or none). User can retry. |
| Refinement limit reached (5) | Must approve or start over (costs 10 credits). |

---

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| 1 | Series as lightweight container (Approach A) | Character Library first (B), Inline during generation (C) | Cleanest separation, minimal changes to existing flow |
| 2 | Text-first with conversational refinement | Upload photo, multiple-choice, description-only | Most natural UX, iterative toward desired look |
| 3 | Single reference image per character | Multiple poses, full character sheet | Imagen 3 accepts one subject reference; keeps storage simple |
| 4 | Max 4 characters per series | Unlimited, 8-10 | Matches target use case (small family cast) |
| 5 | 10 credits for first portrait, 5 free refinements | Free entirely, per-refinement cost | Balances accessibility with abuse prevention |
| 6 | Art style + setting locked per series | Free per book, partial locking | Core to visual consistency |
| 7 | Primary character reference for multi-char scenes | Composite references, alternate per scene | Imagen 3 single-reference limitation |
| 8 | Series deletion orphans books | Delete books too, prevent deletion | Preserves user's generated content |
| 9 | Private by default, optionally public for reading | Always private, shareable for creation | Matches existing book sharing model |

---

## Implementation Sequence

### Phase 1: Database & API Foundation
1. Supabase migration: `series`, `series_characters` tables, add `series_id` to `books`
2. RPC functions: CRUD with constraints (max 4 chars, approved check)
3. Series CRUD API endpoints
4. Character CRUD API endpoints

### Phase 2: Character Refinement
5. Refine-character endpoint (Gemini description merge + Imagen 3 portrait)
6. Character approve endpoint
7. Credit integration (reserve/confirm for portrait generation)

### Phase 3: Series-Aware Book Generation
8. Update concepts route to inject series data
9. Update generate route to load series reference images
10. Update request schemas

### Phase 4: UI
11. Series list page
12. Series detail page with character refinement panel
13. Story studio page — series mode (banner, pre-filled data)
14. Navigation links (bookshelf -> series, series -> create story)
