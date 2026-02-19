# User Authentication & Behavior Tracking — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Google/Facebook OAuth login, page view + time-spent tracking for all users, optional user profiles, and an admin analytics dashboard — all powered by Supabase.

**Architecture:** Supabase Auth handles OAuth (Google + Facebook). A `page_views` table records every tool visit with duration. A `user_profiles` table stores optional demographic data. A shared tool layout auto-tracks all tools via a `usePageTracking` hook. The admin app gets a dedicated analytics dashboard with Recharts.

**Tech Stack:** Supabase Auth + Postgres, Next.js 16 App Router, React 19, Recharts, Tailwind CSS v4 + SCSS

**Supabase Project:** `wgrcfnumbozvtmhcavnm` (region: ap-northeast-2)

---

## Task 1: Database Schema — Migrations

**Files:**
- Applied via Supabase MCP (no local files)

**Step 1: Apply migration for `user_profiles` table**

```sql
-- Create user_profiles table
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  age_range text check (age_range in ('under-18', '18-24', '25-34', '35-44', '45-54', '55+')),
  gender text check (gender in ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  country text,
  occupation text check (occupation in ('developer', 'designer', 'student', 'marketer', 'content-creator', 'other')),
  interests text[] default '{}',
  profile_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile (for the trigger)
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  return new;
end;
$$;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at auto-update
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.update_updated_at();
```

Migration name: `create_user_profiles`

**Step 2: Apply migration for `page_views` table**

```sql
-- Create page_views table
create table public.page_views (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  session_id uuid not null,
  tool_slug text not null,
  page_path text not null,
  duration_seconds integer,
  referrer text,
  device_type text check (device_type in ('mobile', 'tablet', 'desktop')),
  created_at timestamptz default now()
);

-- Index for common queries
create index idx_page_views_tool_slug on public.page_views(tool_slug);
create index idx_page_views_created_at on public.page_views(created_at);
create index idx_page_views_user_id on public.page_views(user_id);
create index idx_page_views_session_id on public.page_views(session_id);

-- Enable RLS
alter table public.page_views enable row level security;

-- Anyone can insert (anonymous tracking via anon key)
create policy "Anyone can insert page views"
  on public.page_views for insert
  with check (true);

-- Users can read their own page views
create policy "Users can read own page views"
  on public.page_views for select
  using (auth.uid() = user_id);

-- Allow anonymous to update their own rows (for duration flush)
create policy "Anyone can update page views by session"
  on public.page_views for update
  using (true)
  with check (true);
```

Migration name: `create_page_views`

**Step 3: Apply migration for admin analytics SQL functions**

