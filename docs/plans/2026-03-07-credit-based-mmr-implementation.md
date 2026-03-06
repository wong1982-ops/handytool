# Credit-Based MMR System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a credit-based metered billing system for AI tools with Supabase-native credit management and Stripe payments, spanning both client and admin portals.

**Architecture:** Supabase Postgres stores all credit data with atomic stored procedures for deductions. Stripe Checkout (hosted) handles payments. Webhooks bridge Stripe events to credit grants. Client app shows balance and purchase UI. Admin app manages users, pricing, promos, and tiers.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres + Auth + RLS), Stripe (Checkout + Webhooks), Zod validation, TypeScript strict, Tailwind CSS v4, pnpm

**Design doc:** `docs/plans/2026-03-07-credit-based-mmr-design.md`

---

## Phase 1: Database Foundation

### Task 1: Create credit system migration

**Files:**
- Create: `supabase/migrations/003_credit_system.sql`

**Step 1: Write the migration SQL**

```sql
-- Credit system tables for AI tool billing
-- Follows pattern from 002_blog_posts.sql

-- 1. Subscription tiers (must exist before user_subscriptions FK)
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_credits INTEGER NOT NULL,
  stripe_price_id TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. User credits (one row per user)
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_balance INTEGER NOT NULL DEFAULT 0,
  purchased_balance INTEGER NOT NULL DEFAULT 0,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Credit transactions (audit log)
CREATE TYPE public.credit_transaction_type AS ENUM (
  'usage', 'purchase', 'subscription_grant', 'subscription_reset',
  'admin_adjustment', 'refund', 'promo_redemption'
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  tool_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tool credit costs
CREATE TABLE IF NOT EXISTS public.tool_credit_costs (
  tool_id TEXT PRIMARY KEY,
  credit_cost INTEGER NOT NULL DEFAULT 1,
  display_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 5. Promo codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  credit_amount INTEGER NOT NULL,
  max_redemptions INTEGER,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id TEXT NOT NULL REFERENCES public.subscription_tiers(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Processed Stripe events (idempotency)
CREATE TABLE IF NOT EXISTS public.processed_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_credit_transactions_user ON public.credit_transactions (user_id, created_at DESC);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions (type);
CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions (user_id);
CREATE INDEX idx_user_subscriptions_stripe ON public.user_subscriptions (stripe_subscription_id);
CREATE INDEX idx_promo_codes_code ON public.promo_codes (code);

-- RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_credit_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read their own data
CREATE POLICY "Users read own credits"
  ON public.user_credits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own subscriptions"
  ON public.user_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Public read for tiers and tool costs (needed for pricing display)
CREATE POLICY "Anyone can read active tiers"
  ON public.subscription_tiers FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "Anyone can read tool costs"
  ON public.tool_credit_costs FOR SELECT TO anon, authenticated
  USING (true);

-- Promo codes: only active, unexpired, with remaining redemptions
CREATE POLICY "Authenticated read active promos"
  ON public.promo_codes FOR SELECT TO authenticated
  USING (active = true);

-- Service role bypasses RLS for admin operations and webhook processing

-- Grant permissions
GRANT SELECT ON public.user_credits TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.subscription_tiers TO anon, authenticated;
GRANT SELECT ON public.tool_credit_costs TO anon, authenticated;
GRANT SELECT ON public.promo_codes TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;
```

**Step 2: Apply the migration**

Run via Supabase MCP tool: `mcp__supabase__apply_migration`

**Step 3: Commit**

```bash
git add supabase/migrations/003_credit_system.sql
git commit -m "feat(db): add credit system tables — tiers, credits, transactions, promos"
```

---

### Task 2: Create stored procedures for atomic credit operations

**Files:**
- Create: `supabase/migrations/004_credit_procedures.sql`

**Step 1: Write the stored procedures**

```sql
-- Atomic credit deduction: tries subscription_balance first, then purchased_balance
-- Returns the new total balance, or raises exception if insufficient
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_tool_id TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(new_subscription_balance INTEGER, new_purchased_balance INTEGER, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_bal INTEGER;
  v_pur_bal INTEGER;
  v_sub_deduct INTEGER;
  v_pur_deduct INTEGER;
  v_total INTEGER;
  v_tx_id UUID;
BEGIN
  -- Lock the row for update
  SELECT subscription_balance, purchased_balance
  INTO v_sub_bal, v_pur_bal
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Create row if not exists
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance)
    VALUES (p_user_id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    v_sub_bal := 0;
    v_pur_bal := 0;
  END IF;

  v_total := v_sub_bal + v_pur_bal;

  IF v_total < p_amount THEN
    RAISE EXCEPTION 'insufficient_credits' USING DETAIL = json_build_object(
      'available', v_total,
      'required', p_amount
    )::text;
  END IF;

  -- Deduct from subscription first (expiring credits), then purchased
  v_sub_deduct := LEAST(v_sub_bal, p_amount);
  v_pur_deduct := p_amount - v_sub_deduct;

  UPDATE public.user_credits
  SET
    subscription_balance = subscription_balance - v_sub_deduct,
    purchased_balance = purchased_balance - v_pur_deduct,
    updated_at = now()
  WHERE user_id = p_user_id;

  v_sub_bal := v_sub_bal - v_sub_deduct;
  v_pur_bal := v_pur_bal - v_pur_deduct;

  -- Log the transaction
  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, tool_id, description)
  VALUES (p_user_id, 'usage', -p_amount, v_sub_bal + v_pur_bal, p_tool_id, p_description)
  RETURNING id INTO v_tx_id;

  RETURN QUERY SELECT v_sub_bal, v_pur_bal, v_tx_id;
END;
$$;

-- Refund credits (on AI failure): restores to purchased_balance
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_original_transaction_id UUID,
  p_description TEXT DEFAULT 'AI call failed — credits refunded'
)
RETURNS TABLE(new_subscription_balance INTEGER, new_purchased_balance INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_bal INTEGER;
  v_pur_bal INTEGER;
BEGIN
  UPDATE public.user_credits
  SET
    purchased_balance = purchased_balance + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING subscription_balance, purchased_balance INTO v_sub_bal, v_pur_bal;

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (
    p_user_id, 'refund', p_amount, v_sub_bal + v_pur_bal, p_description,
    json_build_object('original_transaction_id', p_original_transaction_id)::jsonb
  );

  RETURN QUERY SELECT v_sub_bal, v_pur_bal;
END;
$$;

-- Grant subscription credits (called from webhook on payment/renewal)
CREATE OR REPLACE FUNCTION public.grant_subscription_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_period_end TIMESTAMPTZ,
  p_description TEXT DEFAULT 'Subscription credits granted'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance, current_period_end)
  VALUES (p_user_id, p_amount, 0, p_period_end)
  ON CONFLICT (user_id) DO UPDATE SET
    subscription_balance = p_amount,
    current_period_end = p_period_end,
    updated_at = now();

  SELECT subscription_balance + purchased_balance INTO v_balance
  FROM public.user_credits WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'subscription_grant', p_amount, v_balance, p_description);
END;
$$;

-- Grant purchased credits (called from webhook on one-time payment)
CREATE OR REPLACE FUNCTION public.grant_purchased_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Credit pack purchased'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance)
  VALUES (p_user_id, 0, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET
    purchased_balance = public.user_credits.purchased_balance + p_amount,
    updated_at = now();

  SELECT subscription_balance + purchased_balance INTO v_balance
  FROM public.user_credits WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'purchase', p_amount, v_balance, p_description);
END;
$$;

-- Admin credit adjustment
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  INSERT INTO public.user_credits (user_id, subscription_balance, purchased_balance)
  VALUES (p_user_id, 0, GREATEST(p_amount, 0))
  ON CONFLICT (user_id) DO UPDATE SET
    purchased_balance = GREATEST(public.user_credits.purchased_balance + p_amount, 0),
    updated_at = now();

  SELECT subscription_balance + purchased_balance INTO v_balance
  FROM public.user_credits WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (
    p_user_id, 'admin_adjustment', p_amount, v_balance, p_reason,
    json_build_object('admin_id', p_admin_id)::jsonb
  );
END;
$$;
```

