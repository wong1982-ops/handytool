-- Extend blog_posts for SEO engine
-- Add new post types
ALTER TABLE public.blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_post_type_check;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_post_type_check
  CHECK (post_type IN ('weekly-roundup', 'trending', 'tool-spotlight', 'tool-announcement', 'how-to-guide', 'comparison'));

-- Add metadata columns
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'tool-announcement';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS reading_time_min INTEGER DEFAULT 3;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tool_slug TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Toolk1t';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tool_slug ON public.blog_posts (tool_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON public.blog_posts USING GIN (tags);
