# Admin Analytics Portal — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add email/password auth to the admin portal, implement client-side page tracking with server-side UA enrichment, and build an analytics dashboard showing page views, stay time, unique visitors, referrers, and device breakdown.

**Architecture:** Hybrid approach — client tracker sends events to toolk1t-api which enriches with UA parsing and inserts into Supabase `page_events` table. Admin reads via Supabase RPC functions. Three repos touched: client (tracker hook), API (tracking endpoint), admin (auth + dashboard).

**Tech Stack:** Next.js 16, React 19, Supabase (Auth + Postgres), recharts, ua-parser-js, Tailwind v4

**Design doc:** `docs/plans/2026-02-26-admin-analytics-portal-design.md`

---

## Task 1: Supabase — Create page_events table and RPC functions

**Files:**
- Create: `admin/supabase/migrations/001_page_events.sql`

This is a SQL migration to run in the Supabase SQL Editor. Save it as a reference file.

**Step 1: Write the migration SQL**

```sql
-- Table
CREATE TABLE IF NOT EXISTS page_events (
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

CREATE INDEX IF NOT EXISTS idx_page_events_created_at ON page_events (created_at);
CREATE INDEX IF NOT EXISTS idx_page_events_tool_slug ON page_events (tool_slug);
CREATE INDEX IF NOT EXISTS idx_page_events_session_id ON page_events (session_id);

-- Enable RLS but allow inserts from anon (tracking endpoint uses service role anyway)
ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;

-- RPC: tool_popularity
CREATE OR REPLACE FUNCTION tool_popularity(time_range_days int DEFAULT 30)
RETURNS TABLE (
  tool_slug text,
  tool_name text,
  view_count bigint,
  unique_visitors bigint,
  avg_duration_seconds numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    pe.tool_slug,
    COALESCE(
      REPLACE(INITCAP(REPLACE(pe.tool_slug, '-', ' ')), ' ', ' '),
      pe.tool_slug
    ) AS tool_name,
    COUNT(*) AS view_count,
    COUNT(DISTINCT pe.session_id) AS unique_visitors,
    ROUND(AVG(pe.duration_ms) / 1000.0, 1) AS avg_duration_seconds
  FROM page_events pe
  WHERE pe.tool_slug IS NOT NULL
    AND pe.created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY pe.tool_slug
  ORDER BY view_count DESC;
$$;

-- RPC: daily_traffic
CREATE OR REPLACE FUNCTION daily_traffic(time_range_days int DEFAULT 30)
RETURNS TABLE (
  day date,
  view_count bigint,
  unique_visitors bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    DATE(created_at) AS day,
    COUNT(*) AS view_count,
    COUNT(DISTINCT session_id) AS unique_visitors
  FROM page_events
  WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY DATE(created_at)
  ORDER BY day;
$$;

-- RPC: device_breakdown
CREATE OR REPLACE FUNCTION device_breakdown(time_range_days int DEFAULT 30)
RETURNS TABLE (
  dimension text,
  label text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 'device_type' AS dimension, COALESCE(device_type, 'Unknown') AS label, COUNT(*) AS count
  FROM page_events WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY device_type
  UNION ALL
  SELECT 'browser' AS dimension, COALESCE(browser, 'Unknown') AS label, COUNT(*) AS count
  FROM page_events WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY browser
  UNION ALL
  SELECT 'os' AS dimension, COALESCE(os, 'Unknown') AS label, COUNT(*) AS count
  FROM page_events WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY os;
$$;

-- RPC: top_referrers
CREATE OR REPLACE FUNCTION top_referrers(time_range_days int DEFAULT 30)
RETURNS TABLE (
  referrer_domain text,
  visit_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(
      REGEXP_REPLACE(referrer, '^https?://([^/]+).*$', '\1'),
      'Direct'
    ) AS referrer_domain,
    COUNT(*) AS visit_count
  FROM page_events
  WHERE created_at >= now() - (time_range_days || ' days')::interval
  GROUP BY referrer_domain
  ORDER BY visit_count DESC
  LIMIT 20;
$$;

-- RPC: dashboard_summary
CREATE OR REPLACE FUNCTION dashboard_summary()
RETURNS TABLE (
  total_views_30d bigint,
  unique_visitors_30d bigint,
  avg_duration_30d numeric,
  total_views_7d bigint,
  unique_visitors_7d bigint,
  avg_duration_7d numeric,
  active_today bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    (SELECT COUNT(*) FROM page_events WHERE created_at >= now() - interval '30 days'),
    (SELECT COUNT(DISTINCT session_id) FROM page_events WHERE created_at >= now() - interval '30 days'),
    (SELECT ROUND(AVG(duration_ms) / 1000.0, 1) FROM page_events WHERE created_at >= now() - interval '30 days' AND duration_ms IS NOT NULL),
    (SELECT COUNT(*) FROM page_events WHERE created_at >= now() - interval '7 days'),
    (SELECT COUNT(DISTINCT session_id) FROM page_events WHERE created_at >= now() - interval '7 days'),
    (SELECT ROUND(AVG(duration_ms) / 1000.0, 1) FROM page_events WHERE created_at >= now() - interval '7 days' AND duration_ms IS NOT NULL),
    (SELECT COUNT(DISTINCT session_id) FROM page_events WHERE created_at >= now() - interval '1 day');
$$;
```

