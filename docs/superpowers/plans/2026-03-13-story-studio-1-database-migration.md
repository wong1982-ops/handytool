# Story Studio Modular Redesign — Plan 1: Database & Migration

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create normalized database tables for the modular Story Studio (characters, book_pages, page_illustrations, page_audio, book_cover) and migrate existing data from JSONB blobs and series_characters.

**Architecture:** Additive migration — new tables are created alongside existing ones. Data is copied (not moved) so old code keeps working during transition. Old tables/columns are NOT dropped in this plan — that happens after all UI/API code is migrated in later plans.

**Tech Stack:** Supabase (PostgreSQL), SQL migrations, TypeScript (Zod schemas)

**Design doc:** `docs/plans/2026-03-13-story-studio-modular-redesign.md`

---

## Chunk 1: New Tables & RLS

### Task 1: Create migration file with new tables

**Files:**
- Create: `supabase/migrations/014_story_studio_modular.sql`

- [ ] **Step 1: Create the migration file**

```sql
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
-- Note: idx on character_id not needed — PK (character_id, series_id) covers it

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
-- Note: single-column idx on book_id not needed — composite covers it

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
```

- [ ] **Step 2: Verify the migration file is valid SQL**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && cat supabase/migrations/014_story_studio_modular.sql | head -5`
Expected: First 5 lines of the migration visible.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/014_story_studio_modular.sql
git commit -m "feat(db): add normalized tables for modular Story Studio

New tables: characters, character_series, book_pages, page_illustrations,
page_audio, book_cover. Adds status column to books. RLS policies and
indexes for all tables. Realtime enabled for media tables."
```

---

## Chunk 2: RPC Functions

### Task 2: Create RPC functions for characters

**Files:**
- Create: `supabase/migrations/015_story_studio_rpcs.sql`

- [ ] **Step 1: Create the RPCs migration file**

