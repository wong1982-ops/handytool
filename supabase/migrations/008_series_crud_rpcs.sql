-- RPCs for series CRUD operations (SECURITY DEFINER to bypass RLS in dev mode)

-- Insert a new series
CREATE OR REPLACE FUNCTION insert_series(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT '',
  p_setting TEXT DEFAULT '',
  p_art_style TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO series (user_id, title, description, setting, art_style)
  VALUES (p_user_id, p_title, p_description, p_setting, p_art_style)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Update a series (only if owned by user)
CREATE OR REPLACE FUNCTION update_series(
  p_user_id UUID,
  p_series_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_setting TEXT DEFAULT NULL,
  p_art_style TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE series SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    setting = COALESCE(p_setting, setting),
    art_style = COALESCE(p_art_style, art_style),
    is_public = COALESCE(p_is_public, is_public),
    updated_at = NOW()
  WHERE id = p_series_id AND user_id = p_user_id;
  RETURN FOUND;
END;
$$;

-- Delete a series (only if owned by user, orphans books, cascades characters)
CREATE OR REPLACE FUNCTION delete_series(
  p_user_id UUID,
  p_series_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Orphan books
  UPDATE books SET series_id = NULL WHERE series_id = p_series_id;
  -- Delete series (cascades to series_characters)
  DELETE FROM series WHERE id = p_series_id AND user_id = p_user_id;
  RETURN FOUND;
END;
$$;

-- Update a character (only if series owned by user)
CREATE OR REPLACE FUNCTION update_series_character(
  p_user_id UUID,
  p_series_id UUID,
  p_character_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_reference_image_url TEXT DEFAULT NULL,
  p_refinement_count INT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM series WHERE id = p_series_id AND user_id = p_user_id) THEN
    RETURN FALSE;
  END IF;

  UPDATE series_characters SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    reference_image_url = COALESCE(p_reference_image_url, reference_image_url),
    refinement_count = COALESCE(p_refinement_count, refinement_count),
    status = COALESCE(p_status, status),
    updated_at = NOW()
  WHERE id = p_character_id AND series_id = p_series_id;
  RETURN FOUND;
END;
$$;

-- Delete a character (only if series owned by user)
CREATE OR REPLACE FUNCTION delete_series_character(
  p_user_id UUID,
  p_series_id UUID,
  p_character_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM series WHERE id = p_series_id AND user_id = p_user_id) THEN
    RETURN FALSE;
  END IF;

  DELETE FROM series_characters WHERE id = p_character_id AND series_id = p_series_id;
  RETURN FOUND;
END;
$$;
