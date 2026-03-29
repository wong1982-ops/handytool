# AI Usage Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI Usage dashboard to the admin portal that shows credit consumption, call volume, per-tool drill-down, and per-user detail pages.

**Architecture:** Server-side page fetches data from admin API routes, which query `credit_transactions` via the admin Supabase client (service role). Client component renders charts with Recharts. No new Supabase RPC functions — use direct queries through the admin client for simplicity and to avoid migration complexity.

**Tech Stack:** Next.js 16 App Router, React 19, Recharts, Tailwind CSS v4, Supabase admin client

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `admin/lib/ai-usage.ts` | Tool category mapping, date helpers, shared types |
| Create | `admin/app/api/ai-usage/summary/route.ts` | Summary cards data (calls, credits, users, avg) |
| Create | `admin/app/api/ai-usage/daily/route.ts` | Daily time-series for line chart |
| Create | `admin/app/api/ai-usage/by-tool/route.ts` | Per-tool breakdown |
| Create | `admin/app/api/ai-usage/top-users/route.ts` | Top users by credit consumption |
| Create | `admin/app/api/ai-usage/users/[id]/route.ts` | Per-user transaction history (paginated) |
| Create | `admin/app/(admin)/ai-usage/page.tsx` | Main dashboard server page |
| Create | `admin/app/(admin)/ai-usage/ai-usage-dashboard.tsx` | Main dashboard client component |
| Create | `admin/app/(admin)/ai-usage/users/[id]/page.tsx` | User detail server page |
| Create | `admin/app/(admin)/ai-usage/users/[id]/user-usage-detail.tsx` | User detail client component |
| Modify | `admin/components/admin-sidebar.tsx` | Add "AI Usage" nav item |

---

### Task 1: Shared Types & Tool Category Mapping

**Files:**
- Create: `admin/lib/ai-usage.ts`

- [ ] **Step 1: Create the shared module**

```typescript
// admin/lib/ai-usage.ts

/* ---------- Tool category mapping ---------- */

export const TOOL_CATEGORIES: Record<string, string> = {
  'component-lab': 'Component Lab',
  'ecard-ai': 'E-Card Generator',
  'favicon': 'Favicon Generator',
  'font-generator': 'Font Generator',
  'id-photo': 'ID Photo',
  'image-editor': 'Image Editor',
  'logo-generator': 'Logo Generator',
  'mood-board': 'Mood Board',
  'music-studio': 'Music Studio',
  'palette': 'Color Palette',
  'sketch-to-art': 'Sketch to Art',
  'story': 'Story Video',
  'tax-manager': 'Tax Manager',
  'vblog': 'VBlog Studio',
}

// Sorted longest-first so "image-editor" matches before "image"
const SORTED_PREFIXES = Object.keys(TOOL_CATEGORIES).sort((a, b) => b.length - a.length)

/** Extract tool category from a tool_id like "image-editor-inpaint" → "image-editor" */
export function getToolCategory(toolId: string): string {
  for (const prefix of SORTED_PREFIXES) {
    if (toolId === prefix || toolId.startsWith(prefix + '-')) {
      return prefix
    }
  }
  return toolId
}

/** Get display name for a tool_id */
export function getToolDisplayName(toolId: string): string {
  const category = getToolCategory(toolId)
  return TOOL_CATEGORIES[category] ?? toolId
}

/** Extract operation name from tool_id: "image-editor-inpaint" → "inpaint" */
export function getOperationName(toolId: string): string {
  const category = getToolCategory(toolId)
  if (toolId === category) return 'default'
  return toolId.slice(category.length + 1) || 'default'
}

/* ---------- Date helpers ---------- */

export function getDateRange(preset: string, from?: string, to?: string): { from: string; to: string } {
  if (from && to) {
    return { from: new Date(from).toISOString(), to: new Date(to + 'T23:59:59.999Z').toISOString() }
  }
  const now = new Date()
  const days = parseInt(preset, 10) || 30
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  return { from: start.toISOString(), to: now.toISOString() }
}

export function getPreviousPeriodRange(from: string, to: string): { from: string; to: string } {
  const fromDate = new Date(from)
  const toDate = new Date(to)
  const durationMs = toDate.getTime() - fromDate.getTime()
  const prevTo = new Date(fromDate.getTime())
  const prevFrom = new Date(fromDate.getTime() - durationMs)
  return { from: prevFrom.toISOString(), to: prevTo.toISOString() }
}

/* ---------- Shared types ---------- */

export interface UsageSummary {
  total_calls: number
  total_credits: number
  unique_users: number
  avg_credits_per_call: number
}

export interface DailyUsageRow {
  date: string
  call_count: number
  total_credits: number
}

export interface ToolUsageRow {
  tool_id: string
  call_count: number
  total_credits: number
}

export interface TopUserRow {
  user_id: string
  email: string
  display_name: string | null
  call_count: number
  total_credits: number
  most_used_tool: string
  last_active: string
}

export interface UserTransactionRow {
  id: string
  tool_id: string
  amount: number
  description: string | null
  created_at: string
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/lib/ai-usage.ts
git commit -m "feat(admin): add AI usage shared types and tool category mapping"
```

