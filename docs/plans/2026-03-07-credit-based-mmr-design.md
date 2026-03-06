# Credit-Based MMR System — Design Document

**Date**: 2026-03-07
**Status**: APPROVED (brainstorming complete)
**Author**: Design session via brainstorming skill

---

## Understanding Summary

- **What**: A credit-based metered billing system for AI-powered tools within Toolk1t
- **Why**: Monetize AI tool usage fairly while keeping non-AI tools free
- **Who**: Existing Toolk1t users who want AI capabilities (client) + platform operators (admin)
- **Key constraints**: Supabase-native, Stripe for payments, multiple AI providers, small scale MVP
- **Non-goals**: Free tier for AI, custom payment forms, large-scale infrastructure, token-level billing

## Assumptions

- Supabase Postgres can handle credit operations atomically via stored procedures
- Stripe Checkout (hosted) is sufficient for MVP — no need for embedded payment forms
- AI provider costs are stable enough for fixed credit pricing (admin can adjust)
- Three subscription tiers cover the initial market segmentation
- Promo codes are sufficient for marketing; no referral/affiliate system at launch

---

## Architecture: Supabase-Native with Stripe Webhooks

All credit logic lives in Supabase Postgres. Stripe handles payment collection and subscription lifecycle. Webhooks bridge the two — credits are granted exclusively via verified webhook events, never on redirect.

---

## Database Schema

### 1. `user_credits`

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid (PK, FK → auth.users) | One row per user |
| `subscription_balance` | integer | Resets each billing cycle, expires at `current_period_end` |
| `purchased_balance` | integer | Never expires |
| `current_period_end` | timestamptz | When subscription credits expire |
| `updated_at` | timestamptz | Last modification |

### 2. `credit_transactions`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | |
| `type` | enum | `usage`, `purchase`, `subscription_grant`, `subscription_reset`, `admin_adjustment`, `refund`, `promo_redemption` |
| `amount` | integer | Positive = credit, negative = debit |
| `balance_after` | integer | Snapshot after transaction |
| `tool_id` | text | Nullable — populated for `usage` type |
| `description` | text | Human-readable context |
| `metadata` | jsonb | Stripe session ID, admin user ID, promo code, etc. |
| `created_at` | timestamptz | |

### 3. `subscription_tiers`

| Column | Type | Notes |
|---|---|---|
| `id` | text (PK) | e.g., `basic`, `pro`, `enterprise` |
| `name` | text | Display name |
| `monthly_credits` | integer | Credits granted per cycle |
| `stripe_price_id` | text | Stripe Price object ID |
| `features` | jsonb | Feature list for display |
| `active` | boolean | Soft delete |
| `created_at` | timestamptz | |

### 4. `tool_credit_costs`

| Column | Type | Notes |
|---|---|---|
| `tool_id` | text (PK) | Matches tool slug |
| `credit_cost` | integer | Credits per execution |
| `display_name` | text | For admin UI |
| `updated_at` | timestamptz | |
| `updated_by` | uuid | Admin who last changed it |

### 5. `promo_codes`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `code` | text (unique) | Case-insensitive |
| `credit_amount` | integer | Credits granted on redemption |
| `max_redemptions` | integer | Nullable = unlimited |
| `current_redemptions` | integer | Counter |
| `expires_at` | timestamptz | Nullable = never |
| `active` | boolean | Toggle |
| `created_at` | timestamptz | |

### 6. `user_subscriptions`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | |
| `tier_id` | text (FK) | |
| `stripe_subscription_id` | text | |
| `stripe_customer_id` | text | |
| `status` | enum | `active`, `cancelled`, `past_due` |
| `current_period_start` | timestamptz | |
| `current_period_end` | timestamptz | |
| `created_at` | timestamptz | |

### 7. `processed_events`

| Column | Type | Notes |
|---|---|---|
| `event_id` | text (PK) | Stripe event ID for idempotency |
| `processed_at` | timestamptz | |

---

## Credit Deduction Flow

```
Client clicks "Run AI Tool"
    |
    v
POST /api/tools/:toolId/execute
    |
    v
Auth check (Supabase JWT)
    |
    v
Look up tool credit cost from `tool_credit_costs`
    |
    v
Call Postgres stored procedure: deduct_credits(user_id, amount)
    |
    +-- Check subscription_balance first (FIFO: expiring credits used first)
    |   +-- If subscription_balance >= cost → deduct from subscription_balance
    |   +-- If subscription_balance < cost → use remaining subscription + purchased
    |   +-- If total < cost → RAISE EXCEPTION 'insufficient_credits'
    |
    +-- Insert into credit_transactions (type='usage', negative amount)
    |
    +-- Return new balance
    |
    v
On success → call AI provider → return result
    |
On AI failure → call refund_credits(user_id, amount, transaction_id)
    → Insert refund transaction, restore balance
```

### Graceful Degradation (Insufficient Credits)

- AI features show disabled state with credit cost displayed
- Modal: "You need X credits. You have Y." + CTA buttons: "Buy Credits" / "Upgrade Plan"
- Non-AI tool features remain fully functional

---

## Stripe Integration Flow

### Checkout Session Creation

```
Client UI -> POST /api/billing/checkout
  -> Validate user auth
  -> Create Stripe Checkout Session:
      - Subscriptions: mode='subscription', price=tier's Stripe Price ID
      - Credit packs: mode='payment', price=pack's Stripe Price ID
      - success_url: /billing?session_id={CHECKOUT_SESSION_ID}
      - cancel_url: /billing?cancelled=true
      - metadata: { user_id, type: 'subscription'|'credit_pack', tier_id|pack_id }
  -> Return session URL
  -> Redirect user to Stripe hosted checkout
```