**Step 2: Apply the migration**

Run via Supabase MCP tool: `mcp__supabase__apply_migration`

**Step 3: Commit**

```bash
git add supabase/migrations/004_credit_procedures.sql
git commit -m "feat(db): add credit stored procedures — deduct, refund, grant, admin adjust"
```

---

### Task 3: Seed initial subscription tiers and tool costs

**Files:**
- Create: `supabase/migrations/005_credit_seed.sql`

**Step 1: Write the seed data**

```sql
-- Seed subscription tiers (Stripe Price IDs to be updated after Stripe setup)
INSERT INTO public.subscription_tiers (id, name, monthly_credits, stripe_price_id, features) VALUES
  ('basic', 'Basic', 100, 'price_basic_placeholder', '["100 AI credits/month", "All free tools", "Basic AI tools"]'::jsonb),
  ('pro', 'Pro', 500, 'price_pro_placeholder', '["500 AI credits/month", "All free tools", "All AI tools", "Priority processing"]'::jsonb),
  ('enterprise', 'Enterprise', 2000, 'price_enterprise_placeholder', '["2000 AI credits/month", "All free tools", "All AI tools", "Priority processing", "Dedicated support"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed tool credit costs (placeholder — update when AI tools are built)
-- Using tool slugs from lib/tools.tsx as reference
INSERT INTO public.tool_credit_costs (tool_id, credit_cost, display_name) VALUES
  ('ai-image-enhance', 5, 'AI Image Enhance'),
  ('ai-content-writer', 10, 'AI Content Writer'),
  ('ai-code-assistant', 8, 'AI Code Assistant'),
  ('ai-translator', 3, 'AI Translator')
ON CONFLICT (tool_id) DO NOTHING;
```

**Step 2: Apply the migration**

Run via Supabase MCP tool: `mcp__supabase__apply_migration`

**Step 3: Commit**

```bash
git add supabase/migrations/005_credit_seed.sql
git commit -m "feat(db): seed subscription tiers and initial tool credit costs"
```

---

## Phase 2: Stripe Integration Setup

### Task 4: Install Stripe and configure environment

**Files:**
- Modify: `package.json` (root — client app)
- Modify: `admin/package.json`
- Modify: `.env.example`

**Step 1: Install Stripe SDK in both apps**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace
pnpm add stripe
cd admin && pnpm add stripe && cd ..
```

**Step 2: Update `.env.example` with Stripe variables**

Add to `.env.example`:
```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Step 3: Add Stripe keys to `.env.local`**

User must set actual Stripe keys from their Stripe dashboard.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml admin/package.json .env.example
git commit -m "feat: install stripe SDK and add env variable templates"
```

---

### Task 5: Create Stripe utility module

**Files:**
- Create: `lib/stripe/client.ts`
- Create: `lib/stripe/config.ts`

**Step 1: Create Stripe server client**

`lib/stripe/client.ts`:
```typescript
import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    stripeInstance = new Stripe(key, { apiVersion: '2025-01-27.acacia' })
  }
  return stripeInstance
}
```

**Step 2: Create credit pack config**

`lib/stripe/config.ts`:
```typescript
export const CREDIT_PACKS = [
  { id: 'pack_100', credits: 100, label: '100 Credits', priceCents: 500 },
  { id: 'pack_500', credits: 500, label: '500 Credits', priceCents: 2000 },
  { id: 'pack_1000', credits: 1000, label: '1,000 Credits', priceCents: 3500 },
] as const

export type CreditPackId = typeof CREDIT_PACKS[number]['id']
```

**Step 3: Commit**

```bash
git add lib/stripe/
git commit -m "feat: add Stripe server client and credit pack config"
```

---

### Task 6: Create Stripe webhook endpoint

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`