---

### Task 2: API — Summary Endpoint

**Files:**
- Create: `admin/app/api/ai-usage/summary/route.ts`

- [ ] **Step 1: Create the summary API route**

```typescript
// admin/app/api/ai-usage/summary/route.ts
import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const params = request.nextUrl.searchParams
  const { from, to } = getDateRange(
    params.get('preset') ?? '30',
    params.get('from') ?? undefined,
    params.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  const { data: rows, error: queryError } = await admin
    .from('credit_transactions')
    .select('user_id, amount')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)

  if (queryError) {
    console.error('[ai-usage/summary]', queryError)
    return API_ERRORS.INTERNAL()
  }

  const txns = rows ?? []
  const total_calls = txns.length
  const total_credits = txns.reduce((sum, r) => sum + Math.abs(r.amount), 0)
  const unique_users = new Set(txns.map((r) => r.user_id)).size
  const avg_credits_per_call = total_calls > 0 ? Math.round((total_credits / total_calls) * 10) / 10 : 0

  return apiSuccess({ total_calls, total_credits, unique_users, avg_credits_per_call })
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/api/ai-usage/summary/route.ts
git commit -m "feat(admin): add AI usage summary API endpoint"
```

---

### Task 3: API — Daily Time-Series Endpoint

**Files:**
- Create: `admin/app/api/ai-usage/daily/route.ts`

- [ ] **Step 1: Create the daily API route**

```typescript
// admin/app/api/ai-usage/daily/route.ts
import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const params = request.nextUrl.searchParams
  const { from, to } = getDateRange(
    params.get('preset') ?? '30',
    params.get('from') ?? undefined,
    params.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  const { data: rows, error: queryError } = await admin
    .from('credit_transactions')
    .select('amount, created_at')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)
    .order('created_at', { ascending: true })

  if (queryError) {
    console.error('[ai-usage/daily]', queryError)
    return API_ERRORS.INTERNAL()
  }

  // Group by day
  const byDay = new Map<string, { call_count: number; total_credits: number }>()
  for (const row of rows ?? []) {
    const day = row.created_at.slice(0, 10) // "YYYY-MM-DD"
    const entry = byDay.get(day) ?? { call_count: 0, total_credits: 0 }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    byDay.set(day, entry)
  }

  const daily = Array.from(byDay.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return apiSuccess(daily)
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/api/ai-usage/daily/route.ts
git commit -m "feat(admin): add AI usage daily time-series API endpoint"
```

---

### Task 4: API — Tool Breakdown Endpoint

**Files:**
- Create: `admin/app/api/ai-usage/by-tool/route.ts`

- [ ] **Step 1: Create the by-tool API route**

