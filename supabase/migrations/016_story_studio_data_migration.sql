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
FROM public.books b
CROSS JOIN LATERAL jsonb_array_elements(b.data->'pages') AS p
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
FROM public.books b
CROSS JOIN LATERAL jsonb_array_elements(b.data->'pages') AS p
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