**Step 1: Write the webhook handler**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Use service role for webhook processing (no user context)
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  // Idempotency check
  const { data: existing } = await supabase
    .from('processed_events')
    .select('event_id')
    .eq('event_id', event.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session)
        break
      case 'invoice.paid':
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription)
        break
    }

    // Mark as processed
    await supabase.from('processed_events').insert({ event_id: event.id })
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id
  if (!userId) return

  const type = session.metadata?.type

  if (type === 'subscription') {
    const tierId = session.metadata?.tier_id
    if (!tierId) return

    // Look up tier
    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('monthly_credits')
      .eq('id', tierId)
      .single()

    if (!tier) return

    const stripe = getStripe()
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    // Create subscription record
    await supabase.from('user_subscriptions').insert({
      user_id: userId,
      tier_id: tierId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    // Grant subscription credits
    await supabase.rpc('grant_subscription_credits', {
      p_user_id: userId,
      p_amount: tier.monthly_credits,
      p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      p_description: `${tierId} subscription activated`,
    })
  } else if (type === 'credit_pack') {
    const credits = parseInt(session.metadata?.credits || '0', 10)
    if (credits <= 0) return

    await supabase.rpc('grant_purchased_credits', {
      p_user_id: userId,
      p_amount: credits,
      p_description: `Purchased ${credits} credits`,
    })
  }
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  invoice: Stripe.Invoice
) {
  if (!invoice.subscription) return

  // Find subscription record
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('user_id, tier_id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!sub) return

  // Look up tier
  const { data: tier } = await supabase
    .from('subscription_tiers')
    .select('monthly_credits')
    .eq('id', sub.tier_id)
    .single()

  if (!tier) return

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)

  // Update subscription period
  await supabase
    .from('user_subscriptions')
    .update({
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      status: 'active',
    })
    .eq('stripe_subscription_id', subscription.id)

  // Reset subscription credits
  await supabase.rpc('grant_subscription_credits', {
    p_user_id: sub.user_id,
    p_amount: tier.monthly_credits,
    p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    p_description: `Subscription renewed — ${tier.monthly_credits} credits`,
  })
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) {
  await supabase
    .from('user_subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id)
}
```

**Step 2: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat: add Stripe webhook endpoint with idempotent event processing"
```

---

## Phase 3: Client API Endpoints

### Task 7: Create credits balance endpoint

**Files:**
- Create: `app/api/v1/credits/balance/route.ts`

**Step 1: Write the endpoint**

```typescript
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return API_ERRORS.UNAUTHORIZED()

  const { data, error } = await supabase
    .from('user_credits')
    .select('subscription_balance, purchased_balance, current_period_end')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows — user just has no credits yet
    return API_ERRORS.INTERNAL()
  }

  const credits = data || { subscription_balance: 0, purchased_balance: 0, current_period_end: null }

  return apiSuccess({
    subscription_balance: credits.subscription_balance,
    purchased_balance: credits.purchased_balance,
    total: credits.subscription_balance + credits.purchased_balance,
    current_period_end: credits.current_period_end,
  })
}
```

**Step 2: Commit**

```bash
git add app/api/v1/credits/balance/route.ts
git commit -m "feat: add GET /api/v1/credits/balance endpoint"
```

---

### Task 8: Create credits history endpoint

**Files:**
- Create: `app/api/v1/credits/history/route.ts`

**Step 1: Write the endpoint**

```typescript
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return API_ERRORS.UNAUTHORIZED()

  const url = new URL(req.url)
  const parsed = querySchema.safeParse({
    page: url.searchParams.get('page'),
    limit: url.searchParams.get('limit'),
  })

  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { page, limit } = parsed.data
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('credit_transactions')
    .select('id, type, amount, balance_after, tool_id, description, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return API_ERRORS.INTERNAL()

  return apiSuccess({
    transactions: data || [],
    pagination: { page, limit, total: count || 0 },
  })
}
```

**Step 2: Commit**

```bash
git add app/api/v1/credits/history/route.ts
git commit -m "feat: add GET /api/v1/credits/history endpoint with pagination"
```

---

### Task 9: Create billing checkout endpoint

**Files:**
- Create: `app/api/v1/billing/checkout/route.ts`

**Step 1: Write the endpoint**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { CREDIT_PACKS } from '@/lib/stripe/config'
import { z } from 'zod'

const bodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('subscription'),
    tier_id: z.string(),
  }),
  z.object({
    type: z.literal('credit_pack'),
    pack_id: z.string(),
  }),
])

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return API_ERRORS.UNAUTHORIZED()

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const stripe = getStripe()
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'

  if (parsed.data.type === 'subscription') {
    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('stripe_price_id, name')
      .eq('id', parsed.data.tier_id)
      .eq('active', true)
      .single()

    if (!tier) return API_ERRORS.NOT_FOUND('Subscription tier')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: tier.stripe_price_id, quantity: 1 }],
      success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?cancelled=true`,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        type: 'subscription',
        tier_id: parsed.data.tier_id,
      },
    })

    return apiSuccess({ url: session.url })
  }

  // Credit pack
  const pack = CREDIT_PACKS.find(p => p.id === parsed.data.pack_id)
  if (!pack) return API_ERRORS.NOT_FOUND('Credit pack')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: pack.label },
        unit_amount: pack.priceCents,
      },
      quantity: 1,
    }],
    success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing?cancelled=true`,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      type: 'credit_pack',
      pack_id: pack.id,
      credits: pack.credits.toString(),
    },
  })

  return apiSuccess({ url: session.url })
}
```

**Step 2: Commit**

```bash
git add app/api/v1/billing/checkout/route.ts
git commit -m "feat: add POST /api/v1/billing/checkout for subscriptions and credit packs"
```

---

### Task 10: Create billing portal endpoint

**Files:**
- Create: `app/api/v1/billing/portal/route.ts`

**Step 1: Write the endpoint**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return API_ERRORS.UNAUTHORIZED()

  // Find user's Stripe customer ID
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!sub?.stripe_customer_id) return API_ERRORS.NOT_FOUND('Active subscription')

  const stripe = getStripe()
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/billing`,
  })

  return apiSuccess({ url: session.url })
}
```

**Step 2: Commit**

```bash
git add app/api/v1/billing/portal/route.ts
git commit -m "feat: add POST /api/v1/billing/portal for Stripe Customer Portal"
```

---

### Task 11: Create promo code redemption endpoint

**Files:**
- Create: `app/api/v1/credits/redeem/route.ts`

**Step 1: Write the endpoint**

```typescript
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const bodySchema = z.object({ code: z.string().min(1).max(50) })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return API_ERRORS.UNAUTHORIZED()

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  // Use service role for atomic promo operations
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const code = parsed.data.code.toUpperCase().trim()

  // Find and validate promo
  const { data: promo } = await admin
    .from('promo_codes')
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .single()

  if (!promo) return apiError('Invalid promo code', 'INVALID_PROMO', 400)

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return apiError('Promo code has expired', 'PROMO_EXPIRED', 400)
  }

  if (promo.max_redemptions && promo.current_redemptions >= promo.max_redemptions) {
    return apiError('Promo code fully redeemed', 'PROMO_EXHAUSTED', 400)
  }

  // Check if user already redeemed this code
  const { data: existing } = await admin
    .from('credit_transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'promo_redemption')
    .contains('metadata', { promo_code: code })
    .single()

  if (existing) return apiError('You already used this code', 'PROMO_ALREADY_USED', 400)

  // Grant credits
  await admin.rpc('grant_purchased_credits', {
    p_user_id: user.id,
    p_amount: promo.credit_amount,
    p_description: `Promo code: ${code}`,
  })

  // Update the transaction metadata with promo code
  await admin
    .from('credit_transactions')
    .update({ metadata: { promo_code: code }, type: 'promo_redemption' })
    .eq('user_id', user.id)
    .eq('type', 'purchase')
    .eq('description', `Promo code: ${code}`)

  // Increment redemption count
  await admin
    .from('promo_codes')
    .update({ current_redemptions: promo.current_redemptions + 1 })
    .eq('id', promo.id)

  return apiSuccess({ credits_granted: promo.credit_amount })
}
```

**Step 2: Commit**

```bash
git add app/api/v1/credits/redeem/route.ts
git commit -m "feat: add POST /api/v1/credits/redeem for promo code redemption"
```

---

### Task 12: Create tool execution endpoint (credit gate)

**Files:**
- Create: `app/api/v1/tools/execute/route.ts`

**Step 1: Write the endpoint**

```typescript
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { apiSuccess, apiError, API_ERRORS } from '@/lib/api/response'
import { z } from 'zod'

