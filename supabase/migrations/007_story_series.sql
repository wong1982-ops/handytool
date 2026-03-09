-- Story Series: persistent character consistency across multiple books
-- Enables users to create a series with shared characters, art style, and setting.

-- =============================================================================
-- 1. series — the container for a book series
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  setting TEXT DEFAULT '',
  art_style TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_series_user ON public.series (user_id);

-- =============================================================================
-- 2. series_characters — characters in a series (max 4 per series)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.series_characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.series ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  reference_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  refinement_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_series_characters_series ON public.series_characters (series_id);

-- =============================================================================
-- 3. Add series_id to books (nullable FK for optional series membership)
-- =============================================================================
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.series ON DELETE SET NULL;

CREATE INDEX idx_books_series ON public.books (series_id) WHERE series_id IS NOT NULL;

-- =============================================================================
-- 4. Row Level Security
-- =============================================================================
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_characters ENABLE ROW LEVEL SECURITY;

-- Series: owners can CRUD, public series readable by anyone
CREATE POLICY "Users manage own series"
  ON public.series FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public series readable by anyone"
  ON public.series FOR SELECT TO anon, authenticated
  USING (is_public = true);

-- Characters: accessible if user owns the series
CREATE POLICY "Users manage own series characters"
  ON public.series_characters FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.user_id = auth.uid())
  );

-- Characters in public series are readable
CREATE POLICY "Public series characters readable"
  ON public.series_characters FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.is_public = true)
  );

-- =============================================================================
-- 5. Grants
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.series TO authenticated;
GRANT SELECT ON public.series TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.series_characters TO authenticated;
GRANT SELECT ON public.series_characters TO anon;

-- =============================================================================
-- 6. RPC: add_series_character — enforces max 4 characters per series
-- =============================================================================
CREATE OR REPLACE FUNCTION public.add_series_character(
  p_series_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT ''
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
  -- Verify ownership
  SELECT s.user_id INTO v_user_id
    FROM public.series s
   WHERE s.id = p_series_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'series_not_found'
      USING DETAIL = json_build_object('series_id', p_series_id)::TEXT;
  END IF;

  -- Count existing characters
  SELECT COUNT(*) INTO v_count
    FROM public.series_characters sc
   WHERE sc.series_id = p_series_id;

  IF v_count >= 4 THEN
    RAISE EXCEPTION 'max_characters_reached'
      USING DETAIL = json_build_object('series_id', p_series_id, 'current_count', v_count, 'max', 4)::TEXT;
  END IF;

  -- Insert
  INSERT INTO public.series_characters (series_id, name, description, status)
  VALUES (p_series_id, p_name, p_description, 'draft')
  RETURNING id INTO v_char_id;

  RETURN v_char_id;
END;
$$;

-- =============================================================================
-- 7. RPC: get_series_with_characters — fetch series + characters in one call
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
    s.id,
    s.user_id,
    s.title,
    s.description,
    s.setting,
    s.art_style,
    s.is_public,
    s.created_at,
    s.updated_at,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', sc.id,
          'name', sc.name,
          'description', sc.description,
          'referenceImageUrl', sc.reference_image_url,
          'status', sc.status,
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
-- 8. RPC: check_series_ready — verify series has at least 1 approved character
-- =============================================================================
CREATE OR REPLACE FUNCTION public.check_series_ready(p_series_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
    FROM public.series_characters sc
   WHERE sc.series_id = p_series_id
     AND sc.status = 'approved';

  RETURN v_count > 0;
END;
$$;