```typescript
// admin/app/api/ai-usage/by-tool/route.ts
import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const params = request.nextUrl.searchParams
  const { from, to } = getDateRange(
    params.get('preset') ?? '30',
    params.get('from') ?? undefined,
    params.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  const { data: rows, error: queryError } = await admin
    .from('credit_transactions')
    .select('tool_id, amount')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)

  if (queryError) {
    console.error('[ai-usage/by-tool]', queryError)
    return API_ERRORS.INTERNAL()
  }

  // Group by tool_id
  const byTool = new Map<string, { call_count: number; total_credits: number }>()
  for (const row of rows ?? []) {
    const tid = row.tool_id ?? 'unknown'
    const entry = byTool.get(tid) ?? { call_count: 0, total_credits: 0 }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    byTool.set(tid, entry)
  }

  const tools = Array.from(byTool.entries())
    .map(([tool_id, vals]) => ({ tool_id, ...vals }))
    .sort((a, b) => b.total_credits - a.total_credits)

  return apiSuccess(tools)
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/api/ai-usage/by-tool/route.ts
git commit -m "feat(admin): add AI usage by-tool API endpoint"
```

---

### Task 5: API — Top Users Endpoint

**Files:**
- Create: `admin/app/api/ai-usage/top-users/route.ts`

- [ ] **Step 1: Create the top-users API route**

```typescript
// admin/app/api/ai-usage/top-users/route.ts
import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const params = request.nextUrl.searchParams
  const limit = Math.min(parseInt(params.get('limit') ?? '20', 10), 100)
  const { from, to } = getDateRange(
    params.get('preset') ?? '30',
    params.get('from') ?? undefined,
    params.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  // Fetch usage transactions in range
  const { data: rows, error: queryError } = await admin
    .from('credit_transactions')
    .select('user_id, tool_id, amount, created_at')
    .eq('type', 'usage')
    .gte('created_at', from)
    .lt('created_at', to)

  if (queryError) {
    console.error('[ai-usage/top-users]', queryError)
    return API_ERRORS.INTERNAL()
  }

  // Aggregate by user
  const byUser = new Map<string, {
    call_count: number
    total_credits: number
    tool_counts: Map<string, number>
    last_active: string
  }>()

  for (const row of rows ?? []) {
    const uid = row.user_id
    const entry = byUser.get(uid) ?? {
      call_count: 0,
      total_credits: 0,
      tool_counts: new Map(),
      last_active: row.created_at,
    }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    entry.tool_counts.set(row.tool_id ?? 'unknown', (entry.tool_counts.get(row.tool_id ?? 'unknown') ?? 0) + 1)
    if (row.created_at > entry.last_active) entry.last_active = row.created_at
    byUser.set(uid, entry)
  }

  // Sort by total credits, take top N
  const sorted = Array.from(byUser.entries())
    .sort((a, b) => b[1].total_credits - a[1].total_credits)
    .slice(0, limit)

  // Fetch user emails for the top users
  const userIds = sorted.map(([uid]) => uid)
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 100 })
  const userMap = new Map<string, { email: string; display_name: string | null }>()
  for (const u of users?.users ?? []) {
    if (userIds.includes(u.id)) {
      userMap.set(u.id, {
        email: u.email ?? 'unknown',
        display_name: (u.user_metadata?.display_name as string) ?? (u.user_metadata?.full_name as string) ?? null,
      })
    }
  }

  const topUsers = sorted.map(([uid, data]) => {
    // Find most used tool
    let mostUsedTool = 'unknown'
    let maxCount = 0
    for (const [tool, count] of data.tool_counts) {
      if (count > maxCount) { mostUsedTool = tool; maxCount = count }
    }

    const userInfo = userMap.get(uid)
    return {
      user_id: uid,
      email: userInfo?.email ?? 'unknown',
      display_name: userInfo?.display_name ?? null,
      call_count: data.call_count,
      total_credits: data.total_credits,
      most_used_tool: mostUsedTool,
      last_active: data.last_active,
    }
  })

  return apiSuccess(topUsers)
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/api/ai-usage/top-users/route.ts
git commit -m "feat(admin): add AI usage top-users API endpoint"
```

---

### Task 6: API — User Transactions Endpoint

**Files:**
- Create: `admin/app/api/ai-usage/users/[id]/route.ts`

- [ ] **Step 1: Create the per-user transactions API route**

