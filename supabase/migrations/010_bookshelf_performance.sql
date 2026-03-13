-- =============================================================================
-- Bookshelf Performance Optimization
-- 1. Add missing index on books.series_id
-- 2. Denormalized metadata columns (avoid parsing 10-35MB JSONB per book)
-- 3. Lightweight bookshelf RPC using denormalized columns
-- 4. Lightweight series books RPC using denormalized columns
-- 5. Updated insert_book to populate metadata columns
-- =============================================================================

-- 1. Index on series_id for fast series-based lookups
CREATE INDEX IF NOT EXISTS idx_books_series_id ON public.books(series_id);

-- 2. Denormalized metadata columns — avoid parsing huge JSONB on every bookshelf load
--    Some books have 10-35MB data columns (base64 images embedded in pages).
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS page_count INT DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT '';
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS style TEXT DEFAULT '';

-- Backfill from existing data JSONB
UPDATE public.books SET
  title = COALESCE(data->>'title', 'Untitled'),
  cover_url = CASE
    WHEN (data->>'coverImageUrl') LIKE 'http%' THEN data->>'coverImageUrl'
    WHEN (data->'pages'->0->>'imageUrl') LIKE 'http%' THEN data->'pages'->0->>'imageUrl'
    ELSE NULL
  END,
  page_count = COALESCE(jsonb_array_length(data->'pages'), 0),
  audience = COALESCE(data->'concept'->'tags'->>'audience', ''),
  style = COALESCE(data->'concept'->'tags'->>'style', '')
WHERE title IS NULL;

-- 3. Lightweight bookshelf RPC — uses denormalized columns, zero JSONB parsing
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
    b.created_at,
    b.series_id,
    s.title AS series_title
  FROM public.books b
  LEFT JOIN public.series s ON s.id = b.series_id
  WHERE b.user_id = p_user_id
  ORDER BY b.created_at DESC;
$$;

-- 4. Lightweight series books RPC — uses denormalized columns
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
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    b.id,
    b.slug,
    COALESCE(b.title, b.data->>'title', 'Untitled') AS title,
    b.cover_url AS cover_image_url,
    COALESCE(b.page_count, 0) AS page_count,
    b.is_public,
    b.created_at
  FROM public.books b
  WHERE b.series_id = p_series_id
  ORDER BY b.created_at DESC;
$$;

-- 5. Updated insert_book to populate denormalized columns on insert
CREATE OR REPLACE FUNCTION public.insert_book(
  p_user_id UUID,
  p_slug TEXT,
  p_data JSONB,
  p_is_public BOOLEAN DEFAULT false,
  p_series_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.books (user_id, slug, data, is_public, series_id, title, cover_url, page_count, audience, style)
  VALUES (
    p_user_id,
    p_slug,
    p_data,
    p_is_public,
    p_series_id,
    COALESCE(p_data->>'title', 'Untitled'),
    CASE
      WHEN (p_data->>'coverImageUrl') LIKE 'http%' THEN p_data->>'coverImageUrl'
      ELSE NULL
    END,
    COALESCE(jsonb_array_length(p_data->'pages'), 0),
    COALESCE(p_data->'concept'->'tags'->>'audience', ''),
    COALESCE(p_data->'concept'->'tags'->>'style', '')
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
