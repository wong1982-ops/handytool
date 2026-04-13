# Bookshelf Performance Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bookshelf page load instantly by adding `has_audio`/`has_illustrations` boolean columns to the `books` table and removing all JSONB scanning from the query path.

**Architecture:** Add two boolean columns to `books`, backfill from existing JSONB data, update the bookshelf RPC to read columns instead of scanning, and update three API write paths to set flags on success.

**Tech Stack:** Supabase (PostgreSQL), Next.js API routes, TypeScript

---

### Task 1: Database migration — add columns, backfill, update RPC

**Files:**
- Create: `supabase/migrations/049_bookshelf_bool_columns.sql`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/049_bookshelf_bool_columns.sql`:

```sql
-- Add physical boolean columns for fast bookshelf queries
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS has_audio BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_illustrations BOOLEAN NOT NULL DEFAULT false;

-- Backfill from existing JSONB data (one-time, runs once during migration)
UPDATE public.books SET
  has_illustrations = (
    (cover_url IS NOT NULL AND cover_url != '')
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(data->'pages', '[]'::jsonb)) p
      WHERE p->>'imageUrl' IS NOT NULL AND p->>'imageUrl' != ''
    )
  ),
  has_audio = EXISTS (
    SELECT 1 FROM jsonb_array_elements(COALESCE(data->'pages', '[]'::jsonb)) p
    WHERE p->>'audioUrl' IS NOT NULL AND p->>'audioUrl' != ''
  );

-- Create index for bookshelf queries
CREATE INDEX IF NOT EXISTS idx_books_user_created
  ON public.books (user_id, created_at DESC);

-- Update bookshelf RPC: read columns directly, no JSONB scanning
DROP FUNCTION IF EXISTS public.get_user_bookshelf(UUID);

