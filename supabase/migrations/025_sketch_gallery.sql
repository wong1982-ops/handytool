CREATE TABLE IF NOT EXISTS public.sketch_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  original_sketch_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sketch_gallery_public ON public.sketch_gallery (created_at DESC) WHERE is_public = true;

ALTER TABLE public.sketch_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of gallery" ON public.sketch_gallery FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "Allow authenticated insert" ON public.sketch_gallery FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.sketch_gallery TO anon, authenticated;
GRANT INSERT ON public.sketch_gallery TO authenticated;
