-- supabase/migrations/029_mood_boards.sql
CREATE TABLE IF NOT EXISTS public.mood_boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL DEFAULT 'Untitled Board',
  theme TEXT,
  elements JSONB NOT NULL DEFAULT '[]',
  shared BOOLEAN DEFAULT false,
  share_id UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mood_boards_user ON public.mood_boards (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_boards_share ON public.mood_boards (share_id) WHERE shared = true;

ALTER TABLE public.mood_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own boards" ON public.mood_boards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public read shared boards" ON public.mood_boards FOR SELECT TO anon, authenticated USING (shared = true);
CREATE POLICY "Users insert own boards" ON public.mood_boards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own boards" ON public.mood_boards FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON public.mood_boards TO anon, authenticated;
GRANT INSERT, UPDATE ON public.mood_boards TO authenticated;
