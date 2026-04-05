CREATE TABLE IF NOT EXISTS public.ecommerce_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL,
  score INT NOT NULL,
  results JSONB NOT NULL,
  roadmap_progress JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_assessments_user ON ecommerce_assessments (user_id, created_at DESC);
ALTER TABLE ecommerce_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assessments" ON ecommerce_assessments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT ALL ON ecommerce_assessments TO authenticated, service_role;