```typescript
// admin/app/api/ai-usage/users/[id]/route.ts
import { NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/api/admin-auth'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDateRange } from '@/lib/ai-usage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi()
  if (error) return API_ERRORS.UNAUTHORIZED()

  const { id: userId } = await params
  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = 20
  const offset = (page - 1) * perPage

  const { from, to } = getDateRange(
    searchParams.get('preset') ?? '30',
    searchParams.get('from') ?? undefined,
    searchParams.get('to') ?? undefined,
  )

  const admin = createAdminClient()

  // Fetch user info
  const { data: { user } } = await admin.auth.admin.getUserById(userId)
  const email = user?.email ?? 'unknown'
  const display_name = (user?.user_metadata?.display_name as string)
    ?? (user?.user_metadata?.full_name as string)
    ?? null

  // Fetch transactions with count
  const { data: rows, error: queryError, count } = await admin
    .from('credit_transactions')
    .select('id, tool_id, amount, description, created_at', { count: 'exact' })
    .eq('type', 'usage')
    .eq('user_id', userId)
    .gte('created_at', from)
    .lt('created_at', to)
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (queryError) {
    console.error('[ai-usage/users/id]', queryError)
    return API_ERRORS.INTERNAL()
  }

  // Also fetch summary for this user
  const { data: allRows } = await admin
    .from('credit_transactions')
    .select('tool_id, amount, created_at')
    .eq('type', 'usage')
    .eq('user_id', userId)
    .gte('created_at', from)
    .lt('created_at', to)

  const txns = allRows ?? []
  const total_calls = txns.length
  const total_credits = txns.reduce((sum, r) => sum + Math.abs(r.amount), 0)

  // Per-tool breakdown
  const byTool = new Map<string, { call_count: number; total_credits: number }>()
  for (const row of txns) {
    const tid = row.tool_id ?? 'unknown'
    const entry = byTool.get(tid) ?? { call_count: 0, total_credits: 0 }
    entry.call_count++
    entry.total_credits += Math.abs(row.amount)
    byTool.set(tid, entry)
  }

  const toolBreakdown = Array.from(byTool.entries())
    .map(([tool_id, vals]) => ({ tool_id, ...vals }))
    .sort((a, b) => b.total_credits - a.total_credits)

  // Find favorite tool and date range
  let favoriteTool = 'none'
  let maxCalls = 0
  for (const [tool, data] of byTool) {
    if (data.call_count > maxCalls) { favoriteTool = tool; maxCalls = data.call_count }
  }
  const firstActive = txns.length ? txns.reduce((min, r) => r.created_at < min ? r.created_at : min, txns[0].created_at) : null
  const lastActive = txns.length ? txns.reduce((max, r) => r.created_at > max ? r.created_at : max, txns[0].created_at) : null

  return apiSuccess({
    user: { user_id: userId, email, display_name },
    summary: { total_calls, total_credits, favorite_tool: favoriteTool, first_active: firstActive, last_active: lastActive },
    tool_breakdown: toolBreakdown,
    transactions: rows ?? [],
    pagination: { page, per_page: perPage, total: count ?? 0 },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/api/ai-usage/users/\[id\]/route.ts
git commit -m "feat(admin): add per-user AI usage transactions API endpoint"
```

---

### Task 7: Sidebar — Add AI Usage Nav Item

**Files:**
- Modify: `admin/components/admin-sidebar.tsx:6-9`

- [ ] **Step 1: Add AI Usage to NAV_ITEMS**

In `admin/components/admin-sidebar.tsx`, add an "AI Usage" item to `NAV_ITEMS` between Analytics and Settings:

```typescript
const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { href: '/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/ai-usage', label: 'AI Usage', icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.5' },
  { href: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]
```

- [ ] **Step 2: Commit**

```bash
git add admin/components/admin-sidebar.tsx
git commit -m "feat(admin): add AI Usage nav item to sidebar"
```

---

### Task 8: Main Dashboard — Server Page

**Files:**
- Create: `admin/app/(admin)/ai-usage/page.tsx`

- [ ] **Step 1: Create the server page**

```tsx
// admin/app/(admin)/ai-usage/page.tsx
import type { Metadata } from 'next'
import { AiUsageDashboard } from './ai-usage-dashboard'

export const metadata: Metadata = {
  title: 'AI Usage | Toolk1t Admin',
}

export default function AiUsagePage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-8">AI Usage</h1>
      <AiUsageDashboard />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/\(admin\)/ai-usage/page.tsx
git commit -m "feat(admin): add AI usage server page"
```

