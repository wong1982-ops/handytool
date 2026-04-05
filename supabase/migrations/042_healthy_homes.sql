CREATE TABLE IF NOT EXISTS public.healthy_homes_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  climate_zone INT DEFAULT 2,
  checklist JSONB,
  compliance_status TEXT DEFAULT 'not-checked',
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_healthy_homes_user ON healthy_homes_properties (user_id, created_at DESC);
ALTER TABLE healthy_homes_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own properties" ON healthy_homes_properties FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON healthy_homes_properties TO authenticated, service_role;
