-- supabase/migrations/035_resumes.sql

CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  locale TEXT NOT NULL DEFAULT 'en',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resume_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resume_photos_resume_id ON public.resume_photos(resume_id);

-- RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resume photos"
  ON public.resume_photos FOR SELECT
  USING (resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own resume photos"
  ON public.resume_photos FOR INSERT
  WITH CHECK (resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own resume photos"
  ON public.resume_photos FOR DELETE
  USING (resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()));
