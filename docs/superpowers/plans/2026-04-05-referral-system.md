# Referral System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a referral credit system where users share a unique link and both parties earn 15 credits on signup.

**Architecture:** Cookie-based referral tracking. Client hook captures `?ref=` param into a 30-day cookie. Auth callback reads the cookie after signup and calls a claim API that awards credits via Supabase RPC. Referral UI section in the profile tab shows link, stats, and recent referrals.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase (RLS + RPC), cookie-based tracking.

**Spec:** `docs/superpowers/specs/2026-04-05-referral-system.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `supabase/migrations/038_referral_system.sql` | Tables + RPC for awarding referral credits |
| `lib/hooks/use-referral-tracking.ts` | Client hook: captures `?ref=` into cookie |
| `app/api/v1/referral/code/route.ts` | Get/create user's referral code |
| `app/api/v1/referral/stats/route.ts` | Get referral stats + recent list |
| `app/api/v1/referral/claim/route.ts` | Claim referral on signup (award credits) |
| `tools/referral/referral-section.tsx` | Profile referral UI (link + stats + list) |

### Modified Files
| File | Changes |
|---|---|
| `app/auth/callback/route.ts` | After signup, read `tk_ref` cookie and call claim API |
| `components/mobile/profile-tab.tsx` | Add `<ReferralSection />` component |
| `app/layout.tsx` | Add referral tracking wrapper component |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/038_referral_system.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/038_referral_system.sql

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

  -- If no row exists, create one
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
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp__supabase__apply_migration` with project_id `wgrcfnumbozvtmhcavnm`, name `038_referral_system`, and the SQL above.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/038_referral_system.sql
git commit -m "feat(referral): add referral tables and award_referral_credits RPC"
```

---

## Task 2: Referral Tracking Hook

**Files:**
- Create: `lib/hooks/use-referral-tracking.ts`

- [ ] **Step 1: Create the hook**

```typescript
// lib/hooks/use-referral-tracking.ts
'use client'

import { useEffect } from 'react'

