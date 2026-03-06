-- Credit-based MMR system: tiers, credits, transactions, promos

-- =============================================================================
-- 1. subscription_tiers — defines available subscription plans
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_credits INT NOT NULL,
  stripe_price_id TEXT,
  features JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 2. user_credits — per-user credit balances
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  subscription_balance INT DEFAULT 0,
  purchased_balance INT DEFAULT 0,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 3. credit_transaction_type — enum for transaction categories
-- =============================================================================
CREATE TYPE public.credit_transaction_type AS ENUM (
  'usage',
  'purchase',
  'subscription_grant',
  'subscription_reset',
  'admin_adjustment',
  'refund',
  'promo_redemption'
);

-- =============================================================================
-- 4. credit_transactions — ledger of all credit changes
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  type public.credit_transaction_type NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  tool_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credit_transactions_user_date
  ON public.credit_transactions (user_id, created_at DESC);

CREATE INDEX idx_credit_transactions_type
  ON public.credit_transactions (type);

-- =============================================================================
-- 5. tool_credit_costs — per-tool credit pricing
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tool_credit_costs (
  tool_id TEXT PRIMARY KEY,
  credit_cost INT DEFAULT 1,
  display_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users ON DELETE SET NULL
);

-- =============================================================================
-- 6. promo_codes — promotional credit codes
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  credit_amount INT NOT NULL,
  max_redemptions INT,
  current_redemptions INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_promo_codes_code ON public.promo_codes (code);

-- =============================================================================
-- 7. user_subscriptions — Stripe subscription tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tier_id TEXT NOT NULL REFERENCES public.subscription_tiers (id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_subscriptions_user
  ON public.user_subscriptions (user_id);

CREATE INDEX idx_user_subscriptions_stripe
  ON public.user_subscriptions (stripe_subscription_id);

-- =============================================================================
-- 8. processed_events — idempotency guard for webhook events
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.processed_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_credit_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;

-- subscription_tiers: anyone can read active tiers
CREATE POLICY "Allow public read of active tiers"
  ON public.subscription_tiers FOR SELECT TO anon, authenticated
  USING (active = true);

-- user_credits: users read their own row
CREATE POLICY "Users read own credits"
  ON public.user_credits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- credit_transactions: users read their own rows
CREATE POLICY "Users read own transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- tool_credit_costs: anyone can read
CREATE POLICY "Allow public read of tool costs"
  ON public.tool_credit_costs FOR SELECT TO anon, authenticated
  USING (true);

-- promo_codes: authenticated users read active codes
CREATE POLICY "Authenticated read active promos"
  ON public.promo_codes FOR SELECT TO authenticated
  USING (active = true);

-- user_subscriptions: users read their own rows
CREATE POLICY "Users read own subscriptions"
  ON public.user_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- Grants
-- =============================================================================

GRANT SELECT ON public.user_credits TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT SELECT ON public.subscription_tiers TO anon, authenticated;
GRANT SELECT ON public.tool_credit_costs TO anon, authenticated;
GRANT SELECT ON public.promo_codes TO authenticated;
