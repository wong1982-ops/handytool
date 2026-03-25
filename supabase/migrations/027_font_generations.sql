CREATE TABLE IF NOT EXISTS public.font_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  style_preset TEXT,
  custom_prompt TEXT,
  colors TEXT[] NOT NULL DEFAULT '{}',
  reference_url TEXT,
  characters JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_font_generations_user ON public.font_generations (user_id, created_at DESC);

ALTER TABLE public.font_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own fonts" ON public.font_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own fonts" ON public.font_generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own fonts" ON public.font_generations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.font_generations TO authenticated;
