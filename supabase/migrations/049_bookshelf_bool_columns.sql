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