```sql
-- Tool popularity: views + unique visitors + avg duration
create or replace function public.tool_popularity(
  time_range_days integer default 30
)
returns table (
  tool_slug text,
  total_views bigint,
  unique_visitors bigint,
  avg_duration_seconds numeric
)
language sql
stable
as $$
  select
    pv.tool_slug,
    count(*) as total_views,
    count(distinct coalesce(pv.user_id::text, pv.session_id::text)) as unique_visitors,
    round(avg(pv.duration_seconds) filter (where pv.duration_seconds is not null), 1) as avg_duration_seconds
  from public.page_views pv
  where pv.created_at >= now() - make_interval(days => time_range_days)
  group by pv.tool_slug
  order by total_views desc;
$$;

-- Daily traffic: total views per day
create or replace function public.daily_traffic(
  time_range_days integer default 30
)
returns table (
  day date,
  total_views bigint
)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as day,
    count(*) as total_views
  from public.page_views
  where created_at >= now() - make_interval(days => time_range_days)
  group by day
  order by day;
$$;

-- User stats summary
create or replace function public.user_stats_summary()
returns table (
  total_users bigint,
  new_users_7d bigint,
  active_users_7d bigint,
  profile_completion_rate numeric
)
language sql
stable
as $$
  select
    (select count(*) from public.user_profiles) as total_users,
    (select count(*) from public.user_profiles where created_at >= now() - interval '7 days') as new_users_7d,
    (select count(distinct user_id) from public.page_views where user_id is not null and created_at >= now() - interval '7 days') as active_users_7d,
    (select round(avg(case when profile_completed then 1 else 0 end) * 100, 1) from public.user_profiles) as profile_completion_rate;
$$;

-- Demographics breakdown
create or replace function public.user_demographics()
returns table (
  field text,
  value text,
  count bigint
)
language sql
stable
as $$
  select 'gender' as field, gender as value, count(*) as count
  from public.user_profiles
  where gender is not null
  group by gender
  union all
  select 'age_range', age_range, count(*)
  from public.user_profiles
  where age_range is not null
  group by age_range
  union all
  select 'country', country, count(*)
  from public.user_profiles
  where country is not null
  group by country
  union all
  select 'occupation', occupation, count(*)
  from public.user_profiles
  where occupation is not null
  group by occupation;
$$;

-- Tool detail: daily views for a specific tool
create or replace function public.tool_detail(
  target_tool_slug text,
  time_range_days integer default 30
)
returns table (
  day date,
  total_views bigint,
  unique_visitors bigint,
  avg_duration_seconds numeric,
  mobile_views bigint,
  tablet_views bigint,
  desktop_views bigint
)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as day,
    count(*) as total_views,
    count(distinct coalesce(user_id::text, session_id::text)) as unique_visitors,
    round(avg(duration_seconds) filter (where duration_seconds is not null), 1),
    count(*) filter (where device_type = 'mobile'),
    count(*) filter (where device_type = 'tablet'),
    count(*) filter (where device_type = 'desktop')
  from public.page_views
  where tool_slug = target_tool_slug
    and created_at >= now() - make_interval(days => time_range_days)
  group by day
  order by day;
$$;
```

Migration name: `create_analytics_functions`

**Step 4: Verify tables exist**

Run: `select table_name from information_schema.tables where table_schema = 'public';`
Expected: `user_profiles`, `page_views`

**Step 5: Commit** (no local files for this task — migrations applied via Supabase MCP)

---

## Task 2: Supabase Auth — Google & Facebook OAuth Setup

**Files:**
- Create: `app/auth/callback/route.ts`
- Create: `lib/supabase/auth.ts`

**Step 1: Create auth helper library**

Create `lib/supabase/auth.ts`:

```typescript
import { createClient } from '@/lib/supabase/client'

export type OAuthProvider = 'google' | 'facebook'

export async function signInWithOAuth(provider: OAuthProvider) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

**Step 2: Create the OAuth callback route**

Create `app/auth/callback/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error — redirect to home with error param
  return NextResponse.redirect(`${origin}/?auth_error=true`)
}
```

**Step 3: Configure Supabase OAuth providers**

This is a manual step in the Supabase dashboard:
1. Go to Authentication → Providers
2. Enable Google: add Client ID + Secret from Google Cloud Console
3. Enable Facebook: add App ID + Secret from Facebook Developer Console
4. Set redirect URL to: `https://<supabase-project>.supabase.co/auth/v1/callback`

Document this in a `docs/setup/oauth-providers.md` file for future reference.

**Step 4: Verify callback route compiles**

Run: `pnpm build` (or at minimum check TypeScript: `npx tsc --noEmit`)
Expected: No errors on the new files

**Step 5: Commit**

```bash
git add lib/supabase/auth.ts app/auth/callback/route.ts
git commit -m "feat(auth): add Supabase OAuth helpers and callback route"
```

---

## Task 3: Auth UI — Sign-In Modal & Header Auth State

**Files:**
- Create: `components/auth/sign-in-modal.tsx`
- Create: `components/auth/user-menu.tsx`
- Create: `lib/hooks/use-auth.ts`
- Modify: `components/layout/header.tsx`

**Step 1: Create the `useAuth` hook**