**Step 2: Run migration in Supabase SQL Editor**

Go to the Supabase dashboard > SQL Editor > paste and run the migration. Verify all functions created successfully.

**Step 3: Enable email auth provider in Supabase**

Go to Supabase Dashboard > Authentication > Providers > Email > Enable. Disable "Confirm email" (for simplicity, admin is whitelisted anyway).

**Step 4: Create admin user**

In Supabase SQL Editor, or via the Auth UI, create the admin user:
- Email: `loicwong1982@gmail.com`
- Password: `Pa$$w0rd`

Via Supabase Dashboard > Authentication > Users > Add User > email + password.

**Step 5: Commit the migration file**

```bash
git add admin/supabase/migrations/001_page_events.sql
git commit -m "feat(admin): add page_events table and analytics RPC functions"
```

---

## Task 2: API — Install ua-parser-js and create tracking endpoint

**Files:**
- Modify: `package.json` (root — this is the client+API monolith)
- Create: `app/api/v1/analytics/track/route.ts`

**Note:** The toolk1t-client workspace root IS the Next.js app that also has API routes under `app/api/`. The tracking endpoint goes here since middleware.ts already handles CORS.

**Step 1: Install ua-parser-js**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm add ua-parser-js && pnpm add -D @types/ua-parser-js
```

**Step 2: Create the tracking endpoint**

Create `app/api/v1/analytics/track/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import UAParser from 'ua-parser-js'
import { createClient } from '@/lib/supabase/server'

const DEVICE_MAP: Record<string, string> = {
  console: 'desktop',
  mobile: 'mobile',
  tablet: 'tablet',
  smarttv: 'desktop',
  wearable: 'mobile',
  embedded: 'desktop',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { session_id, page_path, tool_slug, referrer, duration_ms } = body

    // Basic validation
    if (!session_id || typeof session_id !== 'string' || session_id.length > 100) {
      return NextResponse.json({ error: 'Invalid session_id' }, { status: 400 })
    }
    if (!page_path || typeof page_path !== 'string' || page_path.length > 500) {
      return NextResponse.json({ error: 'Invalid page_path' }, { status: 400 })
    }
    if (tool_slug !== undefined && tool_slug !== null && (typeof tool_slug !== 'string' || tool_slug.length > 100)) {
      return NextResponse.json({ error: 'Invalid tool_slug' }, { status: 400 })
    }
    if (duration_ms !== undefined && duration_ms !== null && (typeof duration_ms !== 'number' || duration_ms < 0 || duration_ms > 86400000)) {
      return NextResponse.json({ error: 'Invalid duration_ms' }, { status: 400 })
    }

    // Parse User-Agent
    const ua = new UAParser(request.headers.get('user-agent') || '')
    const deviceResult = ua.getDevice()
    const browserResult = ua.getBrowser()
    const osResult = ua.getOS()

    const device_type = DEVICE_MAP[deviceResult.type || ''] || 'desktop'
    const browser = browserResult.name || 'Unknown'
    const os = osResult.name || 'Unknown'

    // Insert into Supabase
    const supabase = await createClient()
    const { error } = await supabase.from('page_events').insert({
      session_id,
      page_path,
      tool_slug: tool_slug || null,
      referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : null,
      duration_ms: typeof duration_ms === 'number' ? Math.round(duration_ms) : null,
      device_type,
      browser,
      os,
    })

    if (error) {
      console.error('Analytics insert error:', error.message)
      return new NextResponse(null, { status: 204 })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
```

**Step 3: Verify build passes**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add app/api/v1/analytics/track/route.ts package.json pnpm-lock.yaml
git commit -m "feat(api): add analytics tracking endpoint with UA parsing"
```

---

## Task 3: Client — Create usePageTracker hook

**Files:**
- Create: `lib/hooks/use-page-tracker.ts`
- Modify: `app/layout.tsx` (add the tracker component)

**Step 1: Create the tracker hook**

Create `lib/hooks/use-page-tracker.ts`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const TRACK_ENDPOINT = `${API_URL}/api/v1/analytics/track`

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('tk_sid')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('tk_sid', id)
  }
  return id
}