```sql
-- =============================================================
-- 015_story_studio_rpcs.sql
-- Story Studio Modular Redesign — RPC functions
-- =============================================================

-- ---------- Character CRUD RPCs ----------

-- Insert a new character (top-level)
CREATE OR REPLACE FUNCTION public.insert_character(
  p_user_id UUID,
  p_name TEXT,
  p_age TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_personality TEXT DEFAULT NULL,
  p_physical_description TEXT DEFAULT NULL,
  p_reference_image_url TEXT DEFAULT NULL,
  p_voice TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.characters (user_id, name, age, role, personality, physical_description, reference_image_url, voice)
  VALUES (p_user_id, p_name, p_age, p_role, p_personality, p_physical_description, p_reference_image_url, p_voice)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Update a character
CREATE OR REPLACE FUNCTION public.update_character(
  p_user_id UUID,
  p_character_id UUID,
  p_name TEXT DEFAULT NULL,
  p_age TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_personality TEXT DEFAULT NULL,
  p_physical_description TEXT DEFAULT NULL,
  p_reference_image_url TEXT DEFAULT NULL,
  p_voice TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_refinement_count INT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.characters SET
    name = COALESCE(p_name, name),
    age = COALESCE(p_age, age),
    role = COALESCE(p_role, role),
    personality = COALESCE(p_personality, personality),
    physical_description = COALESCE(p_physical_description, physical_description),
    reference_image_url = COALESCE(p_reference_image_url, reference_image_url),
    voice = COALESCE(p_voice, voice),
    status = COALESCE(p_status, status),
    refinement_count = COALESCE(p_refinement_count, refinement_count),
    updated_at = now()
  WHERE id = p_character_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Delete a character
CREATE OR REPLACE FUNCTION public.delete_character(
  p_user_id UUID,
  p_character_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.characters
  WHERE id = p_character_id AND user_id = p_user_id;

  RETURN FOUND;
END;
$$;

-- Get all characters for a user (with their series)
CREATE OR REPLACE FUNCTION public.get_user_characters(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age TEXT,
  role TEXT,
  personality TEXT,
  physical_description TEXT,
  reference_image_url TEXT,
  voice TEXT,
  status TEXT,
  refinement_count INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  series JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.name, c.age, c.role, c.personality,
    c.physical_description, c.reference_image_url,
    c.voice, c.status, c.refinement_count,
    c.created_at, c.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('id', s.id, 'title', s.title)
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::jsonb
    ) AS series
  FROM public.characters c
  LEFT JOIN public.character_series cs ON cs.character_id = c.id
  LEFT JOIN public.series s ON s.id = cs.series_id
  WHERE c.user_id = p_user_id
  GROUP BY c.id
  ORDER BY c.created_at DESC;
END;
$$;

-- ---------- Character-Series Link RPCs ----------

-- Link character to series (with soft limit warning)
CREATE OR REPLACE FUNCTION public.link_character_to_series(
  p_user_id UUID,
  p_character_id UUID,
  p_series_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_char_count INT;
  v_warning TEXT DEFAULT NULL;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM public.characters WHERE id = p_character_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Character not found or not owned by user';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.series WHERE id = p_series_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Series not found or not owned by user';
  END IF;

  -- Insert link (ignore if already exists)
  INSERT INTO public.character_series (character_id, series_id)
  VALUES (p_character_id, p_series_id)
  ON CONFLICT DO NOTHING;

  -- Check soft limit
  SELECT COUNT(*) INTO v_char_count
  FROM public.character_series WHERE series_id = p_series_id;

  IF v_char_count > 6 THEN
    v_warning := 'This series has ' || v_char_count || ' characters. More than 6 may reduce illustration consistency.';
  END IF;

  RETURN jsonb_build_object('ok', true, 'characterCount', v_char_count, 'warning', v_warning);
END;
$$;

-- Unlink character from series
CREATE OR REPLACE FUNCTION public.unlink_character_from_series(
  p_user_id UUID,
  p_character_id UUID,
  p_series_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.character_series
  WHERE character_id = p_character_id
    AND series_id = p_series_id
    AND EXISTS (SELECT 1 FROM public.characters WHERE id = p_character_id AND user_id = p_user_id);

  RETURN FOUND;
END;
$$;

-- ---------- Book Pages RPCs ----------

-- Insert a page into a book
CREATE OR REPLACE FUNCTION public.insert_book_page(
  p_user_id UUID,
  p_book_id UUID,
  p_sequence INT,
  p_scene_description TEXT DEFAULT NULL,
  p_narrative_text TEXT DEFAULT NULL,
  p_image_prompt TEXT DEFAULT NULL,
  p_dialogue JSONB DEFAULT '[]'::jsonb,
  p_mood TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Verify book ownership
  IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Book not found or not owned by user';
  END IF;

  INSERT INTO public.book_pages (book_id, sequence, scene_description, narrative_text, image_prompt, dialogue, mood)
  VALUES (p_book_id, p_sequence, p_scene_description, p_narrative_text, p_image_prompt, p_dialogue, p_mood)
  ON CONFLICT (book_id, sequence) DO UPDATE SET
    scene_description = EXCLUDED.scene_description,
    narrative_text = EXCLUDED.narrative_text,
    image_prompt = EXCLUDED.image_prompt,
    dialogue = EXCLUDED.dialogue,
    mood = EXCLUDED.mood,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Update a single book page
CREATE OR REPLACE FUNCTION public.update_book_page(
  p_user_id UUID,
  p_page_id UUID,
  p_scene_description TEXT DEFAULT NULL,
  p_narrative_text TEXT DEFAULT NULL,
  p_image_prompt TEXT DEFAULT NULL,
  p_dialogue JSONB DEFAULT NULL,
  p_mood TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.book_pages SET
    scene_description = COALESCE(p_scene_description, scene_description),
    narrative_text = COALESCE(p_narrative_text, narrative_text),
    image_prompt = COALESCE(p_image_prompt, image_prompt),
    dialogue = COALESCE(p_dialogue, dialogue),
    mood = COALESCE(p_mood, mood),
    updated_at = now()
  WHERE id = p_page_id
    AND EXISTS (
      SELECT 1 FROM public.books b WHERE b.id = book_pages.book_id AND b.user_id = p_user_id
    );

  RETURN FOUND;
END;
$$;

-- Get all pages for a book (with illustration and audio status)
CREATE OR REPLACE FUNCTION public.get_book_pages_with_media(
  p_book_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  book_id UUID,
  sequence INT,
  scene_description TEXT,
  narrative_text TEXT,
  image_prompt TEXT,
  dialogue JSONB,
  mood TEXT,
  illustration_id UUID,
  illustration_url TEXT,
  illustration_status TEXT,
  audio_id UUID,
  audio_url TEXT,
  audio_status TEXT,
  audio_duration FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify access: owner or public book
  IF p_user_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND user_id = p_user_id) THEN
      RAISE EXCEPTION 'Book not found or not owned by user';
    END IF;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND is_public = true) THEN
      RAISE EXCEPTION 'Book not found or not public';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    bp.id, bp.book_id, bp.sequence,
    bp.scene_description, bp.narrative_text, bp.image_prompt,
    bp.dialogue, bp.mood,
    pi.id AS illustration_id,
    pi.image_url AS illustration_url,
    pi.status AS illustration_status,
    pa.id AS audio_id,
    pa.audio_url AS audio_url,
    pa.status AS audio_status,
    pa.duration_seconds AS audio_duration
  FROM public.book_pages bp
  LEFT JOIN LATERAL (
    SELECT pi2.id, pi2.image_url, pi2.status
    FROM public.page_illustrations pi2
    WHERE pi2.book_page_id = bp.id
    ORDER BY pi2.created_at DESC LIMIT 1
  ) pi ON true
  LEFT JOIN LATERAL (
    SELECT pa2.id, pa2.audio_url, pa2.status, pa2.duration_seconds
    FROM public.page_audio pa2
    WHERE pa2.book_page_id = bp.id
    ORDER BY pa2.created_at DESC LIMIT 1
  ) pa ON true
  ORDER BY bp.sequence;
END;
$$;

-- Delete a book page
CREATE OR REPLACE FUNCTION public.delete_book_page(
  p_user_id UUID,
  p_page_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.book_pages
  WHERE id = p_page_id
    AND EXISTS (
      SELECT 1 FROM public.books b WHERE b.id = book_pages.book_id AND b.user_id = p_user_id
    );

  RETURN FOUND;
END;
$$;

-- ---------- Media Generation RPCs ----------

-- Create a page illustration record (sets status to 'generating')
CREATE OR REPLACE FUNCTION public.create_page_illustration(
  p_user_id UUID,
  p_book_page_id UUID,
  p_quality_mode TEXT DEFAULT 'quality',
  p_generation_config JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Verify ownership via book_pages → books
  IF NOT EXISTS (
    SELECT 1 FROM public.book_pages bp
    JOIN public.books b ON b.id = bp.book_id
    WHERE bp.id = p_book_page_id AND b.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Page not found or not owned by user';
  END IF;

  INSERT INTO public.page_illustrations (book_page_id, status, quality_mode, generation_config)
  VALUES (p_book_page_id, 'generating', p_quality_mode, p_generation_config)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Complete a page illustration (set URL + status=done)
CREATE OR REPLACE FUNCTION public.complete_page_illustration(
  p_illustration_id UUID,
  p_image_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_illustrations
  SET image_url = p_image_url, status = 'done'
  WHERE id = p_illustration_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- Fail a page illustration
CREATE OR REPLACE FUNCTION public.fail_page_illustration(
  p_illustration_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_illustrations
  SET status = 'error', error_message = p_error
  WHERE id = p_illustration_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- Create a page audio record
CREATE OR REPLACE FUNCTION public.create_page_audio(
  p_user_id UUID,
  p_book_page_id UUID,
  p_voice_map JSONB DEFAULT NULL,
  p_narrator_voice TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.book_pages bp
    JOIN public.books b ON b.id = bp.book_id
    WHERE bp.id = p_book_page_id AND b.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Page not found or not owned by user';
  END IF;

  INSERT INTO public.page_audio (book_page_id, status, voice_map, narrator_voice)
  VALUES (p_book_page_id, 'generating', p_voice_map, p_narrator_voice)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Complete page audio
CREATE OR REPLACE FUNCTION public.complete_page_audio(
  p_audio_id UUID,
  p_audio_url TEXT,
  p_duration_seconds FLOAT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_audio
  SET audio_url = p_audio_url, status = 'done', duration_seconds = p_duration_seconds
  WHERE id = p_audio_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- Fail page audio
CREATE OR REPLACE FUNCTION public.fail_page_audio(
  p_audio_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.page_audio
  SET status = 'error', error_message = p_error
  WHERE id = p_audio_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- ---------- Book Cover RPCs ----------

CREATE OR REPLACE FUNCTION public.create_book_cover(
  p_user_id UUID,
  p_book_id UUID,
  p_prompt TEXT,
  p_quality_mode TEXT DEFAULT 'quality'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.books WHERE id = p_book_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Book not found or not owned by user';
  END IF;

  INSERT INTO public.book_cover (book_id, status, prompt, quality_mode)
  VALUES (p_book_id, 'generating', p_prompt, p_quality_mode)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_book_cover(
  p_cover_id UUID,
  p_image_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.book_cover
  SET image_url = p_image_url, status = 'done'
  WHERE id = p_cover_id AND status = 'generating';

  -- Also update denormalized cover_url on books
  UPDATE public.books SET cover_url = p_image_url
  WHERE id = (SELECT book_id FROM public.book_cover WHERE id = p_cover_id);

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_book_cover(
  p_cover_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.book_cover
  SET status = 'error', error_message = p_error
  WHERE id = p_cover_id AND status = 'generating';

  RETURN FOUND;
END;
$$;

-- ---------- Revoke client access to server-only RPCs ----------
-- These are called by API routes (service role), not by client-side supabase.rpc()
REVOKE EXECUTE ON FUNCTION public.complete_page_illustration FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.fail_page_illustration FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.complete_page_audio FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.fail_page_audio FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.complete_book_cover FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.fail_book_cover FROM authenticated, anon;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/015_story_studio_rpcs.sql
git commit -m "feat(db): add RPC functions for modular Story Studio

Character CRUD, character-series linking with soft limit warning,
book page CRUD with media status joins, illustration/audio/cover
generation lifecycle RPCs (create, complete, fail)."
```

