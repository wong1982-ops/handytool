-- Search results cache
CREATE TABLE IF NOT EXISTS public.local_services_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ls_cache_key ON public.local_services_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ls_cache_created ON public.local_services_cache(created_at);

-- User favourites
CREATE TABLE IF NOT EXISTS public.local_services_favourites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_id TEXT NOT NULL,
  place_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_ls_fav_user ON public.local_services_favourites(user_id);

-- RLS
ALTER TABLE public.local_services_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_services_favourites ENABLE ROW LEVEL SECURITY;

-- Cache: public read, service-role write (API routes use service role)
CREATE POLICY "Anyone can read cache" ON public.local_services_cache FOR SELECT USING (true);
CREATE POLICY "Service role can insert cache" ON public.local_services_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can delete cache" ON public.local_services_cache FOR DELETE USING (true);

-- Favourites: users manage own
CREATE POLICY "Users can view own favourites" ON public.local_services_favourites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favourites" ON public.local_services_favourites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favourites" ON public.local_services_favourites FOR DELETE USING (auth.uid() = user_id);