Create `lib/hooks/use-auth.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

**Step 2: Create the sign-in modal**

Create `components/auth/sign-in-modal.tsx`:

A modal dialog with:
- "Continue with Google" button (calls `signInWithOAuth('google')`)
- "Continue with Facebook" button (calls `signInWithOAuth('facebook')`)
- Close button, click-outside-to-close
- Accessible: `role="dialog"`, `aria-modal="true"`, focus trap
- Styled with glass-morphism to match existing design system

**Step 3: Create the user menu dropdown**

Create `components/auth/user-menu.tsx`:

A dropdown triggered by clicking the user avatar, containing:
- Display name + email
- "My Profile" link → `/profile`
- "Sign Out" button (calls `signOut()` from `lib/supabase/auth.ts`)
- Click-outside-to-close

**Step 4: Update the header**

Modify `components/layout/header.tsx`:

- Import `useAuth` hook
- Replace the static "Sign In" `<Link>` (lines 300-305 and 433-439) with:
  - If `loading`: show a skeleton/spinner placeholder
  - If `user`: show `<UserMenu user={user} />`
  - If no user: show a button that opens `<SignInModal />`
- Same logic for the mobile "Sign In" button in the mobile menu

**Step 5: Verify the header renders correctly in both states**

Run: `pnpm dev`
Manual check: Header shows "Sign In" when logged out, avatar menu when logged in.

**Step 6: Commit**

```bash
git add lib/hooks/use-auth.ts components/auth/sign-in-modal.tsx components/auth/user-menu.tsx components/layout/header.tsx
git commit -m "feat(auth): add sign-in modal, user menu, and auth-aware header"
```

---

## Task 4: Page View Tracking — `usePageTracking` Hook

**Files:**
- Create: `lib/hooks/use-page-tracking.ts`
- Modify: `app/tools/layout.tsx`

**Step 1: Create the `usePageTracking` hook**

Create `lib/hooks/use-page-tracking.ts`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getSessionId(): string {
  const key = 'ht-session-id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w <= 1024) return 'tablet'
  return 'desktop'
}

function getToolSlug(pathname: string): string | null {
  const match = pathname.match(/^\/tools\/([^/]+)/)
  return match ? match[1] : null
}

export function usePageTracking() {
  const pathname = usePathname()
  const rowIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const toolSlug = getToolSlug(pathname)
    if (!toolSlug) return

    const supabase = createClient()
    const sessionId = getSessionId()
    const startTime = Date.now()
    startTimeRef.current = startTime
    rowIdRef.current = null

    // Insert page view row
    async function insertView() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('page_views')
        .insert({
          user_id: user?.id ?? null,
          session_id: sessionId,
          tool_slug: toolSlug,
          page_path: pathname,
          referrer: document.referrer || null,
          device_type: getDeviceType(),
        })
        .select('id')
        .single()

      if (data) rowIdRef.current = data.id
    }

    insertView()

    // Flush duration on page leave
    function flushDuration() {
      if (rowIdRef.current === null) return
      const duration = Math.round((Date.now() - startTime) / 1000)
      // Use sendBeacon for reliability on page close
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_views?id=eq.${rowIdRef.current}`
      const body = JSON.stringify({ duration_seconds: duration })
      const headers = {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        'Prefer': 'return=minimal',
      }
      // Try sendBeacon first (works on tab close), fall back to fetch
      const blob = new Blob([body], { type: 'application/json' })
      if (!navigator.sendBeacon(url, blob)) {
        fetch(url, { method: 'PATCH', headers, body, keepalive: true })
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flushDuration()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      flushDuration()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname])
}
```

**Step 2: Create a client wrapper component for the tools layout**

The existing `app/tools/layout.tsx` is a server component (has `metadata` export). We need a client component wrapper.

Create `app/tools/tools-layout-client.tsx`:

```typescript
'use client'

import { usePageTracking } from '@/lib/hooks/use-page-tracking'