function extractToolSlug(path: string): string | null {
  const match = path.match(/^\/tools\/([^/]+)/)
  return match ? match[1] : null
}

function sendEvent(data: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(data)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_ENDPOINT, new Blob([payload], { type: 'application/json' }))
    } else {
      fetch(TRACK_ENDPOINT, { method: 'POST', body: payload, keepalive: true })
    }
  } catch {
    // Silent fail — analytics should never break the app
  }
}

export function PageTracker() {
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())
  const pathnameRef = useRef<string>(pathname)

  useEffect(() => {
    const sessionId = getSessionId()
    if (!sessionId) return

    // Track page entry
    startTimeRef.current = Date.now()
    pathnameRef.current = pathname

    const sendLeaveEvent = () => {
      const duration_ms = Date.now() - startTimeRef.current
      sendEvent({
        session_id: sessionId,
        page_path: pathnameRef.current,
        tool_slug: extractToolSlug(pathnameRef.current),
        referrer: document.referrer || null,
        duration_ms,
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendLeaveEvent()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sendLeaveEvent()
    }
  }, [pathname])

  return null
}
```

**Step 2: Add PageTracker to root layout**

Modify `app/layout.tsx` — add import and render `<PageTracker />` before the closing `</body>`:

```tsx
import { PageTracker } from "@/lib/hooks/use-page-tracker";
```

Add inside `<body>`, after `<ProfilePrompt />`:

```tsx
<PageTracker />
```

**Step 3: Verify build passes**

```bash
pnpm build
```

**Step 4: Commit**

```bash
git add lib/hooks/use-page-tracker.ts app/layout.tsx
git commit -m "feat(client): add page tracking hook with sendBeacon"
```

---

## Task 4: Admin — Add email/password login

**Files:**
- Modify: `admin/lib/supabase/auth.ts` (add signInWithEmail)
- Modify: `admin/app/login/login-form.tsx` (add email/password form)

**Step 1: Add signInWithEmail to auth.ts**

Add to `admin/lib/supabase/auth.ts`:

```typescript
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}
```

**Step 2: Rewrite login-form.tsx with email/password + Google OAuth**

Rewrite `admin/app/login/login-form.tsx`:

```tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithGoogle, signInWithEmail } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAILS = ['loicwong1982@gmail.com']

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        router.replace('/analytics')
      }
    })
  }, [router])

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'unauthorized') {
      setError('Access denied. This account is not authorized as an admin.')
    } else if (err === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    }
  }, [searchParams])

  const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { user } = await signInWithEmail(email, password)
      if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
        const supabase = createClient()
        await supabase.auth.signOut()
        setError('Access denied. This account is not authorized as an admin.')
        setLoading(false)
        return
      }
      router.replace('/analytics')
    } catch (err) {
      console.error('Email sign-in failed:', err)
      setError('Invalid email or password.')
      setLoading(false)
    }
  }, [email, password, router])

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Google sign-in failed:', err)
      setError('Sign-in failed. Please try again.')
      setLoading(false)
    }
  }, [])

  const inputClass =
    'w-full px-4 py-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]'

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white mb-4">
          <svg className="w-7 h-7 text-white dark:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Toolk1t Admin</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Sign in to access the admin portal</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        {error && (
          <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email / Password form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input id="email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} autoComplete="email" />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} autoComplete="current-password" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-zinc-700" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 dark:text-zinc-500">or</span></div>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full px-5 py-3 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-colors shadow-sm cursor-pointer min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-4">
          Only authorized administrators can access this portal.
        </p>
      </div>
    </div>
  )
}
```

**Step 3: Verify admin build passes**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace/admin && pnpm build
```

