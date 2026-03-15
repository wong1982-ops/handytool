-- 018_voice_cloning.sql
-- Voice cloning: recording storage + provider state per character

CREATE TABLE IF NOT EXISTS character_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  provider TEXT,  -- 'elevenlabs' | 'fish_audio' | 'cartesia'
  provider_voice_id TEXT,
  status TEXT NOT NULL DEFAULT 'recorded',  -- 'recorded' | 'cloning' | 'ready' | 'error'
  error_message TEXT,  -- stores failure details when status = 'error'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One custom voice per character
CREATE UNIQUE INDEX IF NOT EXISTS idx_character_voices_character
  ON character_voices(character_id);

-- Lookup by user
CREATE INDEX IF NOT EXISTS idx_character_voices_user
  ON character_voices(user_id);

-- Enable RLS (all access via SECURITY DEFINER RPCs)
ALTER TABLE character_voices ENABLE ROW LEVEL SECURITY;

-- RPC: Upsert a character voice recording
CREATE OR REPLACE FUNCTION upsert_character_voice(
  p_user_id UUID,
  p_character_id UUID,
  p_recording_url TEXT
)
RETURNS TABLE(id UUID, status TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  -- Verify character ownership
  SELECT user_id INTO v_owner FROM characters WHERE id = p_character_id;
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

-- RPC: Get character voice status
CREATE OR REPLACE FUNCTION get_character_voice(
  p_user_id UUID,
  p_character_id UUID
)
RETURNS TABLE(
  id UUID,
  recording_url TEXT,
  provider TEXT,
  provider_voice_id TEXT,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cv.id, cv.recording_url, cv.provider, cv.provider_voice_id,
         cv.status, cv.error_message, cv.created_at
  FROM character_voices cv
  JOIN characters c ON c.id = cv.character_id
  WHERE cv.character_id = p_character_id
    AND c.user_id = p_user_id;
END;
$$;

-- RPC: Update voice clone provider status
CREATE OR REPLACE FUNCTION update_character_voice_provider(
  p_user_id UUID,
  p_character_id UUID,
  p_provider TEXT,
  p_provider_voice_id TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE character_voices cv
  SET provider = p_provider,
      provider_voice_id = p_provider_voice_id,
      status = p_status,
      error_message = p_error_message
  FROM characters c
  WHERE cv.character_id = p_character_id
    AND c.id = cv.character_id
    AND c.user_id = p_user_id;
END;
$$;

-- RPC: Delete character voice (returns recording_url for R2 cleanup)
CREATE OR REPLACE FUNCTION delete_character_voice(
  p_user_id UUID,
  p_character_id UUID
)
RETURNS TABLE(recording_url TEXT, provider TEXT, provider_voice_id TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  DELETE FROM character_voices cv
  USING characters c
  WHERE cv.character_id = p_character_id
    AND c.id = cv.character_id
    AND c.user_id = p_user_id
  RETURNING cv.recording_url, cv.provider, cv.provider_voice_id;
END;
$$;

-- RPC: Batch get character voices for narration (by character IDs)
CREATE OR REPLACE FUNCTION get_character_voices_by_ids(
  p_user_id UUID,
  p_character_ids UUID[]
)
RETURNS TABLE(
  character_id UUID,
  provider TEXT,
  provider_voice_id TEXT,
  recording_url TEXT,
  status TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cv.character_id, cv.provider, cv.provider_voice_id,
         cv.recording_url, cv.status
  FROM character_voices cv
  JOIN characters c ON c.id = cv.character_id
  WHERE cv.character_id = ANY(p_character_ids)
    AND c.user_id = p_user_id;
END;
$$;