### Webhook Handling (`POST /api/webhooks/stripe`)

All credit granting happens exclusively via webhooks.

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Subscription: create `user_subscriptions` row, grant tier credits to `subscription_balance`. Credit pack: add to `purchased_balance`, log transaction |
| `invoice.paid` (recurring) | Reset `subscription_balance` to tier amount, update `current_period_end` |
| `customer.subscription.updated` | Plan change: update tier, adjust `subscription_balance` proportionally |
| `customer.subscription.deleted` | Mark subscription inactive, `subscription_balance` stays until `current_period_end` |
| `charge.refunded` | Deduct refunded credits from `purchased_balance`, log negative transaction |

### Safety Rules

1. **Idempotency**: Store Stripe event IDs in `processed_events`. Skip duplicates.
2. **Webhook signature verification**: Always verify `stripe-signature` header.
3. **Credits granted only on payment confirmation** — never on session creation or redirect.

---

## Client UI

### Credit Balance Display (Global)

Persistent credit badge in header/nav:
- Total available credits (subscription + purchased combined)
- Color indicator: green (>50%), yellow (25-50%), red (<25% of monthly tier)

### Purchase Page (`/billing`)

1. **Current Plan** — Active tier, credits remaining/total, renewal date, upgrade/downgrade
2. **Credit Packs** — Grid of one-time options (e.g., 100/$5, 500/$20, 1000/$35). Each -> Stripe Checkout
3. **Usage History** — Paginated table: date, tool, credits used, balance after. Date range filter

### In-Tool Credit Gate

- **Sufficient credits**: Show cost upfront ("This will use 5 credits"), proceed on confirm
- **Insufficient credits**: Modal with balance, cost needed, CTA to purchase/upgrade

---

## Admin UI

### Dashboard Overview

Metric cards:
- Total active subscribers (by tier)
- Total credits consumed (today / week / month)
- Revenue summary (MRR subscriptions + one-time)
- Low-balance users count (churn signal)

### User Management (`/admin/users`)

Searchable table: name, email, tier, subscription balance, purchased balance, status.
Actions: view history, adjust credits (with required reason), change tier.

### Tool Pricing Config (`/admin/tools`)

Editable credit cost per AI tool. Changes effective immediately. Audit log.

### Promo Codes (`/admin/promos`)

CRUD: code, credit amount, expiry, max redemptions, usage count. Bulk generate. Deactivate toggle.

### Subscription Tier Management (`/admin/tiers`)

Edit name, monthly credits, Stripe Price ID, features. Add/archive (never hard delete).

---

## API Endpoints

### Client-facing

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/credits/balance` | Current user's combined balance |
| `GET` | `/api/credits/history?page=&limit=` | Paginated transaction history |
| `POST` | `/api/billing/checkout` | Create Stripe Checkout session |
| `POST` | `/api/billing/portal` | Create Stripe Customer Portal session |
| `POST` | `/api/credits/redeem` | Apply promo code |
| `POST` | `/api/tools/:toolId/execute` | Execute AI tool (deducts credits) |

### Admin-facing

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/admin/users?search=&page=` | List users with balances |
| `GET` | `/api/admin/users/:id/transactions` | User's transaction log |
| `POST` | `/api/admin/users/:id/adjust` | Manual credit adjustment |
| `GET/PUT` | `/api/admin/tools/:id/pricing` | Get/update tool credit cost |
| `CRUD` | `/api/admin/promos` | Promo code management |
| `CRUD` | `/api/admin/tiers` | Tier management |
| `GET` | `/api/admin/dashboard/stats` | Aggregated metrics |

### Webhook

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/webhooks/stripe` | Stripe event handler (signature-verified) |

All endpoints: Zod validation, Supabase JWT auth, admin endpoints check `is_admin` role.

---

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | AI tools coexist with free tools + new AI-only tools | AI-only platform; upgrade existing only | Maximizes existing user base while enabling new capabilities |
| 2 | Multiple AI providers (Gemini, Anthropic, Seedance2+) | Single provider | Flexibility, best-tool-per-job, no vendor lock-in |
| 3 | Hybrid monetization (subscriptions + one-time packs) | Subscriptions only; pay-per-use only | Predictable revenue + flexibility for occasional users |
| 4 | Stripe Checkout (hosted) | Custom payment form; Stripe Elements | PCI compliance without handling card data, fastest to ship |
| 5 | Variable credit cost per tool, admin-configurable | Flat cost; token-based pricing | Reflects actual provider cost differences, easy to adjust |
| 6 | Graceful degradation when out of credits | Hard block; limited free fallback | Clear upgrade path without frustrating UX |
| 7 | No free tier for AI features | Free tier with limits; freemium | Simplifies billing, AI costs are real, free tools remain free |
| 8 | Full admin control | Limited admin; self-serve only | Essential for operations, support, and marketing |
| 9 | Three subscription tiers (Basic/Pro/Enterprise) | Two tiers; usage-only | Covers hobbyist to power-user segments |
| 10 | Small scale MVP | Medium/large scale | Validate before scaling, minimize upfront complexity |
| 11 | Split balance: subscription expires + purchased persists | Single pool; all expire; all persist | Fair to purchasers, subscription resets incentivize usage |
| 12 | Supabase-native with Stripe Webhooks | Dedicated billing service; third-party platform | Leverages existing stack, atomic Postgres, no new infra |
| 13 | Credits granted only via webhooks | Grant on redirect with reconciliation | Prevents double-granting, handles edge cases cleanly |
| 14 | Idempotent webhook processing | Rely on Stripe dedup alone | Defense in depth against duplicate deliveries |
