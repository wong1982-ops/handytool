-- Migration: 043_worksafe_hazards
-- WorkSafe H&S Toolkit — hazard register entries per user

CREATE TABLE IF NOT EXISTS public.worksafe_hazards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  industry TEXT,
  hazard TEXT NOT NULL,
  risk_level TEXT DEFAULT 'medium',
  likelihood TEXT,
  consequence TEXT,
  controls TEXT,
  responsible TEXT,
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_worksafe_hazards_user
  ON worksafe_hazards (user_id, created_at DESC);

ALTER TABLE worksafe_hazards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own hazards"
  ON worksafe_hazards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON worksafe_hazards TO authenticated, service_role;