export function ToolsLayoutClient({ children }: { children: React.ReactNode }) {
  usePageTracking()
  return <>{children}</>
}
```

**Step 3: Modify `app/tools/layout.tsx` to use the client wrapper**

Modify `app/tools/layout.tsx` — wrap `{children}` with `<ToolsLayoutClient>`:

```typescript
import type { Metadata } from "next";
import { ToolsLayoutClient } from "./tools-layout-client";

// ... metadata and jsonLd stay the same ...

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolsLayoutClient>{children}</ToolsLayoutClient>
    </>
  );
}
```

**Step 4: Verify tracking fires on tool page visit**

Run: `pnpm dev`, visit `/tools/image-editor`
Check Supabase dashboard → Table Editor → `page_views` → should see a new row.
Navigate away → `duration_seconds` should be populated.

**Step 5: Commit**

```bash
git add lib/hooks/use-page-tracking.ts app/tools/tools-layout-client.tsx app/tools/layout.tsx
git commit -m "feat(tracking): add page view + time spent tracking for all tools"
```

---

## Task 5: User Profile Page

**Files:**
- Create: `app/profile/page.tsx`
- Create: `app/profile/profile-form.tsx`

**Step 1: Create the profile form component**

Create `app/profile/profile-form.tsx`:

A client component with:
- Loads current profile from Supabase on mount (`supabase.from('user_profiles').select().eq('id', user.id).single()`)
- Form fields:
  - Display name (text input, pre-filled)
  - Age range (select: "Under 18", "18-24", "25-34", "35-44", "45-54", "55+")
  - Gender (select: "Male", "Female", "Non-binary", "Prefer not to say")
  - Country (select, pre-selected from IP via existing `/api/v1/myip` endpoint)
  - Occupation (select: "Developer", "Designer", "Student", "Marketer", "Content Creator", "Other")
  - Interests (multi-select chips: "Development", "Design", "Photography", "Documents", "Networking", "Data")
- Progress bar: "Profile X% complete" based on how many fields are filled
- Save button → `supabase.from('user_profiles').update({...}).eq('id', user.id)`
- Sets `profile_completed = true` when all fields are filled
- Success/error toast feedback
- Redirect to `/` if not authenticated

**Step 2: Create the profile page**

Create `app/profile/page.tsx`:

```typescript
import type { Metadata } from 'next'
import { ProfileForm } from './profile-form'

export const metadata: Metadata = {
  title: 'My Profile | HandyTool',
}

export default function ProfilePage() {
  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        My Profile
      </h1>
      <ProfileForm />
    </main>
  )
}
```

**Step 3: Verify profile page works**

Run: `pnpm dev`, sign in, navigate to `/profile`
- Form should load with OAuth data pre-filled (display name, avatar)
- Fill in fields, save → check `user_profiles` table in Supabase

**Step 4: Commit**

```bash
git add app/profile/page.tsx app/profile/profile-form.tsx
git commit -m "feat(profile): add user profile page with optional demographics form"
```

---

## Task 6: Profile Completion Prompt

**Files:**
- Create: `components/auth/profile-prompt.tsx`
- Create: `lib/hooks/use-profile-prompt.ts`
- Modify: `app/layout.tsx`

**Step 1: Create the prompt logic hook**

Create `lib/hooks/use-profile-prompt.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'

const STORAGE_KEY = 'ht-profile-prompt'
const MAX_PROMPTS = 3
const COOLDOWN_DAYS = 7
const MIN_UNIQUE_TOOLS = 3

interface PromptState {
  promptCount: number
  lastDismissed: string | null // ISO date
  uniqueTools: string[] // tool slugs visited
}

function getState(): PromptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { promptCount: 0, lastDismissed: null, uniqueTools: [] }
  } catch {
    return { promptCount: 0, lastDismissed: null, uniqueTools: [] }
  }
}

