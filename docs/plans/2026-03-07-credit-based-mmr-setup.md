# Credit-Based MMR System — Remaining Setup

**Date**: 2026-03-07
**Status**: Code deployed, external configuration pending

---

## Deployment Status

| Component | URL | Status |
|---|---|---|
| Database (Supabase) | — | Migrations 003, 004, 005 applied |
| Client (Vercel) | https://toolk1t.com | READY |
| Admin (Vercel) | https://admin.toolk1t.com | READY |

---

## 1. Stripe Account Setup

### 1a. Create Products & Prices in Stripe Dashboard

Go to **Stripe Dashboard > Products** and create:

**Subscription Products (recurring, monthly):**

| Product Name | Price | Stripe Price ID → update in DB |
|---|---|---|
| Basic Plan | $9/month | Copy Price ID → `subscription_tiers.stripe_price_id` WHERE `id = 'basic'` |
| Pro Plan | $29/month | Copy Price ID → `subscription_tiers.stripe_price_id` WHERE `id = 'pro'` |
| Enterprise Plan | $99/month | Copy Price ID → `subscription_tiers.stripe_price_id` WHERE `id = 'enterprise'` |

**Credit Pack Products (one-time):**

| Product Name | Price | Notes |
|---|---|---|
| 100 Credits | $5.00 | Used in client checkout with metadata `credits=100` |
| 500 Credits | $20.00 | Used in client checkout with metadata `credits=500` |
| 1000 Credits | $35.00 | Used in client checkout with metadata `credits=1000` |

After creating credit pack prices, update `lib/stripe/config.ts` with real Stripe Price IDs:

```typescript
// lib/stripe/config.ts — replace placeholder price IDs
export const CREDIT_PACKS = [
  { id: 'pack_100', credits: 100, price: 500, label: '100 Credits', stripePriceId: 'price_REAL_ID_HERE' },
  { id: 'pack_500', credits: 500, price: 2000, label: '500 Credits', stripePriceId: 'price_REAL_ID_HERE' },
  { id: 'pack_1000', credits: 1000, price: 3500, label: '1000 Credits', stripePriceId: 'price_REAL_ID_HERE' },
]
```

### 1b. Update Database with Real Stripe Price IDs

Run in Supabase SQL Editor:

```sql
UPDATE subscription_tiers SET stripe_price_id = 'price_XXXXX' WHERE id = 'basic';
UPDATE subscription_tiers SET stripe_price_id = 'price_XXXXX' WHERE id = 'pro';
UPDATE subscription_tiers SET stripe_price_id = 'price_XXXXX' WHERE id = 'enterprise';
```

### 1c. Create Stripe Customer Portal Configuration

Go to **Stripe Dashboard > Settings > Billing > Customer Portal** and enable:
- Subscription cancellation
- Plan switching (between basic/pro/enterprise)
- Invoice history

---

## 2. Stripe Webhook Registration

Go to **Stripe Dashboard > Developers > Webhooks > Add endpoint**:

| Field | Value |
|---|---|
| Endpoint URL | `https://toolk1t.com/api/webhooks/stripe` |
| Events to listen for | `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded` |

After creating the webhook, copy the **Signing Secret** (`whsec_...`) — this is the `STRIPE_WEBHOOK_SECRET`.

---

## 3. Vercel Environment Variables

### Client App (`handytool` project)

Go to **Vercel > handytool > Settings > Environment Variables** and add:

| Variable | Value | Environment |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (from Stripe Dashboard > Developers > API Keys) | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from webhook created in step 2) | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (from Stripe Dashboard > Developers > API Keys) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase Dashboard > Settings > API) | Production |

### Admin App (`admin` project)

Go to **Vercel > admin > Settings > Environment Variables** and verify these exist:

| Variable | Value | Environment |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | (from Supabase Dashboard > Settings > API) | Production |

The admin app doesn't need Stripe keys — it only reads/writes credit data via Supabase.

After adding env vars, **redeploy both projects** for changes to take effect:
- Client: push a commit or run `npx vercel --prod --yes` from workspace root
- Admin: run `VERCEL_PROJECT_ID=prj_aCktpOQHIm9wwzE4jwtUwaPZzoh9 VERCEL_ORG_ID=team_FQmbloYm7V4vFjbXB0A42vBB npx vercel --prod --yes` from workspace root

---

## 4. Testing Checklist

Use **Stripe test mode** keys (`sk_test_...`, `pk_test_...`) first before going live.

### Smoke Tests

- [ ] Visit `/billing` — verify tiers load with correct pricing
- [ ] Click "Subscribe" on a tier — verify Stripe Checkout opens
- [ ] Complete test subscription (card: `4242 4242 4242 4242`) — verify credits granted
- [ ] Check credit badge appears in header with correct balance
- [ ] Visit `/billing` — verify transaction history shows subscription grant
- [ ] Buy a credit pack — verify purchased balance increases
- [ ] Redeem a promo code — verify purchased balance increases
- [ ] Use an AI tool — verify credits deducted, transaction logged
- [ ] Try using AI tool with insufficient credits — verify modal shows upgrade/purchase CTA

### Admin Tests

- [ ] Visit `admin.toolk1t.com/billing` — verify dashboard stats load
- [ ] `/billing/users` — search for test user, verify balances shown
- [ ] Adjust credits for a user — verify transaction logged
- [ ] `/billing/tools` — update a tool's credit cost
- [ ] `/billing/promos` — create a promo code, verify it works on client
- [ ] `/billing/tiers` — verify tier management works

### Webhook Tests

- [ ] Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Trigger test events: `stripe trigger checkout.session.completed`
- [ ] Verify idempotency: resend same event, confirm no double-granting

---

## 5. Go-Live Checklist

- [ ] Switch from Stripe test keys to live keys in Vercel env vars
- [ ] Update webhook endpoint to use live mode signing secret
- [ ] Verify `subscription_tiers` has live Stripe Price IDs
- [ ] Verify `lib/stripe/config.ts` has live credit pack Price IDs
- [ ] Redeploy both client and admin
- [ ] Do one real subscription purchase to verify end-to-end flow
