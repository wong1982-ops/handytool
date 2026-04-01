-- Community service providers (admin-curated)
CREATE TABLE IF NOT EXISTS public.community_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  profile_photo TEXT,
  portfolio_photos TEXT[] DEFAULT '{}',
  pricing_info TEXT,
  availability TEXT,
  service_area TEXT[] DEFAULT '{}',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cp_category ON public.community_providers(category_id);
CREATE INDEX IF NOT EXISTS idx_cp_status ON public.community_providers(status);
CREATE INDEX IF NOT EXISTS idx_cp_location ON public.community_providers(lat, lng);

-- Reviews for community providers
CREATE TABLE IF NOT EXISTS public.community_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES community_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cr_provider ON public.community_reviews(provider_id);

-- User submissions for new providers
CREATE TABLE IF NOT EXISTS public.community_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID NOT NULL,
  provider_name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  service_area TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.community_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;

-- Providers: public read
CREATE POLICY "Anyone can view active providers" ON public.community_providers FOR SELECT USING (status = 'active' AND is_approved = true);
CREATE POLICY "Service can manage providers" ON public.community_providers FOR ALL USING (true);

-- Reviews: public read, users write own
CREATE POLICY "Anyone can view reviews" ON public.community_reviews FOR SELECT USING (true);
CREATE POLICY "Users can write reviews" ON public.community_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.community_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.community_reviews FOR DELETE USING (auth.uid() = user_id);

-- Submissions: users can create and view own
CREATE POLICY "Users can submit" ON public.community_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can view own submissions" ON public.community_submissions FOR SELECT USING (auth.uid() = submitted_by);
