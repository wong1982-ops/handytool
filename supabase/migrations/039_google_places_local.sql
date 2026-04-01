-- Local database for Google Places data (permanent cache to avoid API charges)
-- Data is fetched once from Google and stored locally. Only new/unseen
-- searches trigger Google API calls.

CREATE TABLE IF NOT EXISTS public.google_places_local (
  id TEXT PRIMARY KEY,                    -- Google Place ID
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  website TEXT,
  rating DOUBLE PRECISION,
  rating_count INT DEFAULT 0,
  category TEXT,
  google_type TEXT,
  photo_url TEXT,
  hours JSONB,                            -- { display: string[], isOpenNow: boolean }
  reviews JSONB DEFAULT '[]'::jsonb,      -- cached Google reviews
  business_status TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),   -- when we first fetched from Google
  refreshed_at TIMESTAMPTZ DEFAULT now()  -- when we last refreshed
);

CREATE INDEX IF NOT EXISTS idx_gpl_category ON public.google_places_local(category);
CREATE INDEX IF NOT EXISTS idx_gpl_location ON public.google_places_local(lat, lng);
CREATE INDEX IF NOT EXISTS idx_gpl_google_type ON public.google_places_local(google_type);

-- Track which search queries we've already done
-- So we know when to skip Google API
CREATE TABLE IF NOT EXISTS public.google_places_search_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,         -- "{lat_3dp},{lng_3dp}:{category}:{radius}"
  result_count INT DEFAULT 0,
  searched_at TIMESTAMPTZ DEFAULT now(),
  refreshed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gpsl_key ON public.google_places_search_log(cache_key);

-- Link table: which places appeared in which search
CREATE TABLE IF NOT EXISTS public.google_places_search_results (
  search_key TEXT NOT NULL,               -- matches google_places_search_log.cache_key
  place_id TEXT NOT NULL REFERENCES google_places_local(id) ON DELETE CASCADE,
  distance INT,                           -- meters from search center
  PRIMARY KEY (search_key, place_id)
);

-- RLS — public read, service-role write
ALTER TABLE public.google_places_local ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_places_search_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_places_search_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read places" ON public.google_places_local FOR SELECT USING (true);
CREATE POLICY "Service can write places" ON public.google_places_local FOR ALL USING (true);

CREATE POLICY "Anyone can read search log" ON public.google_places_search_log FOR SELECT USING (true);
CREATE POLICY "Service can write search log" ON public.google_places_search_log FOR ALL USING (true);

CREATE POLICY "Anyone can read search results" ON public.google_places_search_results FOR SELECT USING (true);
CREATE POLICY "Service can write search results" ON public.google_places_search_results FOR ALL USING (true);
