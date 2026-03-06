-- Credit stored procedures: deduct, refund, grant, admin adjust
-- All procedures run as SECURITY DEFINER to bypass RLS for atomic credit operations.

-- =============================================================================
-- 1. deduct_credits — atomically deduct credits (subscription first, then purchased)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INT,
  p_tool_id TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(new_subscription_balance INT, new_purchased_balance INT, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_balance INT;
  v_purchased_balance INT;
  v_sub_deduct INT;
  v_purchased_deduct INT;
  v_total INT;
  v_balance_after INT;
  v_txn_id UUID;
BEGIN
  -- Ensure user_credits row exists (initialise with 0 if missing)
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lock the row for the duration of this transaction
  SELECT uc.subscription_balance, uc.purchased_balance
    INTO v_sub_balance, v_purchased_balance
    FROM public.user_credits uc
   WHERE uc.user_id = p_user_id
     FOR UPDATE;

  v_total := v_sub_balance + v_purchased_balance;

  -- Guard: insufficient credits
  IF v_total < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits'
      USING DETAIL = json_build_object(
        'available', v_total,
        'required', p_amount,
        'subscription_balance', v_sub_balance,
        'purchased_balance', v_purchased_balance
      )::TEXT;
  END IF;

  -- FIFO: deduct from subscription_balance first (expiring credits)
  v_sub_deduct := LEAST(v_sub_balance, p_amount);
  v_purchased_deduct := p_amount - v_sub_deduct;

  v_sub_balance := v_sub_balance - v_sub_deduct;
  v_purchased_balance := v_purchased_balance - v_purchased_deduct;
  v_balance_after := v_sub_balance + v_purchased_balance;

  -- Update balances
  UPDATE public.user_credits uc
     SET subscription_balance = v_sub_balance,
         purchased_balance = v_purchased_balance,
         updated_at = now()
   WHERE uc.user_id = p_user_id;

  -- Record the transaction (negative amount = usage)
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, tool_id, description)
  VALUES (p_user_id, 'usage', -p_amount, v_balance_after, p_tool_id, p_description)
  RETURNING id INTO v_txn_id;

  RETURN QUERY SELECT v_sub_balance, v_purchased_balance, v_txn_id;
END;
$$;

-- =============================================================================
-- 2. refund_credits — refund credits back to purchased_balance
-- =============================================================================
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id UUID,
  p_amount INT,
  p_original_transaction_id UUID,
  p_description TEXT DEFAULT 'AI call failed — credits refunded'
)
RETURNS TABLE(new_subscription_balance INT, new_purchased_balance INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_balance INT;
  v_purchased_balance INT;
  v_balance_after INT;
BEGIN
  -- Add refund to purchased_balance
  UPDATE public.user_credits uc
     SET purchased_balance = uc.purchased_balance + p_amount,
         updated_at = now()
   WHERE uc.user_id = p_user_id
  RETURNING uc.subscription_balance, uc.purchased_balance
    INTO v_sub_balance, v_purchased_balance;

  v_balance_after := v_sub_balance + v_purchased_balance;

  -- Record the refund transaction (positive amount)
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (
    p_user_id,
    'refund',
    p_amount,
    v_balance_after,
    p_description,
    json_build_object('original_transaction_id', p_original_transaction_id)::JSONB
  );

  RETURN QUERY SELECT v_sub_balance, v_purchased_balance;
END;
$$;

-- =============================================================================
-- 3. grant_subscription_credits — set subscription balance for a billing period
-- =============================================================================
CREATE OR REPLACE FUNCTION public.grant_subscription_credits(
  p_user_id UUID,
  p_amount INT,
  p_period_end TIMESTAMPTZ,
  p_description TEXT DEFAULT 'Subscription credits granted'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_after INT;
BEGIN
  -- Upsert: set subscription_balance and period end
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance, current_period_end)
  VALUES (p_user_id, p_amount, 0, p_period_end)
  ON CONFLICT (user_id) DO UPDATE
    SET subscription_balance = p_amount,
        current_period_end = p_period_end,
        updated_at = now();

  -- Calculate balance_after for the ledger
  SELECT uc.subscription_balance + uc.purchased_balance
    INTO v_balance_after
    FROM public.user_credits uc
   WHERE uc.user_id = p_user_id;

  -- Record the grant
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'subscription_grant', p_amount, v_balance_after, p_description);
END;
$$;

-- =============================================================================
-- 4. grant_purchased_credits — add purchased credits to a user
-- =============================================================================
CREATE OR REPLACE FUNCTION public.grant_purchased_credits(
  p_user_id UUID,
  p_amount INT,
  p_description TEXT DEFAULT 'Credit pack purchased'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_after INT;
BEGIN
  -- Upsert: increment purchased_balance
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance)
  VALUES (p_user_id, 0, p_amount)
  ON CONFLICT (user_id) DO UPDATE
    SET purchased_balance = public.user_credits.purchased_balance + p_amount,
        updated_at = now();

  -- Calculate balance_after for the ledger
  SELECT uc.subscription_balance + uc.purchased_balance
    INTO v_balance_after
    FROM public.user_credits uc
   WHERE uc.user_id = p_user_id;

  -- Record the purchase
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'purchase', p_amount, v_balance_after, p_description);
END;
$$;

-- =============================================================================
-- 5. admin_adjust_credits — admin adjustment (positive or negative, floor at 0)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  p_user_id UUID,
  p_amount INT,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_after INT;
BEGIN
  -- Upsert: adjust purchased_balance, never go below 0
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance)
  VALUES (p_user_id, 0, GREATEST(p_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET purchased_balance = GREATEST(public.user_credits.purchased_balance + p_amount, 0),
        updated_at = now();

  -- Calculate balance_after for the ledger
  SELECT uc.subscription_balance + uc.purchased_balance
    INTO v_balance_after
    FROM public.user_credits uc
   WHERE uc.user_id = p_user_id;

  -- Record the adjustment
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (
    p_user_id,
    'admin_adjustment',
    p_amount,
    v_balance_after,
    p_reason,
    json_build_object('admin_id', p_admin_id)::JSONB
  );
END;
$$;