---

### Task 9: Main Dashboard — Client Component

**Files:**
- Create: `admin/app/(admin)/ai-usage/ai-usage-dashboard.tsx`

- [ ] **Step 1: Create the client dashboard component**

This is the largest file. It includes: period selector with custom date range, comparison toggle, summary cards with deltas, daily line chart, tool breakdown bar chart with expandable rows, and top users table.

```tsx
// admin/app/(admin)/ai-usage/ai-usage-dashboard.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { UsageSummary, DailyUsageRow, ToolUsageRow, TopUserRow } from '@/lib/ai-usage'
import { getToolCategory, getToolDisplayName, getOperationName, TOOL_CATEGORIES } from '@/lib/ai-usage'

/* ---------- Constants ---------- */

const BRAND_BLUE = '#3D6AF2'
const BRAND_TEAL = '#32A9D9'
const PRESETS = [7, 14, 30, 90]

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: 8,
  color: '#fafafa',
}

/* ---------- Helpers ---------- */

function buildParams(preset: number, customFrom: string, customTo: string, compare: boolean) {
  const p = new URLSearchParams()
  if (customFrom && customTo) {
    p.set('from', customFrom)
    p.set('to', customTo)
  } else {
    p.set('preset', String(preset))
  }
  return p.toString()
}

function delta(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const pct = Math.round(((current - previous) / previous) * 100)
  return pct >= 0 ? `+${pct}%` : `${pct}%`
}

/* ---------- Component ---------- */

export function AiUsageDashboard() {
  const [preset, setPreset] = useState(30)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [compare, setCompare] = useState(false)

  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [prevSummary, setPrevSummary] = useState<UsageSummary | null>(null)
  const [daily, setDaily] = useState<DailyUsageRow[]>([])
  const [byTool, setByTool] = useState<ToolUsageRow[]>([])
  const [topUsers, setTopUsers] = useState<TopUserRow[]>([])
  const [loading, setLoading] = useState(true)

  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const qs = useMemo(() => buildParams(preset, customFrom, customTo, compare), [preset, customFrom, customTo, compare])

  // Compute previous period params
  const prevQs = useMemo(() => {
    if (!compare) return ''
    if (customFrom && customTo) {
      const fromDate = new Date(customFrom)
      const toDate = new Date(customTo + 'T23:59:59.999Z')
      const durationMs = toDate.getTime() - fromDate.getTime()
      const prevTo = new Date(fromDate.getTime() - 1)
      const prevFrom = new Date(prevTo.getTime() - durationMs)
      const p = new URLSearchParams()
      p.set('from', prevFrom.toISOString().slice(0, 10))
      p.set('to', prevTo.toISOString().slice(0, 10))
      return p.toString()
    }
    // For presets, double the range
    const p = new URLSearchParams()
    p.set('preset', String(preset * 2))
    return p.toString()
  }, [compare, preset, customFrom, customTo])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, dailyRes, toolRes, usersRes] = await Promise.all([
        fetch(`/api/ai-usage/summary?${qs}`),
        fetch(`/api/ai-usage/daily?${qs}`),
        fetch(`/api/ai-usage/by-tool?${qs}`),
        fetch(`/api/ai-usage/top-users?${qs}`),
      ])

      const sumJson = await sumRes.json()
      const dailyJson = await dailyRes.json()
      const toolJson = await toolRes.json()
      const usersJson = await usersRes.json()

      setSummary(sumJson.data ?? null)
      setDaily(dailyJson.data ?? [])
      setByTool(toolJson.data ?? [])
      setTopUsers(usersJson.data ?? [])

      // Comparison period
      if (compare) {
        // For presets: fetch for double the period and we already have the current
        // Simpler: just fetch summary for the previous period
        const prevFrom = new Date()
        prevFrom.setDate(prevFrom.getDate() - preset * 2)
        const prevTo = new Date()
        prevTo.setDate(prevTo.getDate() - preset)
        const pp = new URLSearchParams()
        if (customFrom && customTo) {
          const fromDate = new Date(customFrom)
          const toDate = new Date(customTo + 'T23:59:59.999Z')
          const durationMs = toDate.getTime() - fromDate.getTime()
          const pTo = new Date(fromDate.getTime() - 1)
          const pFrom = new Date(pTo.getTime() - durationMs)
          pp.set('from', pFrom.toISOString().slice(0, 10))
          pp.set('to', pTo.toISOString().slice(0, 10))
        } else {
          pp.set('from', prevFrom.toISOString().slice(0, 10))
          pp.set('to', prevTo.toISOString().slice(0, 10))
        }
        const prevRes = await fetch(`/api/ai-usage/summary?${pp.toString()}`)
        const prevJson = await prevRes.json()
        setPrevSummary(prevJson.data ?? null)
      } else {
        setPrevSummary(null)
      }
    } catch (err) {
      console.error('Failed to fetch AI usage data:', err)
    }
    setLoading(false)
  }, [qs, compare, preset, customFrom, customTo])

  useEffect(() => { fetchData() }, [fetchData])

  /* ---------- Tool grouping for drill-down ---------- */

  const toolGroups = useMemo(() => {
    const groups = new Map<string, { call_count: number; total_credits: number; operations: ToolUsageRow[] }>()
    for (const row of byTool) {
      const cat = getToolCategory(row.tool_id)
      const group = groups.get(cat) ?? { call_count: 0, total_credits: 0, operations: [] }
      group.call_count += row.call_count
      group.total_credits += row.total_credits
      group.operations.push(row)
      groups.set(cat, group)
    }
    return Array.from(groups.entries())
      .map(([category, data]) => ({
        category,
        displayName: TOOL_CATEGORIES[category] ?? category,
        ...data,
      }))
      .sort((a, b) => b.total_credits - a.total_credits)
  }, [byTool])

  const barData = toolGroups.map((g) => ({
    name: g.displayName,
    credits: g.total_credits,
    calls: g.call_count,
    category: g.category,
  }))

  /* ---------- Render ---------- */

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-zinc-900 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setPreset(p); setCustomFrom(''); setCustomTo('') }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]
              ${preset === p && !customFrom
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
          >
            {p}d
          </button>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
          <span className="text-zinc-500">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="rounded border-zinc-600"
          />
          vs previous period
        </label>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { label: 'Total AI Calls', value: summary.total_calls, prev: prevSummary?.total_calls },
            { label: 'Credits Consumed', value: summary.total_credits, prev: prevSummary?.total_credits },
            { label: 'Unique Users', value: summary.unique_users, prev: prevSummary?.unique_users },
            { label: 'Avg Credits / Call', value: summary.avg_credits_per_call, prev: prevSummary?.avg_credits_per_call },
          ] as const).map((card) => (
            <div key={card.label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <p className="text-sm text-zinc-400 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
              {compare && card.prev !== undefined && card.prev !== null && (
                <p className={`text-xs mt-1 ${card.value >= card.prev ? 'text-emerald-400' : 'text-red-400'}`}>
                  {delta(card.value, card.prev)} vs prev
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Daily chart */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Usage Over Time</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis yAxisId="left" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="call_count" name="Calls" stroke={BRAND_BLUE} strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="total_credits" name="Credits" stroke={BRAND_TEAL} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tool breakdown */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tool Breakdown</h2>
        <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 48)}>
          <BarChart data={barData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#a1a1aa', fontSize: 12 }} width={110} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="credits" name="Credits" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} onClick={(data) => setExpandedTool(expandedTool === data.category ? null : data.category)} style={{ cursor: 'pointer' }} />
          </BarChart>
        </ResponsiveContainer>

        {/* Expandable table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">Tool</th>
                <th className="text-right py-2 px-3 font-medium">Calls</th>
                <th className="text-right py-2 px-3 font-medium">Credits</th>
                <th className="text-right py-2 px-3 font-medium">Avg / Call</th>
              </tr>
            </thead>
            <tbody>
              {toolGroups.map((group) => (
                <>
                  <tr
                    key={group.category}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer"
                    onClick={() => setExpandedTool(expandedTool === group.category ? null : group.category)}
                  >
                    <td className="py-2.5 px-3 text-white font-medium">
                      <span className="mr-2 text-zinc-500">{expandedTool === group.category ? '▼' : '▶'}</span>
                      {group.displayName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">{group.call_count}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">{group.total_credits}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      {group.call_count > 0 ? (group.total_credits / group.call_count).toFixed(1) : '0'}
                    </td>
                  </tr>
                  {expandedTool === group.category && group.operations.map((op) => (
                    <tr key={op.tool_id} className="border-b border-zinc-800/30 bg-zinc-800/10">
                      <td className="py-2 px-3 pl-10 text-zinc-400">{getOperationName(op.tool_id)}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">{op.call_count}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">{op.total_credits}</td>
                      <td className="py-2 px-3 text-right text-zinc-400">
                        {op.call_count > 0 ? (op.total_credits / op.call_count).toFixed(1) : '0'}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top users */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Top Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">User</th>
                <th className="text-right py-2 px-3 font-medium">Calls</th>
                <th className="text-right py-2 px-3 font-medium">Credits</th>
                <th className="text-left py-2 px-3 font-medium">Top Tool</th>
                <th className="text-left py-2 px-3 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-2.5 px-3">
                    <Link href={`/ai-usage/users/${user.user_id}`} className="text-blue-400 hover:underline">
                      {user.display_name ?? user.email}
                    </Link>
                    {user.display_name && <p className="text-xs text-zinc-500">{user.email}</p>}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{user.call_count}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{user.total_credits}</td>
                  <td className="py-2.5 px-3 text-zinc-300">{getToolDisplayName(user.most_used_tool)}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{new Date(user.last_active).toLocaleDateString()}</td>
                </tr>
              ))}
              {topUsers.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-500">No usage data in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/\(admin\)/ai-usage/ai-usage-dashboard.tsx
git commit -m "feat(admin): add AI usage dashboard client component with charts and drill-down"
```