function setState(state: PromptState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function trackToolVisit(toolSlug: string) {
  const state = getState()
  if (!state.uniqueTools.includes(toolSlug)) {
    state.uniqueTools.push(toolSlug)
    setState(state)
  }
}

export function useProfilePrompt() {
  const { user } = useAuth()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (!user) { setShowPrompt(false); return }

    async function check() {
      const state = getState()

      // Already maxed out prompts
      if (state.promptCount >= MAX_PROMPTS) return

      // In cooldown period
      if (state.lastDismissed) {
        const cooldownEnd = new Date(state.lastDismissed)
        cooldownEnd.setDate(cooldownEnd.getDate() + COOLDOWN_DAYS)
        if (new Date() < cooldownEnd) return
      }

      // Not enough unique tools visited
      if (state.uniqueTools.length < MIN_UNIQUE_TOOLS) return

      // Check if profile already completed
      const supabase = createClient()
      const { data } = await supabase
        .from('user_profiles')
        .select('profile_completed')
        .eq('id', user.id)
        .single()

      if (data?.profile_completed) return

      setShowPrompt(true)
    }

    check()
  }, [user])

  function dismiss() {
    const state = getState()
    state.promptCount++
    state.lastDismissed = new Date().toISOString()
    setState(state)
    setShowPrompt(false)
  }

  return { showPrompt, dismiss }
}
```

**Step 2: Create the prompt banner component**

Create `components/auth/profile-prompt.tsx`:

A non-intrusive toast/banner at the bottom of the viewport:
- Text: "Help us recommend better tools — complete your profile (takes 30 seconds)"
- "Complete Profile" button → navigates to `/profile`
- "Dismiss" button → calls `dismiss()` from the hook
- Animated slide-in from bottom
- Matches existing glass-morphism design

**Step 3: Add prompt to root layout**

Modify `app/layout.tsx` — add the `<ProfilePrompt />` component inside `<body>` after `<Footer>`. Wrap it in a client component if needed (or make ProfilePrompt handle its own client boundary).

**Step 4: Wire up tool visit tracking to the prompt system**

In `lib/hooks/use-page-tracking.ts`, add a call to `trackToolVisit(toolSlug)` inside the `useEffect`, so each tool visit is counted toward the 3-tool threshold.

**Step 5: Verify prompt appears after conditions are met**

Run: `pnpm dev`, sign in, visit 3 different tools → prompt should appear.
Dismiss → should not reappear for 7 days.

**Step 6: Commit**

```bash
git add lib/hooks/use-profile-prompt.ts components/auth/profile-prompt.tsx app/layout.tsx lib/hooks/use-page-tracking.ts
git commit -m "feat(profile): add smart profile completion prompt after 3 tool visits"
```

---

## Task 7: Admin Analytics Dashboard — Setup & Data Fetching

**Files:**
- Modify: `admin/package.json` (add recharts dependency)
- Create: `admin/lib/supabase/admin.ts` (service role client)
- Create: `admin/lib/analytics.ts` (data fetching functions)
- Create: `admin/app/analytics/page.tsx`
- Create: `admin/app/analytics/analytics-dashboard.tsx`

**Step 1: Install Recharts in admin app**

Run: `cd admin && pnpm add recharts`

**Step 2: Create admin Supabase client**

Create `admin/lib/supabase/admin.ts`:

Uses the **service role key** (not the anon key) for full read access to `page_views` and `user_profiles`. This key must NEVER be exposed to the client — only used in server components.

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

Add `SUPABASE_SERVICE_ROLE_KEY` to `admin/.env.local` and `admin/.env.example`.

**Step 3: Create analytics data fetching functions**

Create `admin/lib/analytics.ts`:

Functions that call the Postgres RPC functions created in Task 1:
- `fetchToolPopularity(days: number)` → calls `tool_popularity` RPC
- `fetchDailyTraffic(days: number)` → calls `daily_traffic` RPC
- `fetchUserStats()` → calls `user_stats_summary` RPC
- `fetchDemographics()` → calls `user_demographics` RPC
- `fetchToolDetail(slug: string, days: number)` → calls `tool_detail` RPC

All use the admin client (service role key, server-side only).

**Step 4: Create the analytics page (server component)**

Create `admin/app/analytics/page.tsx`:

```typescript
import type { Metadata } from 'next'
import { AnalyticsDashboard } from './analytics-dashboard'
import { fetchToolPopularity, fetchDailyTraffic, fetchUserStats, fetchDemographics } from '@/lib/analytics'