CREATE OR REPLACE FUNCTION public.get_user_bookshelf(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  authors JSONB,
  cover_image_url TEXT,
  audience TEXT,
  style TEXT,
  page_count INT,
  is_public BOOLEAN,
  has_audio BOOLEAN,
  has_illustrations BOOLEAN,
  created_at TIMESTAMPTZ,
  series_id UUID,
  series_title TEXT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    b.id,
    b.slug,
    COALESCE(b.title, b.data->>'title', 'Untitled') AS title,
    COALESCE(b.data->'authors', '["AI"]'::jsonb) AS authors,
    b.cover_url AS cover_image_url,
    COALESCE(b.audience, '') AS audience,
    COALESCE(b.style, '') AS style,
    COALESCE(b.page_count, 0) AS page_count,
    b.is_public,
    b.has_audio,
    b.has_illustrations,
    b.created_at,
    b.series_id,
    s.title AS series_title
  FROM public.books b
  LEFT JOIN public.series s ON s.id = b.series_id
  WHERE b.user_id = p_user_id
  ORDER BY b.created_at DESC;
$$;
```

- [ ] **Step 2: Apply migration to Supabase**

Run via Supabase MCP tool `apply_migration` with project_id `wgrcfnumbozvtmhcavnm`, name `bookshelf_bool_columns`, and the SQL above.

- [ ] **Step 3: Verify migration**

Run via Supabase MCP `execute_sql`:
```sql
SELECT id, title, has_audio, has_illustrations
FROM get_user_bookshelf('10776ca1-8687-4e05-92dc-5df0db8900bc')
LIMIT 3;
```

Expected: returns rows with correct `has_audio`/`has_illustrations` boolean values, fast (<1s).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/049_bookshelf_bool_columns.sql
git commit -m "feat(db): add has_audio/has_illustrations columns to books table

Physical boolean columns replace expensive JSONB scanning.
Backfills existing data and updates bookshelf RPC."
```

---

### Task 2: Update illustration write path

**Files:**
- Modify: `app/api/v1/story/books/[id]/illustrate/route.ts:160` (after upsert_page_illustration/upsert_book_cover)

- [ ] **Step 1: Add has_illustrations flag update after successful generation**

In `app/api/v1/story/books/[id]/illustrate/route.ts`, after the `upsert_page_illustration` / `upsert_book_cover` RPC calls succeed (around line 160, before `confirm_reserved_credits`), add:

```typescript
    // Mark book as having illustrations
    await supabase.from('books').update({ has_illustrations: true }).eq('id', bookId)
```

Insert this line right after line 160 (after the closing `}` of the if/else block for pageId vs cover), before the `confirm_reserved_credits` call.

The full context after edit should read:
```typescript
    // Store result via SECURITY DEFINER RPCs
    if (pageId) {
      await supabase.rpc('upsert_page_illustration', {
        p_book_page_id: pageId,
        p_image_url: result.url,
        p_status: 'done',
        p_quality_mode: qualityMode,
        p_generation_config: { prompt: imagePrompt, characterIds },
      })
    } else {
      await supabase.rpc('upsert_book_cover', {
        p_book_id: bookId,
        p_image_url: result.url,
        p_status: 'done',
        p_prompt: imagePrompt,
      })
    }

    // Mark book as having illustrations
    await supabase.from('books').update({ has_illustrations: true }).eq('id', bookId)

    await supabase.rpc('confirm_reserved_credits', {
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/[id]/illustrate/route.ts
git commit -m "feat: set has_illustrations flag on illustration generation"
```

---

### Task 3: Update narration write path

**Files:**
- Modify: `app/api/v1/story/books/[id]/narrate/route.ts:237` (after upsert_page_audio)

- [ ] **Step 1: Add has_audio flag update after successful narration**

In `app/api/v1/story/books/[id]/narrate/route.ts`, after the `upsert_page_audio` RPC call succeeds (line 237), before `confirm_reserved_credits`, add:

```typescript
    // Mark book as having audio
    await supabase.from('books').update({ has_audio: true }).eq('id', bookId)
```

The full context after edit should read:
```typescript
    // Store result via SECURITY DEFINER RPC
    await supabase.rpc('upsert_page_audio', {
      p_book_page_id: pageId,
      p_audio_url: result.audioUrl,
      p_status: 'done',
      p_voice_map: finalVoiceMap,
      p_duration_seconds: null,
    })

    // Mark book as having audio
    await supabase.from('books').update({ has_audio: true }).eq('id', bookId)

    // Confirm credits
    await supabase.rpc('confirm_reserved_credits', {
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/books/[id]/narrate/route.ts
git commit -m "feat: set has_audio flag on narration generation"
```

---

### Task 4: Update bulk job save path

**Files:**
- Modify: `app/api/v1/story/jobs/[id]/save/route.ts:87-117` (after book save, before credit confirmation)

- [ ] **Step 1: Add flag updates after bulk job save**

In `app/api/v1/story/jobs/[id]/save/route.ts`, after `savedBookId` is assigned in both the bulk and insert branches (around line 117, after the closing `}` of the if/else block), add:

```typescript
  // Set has_audio / has_illustrations flags based on job mode
  const flagUpdate: Record<string, boolean> = {}
  if (bookMode === 'bulk-illustrate') {
    flagUpdate.has_illustrations = true
  } else if (bookMode === 'bulk-narrate') {
    flagUpdate.has_audio = true
  } else {
    // speed/professional mode — check the generated pages
    const pages = Array.isArray(finalBook.pages) ? finalBook.pages : []
    if (pages.some((p: Record<string, unknown>) => p.imageUrl)) flagUpdate.has_illustrations = true
    if (pages.some((p: Record<string, unknown>) => p.audioUrl)) flagUpdate.has_audio = true
  }
  if (Object.keys(flagUpdate).length > 0) {
    await supabase.from('books').update(flagUpdate).eq('id', savedBookId)
  }
```

Insert this between line 117 (closing `}` of if/else) and line 119 (`// Confirm credit reservation`).

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/story/jobs/[id]/save/route.ts
git commit -m "feat: set has_audio/has_illustrations flags on bulk job save"
```

---

### Task 5: Verify API route reads columns correctly

**Files:**
- Verify: `app/api/v1/story/books/route.ts` (GET handler)

- [ ] **Step 1: Verify the GET handler maps RPC columns**

Check that the `GET` handler in `app/api/v1/story/books/route.ts` maps `b.has_audio` and `b.has_illustrations` from the RPC response. The current code should already have:

```typescript
    hasAudio: Boolean(b.has_audio),
    hasIllustrations: Boolean(b.has_illustrations),
```

If not, update it.

- [ ] **Step 2: Test the full flow in browser**

1. Restart dev server: `pnpm dev`
2. Open `http://localhost:3000/tools/story-studio`
3. Verify: story cards load fast (< 1s)
4. Verify: illustration badges appear on books that have cover images
5. Verify: audio badges appear on books that have narration

- [ ] **Step 3: Commit if any changes were needed**

```bash
git add app/api/v1/story/books/route.ts
git commit -m "fix: ensure bookshelf reads has_audio/has_illustrations from columns"
```

---

### Task 6: Clean up old migrations and unused code

**Files:**
- Delete or mark deprecated: `supabase/migrations/047_bookshelf_audio_flags.sql`
- Delete or mark deprecated: `supabase/migrations/048_bookshelf_paged.sql`

- [ ] **Step 1: Add deprecation comments to old migration files**

Add a comment at the top of `047_bookshelf_audio_flags.sql`:
```sql
-- DEPRECATED: Superseded by 049_bookshelf_bool_columns.sql
-- This migration added expensive jsonb_array_elements scanning to the bookshelf RPC.
-- The new migration uses physical boolean columns instead.
```

Add a comment at the top of `048_bookshelf_paged.sql`:
```sql
-- DEPRECATED: Superseded by 049_bookshelf_bool_columns.sql
-- Pagination is handled in JS; the fast non-paginated RPC is sufficient.
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/047_bookshelf_audio_flags.sql supabase/migrations/048_bookshelf_paged.sql
git commit -m "chore: deprecate old bookshelf RPC migrations superseded by 049"
```
