CREATE TABLE IF NOT EXISTS public.story_video_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  book_title TEXT NOT NULL,
  art_style TEXT DEFAULT 'cartoon',
  provider TEXT DEFAULT 'gemini',
  target_duration TEXT DEFAULT 'auto',
  status TEXT DEFAULT 'pending',
  current_step TEXT,
  steps JSONB DEFAULT '{}',
  screenplay JSONB,
  scene_status JSONB DEFAULT '[]',
  artifacts JSONB DEFAULT '{}',
  credits_charged INT DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_story_video_user ON story_video_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_video_status ON story_video_jobs (status) WHERE status IN ('pending', 'processing');

ALTER TABLE story_video_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own video jobs" ON story_video_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON story_video_jobs TO authenticated;
