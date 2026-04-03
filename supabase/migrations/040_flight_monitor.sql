-- Flight Monitor tables

-- 1. Cached search results (global, shared)
CREATE TABLE IF NOT EXISTS public.flight_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  adults INT DEFAULT 1,
  results JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_flight_searches_cache ON public.flight_searches (cache_key);
CREATE INDEX IF NOT EXISTS idx_flight_searches_expiry ON public.flight_searches (expires_at);

-- 2. User price alerts (RLS by user_id)
CREATE TABLE IF NOT EXISTS public.flight_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE,
  target_price NUMERIC NOT NULL,
  current_price NUMERIC,
  status TEXT DEFAULT 'tracking',
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_alerts_user ON public.flight_alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flight_alerts_status ON public.flight_alerts (status) WHERE status = 'price_drop';

-- 3. Daily price history (global)
CREATE TABLE IF NOT EXISTS public.flight_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE,
  price NUMERIC NOT NULL,
  source TEXT NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_price_history_route ON public.flight_price_history (origin, destination, scraped_at DESC);

-- 4. Materialized deals (global, recomputed daily)
CREATE TABLE IF NOT EXISTS public.flight_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  current_price NUMERIC NOT NULL,
  avg_price NUMERIC NOT NULL,
  discount_pct NUMERIC NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flight_deals_discount ON public.flight_deals (discount_pct DESC);

-- RLS
ALTER TABLE public.flight_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_deals ENABLE ROW LEVEL SECURITY;

-- flight_alerts: users read/write own
CREATE POLICY "Users read own alerts" ON public.flight_alerts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alerts" ON public.flight_alerts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON public.flight_alerts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own alerts" ON public.flight_alerts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- flight_searches: global read, service-role write
CREATE POLICY "Anyone can read cached searches" ON public.flight_searches
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role inserts searches" ON public.flight_searches
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role updates searches" ON public.flight_searches
  FOR UPDATE TO service_role USING (true);

-- flight_price_history: global read, service-role write
CREATE POLICY "Anyone can read price history" ON public.flight_price_history
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role inserts history" ON public.flight_price_history
  FOR INSERT TO service_role WITH CHECK (true);

-- flight_deals: global read, service-role write
CREATE POLICY "Anyone can read deals" ON public.flight_deals
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages deals" ON public.flight_deals
  FOR ALL TO service_role USING (true);

-- Permissions
GRANT SELECT ON public.flight_searches TO anon, authenticated;
GRANT SELECT ON public.flight_price_history TO anon, authenticated;
GRANT SELECT ON public.flight_deals TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flight_alerts TO authenticated;
