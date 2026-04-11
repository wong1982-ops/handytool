-- Welcome bonus: grant 15 credits to every newly-created user.
-- Fires once per user via an AFTER INSERT trigger on auth.users.
-- Credits land in purchased_balance (never expires with subscription period).
--
-- Idempotency: the trigger only fires on INSERT, so a user can never receive
-- the bonus twice. Existing users are intentionally NOT backfilled.

-- ---------------------------------------------------------------------------
-- 1. Trigger function
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.grant_signup_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reuse the existing grant_purchased_credits RPC so the credit_transactions
  -- ledger entry is consistent with other credit grants.
  PERFORM public.grant_purchased_credits(
    NEW.id,
    15,
    'Welcome bonus'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block user creation if the bonus grant fails — log via NOTICE and
  -- let the auth.users insert succeed. Operators can backfill manually.
  RAISE NOTICE 'grant_signup_bonus failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Trigger on auth.users
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_signup_bonus ON auth.users;

CREATE TRIGGER on_auth_user_signup_bonus
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_signup_bonus();

-- ---------------------------------------------------------------------------
-- 3. Notes for operators
-- ---------------------------------------------------------------------------
--
-- To verify after applying:
--   SELECT count(*) FROM credit_transactions WHERE description = 'Welcome bonus';
--
-- To backfill an existing user manually (NOT done by this migration):
--   SELECT public.grant_purchased_credits(
--     '<user-uuid>'::uuid,
--     15,
--     'Welcome bonus (backfill)'
--   );
--
-- To revoke (if you ever need to):
--   DROP TRIGGER IF EXISTS on_auth_user_signup_bonus ON auth.users;
--   DROP FUNCTION IF EXISTS public.grant_signup_bonus();
