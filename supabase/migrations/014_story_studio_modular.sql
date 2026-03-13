-- =============================================================
-- 014_story_studio_modular.sql
-- Story Studio Modular Redesign — new normalized tables
-- =============================================================

-- ---------- 0. Reusable updated_at trigger function ----------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------- 1. characters (top-level, independent of series) ----------

CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  age TEXT,
  role TEXT CHECK (role IN ('protagonist', 'antagonist', 'supporting')),
  personality TEXT,
  physical_description TEXT,
  reference_image_url TEXT,
  voice TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  refinement_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_user ON public.characters (user_id);

-- RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own characters"
  ON public.characters FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER set_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- 2. character_series (many-to-many join) ----------

CREATE TABLE IF NOT EXISTS public.character_series (
  character_id UUID NOT NULL REFERENCES public.characters ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES public.series ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (character_id, series_id)
);

CREATE INDEX idx_character_series_series ON public.character_series (series_id);

-- RLS
ALTER TABLE public.character_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own character_series"
  ON public.character_series FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.characters c WHERE c.id = character_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.characters c WHERE c.id = character_id AND c.user_id = auth.uid())
  );

-- ---------- 3. Add status column to books ----------

ALTER TABLE public.books ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'complete'
  CHECK (status IN ('draft', 'complete'));

-- Backfill: all existing books are complete (they went through the full pipeline)
UPDATE public.books SET status = 'complete' WHERE status IS NULL;

-- ---------- 4. book_pages (normalized from books.data JSONB) ----------

CREATE TABLE IF NOT EXISTS public.book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books ON DELETE CASCADE,
  sequence INT NOT NULL,
  scene_description TEXT,
  narrative_text TEXT,
  image_prompt TEXT,
  dialogue JSONB DEFAULT '[]'::jsonb,
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, sequence)
);

CREATE INDEX idx_book_pages_book_seq ON public.book_pages (book_id, sequence);

-- RLS
ALTER TABLE public.book_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own book pages"
  ON public.book_pages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Public book pages readable"
  ON public.book_pages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.is_public = true)
  );

-- updated_at trigger
CREATE TRIGGER set_book_pages_updated_at
  BEFORE UPDATE ON public.book_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- 5. page_illustrations (per-page, optional) ----------

CREATE TABLE IF NOT EXISTS public.page_illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_page_id UUID NOT NULL REFERENCES public.book_pages ON DELETE CASCADE,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'done', 'error')),
  quality_mode TEXT DEFAULT 'quality' CHECK (quality_mode IN ('fast', 'quality')),
  generation_config JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_illustrations_page ON public.page_illustrations (book_page_id);

CREATE TRIGGER set_page_illustrations_updated_at
  BEFORE UPDATE ON public.page_illustrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.page_illustrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own page illustrations"
  ON public.page_illustrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.book_pages bp
      JOIN public.books b ON b.id = bp.book_id
      WHERE bp.id = book_page_id AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.book_pages bp
      JOIN public.books b ON b.id = bp.book_id
      WHERE bp.id = book_page_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Public page illustrations readable"
  ON public.page_illustrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.book_pages bp
      JOIN public.books b ON b.id = bp.book_id
      WHERE bp.id = book_page_id AND b.is_public = true
    )
  );

-- ---------- 6. page_audio (per-page, optional) ----------

CREATE TABLE IF NOT EXISTS public.page_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_page_id UUID NOT NULL REFERENCES public.book_pages ON DELETE CASCADE,
  audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'done', 'error')),
  voice_map JSONB,
  narrator_voice TEXT,
  duration_seconds FLOAT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_audio_page ON public.page_audio (book_page_id);

CREATE TRIGGER set_page_audio_updated_at
  BEFORE UPDATE ON public.page_audio
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.page_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own page audio"
  ON public.page_audio FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.book_pages bp
      JOIN public.books b ON b.id = bp.book_id
      WHERE bp.id = book_page_id AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.book_pages bp
      JOIN public.books b ON b.id = bp.book_id
      WHERE bp.id = book_page_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Public page audio readable"
  ON public.page_audio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.book_pages bp
      JOIN public.books b ON b.id = bp.book_id
      WHERE bp.id = book_page_id AND b.is_public = true
    )
  );

-- ---------- 7. book_cover (per-book, optional) ----------

CREATE TABLE IF NOT EXISTS public.book_cover (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books ON DELETE CASCADE,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'done', 'error')),
  prompt TEXT,
  quality_mode TEXT DEFAULT 'quality' CHECK (quality_mode IN ('fast', 'quality')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_book_cover_book ON public.book_cover (book_id);

CREATE TRIGGER set_book_cover_updated_at
  BEFORE UPDATE ON public.book_cover
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.book_cover ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own book cover"
  ON public.book_cover FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Public book cover readable"
  ON public.book_cover FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.books b WHERE b.id = book_id AND b.is_public = true)
  );

-- ---------- 8. Enable Realtime for new tables ----------

ALTER PUBLICATION supabase_realtime ADD TABLE public.page_illustrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_audio;
ALTER PUBLICATION supabase_realtime ADD TABLE public.book_cover;

-- ---------- 9. GRANT permissions (match existing table patterns) ----------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.characters TO authenticated;
GRANT SELECT ON public.characters TO anon;

GRANT SELECT, INSERT, DELETE ON public.character_series TO authenticated;
GRANT SELECT ON public.character_series TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_pages TO authenticated;
GRANT SELECT ON public.book_pages TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_illustrations TO authenticated;
GRANT SELECT ON public.page_illustrations TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_audio TO authenticated;
GRANT SELECT ON public.page_audio TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_cover TO authenticated;
GRANT SELECT ON public.book_cover TO anon;
