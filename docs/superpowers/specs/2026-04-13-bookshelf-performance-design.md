# Bookshelf Performance Optimization

## Problem

The bookshelf page (`/tools/story-studio`) loads slowly because the `get_user_bookshelf` RPC:
1. Touches the heavy `data` JSONB column (contains all page content, prompts, dialogue)
2. Previously computed `has_audio`/`has_illustrations` via `jsonb_array_elements` EXISTS subqueries — O(n*m) per request where n = books, m = pages per book

## Solution

Add `has_audio` and `has_illustrations` as **physical boolean columns** on the `books` table, updated at write time. Remove all JSONB scanning from the bookshelf query path.

## Database Changes

### New columns on `books` table

```sql
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS has_audio BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_illustrations BOOLEAN NOT NULL DEFAULT false;
```

### Backfill existing data (one-time)

```sql
UPDATE public.books SET
  has_illustrations = EXISTS (
    SELECT 1 FROM jsonb_array_elements(COALESCE(data->'pages', '[]'::jsonb)) p
    WHERE p->>'imageUrl' IS NOT NULL AND p->>'imageUrl' != ''
  ) OR (cover_url IS NOT NULL AND cover_url != ''),
  has_audio = EXISTS (
    SELECT 1 FROM jsonb_array_elements(COALESCE(data->'pages', '[]'::jsonb)) p
    WHERE p->>'audioUrl' IS NOT NULL AND p->>'audioUrl' != ''
  );
```

### Updated `get_user_bookshelf` RPC

Read `has_audio` and `has_illustrations` directly from columns. No JSONB scanning. No `data` column in SELECT.

```sql
CREATE OR REPLACE FUNCTION public.get_user_bookshelf(p_user_id UUID)
RETURNS TABLE (
  id UUID, slug TEXT, title TEXT, authors JSONB, cover_image_url TEXT,
  audience TEXT, style TEXT, page_count INT, is_public BOOLEAN,
  has_audio BOOLEAN, has_illustrations BOOLEAN,
  created_at TIMESTAMPTZ, series_id UUID, series_title TEXT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    b.id, b.slug,
    COALESCE(b.title, 'Untitled'),
    COALESCE(b.data->'authors', '["AI"]'::jsonb),
    b.cover_url,
    COALESCE(b.audience, ''), COALESCE(b.style, ''),
    COALESCE(b.page_count, 0), b.is_public,
    b.has_audio, b.has_illustrations,
    b.created_at, b.series_id,
    s.title
  FROM public.books b
  LEFT JOIN public.series s ON s.id = b.series_id
  WHERE b.user_id = p_user_id
  ORDER BY b.created_at DESC;
$$;
```

**Note:** `b.data->'authors'` is a lightweight JSONB key access (no array scanning). This is the only remaining `data` reference and is fast.

## Write Path Changes

### 1. Single-page illustration (`/api/v1/story/books/[id]/illustrate`)

After successful `upsert_page_illustration` or `upsert_book_cover`, set:
```ts
await supabase.from('books').update({ has_illustrations: true }).eq('id', bookId)
```

### 2. Single-page narration (`/api/v1/story/books/[id]/narrate`)

After successful `upsert_page_audio`, set:
```ts
await supabase.from('books').update({ has_audio: true }).eq('id', bookId)
```

### 3. Bulk job save (`/api/v1/story/jobs/[id]/save`)

After `update_book_data` or `insert_book` completes:
- If mode is `bulk-illustrate` or new book has pages with imageUrl: set `has_illustrations = true`
- If mode is `bulk-narrate` or new book has pages with audioUrl: set `has_audio = true`
- For `speed`/`professional` mode new books: scan the final pages once to set both flags

### 4. RPC `insert_book` (optional enhancement)

The RPC can set flags by scanning the input `p_data` at insert time. Since this runs once per book creation, the cost is acceptable.

## API Route Changes

### `GET /api/v1/story/books` (bookshelf list)

- Use `get_user_bookshelf` RPC (reads columns, no JSONB scanning)
- Map `b.has_audio` and `b.has_illustrations` directly
- Pagination: JS-side cursor filter on `created_at` (RPC returns all, filtered in API)

## Files to Modify

| File | Change |
|---|---|
| `supabase/migrations/049_bookshelf_bool_columns.sql` | Add columns, backfill, update RPC |
| `app/api/v1/story/books/[id]/illustrate/route.ts` | Set `has_illustrations = true` after success |
| `app/api/v1/story/books/[id]/narrate/route.ts` | Set `has_audio = true` after success |
| `app/api/v1/story/jobs/[id]/save/route.ts` | Set flags after bulk job save |
| `app/api/v1/story/books/route.ts` | Read from RPC columns (already does this) |

## Performance Impact

- **Before:** Bookshelf query scans every page of every book via `jsonb_array_elements` — O(n*m), timeouts on 10+ books
- **After:** Simple column read — O(n), milliseconds regardless of page count

## Risks

- **Stale flags:** If a user deletes all illustrations from a book, `has_illustrations` remains `true`. Acceptable for now — the flag means "has ever had illustrations" which is still useful for the badge. Can add a cleanup path later if needed.
