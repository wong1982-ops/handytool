CREATE TABLE IF NOT EXISTS public.seo_keyword_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash TEXT NOT NULL UNIQUE,
  query TEXT NOT NULL,
  results JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_cache_hash ON seo_keyword_cache (query_hash);

CREATE TABLE IF NOT EXISTS public.seo_content_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  topic TEXT,
  tool_slug TEXT,
  scheduled_date DATE,
  status TEXT DEFAULT 'planned',
  draft_content JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_content_plans_user ON seo_content_plans (user_id, created_at DESC);

ALTER TABLE seo_content_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own content plans" ON seo_content_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON seo_content_plans TO authenticated;
GRANT ALL ON seo_keyword_cache TO authenticated, service_role;
