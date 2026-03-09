-- Credit reservation system: lock credits during generation, confirm/release on completion/failure.
-- Prevents parallel requests from double-spending by tracking locked credits.

-- =============================================================================
-- 1. Add locked_balance to user_credits (denormalized counter for fast checks)
-- =============================================================================
ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS locked_balance INT DEFAULT 0;

-- =============================================================================
-- 2. credit_reservations — tracks individual credit locks
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.credit_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  amount INT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'released', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 minutes',
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_credit_reservations_user_status
  ON public.credit_reservations (user_id, status);

CREATE INDEX idx_credit_reservations_expires
  ON public.credit_reservations (expires_at)
  WHERE status = 'pending';

-- RLS: users can read their own reservations
ALTER TABLE public.credit_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reservations"
  ON public.credit_reservations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.credit_reservations TO authenticated;

-- =============================================================================
-- 3. reserve_credits — atomically check available balance and lock credits
--    Available = (subscription + purchased) - locked
--    Prevents parallel requests from exceeding balance.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.reserve_credits(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(reservation_id UUID, available_balance INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_balance INT;
  v_purchased_balance INT;
  v_locked INT;
  v_available INT;
  v_reservation_id UUID;
BEGIN
  -- Ensure user_credits row exists
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance, locked_balance)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock the row — prevents parallel reserve_credits from racing
  SELECT uc.subscription_balance, uc.purchased_balance, uc.locked_balance
    INTO v_sub_balance, v_purchased_balance, v_locked
    FROM public.user_credits uc
   WHERE uc.user_id = p_user_id
     FOR UPDATE;

  v_available := v_sub_balance + v_purchased_balance - v_locked;

  -- Guard: insufficient available credits
  IF v_available < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits'
      USING DETAIL = json_build_object(
        'available', v_available,
        'required', p_amount,
        'subscription_balance', v_sub_balance,
        'purchased_balance', v_purchased_balance,
        'locked_balance', v_locked
      )::TEXT;
  END IF;

  -- Increment locked_balance
  UPDATE public.user_credits uc
     SET locked_balance = uc.locked_balance + p_amount,
         updated_at = now()
   WHERE uc.user_id = p_user_id;

  -- Create reservation record
  INSERT INTO public.credit_reservations (user_id, amount, description, status)
  VALUES (p_user_id, p_amount, p_description, 'pending')
  RETURNING id INTO v_reservation_id;

  RETURN QUERY SELECT v_reservation_id, v_available;
END;
$$;

-- =============================================================================
-- 4. confirm_reserved_credits — finalize a reservation: deduct from real balance,
--    decrement locked, log the usage transaction.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.confirm_reserved_credits(
  p_reservation_id UUID,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(new_subscription_balance INT, new_purchased_balance INT, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_amount INT;
  v_status TEXT;
  v_sub_balance INT;
  v_purchased_balance INT;
  v_sub_deduct INT;
  v_purchased_deduct INT;
  v_balance_after INT;
  v_txn_id UUID;
  v_desc TEXT;
BEGIN
  -- Fetch and lock the reservation
  SELECT cr.user_id, cr.amount, cr.status, cr.description
    INTO v_user_id, v_amount, v_status, v_desc
    FROM public.credit_reservations cr
   WHERE cr.id = p_reservation_id
     FOR UPDATE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'reservation_not_found'
      USING DETAIL = json_build_object('reservation_id', p_reservation_id)::TEXT;
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'reservation_already_resolved'
      USING DETAIL = json_build_object('reservation_id', p_reservation_id, 'status', v_status)::TEXT;
  END IF;

  -- Use provided description or fall back to reservation description
  v_desc := COALESCE(p_description, v_desc);

  -- Lock user_credits row
  SELECT uc.subscription_balance, uc.purchased_balance
    INTO v_sub_balance, v_purchased_balance
    FROM public.user_credits uc
   WHERE uc.user_id = v_user_id
     FOR UPDATE;

  -- FIFO deduction: subscription first, then purchased
  v_sub_deduct := LEAST(v_sub_balance, v_amount);
  v_purchased_deduct := v_amount - v_sub_deduct;

  v_sub_balance := v_sub_balance - v_sub_deduct;
  v_purchased_balance := v_purchased_balance - v_purchased_deduct;
  v_balance_after := v_sub_balance + v_purchased_balance;

  -- Update balances: deduct from real balance AND decrement locked
  UPDATE public.user_credits uc
     SET subscription_balance = v_sub_balance,
         purchased_balance = v_purchased_balance,
         locked_balance = GREATEST(uc.locked_balance - v_amount, 0),
         updated_at = now()
   WHERE uc.user_id = v_user_id;

  -- Mark reservation as confirmed
  UPDATE public.credit_reservations
     SET status = 'confirmed',
         resolved_at = now()
   WHERE id = p_reservation_id;

  -- Record the usage transaction
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (
    v_user_id,
    'usage',
    -v_amount,
    v_balance_after,
    v_desc,
    json_build_object('reservation_id', p_reservation_id)::JSONB
  )
  RETURNING id INTO v_txn_id;

  RETURN QUERY SELECT v_sub_balance, v_purchased_balance, v_txn_id;
END;
$$;

-- =============================================================================
-- 5. release_reserved_credits — cancel a reservation, return locked credits
-- =============================================================================
CREATE OR REPLACE FUNCTION public.release_reserved_credits(
  p_reservation_id UUID,
  p_reason TEXT DEFAULT 'Generation failed — credits released'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_amount INT;
  v_status TEXT;
BEGIN
  -- Fetch and lock the reservation
  SELECT cr.user_id, cr.amount, cr.status
    INTO v_user_id, v_amount, v_status
    FROM public.credit_reservations cr
   WHERE cr.id = p_reservation_id
     FOR UPDATE;

  IF v_user_id IS NULL THEN
    RETURN; -- silently ignore missing reservations
  END IF;

  IF v_status != 'pending' THEN
    RETURN; -- already resolved, no-op
  END IF;

  -- Decrement locked_balance
  UPDATE public.user_credits uc
     SET locked_balance = GREATEST(uc.locked_balance - v_amount, 0),
         updated_at = now()
   WHERE uc.user_id = v_user_id;

  -- Mark reservation as released
  UPDATE public.credit_reservations
     SET status = 'released',
         resolved_at = now(),
         description = COALESCE(description, '') || ' | Released: ' || p_reason
   WHERE id = p_reservation_id;
END;
$$;

-- =============================================================================
-- 6. cleanup_expired_reservations — release stale pending reservations
--    Run periodically via cron or on-demand.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT := 0;
  v_rec RECORD;
BEGIN
  FOR v_rec IN
    SELECT cr.id, cr.user_id, cr.amount
      FROM public.credit_reservations cr
     WHERE cr.status = 'pending'
       AND cr.expires_at < now()
     FOR UPDATE SKIP LOCKED
  LOOP
    -- Decrement locked_balance
    UPDATE public.user_credits uc
       SET locked_balance = GREATEST(uc.locked_balance - v_rec.amount, 0),
           updated_at = now()
     WHERE uc.user_id = v_rec.user_id;

    -- Mark as expired
    UPDATE public.credit_reservations
       SET status = 'expired',
           resolved_at = now()
     WHERE id = v_rec.id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