export const metadata: Metadata = {
  title: 'Analytics | HandyTool Admin',
}

export default async function AnalyticsPage() {
  // Default to 30 days
  const [popularity, traffic, userStats, demographics] = await Promise.all([
    fetchToolPopularity(30),
    fetchDailyTraffic(30),
    fetchUserStats(),
    fetchDemographics(),
  ])

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <AnalyticsDashboard
        popularity={popularity}
        traffic={traffic}
        userStats={userStats}
        demographics={demographics}
      />
    </main>
  )
}
```

**Step 5: Commit**

```bash
git add admin/lib/supabase/admin.ts admin/lib/analytics.ts admin/app/analytics/page.tsx
git commit -m "feat(admin): add analytics page with server-side data fetching"
```

---

## Task 8: Admin Analytics Dashboard — Charts & UI

**Files:**
- Create: `admin/app/analytics/analytics-dashboard.tsx`
- Create: `admin/app/analytics/components/tool-popularity-chart.tsx`
- Create: `admin/app/analytics/components/traffic-chart.tsx`
- Create: `admin/app/analytics/components/user-stats-cards.tsx`
- Create: `admin/app/analytics/components/demographics-charts.tsx`
- Create: `admin/app/analytics/components/time-range-selector.tsx`

**Step 1: Create the time range selector**

A client component with buttons for 7d / 30d / 90d / All Time. On change, triggers a page reload with query params (or client-side refetch).

**Step 2: Create the tool popularity chart**

A horizontal bar chart (Recharts `<BarChart>`) showing:
- Tool name on Y-axis
- Total views as bars
- Tooltip showing unique visitors + avg duration
- Sorted by total views descending

Plus a sortable table below with columns: Tool, Views, Unique Visitors, Avg Duration.

**Step 3: Create the traffic over time chart**

A line chart (Recharts `<LineChart>`) showing daily total views.
- X-axis: dates
- Y-axis: view count
- Responsive container

**Step 4: Create user stats summary cards**

Four cards at the top:
- Total Users (icon + number)
- New Signups (7d)
- Active Users (7d)
- Profile Completion Rate (percentage)

Styled with glass-morphism matching the client app's design system.

**Step 5: Create demographics pie charts**

Four pie charts (Recharts `<PieChart>`):
- Gender distribution
- Age range distribution
- Top 5 countries
- Top 5 occupations

Group into a 2x2 grid.

**Step 6: Create the dashboard layout component**

Create `admin/app/analytics/analytics-dashboard.tsx` — the main client component that composes all the sub-components:

```
<TimeRangeSelector />
<UserStatsCards />
<ToolPopularityChart />
<TrafficChart />
<DemographicsCharts />
```

**Step 7: Verify dashboard renders**

Run: `cd admin && pnpm dev`
Navigate to `/analytics` → should render all sections (charts may be empty if no data yet).

**Step 8: Commit**

```bash
git add admin/app/analytics/
git commit -m "feat(admin): add analytics dashboard with charts and stats"
```

---

## Task 9: Admin Auth Guard

**Files:**
- Create: `admin/lib/auth-guard.ts`
- Modify: `admin/app/analytics/page.tsx`

**Step 1: Create the auth guard**

Create `admin/lib/auth-guard.ts`:

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Allowlisted admin emails
const ADMIN_EMAILS = [
  'loicwong1982@gmail.com',
  // Add more as needed
]

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/')
  }

  return user
}
```

**Step 2: Apply guard to analytics page**

Modify `admin/app/analytics/page.tsx` — call `await requireAdmin()` at the top of the page component.

**Step 3: Commit**

```bash
git add admin/lib/auth-guard.ts admin/app/analytics/page.tsx
git commit -m "feat(admin): add email-allowlist auth guard for analytics page"
```