const bodySchema = z.object({
  tool_id: z.string().min(1),
  input: z.record(z.unknown()),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return API_ERRORS.UNAUTHORIZED()

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { tool_id, input } = parsed.data

  // Look up tool cost
  const { data: toolCost } = await supabase
    .from('tool_credit_costs')
    .select('credit_cost, display_name')
    .eq('tool_id', tool_id)
    .single()

  if (!toolCost) return API_ERRORS.NOT_FOUND('Tool')

  // Use service role for credit deduction (bypasses RLS for writes)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Attempt credit deduction
  const { data: deduction, error: deductError } = await admin.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount: toolCost.credit_cost,
    p_tool_id: tool_id,
    p_description: `Used ${toolCost.display_name}`,
  })

  if (deductError) {
    if (deductError.message?.includes('insufficient_credits')) {
      // Parse available/required from error details
      return apiError(
        'Insufficient credits',
        'INSUFFICIENT_CREDITS',
        402,
        { required: toolCost.credit_cost }
      )
    }
    return API_ERRORS.INTERNAL()
  }

  const transactionId = deduction?.[0]?.transaction_id

  // TODO: Call AI provider here based on tool_id and input
  // For now, return a placeholder
  try {
    // const aiResult = await callAiProvider(tool_id, input)
    const aiResult = { message: 'AI tool placeholder — implement per tool' }

    return apiSuccess({
      result: aiResult,
      credits_used: toolCost.credit_cost,
      balance: {
        subscription: deduction?.[0]?.new_subscription_balance ?? 0,
        purchased: deduction?.[0]?.new_purchased_balance ?? 0,
      },
    })
  } catch (aiError) {
    // Refund on AI failure
    if (transactionId) {
      await admin.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: toolCost.credit_cost,
        p_original_transaction_id: transactionId,
      })
    }
    return apiError('AI processing failed — credits refunded', 'AI_ERROR', 502)
  }
}
```

**Step 2: Commit**

```bash
git add app/api/v1/tools/execute/route.ts
git commit -m "feat: add POST /api/v1/tools/execute with atomic credit deduction and refund"
```

---

## Phase 4: Admin API Endpoints

### Task 13: Create admin auth middleware helper

**Files:**
- Create: `admin/lib/api/admin-auth.ts`
- Create: `admin/lib/api/response.ts`

**Step 1: Create admin auth helper (reuses pattern from auth-guard.ts)**

`admin/lib/api/admin-auth.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = ['loicwong1982@gmail.com']

export async function requireAdminApi() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}
```

**Step 2: Copy response helpers to admin**

`admin/lib/api/response.ts`:
```typescript
import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiError(message: string, code: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, code, details }, { status })
}