---

## Chunk 3: Data Migration

### Task 3: Create data migration from existing tables

**Files:**
- Create: `supabase/migrations/016_story_studio_data_migration.sql`

- [ ] **Step 1: Create the data migration file**

```sql
-- =============================================================
-- 016_story_studio_data_migration.sql
-- Migrate existing data: series_characters → characters + character_series
-- Migrate existing data: books.data JSONB → book_pages + page_illustrations + page_audio
-- =============================================================

-- ---------- 1. Migrate series_characters → characters + character_series ----------

-- Copy each series_character into the characters table
-- Then create the join table link
INSERT INTO public.characters (id, user_id, name, age, role, personality, physical_description, reference_image_url, voice, status, refinement_count, created_at, updated_at)
SELECT
  sc.id,
  s.user_id,
  sc.name,
  NULL AS age,
  NULL AS role,
  NULL AS personality,
  sc.description AS physical_description,
  sc.reference_image_url,
  sc.voice,
  sc.status,
  sc.refinement_count,
  sc.created_at,
  sc.updated_at
FROM public.series_characters sc
JOIN public.series s ON s.id = sc.series_id
ON CONFLICT (id) DO NOTHING;

-- Create the join table links
INSERT INTO public.character_series (character_id, series_id)
SELECT sc.id, sc.series_id
FROM public.series_characters sc
ON CONFLICT DO NOTHING;

-- ---------- 2. Migrate books.data → book_pages ----------

-- Extract pages from books.data JSONB and insert into book_pages
-- books.data structure: { pages: [{ sequence, sceneDescription, narrativeText, dialogue, mood, imagePrompt, imageUrl, audioUrl }] }
INSERT INTO public.book_pages (book_id, sequence, scene_description, narrative_text, image_prompt, dialogue, mood)
SELECT
  b.id AS book_id,
  (p->>'sequence')::int AS sequence,
  p->>'sceneDescription' AS scene_description,
  p->>'narrativeText' AS narrative_text,
  p->>'imagePrompt' AS image_prompt,
  COALESCE(p->'dialogue', '[]'::jsonb) AS dialogue,
  p->>'mood' AS mood
FROM public.books b,
  jsonb_array_elements(b.data->'pages') AS p
WHERE b.data->'pages' IS NOT NULL
  AND jsonb_array_length(b.data->'pages') > 0
ON CONFLICT (book_id, sequence) DO NOTHING;

-- ---------- 3. Migrate existing illustrations → page_illustrations ----------
-- Use WHERE NOT EXISTS for idempotency (no unique constraint on book_page_id)

INSERT INTO public.page_illustrations (book_page_id, image_url, status, quality_mode)
SELECT
  bp.id AS book_page_id,
  p->>'imageUrl' AS image_url,
  'done' AS status,
  'quality' AS quality_mode
FROM public.books b,
  jsonb_array_elements(b.data->'pages') AS p
JOIN public.book_pages bp ON bp.book_id = b.id AND bp.sequence = (p->>'sequence')::int
WHERE p->>'imageUrl' IS NOT NULL
  AND p->>'imageUrl' != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.page_illustrations pi WHERE pi.book_page_id = bp.id
  );

-- ---------- 4. Migrate existing audio → page_audio ----------

INSERT INTO public.page_audio (book_page_id, audio_url, status)
SELECT
  bp.id AS book_page_id,
  p->>'audioUrl' AS audio_url,
  'done' AS status
FROM public.books b,
  jsonb_array_elements(b.data->'pages') AS p
JOIN public.book_pages bp ON bp.book_id = b.id AND bp.sequence = (p->>'sequence')::int
WHERE p->>'audioUrl' IS NOT NULL
  AND p->>'audioUrl' != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.page_audio pa WHERE pa.book_page_id = bp.id
  );

-- ---------- 5. Migrate existing covers → book_cover ----------

INSERT INTO public.book_cover (book_id, image_url, status, prompt)
SELECT
  b.id,
  b.cover_url,
  'done',
  b.data->'concept'->>'coverDescription'
FROM public.books b
WHERE b.cover_url IS NOT NULL
  AND b.cover_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.book_cover bc WHERE bc.book_id = b.id
  );
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/016_story_studio_data_migration.sql
git commit -m "feat(db): migrate existing data to normalized Story Studio tables

Copies series_characters → characters + character_series.
Decomposes books.data JSONB → book_pages + page_illustrations + page_audio.
Migrates existing covers → book_cover. All ON CONFLICT DO NOTHING for idempotency."
```

