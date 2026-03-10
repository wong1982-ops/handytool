-- =============================================================================
-- Bookshelf Performance Optimization
-- 1. Add missing index on books.series_id
-- 2. Create lightweight bookshelf RPC (no full data JSONB)
-- 3. Create lightweight series books RPC (no full data JSONB)
-- =============================================================================

-- 1. Index on series_id for fast series-based lookups
CREATE INDEX IF NOT EXISTS idx_books_series_id ON public.books(series_id);

-- 2. Lightweight bookshelf RPC — returns only metadata, no full data JSONB
--    Extracts title, cover, page count, authors, tags from data JSONB inline
--    Joins series table to get series title in a single query (no N+1)
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
  created_at TIMESTAMPTZ,
  series_id UUID,
  series_title TEXT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    b.id,
    b.slug,
    COALESCE(b.data->>'title', 'Untitled') AS title,
    COALESCE(b.data->'authors', '["AI"]'::jsonb) AS authors,
    COALESCE(
      b.data->>'coverImageUrl',
      b.data->'pages'->0->>'imageUrl'
    ) AS cover_image_url,
    COALESCE(b.data->'concept'->'tags'->>'audience', '') AS audience,
    COALESCE(b.data->'concept'->'tags'->>'style', '') AS style,
    COALESCE(jsonb_array_length(b.data->'pages'), 0)::INT AS page_count,
    b.is_public,
    b.created_at,
    b.series_id,
    s.title AS series_title
  FROM public.books b
  LEFT JOIN public.series s ON s.id = b.series_id
  WHERE b.user_id = p_user_id
  ORDER BY b.created_at DESC;
$$;

-- 3. Lightweight series books RPC — for series detail page
CREATE OR REPLACE FUNCTION public.get_series_books_lightweight(p_series_id UUID)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  cover_image_url TEXT,
  page_count INT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    b.id,
    b.slug,
    COALESCE(b.data->>'title', 'Untitled') AS title,
    COALESCE(
      b.data->>'coverImageUrl',
      b.data->'pages'->0->>'imageUrl'
    ) AS cover_image_url,
    COALESCE(jsonb_array_length(b.data->'pages'), 0)::INT AS page_count,
    b.is_public,
    b.created_at
  FROM public.books b
  WHERE b.series_id = p_series_id
  ORDER BY b.created_at DESC;
$$;
