-- Books table (story studio)
-- This table was originally created on cloud Supabase before migrations were tracked locally.

CREATE TABLE IF NOT EXISTS public.books (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug       TEXT UNIQUE NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  is_public  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_user ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_slug ON public.books(slug);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own books" ON public.books
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public books readable by anyone" ON public.books
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT SELECT ON public.books TO anon;