---

## Chunk 4: TypeScript Types & Credit Config

### Task 4: Add new TypeScript types for the modular schema

**Files:**
- Modify: `lib/story/types.ts`
- Modify: `lib/story/validation.ts`

- [ ] **Step 1: Add new types to `lib/story/types.ts`**

Add the following at the end of the file (after the existing types — do NOT remove anything):

```typescript
// --- Modular Story Studio types ---

// Character (top-level entity)
export const characterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  age: z.string().max(50).nullable().optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).nullable().optional(),
  personality: z.string().max(1000).nullable().optional(),
  physicalDescription: z.string().max(2000).nullable().optional(),
  referenceImageUrl: z.string().url().nullable().optional(),
  voice: z.string().nullable().optional(),
  status: z.enum(['draft', 'approved']),
  refinementCount: z.number().int().min(0).default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  series: z.array(z.object({ id: z.string().uuid(), title: z.string() })).optional(),
})

export type Character = z.infer<typeof characterSchema>

// Create/update character requests
export const createCharacterRequestSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.string().max(50).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting']).optional(),
  personality: z.string().max(1000).optional(),
  physicalDescription: z.string().max(2000).optional(),
  voice: z.string().optional(),
  seriesIds: z.array(z.string().uuid()).optional(),
})

export const updateCharacterRequestSchema = createCharacterRequestSchema.partial().extend({
  status: z.enum(['draft', 'approved']).optional(),
  referenceImageUrl: z.string().url().optional(),
  refinementCount: z.number().int().optional(),
})

export type CreateCharacterRequest = z.infer<typeof createCharacterRequestSchema>
export type UpdateCharacterRequest = z.infer<typeof updateCharacterRequestSchema>

// Book page (normalized)
export const bookPageSchema = z.object({
  id: z.string().uuid(),
  bookId: z.string().uuid(),
  sequence: z.number().int().min(1),
  sceneDescription: z.string().nullable().optional(),
  narrativeText: z.string().nullable().optional(),
  imagePrompt: z.string().nullable().optional(),
  dialogue: z.array(z.object({
    speaker: z.string(),
    line: z.string(),
  })).default([]),
  mood: z.string().nullable().optional(),
  // Media status (joined from page_illustrations / page_audio)
  illustrationId: z.string().uuid().nullable().optional(),
  illustrationUrl: z.string().url().nullable().optional(),
  illustrationStatus: z.enum(['pending', 'generating', 'done', 'error']).nullable().optional(),
  audioId: z.string().uuid().nullable().optional(),
  audioUrl: z.string().url().nullable().optional(),
  audioStatus: z.enum(['pending', 'generating', 'done', 'error']).nullable().optional(),
  audioDuration: z.number().nullable().optional(),
})

export type BookPage = z.infer<typeof bookPageSchema>

// Illustration generation request
export const generateIllustrationRequestSchema = z.object({
  bookPageId: z.string().uuid(),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
  characterIds: z.array(z.string().uuid()).optional(),
})

export const generateBatchIllustrationRequestSchema = z.object({
  bookId: z.string().uuid(),
  pageIds: z.array(z.string().uuid()).min(1),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
})

export type GenerateIllustrationRequest = z.infer<typeof generateIllustrationRequestSchema>
export type GenerateBatchIllustrationRequest = z.infer<typeof generateBatchIllustrationRequestSchema>

// Audio generation request
export const generateAudioRequestSchema = z.object({
  bookPageId: z.string().uuid(),
  narratorVoice: z.string(),
  voiceMap: z.record(z.string(), z.string()).optional(),
})

export const generateBatchAudioRequestSchema = z.object({
  bookId: z.string().uuid(),
  pageIds: z.array(z.string().uuid()).min(1),
  narratorVoice: z.string(),
  voiceMap: z.record(z.string(), z.string()).optional(),
})

export type GenerateAudioRequest = z.infer<typeof generateAudioRequestSchema>
export type GenerateBatchAudioRequest = z.infer<typeof generateBatchAudioRequestSchema>

// Cover generation request
export const generateCoverRequestSchema = z.object({
  bookId: z.string().uuid(),
  prompt: z.string().min(10).max(2000).optional(),
  qualityMode: z.enum(['fast', 'quality']).default('quality'),
})

export type GenerateCoverRequest = z.infer<typeof generateCoverRequestSchema>

// Story generation request (new — text only, no media)
export const generateStoryRequestSchema = z.object({
  plot: z.string().min(10).max(2000),
  seriesId: z.string().uuid().optional(),
  pageCount: z.number().int().min(6).max(20).default(12),
  style: z.string().optional(),
  audience: z.string().optional(),
})

export type GenerateStoryRequest = z.infer<typeof generateStoryRequestSchema>
```

