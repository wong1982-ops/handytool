-- Referral codes (one per user)
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes (code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes (user_id);
GRANT ALL ON referral_codes TO authenticated, service_role;

-- Referrals log
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  credits_awarded INT DEFAULT 15,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_id, created_at DESC);
GRANT ALL ON referrals TO authenticated, service_role;

-- RPC: award referral credits to a user (adds purchased_credits)
CREATE OR REPLACE FUNCTION public.award_referral_credits(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT DEFAULT 'Referral bonus'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_after INT;
BEGIN
  UPDATE public.user_credits
     SET purchased_credits = purchased_credits + p_amount
   WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, purchased_credits, subscription_credits)
    VALUES (p_user_id, p_amount, 0);
  END IF;

  SELECT (uc.subscription_credits + uc.purchased_credits)
    INTO v_balance_after
    FROM public.user_credits uc
   WHERE uc.user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'referral', p_amount, v_balance_after, p_description);
END;
$$;
