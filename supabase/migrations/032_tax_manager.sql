-- supabase/migrations/032_tax_manager.sql

CREATE TABLE IF NOT EXISTS public.tax_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  ird_number TEXT,
  gst_registered BOOLEAN DEFAULT false,
  gst_basis TEXT DEFAULT 'invoice',
  gst_period TEXT DEFAULT '2-monthly',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID NOT NULL REFERENCES tax_entities(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  bank_name TEXT,
  extracted_data JSONB,
  tax_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID NOT NULL REFERENCES tax_entities(id) ON DELETE CASCADE,
  document_id UUID REFERENCES tax_documents(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  gst_amount DECIMAL,
  category TEXT,
  category_confidence TEXT DEFAULT 'low',
  approved BOOLEAN DEFAULT false,
  tax_year TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_category_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID REFERENCES tax_entities(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_entities_user ON tax_entities (user_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_entity ON tax_documents (entity_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_entity ON tax_transactions (entity_id, tax_year, date);
CREATE INDEX IF NOT EXISTS idx_tax_transactions_approval ON tax_transactions (entity_id, tax_year, approved);
CREATE INDEX IF NOT EXISTS idx_tax_rules_entity ON tax_category_rules (user_id, entity_id);

-- RLS
ALTER TABLE tax_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_category_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own entities" ON tax_entities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own documents" ON tax_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own transactions" ON tax_transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own rules" ON tax_category_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT ALL ON tax_entities TO authenticated;
GRANT ALL ON tax_documents TO authenticated;
GRANT ALL ON tax_transactions TO authenticated;
GRANT ALL ON tax_category_rules TO authenticated;