- [ ] **Step 2: Update credit costs in `lib/story/validation.ts`**

Replace the existing `CREDIT_COSTS` object:

```typescript
export const CREDIT_COSTS = {
  // Story generation
  generateStory: 10,
  additionalPage: 2,       // per page beyond default 12
  // Illustrations
  illustrationQuality: 5,  // per page
  illustrationFast: 3,     // per page
  coverIllustration: 5,
  // Audio
  narration: 3,             // per page
  // Character
  characterRefinement: 1,
  // Export
  exportPdf: 5,
  // Legacy (kept for backward compatibility during migration)
  generate: 65,
  regenerateStory: 10,
  regenerateImage: 5,
} as const
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && npx tsc --noEmit 2>&1 | grep -E "types\.ts|validation\.ts" | head -10`
Expected: No errors from these files.

- [ ] **Step 4: Commit**

```bash
git add lib/story/types.ts lib/story/validation.ts
git commit -m "feat(story): add modular types and per-action credit costs

New Zod schemas: Character, BookPage, illustration/audio/cover/story
generation requests. Updated CREDIT_COSTS to per-action pricing
(story=10, illustration=3-5, narration=3, cover=5, refinement=1).
Legacy costs kept for backward compatibility."
```

---

## Summary

This plan creates the database foundation for the modular Story Studio redesign:

| What | Files |
|---|---|
| 6 new tables + RLS + indexes + Realtime | `014_story_studio_modular.sql` |
| 20+ RPC functions (CRUD + media lifecycle) | `015_story_studio_rpcs.sql` |
| Data migration (series_characters + books.data) | `016_story_studio_data_migration.sql` |
| TypeScript types (Zod schemas) | `lib/story/types.ts` |
| Per-action credit costs | `lib/story/validation.ts` |

**What's NOT in this plan** (deferred to later plans):
- No old tables/columns dropped (backward compatible)
- No API routes yet
- No UI changes yet
- No changes to existing job queue (that's Plan 5)
