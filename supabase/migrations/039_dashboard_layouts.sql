CREATE TABLE IF NOT EXISTS public.user_dashboard_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  layout JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user ON user_dashboard_layouts (user_id);
GRANT ALL ON user_dashboard_layouts TO authenticated, service_role;
