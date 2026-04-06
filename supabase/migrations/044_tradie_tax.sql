CREATE TABLE IF NOT EXISTS public.tradie_tax_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  gst_inclusive BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tradie_tax_user ON tradie_tax_entries (user_id, date DESC);

ALTER TABLE tradie_tax_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own entries" ON tradie_tax_entries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON tradie_tax_entries TO authenticated, service_role;
