# Admin Analytics Portal — Design Doc

**Date:** 2026-02-26
**Status:** APPROVED
**Approach:** Hybrid — API for tracking (with UA enrichment), Supabase RPCs for reading

## Summary

Add email/password auth to the existing admin portal, implement client-side page tracking via the toolk1t-api, and build a dashboard to review page views, stay time, unique visitors, top referrers, and device/browser breakdown.

## Architecture

```
toolk1t-client (port 3000)
  └─ usePageTracker() hook (sendBeacon on page leave)
        │
        ▼
toolk1t-api (port 3001)
  └─ POST /api/v1/analytics/track
     - Zod validation
     - User-Agent parsing → device_type, browser, os
     - Insert enriched row into Supabase page_events
        │
        ▼
Supabase (page_events table)
        │
        ▼
toolk1t-admin (port 3002)
  └─ Reads via Supabase RPC functions
     - tool_popularity, daily_traffic, device_breakdown, top_referrers, dashboard_summary
```

## 1. Database Schema

```sql
CREATE TABLE page_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    text NOT NULL,
  page_path     text NOT NULL,
  tool_slug     text,
  referrer      text,
  duration_ms   integer,
  device_type   text,
  browser       text,
  os            text,
  country       text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_page_events_created_at ON page_events (created_at);
CREATE INDEX idx_page_events_tool_slug ON page_events (tool_slug);
CREATE INDEX idx_page_events_session_id ON page_events (session_id);
```

### RPC Functions

- `tool_popularity(time_range_days int)` — views, unique sessions, avg duration per tool
- `daily_traffic(time_range_days int)` — daily view count + unique sessions
- `device_breakdown(time_range_days int)` — counts by device_type, browser, os
- `top_referrers(time_range_days int)` — top referrer domains with counts
- `dashboard_summary()` — total views, unique visitors, avg duration (7d + 30d), active today

## 2. Client-Side Tracker

A `usePageTracker()` hook in toolk1t-client root layout:

- On page load: generate `session_id` (stored in `sessionStorage`), record page path and referrer
- On page leave (`visibilitychange` + `beforeunload`): calculate duration, send via `navigator.sendBeacon()`
- Extract `tool_slug` from URL pattern `/tools/<slug>`
- No external dependencies, ~1KB
- Sends to `NEXT_PUBLIC_API_URL/api/v1/analytics/track`

## 3. API Endpoint

`POST /api/v1/analytics/track` on toolk1t-api:

- Input: `{ session_id, page_path, tool_slug, referrer, duration_ms }`
- Validates with Zod
- Parses `User-Agent` header → `device_type`, `browser`, `os` (using `ua-parser-js`)
- Inserts enriched row into `page_events`
- Returns `204 No Content`
- No auth required (public), rate-limited by IP

## 4. Admin Auth

- Enable Supabase Auth email provider
- Create admin user: `loicwong1982@gmail.com` / `Pa$$w0rd`
- Login page: email/password form + Google OAuth button
- Same `ADMIN_EMAILS` whitelist guard on all protected routes

## 5. Admin Layout

Collapsible sidebar with navigation:

- **Dashboard** — summary stats overview
- **Analytics** — detailed charts and tables
- **Settings** — placeholder for future

Top bar: admin name/email, logout button. Dark mode default. Responsive sidebar (hamburger on mobile).

### Route Structure

```
admin/app/
  login/page.tsx            -- public
  auth/callback/route.ts    -- OAuth callback
  (admin)/                  -- layout group
    layout.tsx              -- sidebar + top bar + requireAdmin()
    page.tsx                -- Dashboard overview
    analytics/page.tsx      -- Detailed analytics
    settings/page.tsx       -- Placeholder
```

## 6. Dashboard Pages

### Dashboard (Overview)

- 4 summary cards: Total Page Views (30d), Unique Visitors (30d), Avg Stay Time (30d), Active Today
- 7-day trend sparklines under each card
- Top 5 Tools quick list (view count + avg duration)

### Analytics (Detail)

- Period selector: 7d / 14d / 30d / 90d
- Tool Popularity: horizontal bar chart + sortable table (views, unique visitors, avg duration)
- Daily Traffic: line chart with views + unique visitors
- Device Breakdown: pie/donut charts for device type, browser, OS
- Top Referrers: table with domain, count, percentage

### Settings

- Placeholder: "Coming soon"

## 7. Dependencies

| Repo | New Dependencies |
|------|-----------------|
| toolk1t-client | none (vanilla JS tracker) |
| toolk1t-api | `ua-parser-js` |
| toolk1t-admin | none (already has recharts, Supabase) |

## 8. Security

- Admin whitelist (`ADMIN_EMAILS`) checked on every protected page
- Tracking endpoint is public but rate-limited
- No PII collected (session_id is random, no user identity)
- Password stored in Supabase Auth (bcrypt hashed)
