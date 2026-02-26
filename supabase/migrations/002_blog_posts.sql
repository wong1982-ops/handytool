-- Blog posts table for auto-generated content
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('weekly-roundup', 'trending', 'tool-spotlight')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_posts_published ON public.blog_posts (published_at DESC)
  WHERE published_at IS NOT NULL;

CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of published posts"
  ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published_at IS NOT NULL);

GRANT SELECT ON public.blog_posts TO anon, authenticated;