const COOKIE_NAME = 'tk_ref'
const COOKIE_DAYS = 30

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function clearReferralCookie() {
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

export function useReferralTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')

    if (ref && /^[a-zA-Z0-9]{6,12}$/.test(ref)) {
      setCookie(COOKIE_NAME, ref, COOKIE_DAYS)

      // Clean URL without reload
      const url = new URL(window.location.href)
      url.searchParams.delete('ref')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [])
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/hooks/use-referral-tracking.ts
git commit -m "feat(referral): add client-side referral tracking hook"
```

---

## Task 3: API Routes

**Files:**
- Create: `app/api/v1/referral/code/route.ts`
- Create: `app/api/v1/referral/stats/route.ts`
- Create: `app/api/v1/referral/claim/route.ts`

- [ ] **Step 1: Create referral code route**

```typescript
// app/api/v1/referral/code/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'
import { randomBytes } from 'crypto'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  // Check if user already has a code
  const { data: existing } = await (supabase.from as any)('referral_codes')
    .select('code')
    .eq('user_id', userId)
    .single()

  if (existing?.code) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'
    return apiSuccess({ code: existing.code, url: `${siteUrl}/?ref=${existing.code}` })
  }

  // Generate new 8-char alphanumeric code
  const code = randomBytes(6).toString('base64url').slice(0, 8).toLowerCase()

  await (supabase.from as any)('referral_codes')
    .insert({ user_id: userId, code })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'
  return apiSuccess({ code, url: `${siteUrl}/?ref=${code}` })
}
```

- [ ] **Step 2: Create referral stats route**

```typescript
// app/api/v1/referral/stats/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = getAdminSupabase()

  // Get all referrals for this user
  const { data: referrals } = await (supabase.from as any)('referrals')
    .select('id, referred_id, credits_awarded, created_at')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const allReferrals = (referrals || []) as { id: string; referred_id: string; credits_awarded: number; created_at: string }[]

  // This month count
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thisMonth = allReferrals.filter(r => r.created_at >= monthStart).length

  // Total credits earned
  const creditsEarned = allReferrals.reduce((sum, r) => sum + (r.credits_awarded || 15), 0)

  // Recent 10 with user names
  const recent = allReferrals.slice(0, 10).map(r => ({
    id: r.id,
    date: r.created_at,
    credits: r.credits_awarded || 15,
  }))

  return apiSuccess({
    totalReferrals: allReferrals.length,
    creditsEarned,
    thisMonth,
    maxPerMonth: 10,
    recent,
  })
}
```

- [ ] **Step 3: Create referral claim route**

```typescript
// app/api/v1/referral/claim/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { apiSuccess, apiError } from '@/lib/api/response'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  let body: { referralCode: string; referredUserId: string }
  try { body = await request.json() } catch { return apiError('Invalid JSON', 'VALIDATION_ERROR', 400) }

  if (!body.referralCode || !body.referredUserId) {
    return apiError('referralCode and referredUserId required', 'VALIDATION_ERROR', 400)
  }

  const supabase = getAdminSupabase()

  // Look up referral code
  const { data: codeRow } = await (supabase.from as any)('referral_codes')
    .select('user_id, code')
    .eq('code', body.referralCode)
    .single()

  if (!codeRow) {
    return apiError('Invalid referral code', 'INVALID_CODE', 400)
  }

  const referrerId = codeRow.user_id as string

  // Self-referral check
  if (referrerId === body.referredUserId) {
    return apiError('Cannot refer yourself', 'SELF_REFERRAL', 400)
  }

  // Already referred check
  const { data: existingReferral } = await (supabase.from as any)('referrals')
    .select('id')
    .eq('referred_id', body.referredUserId)
    .single()

  if (existingReferral) {
    return apiError('User already referred', 'ALREADY_REFERRED', 400)
  }

  // Monthly cap check (10 per month)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: monthCount } = await (supabase.from as any)('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', referrerId)
    .gte('created_at', monthStart)

  if ((monthCount || 0) >= 10) {
    return apiError('Referrer has reached monthly limit', 'MONTHLY_LIMIT', 400)
  }

  // IP abuse check (3 per IP per month)
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (ip !== 'unknown') {
    const { count: ipCount } = await (supabase.from as any)('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', monthStart)

    if ((ipCount || 0) >= 3) {
      return apiError('Too many referrals from this network', 'IP_LIMIT', 400)
    }
  }

  // Award credits to both parties
  try {
    await supabase.rpc('award_referral_credits', {
      p_user_id: referrerId,
      p_amount: 15,
      p_description: 'Referral bonus — new user signed up',
    })

    await supabase.rpc('award_referral_credits', {
      p_user_id: body.referredUserId,
      p_amount: 15,
      p_description: 'Welcome bonus — referred by a friend',
    })
  } catch (err) {
    console.error('[referral/claim] Credit award failed:', err)
    return apiError('Failed to award credits', 'CREDIT_ERROR', 500)
  }

  // Record referral
  await (supabase.from as any)('referrals').insert({
    referrer_id: referrerId,
    referred_id: body.referredUserId,
    referral_code: body.referralCode,
    credits_awarded: 15,
    ip_address: ip,
  })

  return apiSuccess({ success: true, creditsAwarded: 15 })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/referral/
git commit -m "feat(referral): add code, stats, and claim API routes"
```

---

## Task 4: Auth Callback Integration

**Files:**
- Modify: `app/auth/callback/route.ts`

- [ ] **Step 1: Update auth callback to process referrals**

After successful code exchange, check for `tk_ref` cookie and call the claim endpoint if the user is new.

Read the current file, then modify the success block:

```typescript
// After: const { error } = await supabase.auth.exchangeCodeForSession(code)
// In the !error block, before the redirect:

