-- =============================================================================
-- Book Detail Page Performance
-- 1. Rewrite get_book_by_slug with extended timeout
-- 2. Shell RPC — metadata without pages (fast initial load)
-- 3. Pages RPC — paginated page extraction from JSONB
-- =============================================================================

-- 1. Rewrite get_book_by_slug with extended timeout for large JSONB
CREATE OR REPLACE FUNCTION public.get_book_by_slug(p_slug TEXT, p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  slug TEXT,
  data JSONB,
  is_public BOOLEAN,
  series_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM set_config('statement_timeout', '30000', true);
  RETURN QUERY
  SELECT b.id, b.user_id, b.slug, b.data, b.is_public, b.series_id, b.created_at, b.updated_at
  FROM public.books b
  WHERE b.slug = p_slug
    AND (b.is_public = true OR b.user_id = p_user_id)
  LIMIT 1;
END;
$$;

-- 2. Shell RPC — returns book metadata WITHOUT the pages array
--    Uses jsonb subtraction operator to strip pages from the data JSONB
--    Returns page_count so the client knows how many pages to lazy-load
CREATE OR REPLACE FUNCTION public.get_book_shell_by_slug(p_slug TEXT, p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  slug TEXT,
  data JSONB,
  is_public BOOLEAN,
  series_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  page_count INT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    b.id,
    b.user_id,
    b.slug,
    b.data - 'pages' AS data,
    b.is_public,
    b.series_id,
    b.created_at,
    b.updated_at,
    COALESCE(jsonb_array_length(b.data->'pages'), 0)::INT AS page_count
  FROM public.books b
  WHERE b.slug = p_slug
    AND (b.is_public = true OR b.user_id = p_user_id)
  LIMIT 1;
$$;

-- 3. Pages RPC — extracts pages from the data JSONB with offset/limit
--    Returns individual page objects as JSONB rows for lazy loading
CREATE OR REPLACE FUNCTION public.get_book_pages(
  p_book_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_offset INT DEFAULT 0,
  p_limit INT DEFAULT 4
)
RETURNS TABLE (
  page_data JSONB
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT elem AS page_data
  FROM public.books b,
    jsonb_array_elements(b.data->'pages') WITH ORDINALITY AS arr(elem, idx)
  WHERE b.id = p_book_id
    AND (b.is_public = true OR b.user_id = p_user_id)
  ORDER BY arr.idx
  OFFSET p_offset
  LIMIT p_limit;
$$;
