# Story Studio Phase 2 — Persistence, Bookshelf, Rich Concepts & TTS Audio

**Date:** 2026-03-08
**Status:** Approved — ready for implementation
**Depends on:** Phase 1 redesign (completed)

---

## Understanding Summary

- **What:** Add book persistence (Supabase), user bookshelf, shareable static pages with audio, richer concepts with chat-based refinement, and Gemini TTS audio per page
- **Why:** Books are lost on browser clear; concepts are too brief; users want to shape story direction; shared books need consistent audio playback
- **Who:** Authenticated users creating and collecting illustrated storybooks
- **Key constraints:** Supabase for DB + storage, Gemini 2.5 Flash for text + TTS, Imagen 3 for illustrations, Next.js ISR for static pages
- **Non-goals:** No public library/community, no book limits, no paid tier gating, no normalized DB schema

---

## User Journey (Updated)

```
1. [Plot Input]            — user types idea
2. [2 Rich Concept Cards]  — premise, author intent, arc, tone, style, message
3. [Pick Concept]          — select one
4. [Refinement Chat]       — 0-3 rounds: "make it funnier", "add a villain"
5. [Generation Progress]   — SSE: text -> illustrations -> TTS audio -> save to DB
6. [Book Viewer]           — page-flip with MP3 audio, Edit/Share/Bookshelf buttons
```

---

## Data Structures

### StoryConcept (enhanced)

```typescript
interface StoryConcept {
  id: string
  title: string
  coverDescription: string
  sections: {
    premise: string            // "What's the story about?"
    authorIntent: string       // "What does the author want to provoke?"
    messageToAudience: string  // "What should the reader take away?"
    narrativeArc: string       // "How does the story unfold?"
    tone: string               // "How is the story told?"
    visualStyle: string        // "What does the world look like?"
  }
  tags: {
    style: string
    audience: string
    pageCount: number
    tone: string
  }
}
```

### Page (updated)

```typescript
interface Page {
  sequence: number
  sceneDescription: string
  narrativeText: string
  dialogue?: Dialogue[]
  mood: string
  imagePrompt: string
  imageUrl?: string
  imageStatus: ImageStatus
  audioUrl?: string           // NEW — Gemini TTS MP3 URL
}
```

### StoryBook (updated)

```typescript
interface StoryBook {
  id: string
  slug: string               // NEW — URL-friendly unique slug
  title: string
  concept: StoryConcept
  theme: string
  setting: string
  characters: Character[]
  pages: Page[]
  status: BookStatus
  createdAt: string
  updatedAt: string
}
```

### ProgressEvent (updated)

```typescript
type ProgressEvent =
  | { type: 'status'; message: string }
  | { type: 'story-ready'; data: StoryBook }
  | { type: 'image-done'; page: number; url: string }
  | { type: 'audio-done'; page: number; url: string }    // NEW
  | { type: 'complete'; data: StoryBook }
  | { type: 'error'; message: string }
```

### AppPhase (updated)

```typescript
type AppPhase = 'input' | 'concepts' | 'refine' | 'generating' | 'viewer'
```

### ChatMessage (new)

```typescript
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
```

---

## Database Schema

```sql
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null,
  data jsonb not null,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_books_user_id on public.books(user_id);
create index idx_books_slug on public.books(slug);

alter table public.books enable row level security;

create policy "Users can read own books" on public.books
  for select using (auth.uid() = user_id);
create policy "Users can insert own books" on public.books
  for insert with check (auth.uid() = user_id);
create policy "Users can update own books" on public.books
  for update using (auth.uid() = user_id);
create policy "Users can delete own books" on public.books
  for delete using (auth.uid() = user_id);
create policy "Anyone can read public books" on public.books
  for select using (is_public = true);
```

Audio files: `story-assets` bucket at `audio/{book_id}/page-{n}.mp3`

---

## API Routes

### New routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/v1/story/refine` | POST | No | Chat refinement of concept (free, max 3 rounds) |
| `/api/v1/story/save` | POST | Required | Save book to Supabase + trigger revalidation |
| `/api/v1/story/share` | POST | Required | Toggle `is_public`, return share URL |
| `/api/v1/story/books` | GET | Required | List user's books for bookshelf |
| `/api/v1/story/books/[id]` | DELETE | Required | Delete a book |

### Modified routes

| Route | Changes |
|---|---|
| `POST /api/v1/story/generate` | Add TTS generation step + audio-done events + auto-save to DB |
| `POST /api/v1/story/concepts` | Enhanced prompt for rich concept sections |