export const API_ERRORS = {
  VALIDATION: (details?: unknown) => apiError('Validation failed', 'VALIDATION_ERROR', 400, details),
  UNAUTHORIZED: () => apiError('Unauthorized', 'UNAUTHORIZED', 401),
  FORBIDDEN: () => apiError('Forbidden', 'FORBIDDEN', 403),
  NOT_FOUND: (resource = 'Resource') => apiError(`${resource} not found`, 'NOT_FOUND', 404),
  INTERNAL: () => apiError('Internal server error', 'INTERNAL_ERROR', 500),
} as const
```

**Step 3: Commit**

```bash
git add admin/lib/api/
git commit -m "feat(admin): add API auth middleware and response helpers"
```

---

### Task 14: Create admin users endpoint

**Files:**
- Create: `admin/app/api/users/route.ts`
- Create: `admin/app/api/users/[id]/transactions/route.ts`
- Create: `admin/app/api/users/[id]/adjust/route.ts`

**Step 1: Users list endpoint**

`admin/app/api/users/route.ts`:
```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(req: Request) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const url = new URL(req.url)
  const parsed = querySchema.safeParse({
    search: url.searchParams.get('search'),
    page: url.searchParams.get('page'),
    limit: url.searchParams.get('limit'),
  })
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const { search, page, limit } = parsed.data
  const supabase = createAdminClient()

  // Fetch users with their credits via admin client
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('user_credits')
    .select(`
      user_id,
      subscription_balance,
      purchased_balance,
      current_period_end,
      updated_at
    `, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to)

  const { data: credits, count, error: dbError } = await query
  if (dbError) return API_ERRORS.INTERNAL()

  // Fetch user profiles from auth.users (service role needed)
  const userIds = (credits || []).map(c => c.user_id)
  const profiles = await Promise.all(
    userIds.map(id => supabase.auth.admin.getUserById(id))
  )

  const users = (credits || []).map((credit, i) => {
    const authUser = profiles[i]?.data?.user
    return {
      id: credit.user_id,
      email: authUser?.email ?? 'unknown',
      name: authUser?.user_metadata?.full_name ?? authUser?.user_metadata?.name ?? null,
      subscription_balance: credit.subscription_balance,
      purchased_balance: credit.purchased_balance,
      total_credits: credit.subscription_balance + credit.purchased_balance,
      current_period_end: credit.current_period_end,
    }
  })

  return apiSuccess({ users, pagination: { page, limit, total: count || 0 } })
}
```

**Step 2: User transactions endpoint**

`admin/app/api/users/[id]/transactions/route.ts`:
```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = createAdminClient()

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)))
  const from = (page - 1) * limit

  const { data, count, error: dbError } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (dbError) return API_ERRORS.INTERNAL()

  return apiSuccess({ transactions: data || [], pagination: { page, limit, total: count || 0 } })
}
```

**Step 3: Admin credit adjustment endpoint**

`admin/app/api/users/[id]/adjust/route.ts`:
```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const bodySchema = z.object({
  amount: z.number().int(),
  reason: z.string().min(1).max(500),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const supabase = createAdminClient()

  const { error: rpcError } = await supabase.rpc('admin_adjust_credits', {
    p_user_id: id,
    p_amount: parsed.data.amount,
    p_admin_id: user!.id,
    p_reason: parsed.data.reason,
  })

  if (rpcError) return API_ERRORS.INTERNAL()

  return apiSuccess({ adjusted: true })
}
```

**Step 4: Commit**

```bash
git add admin/app/api/users/
git commit -m "feat(admin): add user management API — list, transactions, credit adjustment"
```

---

### Task 15: Create admin tool pricing endpoint

**Files:**
- Create: `admin/app/api/tools/[id]/pricing/route.ts`

**Step 1: Write GET and PUT handlers**

```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error: dbError } = await supabase
    .from('tool_credit_costs')
    .select('*')
    .eq('tool_id', id)
    .single()

  if (dbError) return API_ERRORS.NOT_FOUND('Tool pricing')

  return apiSuccess(data)
}

const updateSchema = z.object({
  credit_cost: z.number().int().min(1).max(1000),
  display_name: z.string().min(1).max(100).optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const supabase = createAdminClient()

  const { error: dbError } = await supabase
    .from('tool_credit_costs')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
      updated_by: user!.id,
    })
    .eq('tool_id', id)

  if (dbError) return API_ERRORS.INTERNAL()

  return apiSuccess({ updated: true })
}
```

**Step 2: Commit**

```bash
git add admin/app/api/tools/
git commit -m "feat(admin): add tool pricing GET/PUT endpoint"
```

---

### Task 16: Create admin promo codes CRUD endpoint

**Files:**
- Create: `admin/app/api/promos/route.ts`
- Create: `admin/app/api/promos/[id]/route.ts`

**Step 1: List and create promos**

`admin/app/api/promos/route.ts`:
```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

export async function GET() {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbError) return API_ERRORS.INTERNAL()

  return apiSuccess({ promos: data || [] })
}

const createSchema = z.object({
  code: z.string().min(3).max(30).transform(s => s.toUpperCase().trim()),
  credit_amount: z.number().int().min(1),
  max_redemptions: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

export async function POST(req: Request) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('promo_codes')
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) {
    if (dbError.code === '23505') {
      return apiSuccess({ error: 'Code already exists' }, 409)
    }
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess(data, 201)
}
```

**Step 2: Single promo update/delete**

`admin/app/api/promos/[id]/route.ts`:
```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const updateSchema = z.object({
  active: z.boolean().optional(),
  credit_amount: z.number().int().min(1).optional(),
  max_redemptions: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const supabase = createAdminClient()
  const { error: dbError } = await supabase
    .from('promo_codes')
    .update(parsed.data)
    .eq('id', id)

  if (dbError) return API_ERRORS.INTERNAL()

  return apiSuccess({ updated: true })
}
```

**Step 3: Commit**

```bash
git add admin/app/api/promos/
git commit -m "feat(admin): add promo codes CRUD API"
```

---

### Task 17: Create admin tiers CRUD endpoint

**Files:**
- Create: `admin/app/api/tiers/route.ts`
- Create: `admin/app/api/tiers/[id]/route.ts`

**Step 1: List and create tiers**

`admin/app/api/tiers/route.ts`:
```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

export async function GET() {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('subscription_tiers')
    .select('*')
    .order('monthly_credits', { ascending: true })

  if (dbError) return API_ERRORS.INTERNAL()

  return apiSuccess({ tiers: data || [] })
}

const createSchema = z.object({
  id: z.string().min(1).max(30).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(50),
  monthly_credits: z.number().int().min(1),
  stripe_price_id: z.string().min(1),
  features: z.array(z.string()).default([]),
})

export async function POST(req: Request) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const supabase = createAdminClient()
  const { data, error: dbError } = await supabase
    .from('subscription_tiers')
    .insert(parsed.data)
    .select()
    .single()

  if (dbError) return API_ERRORS.INTERNAL()

  return apiSuccess(data, 201)
}
```

**Step 2: Update tier**

`admin/app/api/tiers/[id]/route.ts`:
```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  monthly_credits: z.number().int().min(1).optional(),
  stripe_price_id: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
  active: z.boolean().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return API_ERRORS.VALIDATION(parsed.error.flatten())

  const supabase = createAdminClient()
  const { error: dbError } = await supabase
    .from('subscription_tiers')
    .update(parsed.data)
    .eq('id', id)

  if (dbError) return API_ERRORS.INTERNAL()

  return apiSuccess({ updated: true })
}
```

**Step 3: Commit**

```bash
git add admin/app/api/tiers/
git commit -m "feat(admin): add subscription tiers CRUD API"
```

---

### Task 18: Create admin dashboard stats endpoint

**Files:**
- Create: `admin/app/api/dashboard/stats/route.ts`

**Step 1: Write the aggregation endpoint**

```typescript
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const supabase = createAdminClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    activeSubsResult,
    creditsUsedTodayResult,
    creditsUsedWeekResult,
    creditsUsedMonthResult,
    lowBalanceResult,
  ] = await Promise.all([
    // Active subscribers count
    supabase
      .from('user_subscriptions')
      .select('tier_id', { count: 'exact' })
      .eq('status', 'active'),

    // Credits consumed today
    supabase
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'usage')
      .gte('created_at', todayStart),

    // Credits consumed this week
    supabase
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'usage')
      .gte('created_at', weekStart),

    // Credits consumed this month
    supabase
      .from('credit_transactions')
      .select('amount')
      .eq('type', 'usage')
      .gte('created_at', monthStart),

    // Low balance users (total < 10)
    supabase
      .from('user_credits')
      .select('user_id', { count: 'exact' })
      .lt('subscription_balance', 10)
      .lt('purchased_balance', 10),
  ])

  const sumCredits = (rows: { amount: number }[] | null) =>
    (rows || []).reduce((sum, r) => sum + Math.abs(r.amount), 0)

  return apiSuccess({
    active_subscribers: activeSubsResult.count || 0,
    credits_consumed: {
      today: sumCredits(creditsUsedTodayResult.data),
      week: sumCredits(creditsUsedWeekResult.data),
      month: sumCredits(creditsUsedMonthResult.data),
    },
    low_balance_users: lowBalanceResult.count || 0,
  })
}
```

**Step 2: Commit**

```bash
git add admin/app/api/dashboard/stats/route.ts
git commit -m "feat(admin): add dashboard stats aggregation endpoint"
```

---

## Phase 5: Client UI

### Task 19: Create useCredits hook

**Files:**
- Create: `lib/hooks/use-credits.ts`

**Step 1: Write the hook**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CreditBalance {
  subscription_balance: number
  purchased_balance: number
  total: number
  current_period_end: string | null
}

export function useCredits() {
  const [balance, setBalance] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/credits/balance')
      if (!res.ok) {
        setBalance(null)
        return
      }
      const json = await res.json()
      setBalance(json.data)
    } catch {
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Only fetch if user is authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchBalance()
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchBalance()
        } else {
          setBalance(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchBalance])

  return { balance, loading, refetch: fetchBalance }
}
```

