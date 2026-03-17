-- Fix: "column reference id is ambiguous" in upsert_character_voice
-- The RETURNS TABLE column names clash with table column names in RETURNING clause.

DROP FUNCTION IF EXISTS upsert_character_voice(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION upsert_character_voice(
  p_user_id UUID,
  p_character_id UUID,
  p_recording_url TEXT
)
RETURNS TABLE(out_id UUID, out_status TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  SELECT user_id INTO v_owner FROM characters WHERE characters.id = p_character_id;
  IF v_owner IS NULL OR v_owner != p_user_id THEN
    RAISE EXCEPTION 'Character not found or not owned by user';
  END IF;

  RETURN QUERY
  INSERT INTO character_voices (character_id, user_id, recording_url, status)
  VALUES (p_character_id, p_user_id, p_recording_url, 'recorded')
  ON CONFLICT (character_id)
  DO UPDATE SET
    recording_url = EXCLUDED.recording_url,
    provider = NULL,
    provider_voice_id = NULL,
    status = 'recorded',
    created_at = now()
  RETURNING character_voices.id, character_voices.status;
END;
$$;
