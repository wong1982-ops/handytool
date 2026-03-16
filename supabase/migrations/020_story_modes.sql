-- Story Studio: Speed Mode & Professional Mode
-- Adds mode column to book_jobs and books, updates RPCs.

-- =============================================================================
-- 1. Add mode column to book_jobs
-- =============================================================================
ALTER TABLE public.book_jobs
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'speed';

ALTER TABLE public.book_jobs
  ADD CONSTRAINT book_jobs_mode_check CHECK (mode IN ('speed', 'professional'));

-- =============================================================================
-- 2. Add mode column to books
-- =============================================================================
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'speed';

ALTER TABLE public.books
  ADD CONSTRAINT books_mode_check CHECK (mode IN ('speed', 'professional'));

-- =============================================================================
-- 3. Update create_book_job RPC — accept p_mode parameter
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_book_job(
  p_user_id UUID,
  p_series_id UUID DEFAULT NULL,
  p_total_pages INT DEFAULT 0,
  p_input JSONB DEFAULT '{}',
  p_mode TEXT DEFAULT 'speed'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO public.book_jobs (user_id, series_id, status, current_step, total_pages, input, state, mode)
  VALUES (p_user_id, p_series_id, 'scheduled', 'story_bible', p_total_pages, p_input, '{}', p_mode)
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- =============================================================================
-- 4. Update get_user_active_jobs RPC — return mode column
-- =============================================================================
DROP FUNCTION IF EXISTS public.get_user_active_jobs(UUID);

CREATE OR REPLACE FUNCTION public.get_user_active_jobs(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  status TEXT,
  current_step TEXT,
  total_pages INT,
  title TEXT,
  cover_url TEXT,
  pages_completed INT,
  audio_completed INT,
  error_message TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  mode TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bj.id,
    bj.status,
    bj.current_step,
    bj.total_pages,
    COALESCE(bj.input->'concept'->>'title', 'Untitled')::TEXT AS title,
    (bj.state->>'coverUrl')::TEXT AS cover_url,
    COALESCE(jsonb_array_length(bj.state->'pages'), 0)::INT AS pages_completed,
    COALESCE(jsonb_array_length(bj.state->'audio'), 0)::INT AS audio_completed,
    bj.error_message,
    bj.created_at,
    bj.updated_at,
    bj.mode
  FROM public.book_jobs bj
  WHERE bj.user_id = p_user_id
    AND bj.status IN ('scheduled', 'running', 'failed')
  ORDER BY bj.created_at DESC;
END;
$$;
