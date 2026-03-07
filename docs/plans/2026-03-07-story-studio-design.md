# Story Studio — Design Document

**Date:** 2026-03-07
**Status:** APPROVED

## Overview

AI Story Studio is a tool that takes a user's storyline/plot and generates a fully illustrated picture book. The system uses Claude for story enrichment and Flux/DALL-E for illustrations. Users get an interactive editor to tweak pages, swap illustrations, and regenerate content. Output formats include an in-browser reader, PDF download, and image pack.

Architecture is designed to support future book formats (children's book, illustrated book, pop-up book) and cartoon/animation generation.

## Target Audience

General audience — anyone who wants to turn a story idea into a visual book. UX must be simple and jargon-free.

## User Flow — 4-Step Wizard + Editor

### Step 1: Story Input
- Title (optional — AI can generate one)
- Storyline / Main Plot — textarea, 50-500 words
- Target audience — dropdown: Toddler (2-4), Early Reader (5-7), Middle Grade (8-12), Young Adult, All Ages
- Book format — Picture Book (MVP, others greyed out with "Coming Soon")
- Page count — slider: 8, 10, 12, 16 pages
- Illustration style — preset grid (Watercolor, Cartoon, Anime, Realistic, Paper-Craft) + custom prompt field
- "Generate" button deducts base credit cost

### Step 2: Story Review
- AI-enriched story displayed as structured outline: title, theme, setting, characters, page-by-page breakdown (scene, narrative, dialogue, mood)
- User can edit any field inline
- "Regenerate Story" button (extra credits)
- "Approve & Generate Illustrations" to proceed

### Step 3: Illustration Generation
- Grid of page cards, each showing scene text + illustration (spinner → image)
- Generated sequentially, one page at a time
- Each card has: Regenerate (extra credits), Edit prompt
- "Approve & Build Book" when all pages done

### Step 4: Book Editor & Export
- In-browser book reader with page turn animation
- Edit mode: click any page to edit text, swap illustration, reorder (drag), delete
- Export panel: PDF download, image pack (ZIP), share link (future)

## Data Model

```typescript
interface StoryBook {
  id: string
  title: string
  audience: 'toddler' | 'early-reader' | 'middle-grade' | 'young-adult' | 'all-ages'
  format: 'picture-book'
  style: {
    preset: string
    customPrompt?: string
  }
  theme: string
  setting: string
  characters: Character[]
  pages: Page[]
  status: 'draft' | 'story-approved' | 'illustrating' | 'complete'
  createdAt: string
  updatedAt: string
}

interface Character {
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting'
  description: string
  age?: string
}

interface Page {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue?: {
    speaker: string
    line: string
  }[]
  mood: string
  imagePrompt: string
  imageUrl?: string
  imageStatus: 'pending' | 'generating' | 'done' | 'error'
}
```

### Storage Strategy
- **Client-side (localStorage):** active book state during creation
- **Generated images:** Supabase Storage bucket, URLs referenced in book object
- **Future:** save books to Supabase `story_books` table for user accounts, history, sharing

### Animation-Friendly Fields
- `sequence` — page ordering for timeline
- `dialogue.speaker` — character attribution for animation
- `mood` — tone tags for scene transitions

## API Endpoints

All in toolk1t-api under `/api/v1/story/`:

| Method | Path | Purpose | Credits |
|---|---|---|---|
| POST | `/api/v1/story/enrich` | Raw plot → enriched StoryBook (no images) | 20 |
| POST | `/api/v1/story/illustrate` | Single Page → imageUrl | 5 |
| POST | `/api/v1/story/regenerate-story` | Re-enrich with edits | 10 |
| POST | `/api/v1/story/regenerate-image` | Regenerate one illustration | 5 |
| POST | `/api/v1/story/export-pdf` | Complete StoryBook → PDF binary | 5 |

### AI Pipeline

**Story Enrichment (`/enrich`):**
- Claude API with structured prompt for children's book authoring
- JSON output matching StoryBook interface
- Auto-generates imagePrompt per page from scene + characters + style

**Illustration (`/illustrate`):**
- Combines page imagePrompt + style preset/custom + character descriptions
- Calls Flux (via fal.ai) or DALL-E 3
- Uploads to Supabase Storage, returns public URL

**PDF Export (`/export-pdf`):**
- Uses pdf-lib to assemble cover + content pages + back cover
- Returns PDF binary

### Character Consistency (MVP)
- Detailed visual description per character in enrichment step
- Full character description included in every image prompt
- Style preset prepended to every prompt
- Future: reference image seeding (Flux image-to-image)

## Client Architecture

Route: `/tools/story-studio`

### Components
```
app/tools/story-studio/page.tsx     — wizard state machine
tools/story-studio/
  ├── story-input-form.tsx          — Step 1: plot, audience, style, pages
  ├── style-picker.tsx              — style preset grid + custom prompt
  ├── story-review.tsx              — Step 2: editable outline
  ├── character-card.tsx            — editable character display
  ├── page-card.tsx                 — single page editor
  ├── illustration-grid.tsx         — Step 3: generation grid
  ├── illustration-card.tsx         — image preview + regenerate
  ├── book-editor.tsx               — Step 4: full editor
  ├── book-reader.tsx               — flip-through reader
  ├── export-panel.tsx              — PDF, image pack, share
  ├── wizard-progress.tsx           — progress bar
  └── use-story-book.ts             — state hook + localStorage + API calls
```

### Layout
- Desktop: full-width wizard, Steps 2-4 split layout (edit left, preview right)
- Mobile: single column, book reader full-screen with swipe
- Wizard progress bar at top: Input → Story → Illustrations → Book

## Credit Pricing

| Action | Credits | Rationale |
|---|---|---|
| Generate story (enrich) | 20 | One Claude API call |
| Generate illustration (per page) | 5 | One image generation call |
| Regenerate story | 10 | Partial re-generation |
| Regenerate illustration | 5 | Same as initial |
| Export PDF | 5 | Server-side assembly |
| **Total for 10-page book** | **~75** | 20 + (10x5) + 5 export |

Pricing model: flat cost per book + extra credits for regenerations.

## Error Handling

| Failure | Handling |
|---|---|
| Claude API fails | Error toast, retry button, credits not deducted on failure |
| Image generation fails | Mark page as error, retry button, skip to next, credits refunded |
| Inappropriate content | Safety filter, auto-regenerate once with modified prompt |
| PDF export fails | Toast error, retry, credits refunded |
| Out of credits mid-generation | Pause, show "Buy more credits", resume after purchase |
| localStorage full | Warn user, offer JSON export |

Credit deduction rule: deduct before API call, refund on failure.

## Technical Approach

- **Architecture:** Linear Pipeline — each step is a discrete API call
- **AI providers:** Claude (story enrichment) + Flux/DALL-E 3 (illustrations)
- **Processing:** toolk1t-api, synchronous per-step
- **State:** client-side localStorage via useStoryBook hook
- **Images:** Supabase Storage bucket
- **Export:** pdf-lib for PDF generation

## Future Extensions (Not in MVP)

- Additional book formats: Children's Book, Illustrated Book, Pop-up Book
- Cartoon/animation generation consuming the scene/dialogue/mood data
- Server-side book persistence (Supabase table)
- Sharing and public gallery
- Reference image seeding for character consistency
- Parallel illustration generation
- Audio narration (ElevenLabs)
