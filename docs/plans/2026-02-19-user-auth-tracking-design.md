# User Authentication & Behavior Tracking — Design Document

**Date:** 2026-02-19
**Status:** Approved
**Approach:** Supabase-Only (Approach A)

---

## Goals

1. **Primary:** Track tool popularity via page views + time spent
2. **Secondary:** Collect optional user profiles for segmentation
3. **Tertiary:** Personalized tool recommendations (future iteration)

## Decisions

| Aspect | Decision |
|---|---|
| Auth | Google + Facebook via Supabase Auth |
| Tracking scope | All users (anonymous + logged-in) |
| Tracking depth | Page views + time spent per tool |
| Profile prompt | After 3+ unique tool visits, max 3 prompts |
| Profile fields | Age range, gender, country, occupation, interests |
| Admin view | Dedicated analytics page in admin app |
| Chart library | Recharts |
| Data store | Supabase Postgres (single source of truth) |

---

## 1. Database Schema

### `auth.users` (managed by Supabase)

Created automatically on OAuth sign-in. Contains id, email, provider, created_at.

### `public.user_profiles`

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK, FK -> auth.users) | 1:1 with auth user |
| display_name | text | From OAuth provider initially |
| avatar_url | text | From OAuth provider |
| age_range | text | "18-24", "25-34", "35-44", "45-54", "55+" |
| gender | text | "male", "female", "non-binary", "prefer-not-to-say" |
| country | text | ISO country code, auto-detected from IP |
| occupation | text | "developer", "designer", "student", "marketer", "content-creator", "other" |
| interests | text[] | Array of tags: "development", "design", "photography", "documents", "networking", "data" |
| profile_completed | boolean | True when all fields filled |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `public.page_views`

| Column | Type | Notes |
|---|---|---|
| id | bigint (PK, auto) | |
| user_id | uuid (FK, nullable) | Null for anonymous users |
| session_id | uuid | Client-generated per browser session |
| tool_slug | text | e.g. "image-editor" |
| page_path | text | e.g. "/tools/image-editor" |
| duration_seconds | integer (nullable) | Filled on page leave |
| referrer | text (nullable) | |
| device_type | text | "mobile", "tablet", "desktop" |
| created_at | timestamptz | Visit start time |

### RLS Policies

- **user_profiles:** Users read/update own row. Admin reads all.
- **page_views:** Insert-only for anon key. Users read own rows. Admin reads all.

### Postgres Trigger

On `auth.users` insert -> auto-create `user_profiles` row with display_name and avatar_url from OAuth metadata.

---

## 2. Authentication Flow

1. User clicks "Continue with Google/Facebook" in header sign-in modal
2. `supabase.auth.signInWithOAuth()` redirects to provider
3. Provider redirects to `/auth/callback`
4. Server route handler exchanges code for session
5. Postgres trigger creates `user_profiles` row from OAuth data
6. User returns to the page they were on

**Signed-in header state:** Avatar + dropdown with display name, "My Profile" link, "Sign Out".

**Sign out:** `supabase.auth.signOut()` -> clear session -> redirect to home.

---

## 3. Behavior Tracking

### `usePageTracking()` hook

Lives in a shared tool layout (`app/tools/layout.tsx`) so all tools are tracked automatically.

**Lifecycle:**
1. **Mount:** Generate/reuse `session_id` from `sessionStorage`. Record start time. Insert `page_views` row with `duration_seconds = null`.
2. **Unmount / page leave:** Calculate duration. Update row with `duration_seconds`.
3. **Tab close fallback:** `visibilitychange` event flushes duration.

**User identification:**
- Logged in: `user_id` from Supabase session
- Anonymous: `user_id = null`, grouped by `session_id`

**Device detection:** `window.innerWidth` — mobile (<768), tablet (768-1024), desktop (>1024).

---

## 4. User Profile Collection

### Prompt Trigger

- Condition: Logged in AND visited 3+ unique tools
- Display: Non-intrusive banner/toast
- Dismiss: Hidden for 7 days, max 3 prompts total (tracked in localStorage)

### Profile Page (`/app/profile/page.tsx`)

Accessible from avatar dropdown. All fields optional.

| Field | Input | Notes |
|---|---|---|
| Display name | Text | Pre-filled from OAuth |
| Age range | Select | "Under 18", "18-24", "25-34", "35-44", "45-54", "55+" |
| Gender | Select | "Male", "Female", "Non-binary", "Prefer not to say" |
| Country | Select | Pre-selected via IP geolocation |
| Occupation | Select | Developer, Designer, Student, Marketer, Content Creator, Other |
| Interests | Multi-select chips | Development, Design, Photography, Documents, Networking, Data |

Progress indicator: "Profile 60% complete" to encourage completion.

---

## 5. Admin Analytics Dashboard

**Route:** `/admin/analytics`
**Auth:** Email allowlist check (evolve to RBAC later)
**Data:** Supabase service role key, server-side only

### 5a. Tool Popularity Overview

- Bar chart: tools ranked by page views (7d / 30d / 90d / all time)
- Table: tool name, total views, unique visitors, avg time spent, trend arrow
- Sortable columns

### 5b. Traffic Over Time

- Line chart: daily page views, configurable time range
- Optional per-tool overlay lines

### 5c. User Stats

- Summary cards: total users, new signups, active users (7d), profile completion rate
- Pie charts: gender, age range, top countries, top occupations
- Graceful degradation when profile data is sparse

### 5d. Tool Detail Drill-Down

- Click tool -> daily views, avg duration, device split, visitor demographics

### Tech

- Charts: Recharts (React, ~40KB, tree-shakeable)
- Aggregation: SQL views/functions in Postgres for fast queries

---

## Repo Mapping

| Component | Repo | Location |
|---|---|---|
| Auth callback route | handytool-client | `app/auth/callback/route.ts` |
| Sign-in modal | handytool-client | `components/auth/` |
| Header auth state | handytool-client | `components/layout/header.tsx` |
| `usePageTracking` hook | handytool-client | `lib/hooks/use-page-tracking.ts` |
| Tool layout wrapper | handytool-client | `app/tools/layout.tsx` |
| Profile page | handytool-client | `app/profile/page.tsx` |
| Profile prompt banner | handytool-client | `components/auth/profile-prompt.tsx` |
| Analytics dashboard | handytool-admin | `app/analytics/page.tsx` |
| DB migrations | Supabase | Applied via Supabase MCP |
| RLS policies | Supabase | Applied via Supabase MCP |

---

## Not In Scope (Future Iterations)

- Personalized tool recommendations based on profile + usage
- Merging anonymous history into user profile on sign-up
- Role-based access control for admin
- In-tool action tracking (e.g. "applied a filter", "converted a PDF")
- Email/password auth (OAuth only for now)
- Data retention policies / aggregation of old rows
