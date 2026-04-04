# Admin Analytics Dashboard — Design Spec

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

An admin-only analytics dashboard section in the profile page, showing user growth, tool usage, credits/revenue, and referral metrics. Data sourced entirely from Supabase. Visible only to admin email (loicwong1982@gmail.com).

## Location

Profile page → below referral section → admin-gated. Hidden for non-admin users.

## Time Period Selector

3 pill buttons at the top: 7 days / 30 days / 90 days. Default: 30 days. All sections update when period changes.

## Section 1: User Growth

**Metric cards (3):**
- Total Users — all-time count
- New Users — signups in selected period
- Active Users — users with credit_transactions in period

**Signup chart:**
- CSS bar chart, daily for 7d/30d, weekly for 90d
- Bars: `bg-[#3D6AF2]`, rounded top, count label above

## Section 2: Tool Usage

**Top tools table (top 10):**
- Rank, Tool Name, Credits Used, Usage Count, Trend arrow (vs previous period)

**Usage distribution (top 5):**
- Horizontal CSS bars, width proportional to credit share

## Section 3: Credits & Revenue

**Metric cards (3):**
- Credits Purchased (green)
- Credits Consumed (blue)
- Conversion Rate — % users who purchased (purple)

**Credits flow chart:**
- Daily stacked bars: blue (consumed) + green (purchased)

## Section 4: Referrals

**Metric cards (3):**
- Total Referrals in period
- Referral Credits Awarded
- Referral Conversion — % referred vs total signups

**Top referrers (top 5):**
- User email (truncated), Referral count, Credits earned

## API

### GET `/api/v1/admin/analytics?period=30`

Admin-only. Returns all metrics in one response:

```typescript
{
  users: { total, new, active }
  signupChart: { date: string, count: number }[]
  tools: { slug, name, creditsUsed, usageCount, trend: 'up'|'down'|'flat' }[]
  credits: { purchased, consumed, conversionRate }
  creditsChart: { date: string, purchased: number, consumed: number }[]
  referrals: { total, creditsAwarded, conversionRate }
  topReferrers: { email, count, credits }[]
}
```

**Data sources:**
- `auth.users` (via admin client) — user count, signups
- `credit_transactions` — tool usage, credits consumed/purchased
- `user_credits` — who has purchased
- `referrals` — referral metrics

## File Structure

| File | Responsibility |
|---|---|
| `tools/admin/analytics-dashboard.tsx` | Full dashboard UI component |
| `app/api/v1/admin/analytics/route.ts` | Analytics data API |

## Modified Files

| File | Changes |
|---|---|
| `components/mobile/profile-tab.tsx` | Add `<AnalyticsDashboard />` below referral section, admin-gated |

## Styling

Dark theme tokens. CSS-only bar charts. Cards: `rounded-xl bg-[#131a23] border border-[#1e2631]`. Same design system as rest of app.

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Supabase-only | GA; both | No external deps |
| 2 | Profile section | /admin route; admin app | Simplest |
| 3 | Single scroll | Tabs | All visible |
| 4 | CSS charts | Recharts | No new dependency |
| 5 | Single API | Per-section | One fetch |
| 6 | 7d/30d/90d selector | Fixed; custom | Good balance |