---

## Task 10: E2E Tests — Auth Flow

**Files:**
- Create: `e2e/auth.spec.ts`

**Step 1: Write Playwright tests for auth UI**

Test cases:
1. Sign-in modal opens when clicking "Sign In" button
2. Modal shows Google and Facebook buttons
3. Modal closes on click-outside and Escape key
4. Signed-in state shows user avatar menu (mock Supabase auth state)
5. User menu shows "My Profile" and "Sign Out" options
6. Sign out returns to signed-out state

Note: OAuth redirect flow can't be fully E2E tested without real credentials. Test the UI interactions and mock the Supabase client for state changes.

**Step 2: Run tests**

Run: `pnpm exec playwright test e2e/auth.spec.ts`
Expected: All tests pass

**Step 3: Commit**

```bash
git add e2e/auth.spec.ts
git commit -m "test(auth): add E2E tests for sign-in modal and user menu"
```

---

## Task 11: E2E Tests — Page Tracking & Profile

**Files:**
- Create: `e2e/tracking.spec.ts`
- Create: `e2e/profile.spec.ts`

**Step 1: Write tracking tests**

Test cases:
1. Visiting a tool page creates a `page_views` row (mock Supabase insert)
2. Navigating away populates `duration_seconds`
3. Session ID persists across page navigations
4. Device type is correctly detected

**Step 2: Write profile tests**

Test cases:
1. Profile page redirects to home when not authenticated
2. Profile form loads with pre-filled data
3. Form fields can be updated and saved
4. Progress indicator updates as fields are filled
5. Profile prompt appears after visiting 3+ unique tools (when signed in)
6. Profile prompt dismisses and respects cooldown

**Step 3: Run tests**

Run: `pnpm exec playwright test e2e/tracking.spec.ts e2e/profile.spec.ts`
Expected: All tests pass

**Step 4: Commit**

```bash
git add e2e/tracking.spec.ts e2e/profile.spec.ts
git commit -m "test: add E2E tests for page tracking and user profile"
```

---

## Task 12: Documentation & OAuth Setup Guide

**Files:**
- Create: `docs/setup/oauth-providers.md`

**Step 1: Write OAuth setup guide**

Document step-by-step instructions for:
1. Creating a Google Cloud project and OAuth credentials
2. Creating a Facebook App and OAuth credentials
3. Configuring redirect URLs in Supabase dashboard
4. Setting environment variables

**Step 2: Update `.env.example`**

Add any new env vars needed (e.g., nothing client-side beyond what exists, but document `SUPABASE_SERVICE_ROLE_KEY` for admin).

**Step 3: Commit**

```bash
git add docs/setup/oauth-providers.md .env.example
git commit -m "docs: add OAuth provider setup guide"
```

---

## Summary — Task Dependency Order

```
Task 1: DB Schema (migrations)        ← no dependencies
Task 2: Auth Helpers + Callback Route  ← depends on Task 1
Task 3: Auth UI (modal + header)       ← depends on Task 2
Task 4: Page Tracking Hook             ← depends on Task 1
Task 5: Profile Page                   ← depends on Task 1, Task 2
Task 6: Profile Prompt                 ← depends on Task 4, Task 5
Task 7: Admin Dashboard (data layer)   ← depends on Task 1
Task 8: Admin Dashboard (charts UI)    ← depends on Task 7
Task 9: Admin Auth Guard               ← depends on Task 7
Task 10: E2E Tests (auth)              ← depends on Task 3
Task 11: E2E Tests (tracking+profile)  ← depends on Task 4, Task 5, Task 6
Task 12: Documentation                 ← depends on Task 2
```

**Parallelizable groups:**
- Task 1 first (everything depends on schema)
- Then Task 2 + Task 4 + Task 7 in parallel
- Then Task 3 + Task 5 + Task 8 + Task 9 in parallel
- Then Task 6 + Task 10 + Task 12 in parallel
- Finally Task 11