---

### Task 10: User Detail — Server Page

**Files:**
- Create: `admin/app/(admin)/ai-usage/users/[id]/page.tsx`

- [ ] **Step 1: Create the user detail server page**

```tsx
// admin/app/(admin)/ai-usage/users/[id]/page.tsx
import type { Metadata } from 'next'
import { UserUsageDetail } from './user-usage-detail'

export const metadata: Metadata = {
  title: 'User AI Usage | Toolk1t Admin',
}

export default async function UserUsagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <UserUsageDetail userId={id} />
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/\(admin\)/ai-usage/users/\[id\]/page.tsx
git commit -m "feat(admin): add user AI usage detail server page"
```

---

### Task 11: User Detail — Client Component

**Files:**
- Create: `admin/app/(admin)/ai-usage/users/[id]/user-usage-detail.tsx`

- [ ] **Step 1: Create the user detail client component**

```tsx
// admin/app/(admin)/ai-usage/users/[id]/user-usage-detail.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { ToolUsageRow, UserTransactionRow } from '@/lib/ai-usage'
import { getToolCategory, getToolDisplayName, getOperationName, TOOL_CATEGORIES } from '@/lib/ai-usage'

const BRAND_BLUE = '#3D6AF2'
const PRESETS = [7, 14, 30, 90]

const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: 8,
  color: '#fafafa',
}

interface UserInfo {
  user_id: string
  email: string
  display_name: string | null
}

interface UserSummary {
  total_calls: number
  total_credits: number
  favorite_tool: string
  first_active: string | null
  last_active: string | null
}

interface PageData {
  user: UserInfo
  summary: UserSummary
  tool_breakdown: ToolUsageRow[]
  transactions: UserTransactionRow[]
  pagination: { page: number; per_page: number; total: number }
}

export function UserUsageDetail({ userId }: { userId: string }) {
  const [preset, setPreset] = useState(30)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (customFrom && customTo) {
      p.set('from', customFrom)
      p.set('to', customTo)
    } else {
      p.set('preset', String(preset))
    }
    p.set('page', String(page))

    try {
      const res = await fetch(`/api/ai-usage/users/${userId}?${p.toString()}`)
      const json = await res.json()
      setData(json.data ?? null)
    } catch (err) {
      console.error('Failed to fetch user usage:', err)
    }
    setLoading(false)
  }, [userId, preset, customFrom, customTo, page])

  useEffect(() => { fetchData() }, [fetchData])

  // Group tool breakdown by category
  const toolGroups = useMemo(() => {
    if (!data) return []
    const groups = new Map<string, { call_count: number; total_credits: number }>()
    for (const row of data.tool_breakdown) {
      const cat = getToolCategory(row.tool_id)
      const group = groups.get(cat) ?? { call_count: 0, total_credits: 0 }
      group.call_count += row.call_count
      group.total_credits += row.total_credits
      groups.set(cat, group)
    }
    return Array.from(groups.entries())
      .map(([cat, vals]) => ({ name: TOOL_CATEGORIES[cat] ?? cat, ...vals }))
      .sort((a, b) => b.total_credits - a.total_credits)
  }, [data])

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.per_page) : 0

  if (loading && !data) {
    return <div className="h-96 rounded-xl bg-zinc-900 animate-pulse" />
  }

  if (!data) {
    return <p className="text-zinc-400">No data found.</p>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ai-usage" className="text-zinc-400 hover:text-white transition-colors min-h-[44px] flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{data.user.display_name ?? data.user.email}</h1>
          {data.user.display_name && <p className="text-sm text-zinc-400">{data.user.email}</p>}
        </div>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setPreset(p); setCustomFrom(''); setCustomTo(''); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]
              ${preset === p && !customFrom
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
          >
            {p}d
          </button>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => { setCustomFrom(e.target.value); setPage(1) }}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
          <span className="text-zinc-500">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => { setCustomTo(e.target.value); setPage(1) }}
            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm border border-zinc-700 min-h-[44px]"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Total Calls</p>
          <p className="text-2xl font-bold text-white">{data.summary.total_calls.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Credits Consumed</p>
          <p className="text-2xl font-bold text-white">{data.summary.total_credits.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Favorite Tool</p>
          <p className="text-2xl font-bold text-white">{getToolDisplayName(data.summary.favorite_tool)}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-1">Last Active</p>
          <p className="text-2xl font-bold text-white">
            {data.summary.last_active ? new Date(data.summary.last_active).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {/* Tool breakdown chart */}
      {toolGroups.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Usage by Tool</h2>
          <ResponsiveContainer width="100%" height={Math.max(200, toolGroups.length * 48)}>
            <BarChart data={toolGroups} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#a1a1aa', fontSize: 12 }} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total_credits" name="Credits" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction history */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left py-2 px-3 font-medium">Date</th>
                <th className="text-left py-2 px-3 font-medium">Tool</th>
                <th className="text-left py-2 px-3 font-medium">Operation</th>
                <th className="text-right py-2 px-3 font-medium">Credits</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-2.5 px-3 text-zinc-300">
                    {new Date(txn.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">{getToolDisplayName(txn.tool_id)}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{getOperationName(txn.tool_id)}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{Math.abs(txn.amount)}</td>
                </tr>
              ))}
              {data.transactions.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-zinc-500">No transactions in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-400">
              Page {page} of {totalPages} ({data.pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm disabled:opacity-40 hover:bg-zinc-700 transition-colors min-h-[44px]"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm disabled:opacity-40 hover:bg-zinc-700 transition-colors min-h-[44px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/app/\(admin\)/ai-usage/users/\[id\]/user-usage-detail.tsx
git commit -m "feat(admin): add per-user AI usage detail page with tool breakdown and transactions"
```

---

### Task 12: Build Verification

- [ ] **Step 1: Run the admin build to verify no TypeScript errors**

```bash
cd admin && pnpm build
```

Expected: Build completes successfully with no type errors.

- [ ] **Step 2: Fix any build errors if found**

Common issues to watch for:
- Missing Recharts import (should already be a dependency in admin)
- Fragment key warnings in the expandable table (use `key` on the fragment wrapping `<tr>` pairs)

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A && git commit -m "fix(admin): resolve build issues in AI usage dashboard"
```