**Step 2: Commit**

```bash
git add lib/hooks/use-credits.ts
git commit -m "feat: add useCredits hook for client credit balance"
```

---

### Task 20: Add credit balance badge to header

**Files:**
- Create: `components/ui/credit-badge.tsx`
- Modify: `components/layout/header.tsx`

**Step 1: Create the credit badge component**

`components/ui/credit-badge.tsx`:
```typescript
'use client'

import { useCredits } from '@/lib/hooks/use-credits'
import Link from 'next/link'

export function CreditBadge() {
  const { balance, loading } = useCredits()

  // Don't show if not authenticated or no balance
  if (loading || !balance) return null

  const total = balance.total
  const color = total > 50 ? 'text-emerald-500' : total > 10 ? 'text-amber-500' : 'text-red-500'
  const bgColor = total > 50
    ? 'bg-emerald-500/10 dark:bg-emerald-500/20'
    : total > 10
    ? 'bg-amber-500/10 dark:bg-amber-500/20'
    : 'bg-red-500/10 dark:bg-red-500/20'

  return (
    <Link
      href="/billing"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${color} ${bgColor} hover:opacity-80 transition-opacity`}
      title={`${balance.subscription_balance} subscription + ${balance.purchased_balance} purchased credits`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.014a7.35 7.35 0 010-1H10a1 1 0 100-2H8.315c.134-.29.283-.56.421-.821z" />
      </svg>
      {total}
    </Link>
  )
}
```

**Step 2: Add CreditBadge to header**

In `components/layout/header.tsx`, add the import and render the badge next to the user menu area (in the right side of the header, before the dark mode toggle or user menu). The exact insertion point depends on the current header structure — look for where `UserMenu` or sign-in button is rendered and add `<CreditBadge />` before it.

Import to add:
```typescript
import { CreditBadge } from '@/components/ui/credit-badge'
```

Insert `<CreditBadge />` in the desktop nav right section, before the user authentication area.

**Step 3: Commit**

```bash
git add components/ui/credit-badge.tsx components/layout/header.tsx
git commit -m "feat: add credit balance badge to desktop header"
```

---

### Task 21: Create billing page

**Files:**
- Create: `app/billing/page.tsx`

**Step 1: Write the billing page**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCredits } from '@/lib/hooks/use-credits'
import { CREDIT_PACKS } from '@/lib/stripe/config'

interface Tier {
  id: string
  name: string
  monthly_credits: number
  features: string[]
}

interface Transaction {
  id: string
  type: string
  amount: number
  balance_after: number
  tool_id: string | null
  description: string
  created_at: string
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth()
  const { balance, loading: creditsLoading, refetch } = useCredits()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [totalTx, setTotalTx] = useState(0)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    // Fetch tiers (public)
    fetch('/api/v1/credits/tiers')
      .then(r => r.json())
      .then(j => setTiers(j.data?.tiers || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    fetch(`/api/v1/credits/history?page=${page}&limit=10`)
      .then(r => r.json())
      .then(j => {
        setTransactions(j.data?.transactions || [])
        setTotalTx(j.data?.pagination?.total || 0)
      })
      .catch(() => {})
  }, [user, page])

  const handleCheckout = async (type: 'subscription' | 'credit_pack', id: string) => {
    setCheckoutLoading(id)
    try {
      const body = type === 'subscription'
        ? { type: 'subscription', tier_id: id }
        : { type: 'credit_pack', pack_id: id }

      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (json.data?.url) {
        window.location.href = json.data.url
      }
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    const res = await fetch('/api/v1/billing/portal', { method: 'POST' })
    const json = await res.json()
    if (json.data?.url) {
      window.location.href = json.data.url
    }
  }

  if (authLoading) return <div className="p-8 text-center">Loading...</div>
  if (!user) return <div className="p-8 text-center">Please sign in to manage billing.</div>

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Credits</h1>

      {/* Current Balance */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Credit Balance</h2>
        {creditsLoading ? (
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{balance?.total ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Subscription</p>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">{balance?.subscription_balance ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Purchased</p>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">{balance?.purchased_balance ?? 0}</p>
            </div>
          </div>
        )}
        {balance?.current_period_end && (
          <p className="text-xs text-slate-400 mt-2">
            Subscription credits renew {new Date(balance.current_period_end).toLocaleDateString()}
          </p>
        )}
        <button onClick={handlePortal} className="mt-4 text-sm text-[#3D6AF2] font-medium hover:underline">
          Manage Subscription
        </button>
      </section>

      {/* Subscription Tiers */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Subscription Plans</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {tiers.map(tier => (
            <div key={tier.id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white">{tier.name}</h3>
              <p className="text-2xl font-bold text-[#3D6AF2] my-2">{tier.monthly_credits}<span className="text-sm font-normal text-slate-500">/mo</span></p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                {tier.features.map((f, i) => <li key={i}>• {f}</li>)}
              </ul>
              <button
                onClick={() => handleCheckout('subscription', tier.id)}
                disabled={checkoutLoading === tier.id}
                className="w-full py-2.5 rounded-lg bg-[#3D6AF2] text-white text-sm font-semibold hover:bg-[#3558D4] transition-colors disabled:opacity-50"
              >
                {checkoutLoading === tier.id ? 'Loading...' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Credit Packs */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Credit Packs</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {CREDIT_PACKS.map(pack => (
            <div key={pack.id} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white">{pack.label}</h3>
              <p className="text-2xl font-bold text-[#3D6AF2] my-2">${(pack.priceCents / 100).toFixed(2)}</p>
              <button
                onClick={() => handleCheckout('credit_pack', pack.id)}
                disabled={checkoutLoading === pack.id}
                className="w-full py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {checkoutLoading === pack.id ? 'Loading...' : 'Buy'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Transaction History */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Usage History</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4 text-right">Credits</th>
                    <th className="py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 capitalize text-slate-700 dark:text-slate-300">{tx.type.replace('_', ' ')}</td>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-400">{tx.description}</td>
                      <td className={`py-2 pr-4 text-right font-medium ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">{tx.balance_after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalTx > 10 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500 py-1.5">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 10 >= totalTx}
                  className="px-3 py-1.5 text-sm rounded bg-slate-100 dark:bg-slate-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