**Step 4: Commit**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace && git add admin/lib/supabase/auth.ts admin/app/login/login-form.tsx
git commit -m "feat(admin): add email/password login alongside Google OAuth"
```

---

## Task 5: Admin — Create sidebar layout shell

**Files:**
- Create: `admin/app/(admin)/layout.tsx` (sidebar + top bar + auth guard)
- Create: `admin/components/admin-sidebar.tsx`
- Create: `admin/components/admin-topbar.tsx`

**Step 1: Create admin-sidebar.tsx**

Create `admin/components/admin-sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { href: '/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

interface Props {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onToggle} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-zinc-900 border-r border-zinc-800 transition-all duration-200 flex flex-col
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-64 translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-zinc-800 shrink-0">
          {!collapsed && (
            <span className="text-lg font-bold text-white">Toolk1t</span>
          )}
          <button
            onClick={onToggle}
            className="ml-auto p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors hidden lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/' || pathname === ''
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) onToggle() }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]
                  ${isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }
                  ${collapsed ? 'lg:justify-center' : ''}`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
```

**Step 2: Create admin-topbar.tsx**

Create `admin/components/admin-topbar.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/supabase/auth'

interface Props {
  email: string
  sidebarCollapsed: boolean
  onMenuToggle: () => void
}

export function AdminTopbar({ email, sidebarCollapsed, onMenuToggle }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 flex items-center px-4 gap-4 transition-all duration-200
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Admin info + logout */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400 hidden sm:inline">{email}</span>
        <button
          onClick={handleSignOut}
          className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors min-h-[44px]"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
```

**Step 3: Create the admin layout group**

Create `admin/app/(admin)/layout.tsx`:

```tsx
import { requireAdmin } from '@/lib/auth-guard'
import { AdminShell } from './admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return (
    <AdminShell email={user.email ?? 'Admin'}>
      {children}
    </AdminShell>
  )
}
```

Create `admin/app/(admin)/admin-shell.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminTopbar } from '@/components/admin-topbar'

interface Props {
  email: string
  children: React.ReactNode
}

export function AdminShell({ email, children }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <AdminTopbar email={email} sidebarCollapsed={collapsed} onMenuToggle={() => setCollapsed((c) => !c)} />
      <main className={`transition-all duration-200 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add admin/components/admin-sidebar.tsx admin/components/admin-topbar.tsx admin/app/\(admin\)/layout.tsx admin/app/\(admin\)/admin-shell.tsx
git commit -m "feat(admin): add sidebar layout shell with responsive navigation"
```

---

## Task 6: Admin — Create Dashboard overview page

**Files:**
- Create: `admin/app/(admin)/page.tsx`
- Modify: `admin/lib/analytics.ts` (add fetchDashboardSummary, fetchTopTools)

**Step 1: Add new data fetchers to analytics.ts**

Add to `admin/lib/analytics.ts`:

```typescript
export async function fetchDashboardSummary() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('dashboard_summary')
  if (error) throw error
  return data?.[0] ?? {
    total_views_30d: 0,
    unique_visitors_30d: 0,
    avg_duration_30d: 0,
    total_views_7d: 0,
    unique_visitors_7d: 0,
    avg_duration_7d: 0,
    active_today: 0,
  }
}

