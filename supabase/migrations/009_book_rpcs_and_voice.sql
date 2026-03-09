-- Book RPCs (depend on series_id column added in 007)
-- Voice column for series_characters
-- get_user_series RPC

-- =============================================================================
-- 1. Add voice column to series_characters (was added on cloud, missing from migrations)
-- =============================================================================
ALTER TABLE public.series_characters
  ADD COLUMN IF NOT EXISTS voice TEXT;

-- =============================================================================
-- 2. Update add_series_character to accept voice parameter
-- =============================================================================
CREATE OR REPLACE FUNCTION public.add_series_character(
  p_series_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT '',
  p_voice TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_count INT;
  v_char_id UUID;
BEGIN
  SELECT s.user_id INTO v_user_id
    FROM public.series s
   WHERE s.id = p_series_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'series_not_found'
      USING DETAIL = json_build_object('series_id', p_series_id)::TEXT;
  END IF;

  SELECT COUNT(*) INTO v_count
    FROM public.series_characters sc
   WHERE sc.series_id = p_series_id;

  IF v_count >= 20 THEN
    RAISE EXCEPTION 'max_characters_reached'
      USING DETAIL = json_build_object('series_id', p_series_id, 'current_count', v_count, 'max', 20)::TEXT;
  END IF;

  INSERT INTO public.series_characters (series_id, name, description, voice, status)
  VALUES (p_series_id, p_name, p_description, p_voice, 'draft')
  RETURNING id INTO v_char_id;

  RETURN v_char_id;
END;
$$;

-- =============================================================================
-- 3. Update get_series_with_characters to include voice
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_series_with_characters(
  p_series_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  setting TEXT,
  art_style TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  characters JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.user_id, s.title, s.description, s.setting, s.art_style,
    s.is_public, s.created_at, s.updated_at,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', sc.id,
          'name', sc.name,
          'description', sc.description,
          'referenceImageUrl', sc.reference_image_url,
          'status', sc.status,
          'voice', sc.voice,
          'refinementCount', sc.refinement_count
        ) ORDER BY sc.created_at
      )
      FROM public.series_characters sc WHERE sc.series_id = s.id),
      '[]'::JSONB
    ) AS characters
  FROM public.series s
  WHERE s.id = p_series_id
    AND (s.is_public = true OR s.user_id = p_user_id);
END;
$$;

-- =============================================================================
-- 4. Book RPCs (need series_id column from 007)
-- =============================================================================

-- RPC: insert_book
CREATE OR REPLACE FUNCTION public.insert_book(
  p_user_id UUID,
  p_slug TEXT,
  p_data JSONB,
  p_is_public BOOLEAN DEFAULT false,
  p_series_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.books (user_id, slug, data, is_public, series_id)
  VALUES (p_user_id, p_slug, p_data, p_is_public, p_series_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- RPC: get_user_books
CREATE OR REPLACE FUNCTION public.get_user_books(p_user_id UUID)
RETURNS SETOF public.books
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM public.books WHERE user_id = p_user_id ORDER BY created_at DESC;
$$;

-- RPC: get_book_by_slug
CREATE OR REPLACE FUNCTION public.get_book_by_slug(p_slug TEXT, p_user_id UUID DEFAULT NULL)
RETURNS SETOF public.books
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM public.books
  WHERE slug = p_slug
    AND (is_public = true OR user_id = p_user_id)
  LIMIT 1;
$$;

-- RPC: update_book_data
CREATE OR REPLACE FUNCTION public.update_book_data(
  p_user_id UUID,
  p_book_id UUID,
  p_data JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.books
  SET data = p_data, updated_at = now()
  WHERE id = p_book_id AND user_id = p_user_id;
  RETURN FOUND;
END;
$$;

-- RPC: delete_user_book
CREATE OR REPLACE FUNCTION public.delete_user_book(
  p_user_id UUID,
  p_book_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.books WHERE id = p_book_id AND user_id = p_user_id;
  RETURN FOUND;
END;
$$;

-- RPC: share_book
CREATE OR REPLACE FUNCTION public.share_book(
  p_user_id UUID,
  p_book_id UUID,
  p_is_public BOOLEAN
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_slug TEXT;
BEGIN
  UPDATE public.books
  SET is_public = p_is_public, updated_at = now()
  WHERE id = p_book_id AND user_id = p_user_id
  RETURNING slug INTO v_slug;
  RETURN v_slug;
END;
$$;

-- =============================================================================
-- 5. get_user_series — returns series with character + book counts
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_user_series(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  setting TEXT,
  art_style TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  character_count BIGINT,
  book_count BIGINT,
  characters JSONB
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    s.id, s.title, s.description, s.setting, s.art_style,
    s.is_public, s.created_at, s.updated_at,
    (SELECT count(*) FROM public.series_characters sc WHERE sc.series_id = s.id) AS character_count,
    (SELECT count(*) FROM public.books b WHERE b.series_id = s.id) AS book_count,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', sc.id,
        'name', sc.name,
        'description', sc.description,
        'reference_image_url', sc.reference_image_url,
        'status', sc.status,
        'voice', sc.voice,
        'refinement_count', sc.refinement_count
      ) ORDER BY sc.created_at)
      FROM public.series_characters sc WHERE sc.series_id = s.id),
      '[]'::jsonb
    ) AS characters
  FROM public.series s
  WHERE s.user_id = p_user_id
  ORDER BY s.updated_at DESC;
$$;
