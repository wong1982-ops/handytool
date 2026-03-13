-- =============================================================
-- 015_story_studio_rpcs.sql
-- Story Studio Modular Redesign — RPC functions
-- =============================================================

-- ---------- Character CRUD RPCs ----------

-- Insert a new character (top-level)
CREATE OR REPLACE FUNCTION public.insert_character(
  p_user_id UUID,
  p_name TEXT,
  p_age TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_personality TEXT DEFAULT NULL,
  p_physical_description TEXT DEFAULT NULL,
  p_reference_image_url TEXT DEFAULT NULL,
  p_voice TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.characters (user_id, name, age, role, personality, physical_description, reference_image_url, voice)
  VALUES (p_user_id, p_name, p_age, p_role, p_personality, p_physical_description, p_reference_image_url, p_voice)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Update a character
CREATE OR REPLACE FUNCTION public.update_character(
  p_user_id UUID,
  p_character_id UUID,
  p_name TEXT DEFAULT NULL,
  p_age TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_personality TEXT DEFAULT NULL,
  p_physical_description TEXT DEFAULT NULL,
  p_reference_image_url TEXT DEFAULT NULL,
  p_voice TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_refinement_count INT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.characters SET
    name = COALESCE(p_name, name),
    age = COALESCE(p_age, age),
    role = COALESCE(p_role, role),
    personality = COALESCE(p_personality, personality),
    physical_description = COALESCE(p_physical_description, physical_description),
    reference_image_url = COALESCE(p_reference_image_url, reference_image_url),
    voice = COALESCE(p_voice, voice),
    status = COALESCE(p_status, status),
    refinement_count = COALESCE(p_refinement_count, refinement_count),
    updated_at = now()
  WHERE id = p_character_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Delete a character
CREATE OR REPLACE FUNCTION public.delete_character(
  p_user_id UUID,
  p_character_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.characters
  WHERE id = p_character_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Get all characters for a user (with their series)
CREATE OR REPLACE FUNCTION public.get_user_characters(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age TEXT,
  role TEXT,
  personality TEXT,
  physical_description TEXT,
  reference_image_url TEXT,
  voice TEXT,
  status TEXT,
  refinement_count INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  series JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.name, c.age, c.role, c.personality,
    c.physical_description, c.reference_image_url,
    c.voice, c.status, c.refinement_count,
    c.created_at, c.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('id', s.id, 'title', s.title)
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::jsonb
    ) AS series
  FROM public.characters c
  LEFT JOIN public.character_series cs ON cs.character_id = c.id
  LEFT JOIN public.series s ON s.id = cs.series_id
  WHERE c.user_id = p_user_id
  GROUP BY c.id
  ORDER BY c.created_at DESC;
END;
$$;

-- ---------- Character-Series Link RPCs ----------

-- Link character to series (with soft limit warning)
CREATE OR REPLACE FUNCTION public.link_character_to_series(
  p_user_id UUID,
  p_character_id UUID,
  p_series_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_char_count INT;
  v_warning TEXT DEFAULT NULL;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM public.characters WHERE id = p_character_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Character not found or not owned by user';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.series WHERE id = p_series_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Series not found or not owned by user';
  END IF;

  -- Insert link (ignore if already exists)
  INSERT INTO public.character_series (character_id, series_id)
  VALUES (p_character_id, p_series_id)
  ON CONFLICT DO NOTHING;

  -- Check soft limit
  SELECT COUNT(*) INTO v_char_count
  FROM public.character_series WHERE series_id = p_series_id;

  IF v_char_count > 6 THEN
    v_warning := 'This series has ' || v_char_count || ' characters. More than 6 may reduce illustration consistency.';
  END IF;

  RETURN jsonb_build_object('ok', true, 'characterCount', v_char_count, 'warning', v_warning);
END;
$$;

-- Unlink character from series
CREATE OR REPLACE FUNCTION public.unlink_character_from_series(
  p_user_id UUID,
  p_character_id UUID,
  p_series_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.character_series
  WHERE character_id = p_character_id
    AND series_id = p_series_id
    AND EXISTS (SELECT 1 FROM public.characters WHERE id = p_character_id AND user_id = p_user_id);

  RETURN FOUND;
END;
$$;

-- ---------- Book Pages RPCs ----------

-- Insert a page into a book
CREATE OR REPLACE FUNCTION public.insert_book_page(
  p_user_id UUID,
  p_book_id UUID,
  p_sequence INT,
  p_scene_description TEXT DEFAULT NULL,
  p_narrative_text TEXT DEFAULT NULL,
  p_image_prompt TEXT DEFAULT NULL,
  p_dialogue JSONB DEFAULT '[]'::jsonb,
  p_mood TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Verify book ownership
  IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Book not found or not owned by user';
  END IF;

  INSERT INTO public.book_pages (book_id, sequence, scene_description, narrative_text, image_prompt, dialogue, mood)
  VALUES (p_book_id, p_sequence, p_scene_description, p_narrative_text, p_image_prompt, p_dialogue, p_mood)
  ON CONFLICT (book_id, sequence) DO UPDATE SET
    scene_description = EXCLUDED.scene_description,
    narrative_text = EXCLUDED.narrative_text,
    image_prompt = EXCLUDED.image_prompt,
    dialogue = EXCLUDED.dialogue,
    mood = EXCLUDED.mood,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Update a single book page
CREATE OR REPLACE FUNCTION public.update_book_page(
  p_user_id UUID,
  p_page_id UUID,
  p_scene_description TEXT DEFAULT NULL,
  p_narrative_text TEXT DEFAULT NULL,
  p_image_prompt TEXT DEFAULT NULL,
  p_dialogue JSONB DEFAULT NULL,
  p_mood TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.book_pages SET
    scene_description = COALESCE(p_scene_description, scene_description),
    narrative_text = COALESCE(p_narrative_text, narrative_text),
    image_prompt = COALESCE(p_image_prompt, image_prompt),
    dialogue = COALESCE(p_dialogue, dialogue),
    mood = COALESCE(p_mood, mood),
    updated_at = now()
  WHERE id = p_page_id
    AND EXISTS (
      SELECT 1 FROM public.books b WHERE b.id = book_pages.book_id AND b.user_id = p_user_id
    );

  RETURN FOUND;
END;
$$;

-- Get all pages for a book (with illustration and audio status)
CREATE OR REPLACE FUNCTION public.get_book_pages_with_media(
  p_book_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  book_id UUID,
  sequence INT,
  scene_description TEXT,
  narrative_text TEXT,
  image_prompt TEXT,
  dialogue JSONB,
  mood TEXT,
  illustration_id UUID,
  illustration_url TEXT,
  illustration_status TEXT,
  audio_id UUID,
  audio_url TEXT,
  audio_status TEXT,
  audio_duration FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify access: owner or public book
  IF p_user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND user_id = p_user_id) THEN
      RAISE EXCEPTION 'Book not found or not owned by user';
    END IF;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND is_public = true) THEN
      RAISE EXCEPTION 'Book not found or not public';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    bp.id, bp.book_id, bp.sequence,
    bp.scene_description, bp.narrative_text, bp.image_prompt,
    bp.dialogue, bp.mood,
    pi.id AS illustration_id,
    pi.image_url AS illustration_url,
    pi.status AS illustration_status,
    pa.id AS audio_id,
    pa.audio_url AS audio_url,
    pa.status AS audio_status,
    pa.duration_seconds AS audio_duration
  FROM public.book_pages bp
  LEFT JOIN LATERAL (
    SELECT pi2.id, pi2.image_url, pi2.status
    FROM public.page_illustrations pi2
    WHERE pi2.book_page_id = bp.id
    ORDER BY pi2.created_at DESC LIMIT 1
  ) pi ON true
  LEFT JOIN LATERAL (
    SELECT pa2.id, pa2.audio_url, pa2.status, pa2.duration_seconds
    FROM public.page_audio pa2
    WHERE pa2.book_page_id = bp.id
    ORDER BY pa2.created_at DESC LIMIT 1
  ) pa ON true
  ORDER BY bp.sequence;
END;
$$;

-- Delete a book page
CREATE OR REPLACE FUNCTION public.delete_book_page(
  p_user_id UUID,
  p_page_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.book_pages
  WHERE id = p_page_id
    AND EXISTS (
      SELECT 1 FROM public.books b WHERE b.id = book_pages.book_id AND b.user_id = p_user_id
    );

  RETURN FOUND;
END;
$$;

-- ---------- Media Generation RPCs ----------

-- Create a page illustration record (sets status to 'generating')
CREATE OR REPLACE FUNCTION public.create_page_illustration(
  p_user_id UUID,
  p_book_page_id UUID,
  p_quality_mode TEXT DEFAULT 'quality',
  p_generation_config JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Verify ownership via book_pages → books
  IF NOT EXISTS (
    SELECT 1 FROM public.book_pages bp
    JOIN public.books b ON b.id = bp.book_id
    WHERE bp.id = p_book_page_id AND b.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Page not found or not owned by user';
  END IF;

  INSERT INTO public.page_illustrations (book_page_id, status, quality_mode, generation_config)
  VALUES (p_book_page_id, 'generating', p_quality_mode, p_generation_config)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Complete a page illustration (set URL + status=done)
CREATE OR REPLACE FUNCTION public.complete_page_illustration(
  p_illustration_id UUID,
  p_image_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_illustrations
  SET image_url = p_image_url, status = 'done'
  WHERE id = p_illustration_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- Fail a page illustration
CREATE OR REPLACE FUNCTION public.fail_page_illustration(
  p_illustration_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_illustrations
  SET status = 'error', error_message = p_error
  WHERE id = p_illustration_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- Create a page audio record
CREATE OR REPLACE FUNCTION public.create_page_audio(
  p_user_id UUID,
  p_book_page_id UUID,
  p_voice_map JSONB DEFAULT NULL,
  p_narrator_voice TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.book_pages bp
    JOIN public.books b ON b.id = bp.book_id
    WHERE bp.id = p_book_page_id AND b.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Page not found or not owned by user';
  END IF;

  INSERT INTO public.page_audio (book_page_id, status, voice_map, narrator_voice)
  VALUES (p_book_page_id, 'generating', p_voice_map, p_narrator_voice)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Complete page audio
CREATE OR REPLACE FUNCTION public.complete_page_audio(
  p_audio_id UUID,
  p_audio_url TEXT,
  p_duration_seconds FLOAT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_audio
  SET audio_url = p_audio_url, status = 'done', duration_seconds = p_duration_seconds
  WHERE id = p_audio_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- Fail page audio
CREATE OR REPLACE FUNCTION public.fail_page_audio(
  p_audio_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_audio
  SET status = 'error', error_message = p_error
  WHERE id = p_audio_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- ---------- Book Cover RPCs ----------

CREATE OR REPLACE FUNCTION public.create_book_cover(
  p_user_id UUID,
  p_book_id UUID,
  p_prompt TEXT,
  p_quality_mode TEXT DEFAULT 'quality'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Book not found or not owned by user';
  END IF;

  INSERT INTO public.book_cover (book_id, status, prompt, quality_mode)
  VALUES (p_book_id, 'generating', p_prompt, p_quality_mode)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_book_cover(
  p_cover_id UUID,
  p_image_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.book_cover
  SET image_url = p_image_url, status = 'done'
  WHERE id = p_cover_id AND status = 'generating';

  -- Also update denormalized cover_url on books
  UPDATE public.books SET cover_url = p_image_url
  WHERE id = (SELECT book_id FROM public.book_cover WHERE id = p_cover_id);

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_book_cover(
  p_cover_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.book_cover
  SET status = 'error', error_message = p_error
  WHERE id = p_cover_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- ---------- Revoke client access to server-only RPCs ----------
-- These are called by API routes (service role), not by client-side supabase.rpc()
REVOKE EXECUTE ON FUNCTION public.complete_page_illustration FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.fail_page_illustration FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.complete_page_audio FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.fail_page_audio FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.complete_book_cover FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.fail_book_cover FROM authenticated, anon;