```

**Step 2: Add tiers public endpoint (needed by billing page)**

Create `app/api/v1/credits/tiers/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('id, name, monthly_credits, features')
    .eq('active', true)
    .order('monthly_credits', { ascending: true })

  if (error) return API_ERRORS.INTERNAL()

  return apiSuccess({ tiers: data || [] })
}
```

**Step 3: Commit**

```bash
git add app/billing/ app/api/v1/credits/tiers/
git commit -m "feat: add billing page with subscription tiers, credit packs, and usage history"
```

---

### Task 22: Add credit balance to mobile profile tab

**Files:**
- Modify: `components/mobile/profile-tab.tsx`

**Step 1: Add credit balance display to the settings panel**

Import `useCredits` and add a balance card between the user section and dark mode toggle. Show total credits with a link to `/billing`.

Add import:
```typescript
import { useCredits } from '@/lib/hooks/use-credits'
```

Inside `ProfileTab`, add after `useAuth`:
```typescript
const { balance } = useCredits()
```

Insert after the user section (after line ~258), before the dark mode toggle:
```tsx
{/* Credit balance */}
{balance && (
  <button
    onClick={() => {
      // Navigate to billing in the main app
      window.location.href = '/billing'
    }}
    className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-white/5 w-full cursor-pointer"
    style={{ minHeight: '44px' }}
  >
    <span className="text-sm text-slate-900 dark:text-white font-medium">Credits</span>
    <span className={`text-sm font-bold ${balance.total > 50 ? 'text-emerald-500' : balance.total > 10 ? 'text-amber-500' : 'text-red-500'}`}>
      {balance.total}
    </span>
  </button>
)}
```

**Step 2: Commit**

```bash
git add components/mobile/profile-tab.tsx
git commit -m "feat: add credit balance display to mobile profile tab"
```

---

## Phase 6: Admin UI

### Task 23: Create admin billing dashboard section

**Files:**
- Create: `admin/app/(admin)/billing/page.tsx`

**Step 1: Write the billing dashboard page**

```typescript
import { requireAdmin } from '@/lib/auth-guard'
import { BillingDashboard } from './billing-dashboard'

export default async function BillingPage() {
  await requireAdmin()
  return <BillingDashboard />
}
```

Create `admin/app/(admin)/billing/billing-dashboard.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  active_subscribers: number
  credits_consumed: { today: number; week: number; month: number }
  low_balance_users: number
}

