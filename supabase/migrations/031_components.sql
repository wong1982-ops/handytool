-- supabase/migrations/031_components.sql
CREATE TABLE IF NOT EXISTS public.components_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  prompt TEXT,
  settings JSONB,
  code_react TEXT,
  code_vue TEXT,
  code_svelte TEXT,
  code_html TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  copy_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_components_user ON public.components_library (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_components_public ON public.components_library (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_components_slug ON public.components_library (slug);

ALTER TABLE public.components_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own components" ON public.components_library FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public read shared components" ON public.components_library FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "Users insert own components" ON public.components_library FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own components" ON public.components_library FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own components" ON public.components_library FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON public.components_library TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.components_library TO authenticated;