if (!error) {
  // Check if this is a new user (created in the last 60 seconds)
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const createdAt = new Date(user.created_at).getTime()
    const isNewUser = Date.now() - createdAt < 60_000 // within last 60 seconds

    if (isNewUser) {
      // Check for referral cookie
      const cookieHeader = request.headers.get('cookie') || ''
      const refMatch = cookieHeader.match(/tk_ref=([a-zA-Z0-9]+)/)

      if (refMatch) {
        const referralCode = refMatch[1]
        try {
          await fetch(`${origin}/api/v1/referral/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode, referredUserId: user.id }),
          })
        } catch (err) {
          console.error('[auth/callback] Referral claim failed:', err)
        }
      }
    }
  }

  // Clear referral cookie in the redirect response
  const response = NextResponse.redirect(`${origin}${next}`)
  response.cookies.set('tk_ref', '', { maxAge: 0, path: '/' })
  return response
}
```

Replace the existing `return NextResponse.redirect(...)` in the success block with this logic.

- [ ] **Step 2: Commit**

```bash
git add app/auth/callback/route.ts
git commit -m "feat(referral): process referral claims in auth callback"
```

---

## Task 5: Referral Section UI

**Files:**
- Create: `tools/referral/referral-section.tsx`

- [ ] **Step 1: Create the referral section component**

`'use client'` default export. Fetches code and stats from API on mount.

**State:** `code`, `url`, `stats`, `loading`, `copied`

**UI sections:**
1. Referral link card — heading, subtitle, URL input + Copy button, share buttons (Twitter/LinkedIn)
2. Stats row — 3 metric cards (Total Referrals, Credits Earned, This Month X/10 with progress bar)
3. Recent referrals list — date + credits badge per row, empty state

**Styling:** dark theme tokens (`#131a23`, `#1e2631`, `#3D6AF2`). All buttons min-h-[44px].

**API calls:**
- `GET /api/v1/referral/code` → sets code + url
- `GET /api/v1/referral/stats` → sets stats

**Share URLs:**
- Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
- LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
- Share text: `"Check out Toolk1t — free AI tools for devs and creators! Sign up with my link and we both get free credits: ${url}"`

**Copy:** navigator.clipboard.writeText(url), "Copied!" feedback for 2s

- [ ] **Step 2: Commit**

```bash
git add tools/referral/referral-section.tsx
git commit -m "feat(referral): add referral section UI with link, stats, and recent list"
```

---

## Task 6: Integration — Layout + Profile

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/mobile/profile-tab.tsx`

- [ ] **Step 1: Add referral tracking to layout**

Create a small client wrapper component inside layout or import the hook. Since `app/layout.tsx` is a server component, create a wrapper:

Add to the body in layout.tsx (after existing client components like `<ProfilePrompt />`):

```tsx
<ReferralTracker />
```

Create a tiny inline component or import:

```typescript
// At the top of layout.tsx or as a separate tiny file
'use client'
import { useReferralTracking } from '@/lib/hooks/use-referral-tracking'
function ReferralTracker() { useReferralTracking(); return null }
```

Since layout.tsx is a server component, the `ReferralTracker` needs to be a separate client component file or inlined. The simplest approach: create `components/referral-tracker.tsx`:

```typescript
// components/referral-tracker.tsx
'use client'
import { useReferralTracking } from '@/lib/hooks/use-referral-tracking'
export function ReferralTracker() { useReferralTracking(); return null }
```

Then import and add `<ReferralTracker />` in layout.tsx alongside the other client components.

- [ ] **Step 2: Add referral section to profile tab**

In `components/mobile/profile-tab.tsx`, import `ReferralSection` and render it inside the profile settings view, after the user info section:

```typescript
import ReferralSection from '@/tools/referral/referral-section'
```

Add `<ReferralSection />` in the appropriate place within the settings view (after the user avatar/name section, before the settings links).

Only show when user is authenticated (`user` is truthy).

- [ ] **Step 3: Commit**

```bash
git add components/referral-tracker.tsx app/layout.tsx components/mobile/profile-tab.tsx
git commit -m "feat(referral): integrate tracking in layout, add section to profile"
```

---

## Task 7: E2E Test & Verification

**Files:** None new

- [ ] **Step 1: Build check**

```bash
pnpm build
```

Expected: clean build.

- [ ] **Step 2: Test referral code API**

```bash
curl -s http://localhost:3000/api/v1/referral/code | python3 -m json.tool
```

Expected: `{ "data": { "code": "abc12345", "url": "..." } }`

- [ ] **Step 3: Test referral stats API**

```bash
curl -s http://localhost:3000/api/v1/referral/stats | python3 -m json.tool
```

Expected: `{ "data": { "totalReferrals": 0, "creditsEarned": 0, ... } }`

- [ ] **Step 4: Test referral tracking hook**

Open `http://localhost:3000/?ref=testcode` in Playwright, verify `tk_ref` cookie is set, URL is cleaned.

- [ ] **Step 5: Visual verification — screenshot profile with referral section**

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://localhost:3000/', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    # Navigate to profile tab
    page.screenshot(path='/tmp/referral-profile.png', full_page=True)
    browser.close()
"
```

- [ ] **Step 6: Fix any issues found, re-test, commit**

```bash
git add -A && git commit -m "fix(referral): e2e test fixes"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Database migration + RPC | None | Simple |
| 2 | Referral tracking hook | None | Simple |
| 3 | API routes (code/stats/claim) | Task 1 | Medium |
| 4 | Auth callback integration | Task 3 | Medium |
| 5 | Referral section UI | Task 3 | Medium |
| 6 | Layout + profile integration | Tasks 2, 5 | Simple |
| 7 | E2E test & verification | All | Medium |

Tasks 1 and 2 can run in parallel. Tasks 3-5 can run partially in parallel. Task 6 depends on 2+5. Task 7 runs last.
