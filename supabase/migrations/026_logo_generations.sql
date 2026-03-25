CREATE TABLE IF NOT EXISTS public.logo_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  tagline TEXT,
  industry TEXT,
  style TEXT NOT NULL,
  colors TEXT[] NOT NULL DEFAULT '{}',
  custom_prompt TEXT,
  concepts JSONB NOT NULL DEFAULT '[]',
  selected_index INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logo_generations_user ON public.logo_generations (user_id, created_at DESC);

ALTER TABLE public.logo_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own logos" ON public.logo_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own logos" ON public.logo_generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own logos" ON public.logo_generations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.logo_generations TO authenticated;
