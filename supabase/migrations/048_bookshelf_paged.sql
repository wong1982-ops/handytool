-- DEPRECATED: Superseded by 049_bookshelf_bool_columns.sql
-- Pagination is handled in JS; the fast non-paginated RPC is sufficient.
--
-- Original description:
-- Migration: Add paginated version of get_user_bookshelf
-- Supports cursor-based pagination (cursor = created_at of last item)

CREATE OR REPLACE FUNCTION public.get_user_bookshelf_paged(
  p_user_id UUID,
  p_limit INT DEFAULT 12,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
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
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(b.data->'pages', '[]'::jsonb)) AS p
      WHERE p->>'audioUrl' IS NOT NULL AND p->>'audioUrl' != ''
    ) AS has_audio,
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(b.data->'pages', '[]'::jsonb)) AS p
      WHERE p->>'imageUrl' IS NOT NULL AND p->>'imageUrl' != ''
    ) AS has_illustrations,
    b.created_at,
    b.series_id,
    s.title AS series_title
  FROM public.books b
  LEFT JOIN public.series s ON s.id = b.series_id
  WHERE b.user_id = p_user_id
    AND (p_cursor IS NULL OR b.created_at < p_cursor)
  ORDER BY b.created_at DESC
  LIMIT p_limit;
$$;