### Refine endpoint details

- Input: `{ concept: StoryConcept, message: string, history: ChatMessage[] }`
- Output: `{ concept: StoryConcept, reply: string }`
- No credit charge
- Max 3 user messages in history

---

## Pages & Routes

| Route | Type | Auth | Purpose |
|---|---|---|---|
| `/tools/story-studio/bookshelf` | Client page | Required | User's book library grid |
| `/tools/story-studio/book/[slug]` | Server + Client hybrid | Public | Static preview + interactive viewer |

### Static page `/tools/story-studio/book/[slug]`

- Server component fetches book from Supabase by slug
- `generateMetadata` returns OG tags (title, description, cover image URL)
- Static preview: cover image, title, author intent, first page preview
- "Read Full Book" button hydrates interactive BookViewer with MP3 audio
- "Create Your Own Story" CTA at bottom
- Revalidated via `revalidatePath` on book save

### Bookshelf page

- Grid of book cards (cover thumbnail, title, audience tag, date)
- Click opens book in viewer
- Share button (toggles public, copies link)
- Delete button (with confirmation)
- Empty state: "No books yet — create your first story!"

---

## Audio Generation

- Model: `gemini-2.5-flash-preview-tts`
- Generate per-page: narrative text + dialogue as input
- Output: MP3 stored in Supabase `story-assets/audio/{book_id}/page-{n}.mp3`
- Generated in parallel after illustrations complete
- Cost: ~$0.001 per book (negligible)
- Book viewer plays MP3 if `audioUrl` exists, falls back to browser Speech API

---

## Generation Flow (Updated End-to-End)

1. Deduct 50 credits
2. "Writing your story..." → Gemini generates text → emit `story-ready`
3. "Illustrating pages..." → Imagen 3 parallel → emit `image-done` per page
4. "Recording narration..." → Gemini TTS parallel → emit `audio-done` per page
5. Save to `books` table → generate slug → `revalidatePath`
6. Emit `complete` with final StoryBook (includes slug, audioUrls, imageUrls)

On failure at any step: refund credits, return partial with error.

---

## Credits

- Concept generation: free
- Concept refinement: free (max 3 rounds)
- Full book generation: 50 credits (text + illustrations + TTS + storage + static page)
- Story regeneration (editor): 10 credits
- Image regeneration (editor): 5 credits
- PDF export: 5 credits

---

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Bookshelf as separate page | Tab in studio, user profile | Clean separation, dedicated URL |
| 2 | Chat-based concept refinement | Tone selector, editable fields | Most natural UX, flexible |
| 3 | 3-round refinement cap | Unlimited, 1 round | Cost control + user flexibility |
| 4 | Full book data in Supabase JSONB | Normalized tables, metadata only | Simple, fast single-query reads |
| 5 | Shareable links (private by default) | Private only, public library | Viral potential without moderation |
| 6 | Unlimited books per user | Soft limit | Simplest approach |
| 7 | Read-only viewer + "Create your own" CTA | Full viewer, viewer with fork | Drives signups without complexity |
| 8 | Static page on book save (ISR) | On first share, on-demand cached | Always ready, fastest shared experience |
| 9 | Static preview + interactive viewer hydrates | Full static, preview only | Best SEO + full experience |
| 10 | Gemini TTS, MP3 in Supabase | Browser Speech API only, Google Cloud TTS | Practically free, consistent quality |
| 11 | Rich concept sections | Brief summary only | Clear hooks for refinement chat |
| 12 | Ephemeral refinement chat | Persist chat history | Only final concept matters |

---

## Implementation Order

1. Update types — enhanced StoryConcept, Page.audioUrl, StoryBook.slug, ChatMessage, AppPhase.refine
2. Supabase migration — create `books` table with RLS
3. Update concept generation prompt — rich sections output
4. Update concept-cards UI — display sections with headings
5. Create refine API route + refinement-chat component
6. Create TTS generation utility (Gemini TTS → MP3 → Supabase upload)
7. Update generate route — add TTS step + auto-save to DB + slug generation
8. Update generate progress UI — audio-done events
9. Update book-viewer — MP3 audio playback with fallback to browser TTS
10. Create bookshelf page + API routes (list, delete)
11. Create share API route + share button in viewer
12. Create static book page `/tools/story-studio/book/[slug]` with OG tags
13. Update page.tsx — add refine phase to flow
14. Update use-story-book hook — refine state, load from DB instead of localStorage
