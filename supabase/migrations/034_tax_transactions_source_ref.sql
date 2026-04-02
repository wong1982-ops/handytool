-- Add source_ref column for bank CSV deduplication
ALTER TABLE public.tax_transactions
  ADD COLUMN IF NOT EXISTS source_ref TEXT;

-- Partial index for fast duplicate lookups by source_ref
CREATE INDEX IF NOT EXISTS idx_tax_transactions_source_ref
  ON public.tax_transactions (entity_id, source_ref)
  WHERE source_ref IS NOT NULL;