export async function fetchTopTools(days: number = 30, limit: number = 5) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('tool_popularity', { time_range_days: days })
  if (error) throw error
  return (data ?? []).slice(0, limit)
}
```

**Step 2: Create dashboard page**

Create `admin/app/(admin)/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { fetchDashboardSummary, fetchTopTools, fetchDailyTraffic } from '@/lib/analytics'
import { DashboardOverview } from './dashboard-overview'

export const metadata: Metadata = {
  title: 'Dashboard | Toolk1t Admin',
}

export default async function DashboardPage() {
  const [summary, topTools, traffic7d] = await Promise.all([
    fetchDashboardSummary(),
    fetchTopTools(30, 5),
    fetchDailyTraffic(7),
  ])

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>
      <DashboardOverview summary={summary} topTools={topTools} traffic7d={traffic7d} />
    </>
  )
}
```

**Step 3: Create dashboard-overview.tsx client component**

Create `admin/app/(admin)/dashboard-overview.tsx`:

```tsx
'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface Summary {
  total_views_30d: number
  unique_visitors_30d: number
  avg_duration_30d: number | null
  total_views_7d: number
  unique_visitors_7d: number
  avg_duration_7d: number | null
  active_today: number
}

interface ToolRow {
  tool_slug: string
  tool_name: string
  view_count: number
  unique_visitors: number
  avg_duration_seconds: number
}

interface TrafficRow {
  day: string
  view_count: number
  unique_visitors: number
}

interface Props {
  summary: Summary
  topTools: ToolRow[]
  traffic7d: TrafficRow[]
}

