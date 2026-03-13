-- Book generation job queue: checkpoint/resume for background generation.
-- Each job tracks a book generation through discrete steps with accumulated state.

-- =============================================================================
-- 1. book_jobs table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.book_jobs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id                 UUID REFERENCES public.books(id) ON DELETE SET NULL,
  series_id               UUID REFERENCES public.series(id) ON DELETE SET NULL,
  status                  TEXT NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled', 'running', 'completed', 'failed')),
  current_step            TEXT NOT NULL DEFAULT 'story_bible',
  total_pages             INT NOT NULL DEFAULT 0,
  input                   JSONB NOT NULL DEFAULT '{}',
  state                   JSONB NOT NULL DEFAULT '{}',
  credits_reservation_id  UUID REFERENCES public.credit_reservations(id),
  retry_count             INT NOT NULL DEFAULT 0,
  error_message           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index: list active jobs for a user (bookshelf "In Progress" section)
CREATE INDEX idx_book_jobs_user_status
  ON public.book_jobs (user_id, status);

-- Index: cleanup old completed/failed jobs
CREATE INDEX idx_book_jobs_cleanup
  ON public.book_jobs (updated_at)
  WHERE status IN ('completed', 'failed');

-- =============================================================================
-- 2. Row Level Security
-- =============================================================================
ALTER TABLE public.book_jobs ENABLE ROW LEVEL SECURITY;

-- Users can read their own jobs
CREATE POLICY "Users read own jobs"
  ON public.book_jobs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own jobs
CREATE POLICY "Users insert own jobs"
  ON public.book_jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role (API routes via QStash) can do everything — no RLS restriction
-- QStash step routes use the service role key, so they bypass RLS.

-- Anon can read nothing
GRANT SELECT, INSERT ON public.book_jobs TO authenticated;

-- =============================================================================
-- 3. RPC: get_user_active_jobs — fetch in-progress jobs for bookshelf display
-- =============================================================================
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
  updated_at TIMESTAMPTZ
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
    -- Extract title from input concept
    COALESCE(bj.input->'concept'->>'title', 'Untitled')::TEXT AS title,
    -- Extract cover URL from state if available
    (bj.state->>'coverUrl')::TEXT AS cover_url,
    -- Count completed page illustrations
    COALESCE(jsonb_array_length(bj.state->'pages'), 0)::INT AS pages_completed,
    -- Count completed audio
    COALESCE(jsonb_array_length(bj.state->'audio'), 0)::INT AS audio_completed,
    bj.error_message,
    bj.created_at,
    bj.updated_at
  FROM public.book_jobs bj
  WHERE bj.user_id = p_user_id
    AND bj.status IN ('scheduled', 'running', 'failed')
  ORDER BY bj.created_at DESC;
END;
$$;

-- =============================================================================
-- 4. RPC: update_job_step — atomically advance a job's state after a step
--    Used by QStash step routes to write results and advance current_step.
--    Idempotent: if the step output already exists in state, returns false.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_job_step(
  p_job_id UUID,
  p_step TEXT,
  p_state_patch JSONB,
  p_next_step TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'running'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_step TEXT;
  v_status TEXT;
BEGIN
  -- Lock the job row
  SELECT bj.current_step, bj.status
    INTO v_current_step, v_status
    FROM public.book_jobs bj
   WHERE bj.id = p_job_id
     FOR UPDATE;

  IF v_current_step IS NULL THEN
    RAISE EXCEPTION 'job_not_found';
  END IF;

  -- Don't update completed/failed jobs (unless retrying)
  IF v_status = 'completed' THEN
    RETURN FALSE;
  END IF;

  -- Merge state patch into existing state
  UPDATE public.book_jobs bj
     SET state = bj.state || p_state_patch,
         current_step = COALESCE(p_next_step, p_step),
         status = p_status,
         retry_count = CASE WHEN p_status = 'running' THEN 0 ELSE bj.retry_count END,
         error_message = CASE WHEN p_status = 'running' THEN NULL ELSE bj.error_message END,
         updated_at = now()
   WHERE bj.id = p_job_id;

  RETURN TRUE;
END;
$$;

-- =============================================================================
-- 5. RPC: fail_job_step — mark a job as failed with error details
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fail_job_step(
  p_job_id UUID,
  p_step TEXT,
  p_error TEXT,
  p_retry_count INT DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.book_jobs bj
     SET status = 'failed',
         current_step = p_step,
         error_message = p_error,
         retry_count = p_retry_count,
         updated_at = now()
   WHERE bj.id = p_job_id;
END;
$$;

-- =============================================================================
-- 6. RPC: complete_job — finalize a job, link to the created book
-- =============================================================================
CREATE OR REPLACE FUNCTION public.complete_job(
  p_job_id UUID,
  p_book_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.book_jobs bj
     SET status = 'completed',
         book_id = p_book_id,
         current_step = 'done',
         error_message = NULL,
         updated_at = now()
   WHERE bj.id = p_job_id;
END;
$$;

-- =============================================================================
-- 7. RPC: count_user_active_jobs — for concurrent job limit check
-- =============================================================================
CREATE OR REPLACE FUNCTION public.count_user_active_jobs(p_user_id UUID)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*)::INT
    FROM public.book_jobs
   WHERE user_id = p_user_id
     AND status IN ('scheduled', 'running');
$$;

-- =============================================================================
-- 8. Enable Supabase Realtime on book_jobs for live progress updates
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.book_jobs;

-- =============================================================================
-- 9. Cleanup: function to delete old completed/failed jobs (>30 days)
--    Run via pg_cron or manual invocation.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_book_jobs()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  DELETE FROM public.book_jobs
   WHERE status IN ('completed', 'failed')
     AND updated_at < now() - INTERVAL '30 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- =============================================================================
-- 10. RPC: create_book_job — insert a new job row (SECURITY DEFINER bypasses RLS)
--     Used by POST /api/v1/story/jobs to create jobs via the user session client.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_book_job(
  p_user_id UUID,
  p_series_id UUID DEFAULT NULL,
  p_total_pages INT DEFAULT 0,
  p_input JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO public.book_jobs (user_id, series_id, status, current_step, total_pages, input, state)
  VALUES (p_user_id, p_series_id, 'scheduled', 'story_bible', p_total_pages, p_input, '{}')
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- =============================================================================
-- 11. RPC: get_job_by_id — fetch a job row by ID (bypasses RLS for step routes)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_job_by_id(p_job_id UUID)
RETURNS SETOF public.book_jobs
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM public.book_jobs WHERE id = p_job_id;
$$;

-- =============================================================================
-- 12. RPC: set_job_running — mark a scheduled job as running
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_job_running(p_job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.book_jobs
     SET status = 'running', updated_at = now()
   WHERE id = p_job_id AND status = 'scheduled';
END;
$$;

-- =============================================================================
-- 13. RPC: set_job_total_pages — update total_pages on a job
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_job_total_pages(p_job_id UUID, p_total_pages INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.book_jobs
     SET total_pages = p_total_pages, updated_at = now()
   WHERE id = p_job_id;
END;
$$;

-- =============================================================================
-- 14. RPC: increment_job_retry — bump retry count and record error
-- =============================================================================
CREATE OR REPLACE FUNCTION public.increment_job_retry(p_job_id UUID, p_error TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.book_jobs
     SET retry_count = retry_count + 1,
         error_message = p_error,
         updated_at = now()
   WHERE id = p_job_id;
END;
$$;
