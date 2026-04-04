# Referral System — Design Spec

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

A referral credit system where users share a unique link. When a new user signs up via the link, both referrer and referred user receive 15 credits. Capped at 10 referrals per user per month. Referral section lives in the user's profile page.

## Referral Flow

1. User visits profile → sees referral section with unique link
2. User shares link (copy, Twitter, LinkedIn)
3. Visitor clicks link → `?ref=abc12345` param captured
4. Referral code stored in cookie (`tk_ref`, 30-day expiry)
5. Visitor signs up via Google OAuth
6. Auth callback detects referral cookie → validates → awards credits to both parties
7. Cookie cleared

## Abuse Prevention

- Max 10 referrals per referrer per month
- Same referred email can't be counted twice (unique constraint on `referred_id`)
- Self-referral blocked (referrer_id !== referred_id)
- Same IP can't generate more than 3 referrals per month
- Referral code validated against `referral_codes` table

## UI — Profile Referral Section

Located inside the existing profile/account page.

### Referral Link Card
- Heading: "Invite Friends, Earn Credits"
- Subtitle: "Share your link — you both get 15 credits when they sign up"
- Readonly input showing referral URL + "Copy" button
- Share buttons: Copy link, Twitter (pre-filled text), LinkedIn (pre-filled text)
- Pre-filled share text: "Check out Toolk1t — free AI tools for devs and creators! Sign up with my link and we both get free credits: {url}"

### Stats Row (3 metric cards)
- "Total Referrals" — count of all referrals
- "Credits Earned" — total credits from referrals
- "This Month" — X/10 with progress indicator

### Recent Referrals List
- List of recent referrals: referred user first name + date + "15 credits earned"
- Max 10 entries, most recent first
- Empty state: "No referrals yet. Share your link to get started!"

## Database

### Table: `referral_codes`
```sql
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes (code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes (user_id);
```

### Table: `referrals`
```sql
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
```

Both tables: RLS enabled, service_role has full access. Referral codes readable by the owning user. Referrals readable by the referrer.

## API Routes

### GET `/api/v1/referral/code`
- Auth: required
- Returns the user's referral code. Creates one if not exists (8-char random alphanumeric).
- Response: `{ code: "abc12345", url: "https://toolk1t.com/?ref=abc12345" }`

### GET `/api/v1/referral/stats`
- Auth: required
- Returns: `{ totalReferrals, creditsEarned, thisMonth, maxPerMonth: 10, recent: [{ name, date, credits }] }`
- Queries `referrals` table where `referrer_id = userId`
- `thisMonth`: count where `created_at` is in current month
- `recent`: last 10 referrals joined with user profiles for first name

### POST `/api/v1/referral/claim`
- Auth: required (called from auth callback)
- Body: `{ referralCode: string, referredUserId: string, ipAddress?: string }`
- Validates:
  - Code exists in `referral_codes` table
  - Referrer !== referred
  - Referred user not already in `referrals` table
  - Referrer hasn't exceeded 10 this month
  - IP hasn't generated 3+ referrals this month
- Awards: 15 credits to referrer, 15 credits to referred user (via `award_credits` or `deduct_credits` with negative amount)
- Inserts row into `referrals` table
- Response: `{ success: true, creditsAwarded: 15 }`

## Referral Cookie Handling

### Client-side hook: `useReferralTracking()`
- On mount: check URL for `?ref=` param
- If found: set cookie `tk_ref={code}` with 30-day expiry, `path=/`, `SameSite=Lax`
- Clean the URL (remove `?ref=` param without page reload using `history.replaceState`)

### Auth callback integration
- After successful Google OAuth signup (new user only, not existing login)
- Read `tk_ref` cookie
- If present: call `POST /api/v1/referral/claim` with the code
- Clear the cookie regardless of claim result

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `lib/hooks/use-referral-tracking.ts` | Client hook to capture `?ref=` param into cookie |
| `tools/referral/referral-section.tsx` | Profile page referral UI (link + stats + list) |
| `app/api/v1/referral/code/route.ts` | Get/create referral code |
| `app/api/v1/referral/stats/route.ts` | Get referral stats |
| `app/api/v1/referral/claim/route.ts` | Claim referral on signup |
| `supabase/migrations/038_referral_system.sql` | Database tables |

### Modified Files
| File | Changes |
|---|---|
| `app/layout.tsx` | Add `useReferralTracking()` hook (or a wrapper component) |
| Profile page component | Add `<ReferralSection />` |

## Credit Mechanics

- Referrer: +15 credits via Supabase RPC
- Referred: gets the standard 15 signup credits (existing flow) — no additional RPC needed if signup already grants credits
- If signup doesn't already grant credits: the claim endpoint awards 15 to the referred user too

## Out of Scope

- Referral leaderboard
- Tiered rewards
- "Made with Toolk1t" branding
- Embeddable widgets
- Admin dashboard for referral analytics
- Email notifications for referral events

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Referral credits first | Branding; widgets | Highest direct conversion |
| 2 | Symmetrical 15 credits | Higher referrer; tiered | Simple, matches signup credits |
| 3 | On signup + 10/month cap | On tool use; no cap | Instant gratification; prevents abuse |
| 4 | Profile section | Dedicated page; inline | Simple, discoverable |
| 5 | 30-day cookie tracking | URL param only; localStorage | Persists across sessions |
| 6 | Unique 8-char code | User ID; UUID | Short URLs, no ID exposure |
| 7 | IP-based abuse (3/month/IP) | Phone; email domain | Low friction MVP |