export function DashboardOverview({ summary, topTools, traffic7d }: Props) {
  const cards = [
    { label: 'Page Views (30d)', value: summary.total_views_30d.toLocaleString(), sub: `${summary.total_views_7d.toLocaleString()} this week` },
    { label: 'Unique Visitors (30d)', value: summary.unique_visitors_30d.toLocaleString(), sub: `${summary.unique_visitors_7d.toLocaleString()} this week` },
    { label: 'Avg Stay Time (30d)', value: summary.avg_duration_30d ? `${summary.avg_duration_30d}s` : '—', sub: summary.avg_duration_7d ? `${summary.avg_duration_7d}s this week` : '—' },
    { label: 'Active Today', value: summary.active_today.toLocaleString(), sub: 'unique sessions' },
  ]

  return (
    <div className="space-y-8">
      {/* Summary cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm">
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 7-day traffic sparkline */}
      {traffic7d.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">Last 7 Days Traffic</h2>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={traffic7d}>
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fafafa' }}
                labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
              />
              <Line type="monotone" dataKey="view_count" name="Views" stroke="#3D6AF2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="unique_visitors" name="Visitors" stroke="#32A9D9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 tools */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-400">Top Tools (30 days)</h2>
        </div>
        {topTools.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {topTools.map((tool, i) => (
              <div key={tool.tool_slug} className="flex items-center gap-4 px-6 py-3">
                <span className="text-sm font-mono text-zinc-500 w-6">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-white">{tool.tool_name}</span>
                <span className="text-sm text-zinc-400">{tool.view_count.toLocaleString()} views</span>
                <span className="text-sm text-zinc-500">{Math.round(tool.avg_duration_seconds)}s avg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-zinc-500 text-center">No data yet.</p>
        )}
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add admin/lib/analytics.ts admin/app/\(admin\)/page.tsx admin/app/\(admin\)/dashboard-overview.tsx
git commit -m "feat(admin): add dashboard overview with summary cards and sparklines"
```

---

## Task 7: Admin — Move and enhance Analytics page

**Files:**
- Move: `admin/app/analytics/` → `admin/app/(admin)/analytics/`
- Modify: `admin/lib/analytics.ts` (add fetchDeviceBreakdown, fetchTopReferrers)
- Modify: `admin/app/(admin)/analytics/analytics-dashboard.tsx` (add period selector, device breakdown, referrers)

**Step 1: Add new fetchers to analytics.ts**

Add to `admin/lib/analytics.ts`:

```typescript
export async function fetchDeviceBreakdown(days: number = 30) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('device_breakdown', { time_range_days: days })
  if (error) throw error
  return data ?? []
}

export async function fetchTopReferrers(days: number = 30) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('top_referrers', { time_range_days: days })
  if (error) throw error
  return data ?? []
}
```

**Step 2: Move analytics into (admin) route group**

Move `admin/app/analytics/` directory to `admin/app/(admin)/analytics/`.

**Step 3: Update analytics page.tsx to pass period and new data**

Rewrite `admin/app/(admin)/analytics/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { fetchToolPopularity, fetchDailyTraffic, fetchDeviceBreakdown, fetchTopReferrers } from '@/lib/analytics'
import { AnalyticsDashboard } from './analytics-dashboard'

export const metadata: Metadata = {
  title: 'Analytics | Toolk1t Admin',
}

interface Props {
  searchParams: Promise<{ period?: string }>
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams
  const days = parseInt(params.period || '30', 10)
  const validDays = [7, 14, 30, 90].includes(days) ? days : 30

  const [popularity, traffic, devices, referrers] = await Promise.all([
    fetchToolPopularity(validDays),
    fetchDailyTraffic(validDays),
    fetchDeviceBreakdown(validDays),
    fetchTopReferrers(validDays),
  ])

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">Analytics</h1>
      <AnalyticsDashboard
        popularity={popularity}
        traffic={traffic}
        devices={devices}
        referrers={referrers}
        period={validDays}
      />
    </>
  )
}
```

**Step 4: Rewrite analytics-dashboard.tsx**

Rewrite `admin/app/(admin)/analytics/analytics-dashboard.tsx` with:
- Period selector (7d/14d/30d/90d) that updates URL search params
- Tool Popularity bar chart + sortable table (existing, keep as-is)
- Daily Traffic line chart with views + unique visitors (enhance existing)
- Device Breakdown: 3 pie/donut charts (device type, browser, OS)
- Top Referrers table (new)

The existing component is already well-structured. Key changes:
- Replace `userStats` and `demographics` props with `devices`, `referrers`, `period`
- Add `PeriodSelector` sub-component that uses `useRouter` to update `?period=X`
- Replace `DemographicsSection` with `DeviceBreakdownSection` (uses `devices` prop)
- Add `ReferrersTable` sub-component
- Keep `PopularityTable` as-is
- Add second line to traffic chart for unique visitors

Full code is in the design doc — the engineer should reference the existing component at `admin/app/analytics/analytics-dashboard.tsx` and adapt it with the changes above.

**Step 5: Delete old analytics directory**

Delete `admin/app/analytics/` (the one outside `(admin)` group).

**Step 6: Update root page.tsx redirect**

Update `admin/app/page.tsx` to redirect to `/` instead of `/analytics` (since the dashboard is now at `/`):

The root page should still redirect authenticated users to `/` (which is the dashboard inside `(admin)`), and unauthenticated to `/login`.

**Step 7: Verify build**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace/admin && pnpm build
```

**Step 8: Commit**

```bash
git add admin/app/\(admin\)/analytics/ admin/lib/analytics.ts admin/app/page.tsx
git rm -r admin/app/analytics/
git commit -m "feat(admin): enhance analytics with period selector, device breakdown, referrers"
```

---

## Task 8: Admin — Create Settings placeholder page

**Files:**
- Create: `admin/app/(admin)/settings/page.tsx`

**Step 1: Create settings page**

Create `admin/app/(admin)/settings/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Toolk1t Admin',
}

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
        <p className="text-zinc-400">Settings coming soon.</p>
      </div>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add admin/app/\(admin\)/settings/page.tsx
git commit -m "feat(admin): add settings placeholder page"
```

---

## Task 9: Final verification and build check

**Step 1: Build all apps**

```bash
cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm build
cd /Users/mercury/WebstormProjects/handytool-workspace/admin && pnpm build
```

**Step 2: Manual smoke test**

- Start client: `pnpm dev` (port 3000) — visit a few tool pages, check browser console for sendBeacon calls
- Start admin: `cd admin && pnpm dev` (port 3002) — login with email/password, verify redirect to dashboard, check sidebar navigation, verify analytics page loads

**Step 3: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix(admin): final adjustments after smoke test"
```
