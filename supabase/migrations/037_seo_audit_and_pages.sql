CREATE TABLE IF NOT EXISTS public.seo_audit_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  overall_score INT NOT NULL,
  results JSONB NOT NULL
);

GRANT ALL ON seo_audit_results TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.seo_landing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  keyword TEXT NOT NULL,
  page_type TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  content JSONB NOT NULL,
  structured_data JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_landing_pages_slug ON seo_landing_pages (slug);
GRANT ALL ON seo_landing_pages TO authenticated, service_role;
