CREATE TABLE IF NOT EXISTS public.tarot_readings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL,
  spread_id     TEXT NOT NULL,
  question      TEXT NOT NULL DEFAULT '',
  language      TEXT NOT NULL DEFAULT 'en',
  category      TEXT,
  cards         JSONB NOT NULL DEFAULT '[]',
  interpretation JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarot_readings_user
  ON public.tarot_readings (user_id, created_at DESC);

ALTER TABLE public.tarot_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own tarot readings"
  ON public.tarot_readings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own tarot readings"
  ON public.tarot_readings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own tarot readings"
  ON public.tarot_readings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.tarot_readings TO authenticated;
