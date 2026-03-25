CREATE TABLE IF NOT EXISTS public.vblog_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  script_style TEXT NOT NULL,
  voice_type TEXT NOT NULL,
  voice_id TEXT,
  target_duration INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_step TEXT,
  steps JSONB NOT NULL DEFAULT '{}',
  artifacts JSONB NOT NULL DEFAULT '{}',
  script_data JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vblog_jobs_user ON public.vblog_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vblog_jobs_status ON public.vblog_jobs (status) WHERE status IN ('pending', 'processing');

ALTER TABLE public.vblog_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own vblog jobs" ON public.vblog_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vblog jobs" ON public.vblog_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vblog jobs" ON public.vblog_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.vblog_jobs TO authenticated;