export function BillingDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(j => setStats(j.data))
      .catch(() => {})
  }, [])

  if (!stats) return <div className="p-8">Loading dashboard...</div>

  const cards = [
    { label: 'Active Subscribers', value: stats.active_subscribers, color: 'text-blue-600' },
    { label: 'Credits Used Today', value: stats.credits_consumed.today, color: 'text-emerald-600' },
    { label: 'Credits This Week', value: stats.credits_consumed.week, color: 'text-amber-600' },
    { label: 'Credits This Month', value: stats.credits_consumed.month, color: 'text-purple-600' },
    { label: 'Low Balance Users', value: stats.low_balance_users, color: 'text-red-600' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Billing Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(card => (
          <div key={card.label} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add admin/app/\(admin\)/billing/
git commit -m "feat(admin): add billing dashboard with stats overview"
```

---

### Task 24: Create admin user management page

**Files:**
- Create: `admin/app/(admin)/billing/users/page.tsx`
- Create: `admin/app/(admin)/billing/users/user-management.tsx`

**Step 1: Write the user management page**

`admin/app/(admin)/billing/users/page.tsx`:
```typescript
import { requireAdmin } from '@/lib/auth-guard'
import { UserManagement } from './user-management'

export default async function UsersPage() {
  await requireAdmin()
  return <UserManagement />
}
```

`admin/app/(admin)/billing/users/user-management.tsx`:
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'

interface CreditUser {
  id: string
  email: string
  name: string | null
  subscription_balance: number
  purchased_balance: number
  total_credits: number
}

export function UserManagement() {
  const [users, setUsers] = useState<CreditUser[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [adjustModal, setAdjustModal] = useState<{ userId: string; name: string } | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  const fetchUsers = useCallback(async () => {
    const res = await fetch(`/api/users?search=${encodeURIComponent(search)}&page=${page}&limit=20`)
    const json = await res.json()
    setUsers(json.data?.users || [])
    setTotal(json.data?.pagination?.total || 0)
  }, [search, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleAdjust = async () => {
    if (!adjustModal || !adjustAmount || !adjustReason) return

    await fetch(`/api/users/${adjustModal.userId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(adjustAmount, 10), reason: adjustReason }),
    })

    setAdjustModal(null)
    setAdjustAmount('')
    setAdjustReason('')
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Credit Management</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4 text-right">Subscription</th>
              <th className="py-2 pr-4 text-right">Purchased</th>
              <th className="py-2 pr-4 text-right">Total</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4">
                  <p className="font-medium">{u.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="py-2 pr-4 text-right">{u.subscription_balance}</td>
                <td className="py-2 pr-4 text-right">{u.purchased_balance}</td>
                <td className="py-2 pr-4 text-right font-bold">{u.total_credits}</td>
                <td className="py-2">
                  <button
                    onClick={() => setAdjustModal({ userId: u.id, name: u.name || u.email })}
                    className="text-xs text-[#3D6AF2] font-medium hover:underline"
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm rounded bg-slate-100 disabled:opacity-50">Prev</button>
          <span className="text-sm py-1">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-3 py-1 text-sm rounded bg-slate-100 disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">Adjust Credits for {adjustModal.name}</h2>
            <input
              type="number"
              placeholder="Amount (positive to add, negative to deduct)"
              value={adjustAmount}
              onChange={e => setAdjustAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            />
            <textarea
              placeholder="Reason (required)"
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAdjustModal(null)} className="px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800">Cancel</button>
              <button onClick={handleAdjust} className="px-4 py-2 text-sm rounded-lg bg-[#3D6AF2] text-white font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add admin/app/\(admin\)/billing/users/
git commit -m "feat(admin): add user credit management page with adjust modal"
```

---

### Task 25: Create admin tool pricing page

**Files:**
- Create: `admin/app/(admin)/billing/tools/page.tsx`
- Create: `admin/app/(admin)/billing/tools/tool-pricing.tsx`

This page lists all AI tools with their credit costs and allows inline editing. Follow the same pattern as Task 24 — server page with `requireAdmin()` guard, client component for interactive UI. Fetch from `/api/tools` admin endpoint, render editable table, PUT on save.

**Step 1: Implement following the same pattern as user management**

**Step 2: Commit**

```bash
git add admin/app/\(admin\)/billing/tools/
git commit -m "feat(admin): add tool credit pricing management page"
```

---

### Task 26: Create admin promo codes page

**Files:**
- Create: `admin/app/(admin)/billing/promos/page.tsx`
- Create: `admin/app/(admin)/billing/promos/promo-management.tsx`

CRUD page for promo codes. Server guard page + client component. Fetch from `/api/promos`, render table with create form and deactivate toggles.

**Step 1: Implement following the same pattern as user management**

**Step 2: Commit**

```bash
git add admin/app/\(admin\)/billing/promos/
git commit -m "feat(admin): add promo code management page"
```

---

### Task 27: Create admin tier management page

**Files:**
- Create: `admin/app/(admin)/billing/tiers/page.tsx`
- Create: `admin/app/(admin)/billing/tiers/tier-management.tsx`

Management page for subscription tiers. Server guard + client component. Fetch from `/api/tiers`, render editable cards, PUT on save, POST for new tiers, archive (set active=false) for removal.

**Step 1: Implement following the same pattern as user management**

**Step 2: Commit**

```bash
git add admin/app/\(admin\)/billing/tiers/
git commit -m "feat(admin): add subscription tier management page"
```

---

### Task 28: Add billing nav link to admin sidebar

**Files:**
- Modify: `admin/app/(admin)/layout.tsx`

**Step 1: Add navigation links for the billing section**

Add links to the admin layout navigation for:
- `/billing` — Dashboard
- `/billing/users` — User Management
- `/billing/tools` — Tool Pricing
- `/billing/promos` — Promo Codes
- `/billing/tiers` — Subscription Tiers

**Step 2: Commit**

```bash
git add admin/app/\(admin\)/layout.tsx
git commit -m "feat(admin): add billing section navigation to admin layout"
```

---

### Task 29: Add SUPABASE_SERVICE_ROLE_KEY to client env

**Files:**
- Modify: `.env.example`

**Step 1: Document the required env var**

The webhook and credit deduction endpoints in the client app need `SUPABASE_SERVICE_ROLE_KEY` for service-role operations. Add to `.env.example`:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Also set the actual value in `.env.local` and in Vercel environment variables for the client deployment.

**Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add SUPABASE_SERVICE_ROLE_KEY and STRIPE env vars to .env.example"
```

---

### Task 30: Final integration test and deploy

**Step 1: Run builds for both apps**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace
pnpm build
cd admin && pnpm build && cd ..
```

**Step 2: Fix any TypeScript or build errors**

**Step 3: Test the credit flow end-to-end**

1. Create a Stripe test product + prices in Stripe dashboard
2. Update `subscription_tiers` with real Stripe Price IDs
3. Test: Checkout → Webhook → Credits granted → Tool execution → Deduction
4. Test: Promo code redemption
5. Test: Admin adjustment

**Step 4: Push and deploy**

```bash
git push origin main
```

Both client and admin auto-deploy via Vercel.

---

## Summary

| Phase | Tasks | What it delivers |
|---|---|---|
| 1: Database | 1-3 | Tables, stored procedures, seed data |
| 2: Stripe | 4-6 | SDK, config, webhook handler |
| 3: Client API | 7-12 | Balance, history, checkout, portal, redeem, execute |
| 4: Admin API | 13-18 | Auth helper, users, pricing, promos, tiers, stats |
| 5: Client UI | 19-22 | useCredits hook, header badge, billing page, mobile balance |
| 6: Admin UI | 23-28 | Dashboard, user mgmt, tool pricing, promos, tiers, nav |
| 7: Integration | 29-30 | Env config, build, test, deploy |

**Total: 30 tasks across 7 phases.**
