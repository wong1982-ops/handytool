CREATE TABLE IF NOT EXISTS public.music_clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled',
  duration_seconds INT NOT NULL,
  format TEXT NOT NULL,
  clip_url TEXT NOT NULL,
  mode TEXT,
  prompt_summary TEXT,
  bpm INT,
  scale TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_clips_user ON public.music_clips (user_id, created_at DESC);

ALTER TABLE public.music_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own clips" ON public.music_clips FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own clips" ON public.music_clips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.music_clips TO authenticated;
