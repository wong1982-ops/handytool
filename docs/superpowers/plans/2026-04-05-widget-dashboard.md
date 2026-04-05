# Widget Dashboard (Phase 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a customizable widget dashboard where users arrange smart shortcut cards for all tools in a drag-and-drop grid, with layout persistence and a condensed homepage integration.

**Architecture:** Dashboard page at `/dashboard` uses ToolFrame. Grid powered by `@dnd-kit/sortable`. Each tool gets a smart shortcut card (3 sizes). Layout saved to Supabase via debounced auto-save. Homepage shows condensed 6-widget grid for logged-in users.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, @dnd-kit/core + @dnd-kit/sortable (already installed), Supabase.

**Spec:** `docs/superpowers/specs/2026-04-05-widget-dashboard.md`

---

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `tools/dashboard/types.ts` | Dashboard types (DashboardWidget, DashboardLayout) |
| `tools/dashboard/default-layout.ts` | Default 6-widget layout for new users |
| `tools/dashboard/use-dashboard.ts` | Layout state hook (fetch, update, auto-save) |
| `tools/dashboard/dashboard-grid.tsx` | Main drag-and-drop grid |
| `tools/dashboard/widget-card.tsx` | Widget card component (small/medium/large) |
| `tools/dashboard/add-widget-drawer.tsx` | Widget picker drawer |
| `tools/dashboard/dashboard-toolbar.tsx` | Toolbar (add widget, reset, count) |
| `app/dashboard/page.tsx` | Dashboard route page |
| `app/api/v1/dashboard/layout/route.ts` | Layout CRUD API |
| `supabase/migrations/039_dashboard_layouts.sql` | Database table |
| `components/home/dashboard-preview.tsx` | Condensed homepage widget grid |

### Modified Files
| File | Changes |
|---|---|
| `app/page.tsx` | Add DashboardPreview for logged-in users |
| `components/layout/tool-categories.ts` | Add 'dashboard' to category map |

---

## Task 1: Types, Default Layout, Database

**Files:**
- Create: `tools/dashboard/types.ts`
- Create: `tools/dashboard/default-layout.ts`
- Create: `supabase/migrations/039_dashboard_layouts.sql`

- [ ] **Step 1: Create types.ts**

```typescript
// tools/dashboard/types.ts

export type WidgetSize = 'small' | 'medium' | 'large'

export interface DashboardWidget {
  id: string
  toolSlug: string
  size: WidgetSize
  order: number  // sort order in the grid
}

export interface ToolActivity {
  toolSlug: string
  lastUsed: string | null   // ISO date
  usageCount: number        // in last 30 days
}

export const MAX_WIDGETS = 12

export const WIDGET_SIZES: { id: WidgetSize; label: string; cols: number; rows: number }[] = [
  { id: 'small', label: 'Small', cols: 1, rows: 1 },
  { id: 'medium', label: 'Medium', cols: 2, rows: 1 },
  { id: 'large', label: 'Large', cols: 2, rows: 2 },
]
```

- [ ] **Step 2: Create default-layout.ts**

```typescript
// tools/dashboard/default-layout.ts
import type { DashboardWidget } from './types'

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w-1', toolSlug: 'json-converter', size: 'medium', order: 0 },
  { id: 'w-2', toolSlug: 'image-editor', size: 'medium', order: 1 },
  { id: 'w-3', toolSlug: 'story-studio', size: 'medium', order: 2 },
  { id: 'w-4', toolSlug: 'color-palette', size: 'small', order: 3 },
  { id: 'w-5', toolSlug: 'speedtest', size: 'small', order: 4 },
  { id: 'w-6', toolSlug: 'mood-board', size: 'medium', order: 5 },
]
```

- [ ] **Step 3: Create migration**

```sql
-- supabase/migrations/039_dashboard_layouts.sql
CREATE TABLE IF NOT EXISTS public.user_dashboard_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  layout JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user ON user_dashboard_layouts (user_id);
GRANT ALL ON user_dashboard_layouts TO authenticated, service_role;
```

Apply via Supabase MCP.

- [ ] **Step 4: Commit**

```bash
git add tools/dashboard/types.ts tools/dashboard/default-layout.ts supabase/migrations/039_dashboard_layouts.sql
git commit -m "feat(dashboard): add types, default layout, and database table"
```

---

## Task 2: Dashboard Layout API

**Files:**
- Create: `app/api/v1/dashboard/layout/route.ts`

- [ ] **Step 1: Create layout API**

GET returns the user's layout (or default if none). Also returns recent activity per tool from `credit_transactions`. POST upserts the layout.

```typescript
// app/api/v1/dashboard/layout/route.ts
import { getAdminSupabase } from '@/lib/supabase/admin'
import { getAuthUserId, apiSuccess, API_ERRORS } from '@/lib/api/response'
import { DEFAULT_WIDGETS } from '@/tools/dashboard/default-layout'

async function getSupabase() {
  if (process.env.NODE_ENV === 'development' || process.env.DEV_USER_ID) {
    try { return getAdminSupabase() } catch {}
  }
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}

export async function GET() {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  const supabase = await getSupabase()

  // Get layout
  const { data: layoutRow } = await (supabase.from as any)('user_dashboard_layouts')
    .select('layout')
    .eq('user_id', userId)
    .single()

  const widgets = layoutRow?.layout || DEFAULT_WIDGETS

  // Get recent activity (last transaction per tool in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: transactions } = await (supabase.from as any)('credit_transactions')
    .select('description, created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .limit(500)

  // Parse tool activity from transaction descriptions
  const activityMap: Record<string, { lastUsed: string; count: number }> = {}
  for (const tx of (transactions || [])) {
    // Descriptions contain tool context — extract tool slug if possible
    const desc = (tx.description || '') as string
    // Match common patterns: "Keyword research:", "Social posts: JSON Converter"
    // For MVP, just count per user — we'll refine later
    if (!activityMap['_global']) {
      activityMap['_global'] = { lastUsed: tx.created_at, count: 0 }
    }
    activityMap['_global'].count++
  }

  return apiSuccess({ widgets, activity: activityMap })
}

export async function POST(request: Request) {
  const userId = await getAuthUserId()
  if (!userId) return API_ERRORS.UNAUTHORIZED()

  let body: { layout: unknown[] }
  try { body = await request.json() } catch { return API_ERRORS.VALIDATION({ message: 'Invalid JSON' }) }

  if (!Array.isArray(body.layout)) {
    return API_ERRORS.VALIDATION({ message: 'layout must be an array' })
  }

  const supabase = await getSupabase()

  const { error } = await (supabase.from as any)('user_dashboard_layouts')
    .upsert({
      user_id: userId,
      layout: body.layout,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('[dashboard/layout] Save error:', error)
    return API_ERRORS.INTERNAL()
  }

  return apiSuccess({ saved: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/dashboard/layout/route.ts
git commit -m "feat(dashboard): add layout CRUD API with activity data"
```

---

## Task 3: useDashboard Hook

**Files:**
- Create: `tools/dashboard/use-dashboard.ts`

- [ ] **Step 1: Create the hook**

`'use client'` hook managing layout state, fetch, auto-save, add/remove/resize/reorder.

```typescript
// tools/dashboard/use-dashboard.ts
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { DashboardWidget, WidgetSize } from './types'
import { MAX_WIDGETS } from './types'
import { DEFAULT_WIDGETS } from './default-layout'

interface UseDashboardReturn {
  widgets: DashboardWidget[]
  loading: boolean
  addWidget: (toolSlug: string) => void
  removeWidget: (id: string) => void
  resizeWidget: (id: string) => void
  reorderWidgets: (activeId: string, overId: string) => void
  resetLayout: () => void
  isToolOnDashboard: (toolSlug: string) => boolean
}

export function useDashboard(): UseDashboardReturn {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [loading, setLoading] = useState(true)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const widgetsRef = useRef(widgets)
  widgetsRef.current = widgets

  // Fetch layout on mount
  useEffect(() => {
    fetch('/api/v1/dashboard/layout')
      .then(r => r.json())
      .then(json => {
        const data = json.data ?? json
        setWidgets(data.widgets || DEFAULT_WIDGETS)
      })
      .catch(() => setWidgets(DEFAULT_WIDGETS))
      .finally(() => setLoading(false))
  }, [])

  // Auto-save (debounced 2s)
  useEffect(() => {
    if (loading) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/v1/dashboard/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: widgetsRef.current }),
      }).catch(() => {})
    }, 2000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [widgets, loading])

  const addWidget = useCallback((toolSlug: string) => {
    setWidgets(prev => {
      if (prev.length >= MAX_WIDGETS) return prev
      if (prev.some(w => w.toolSlug === toolSlug)) return prev
      return [...prev, {
        id: `w-${Date.now()}`,
        toolSlug,
        size: 'medium' as WidgetSize,
        order: prev.length,
      }]
    })
  }, [])

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id).map((w, i) => ({ ...w, order: i })))
  }, [])

  const resizeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w
      const sizes: WidgetSize[] = ['small', 'medium', 'large']
      const nextIndex = (sizes.indexOf(w.size) + 1) % sizes.length
      return { ...w, size: sizes[nextIndex] }
    }))
  }, [])

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setWidgets(prev => {
      const oldIndex = prev.findIndex(w => w.id === activeId)
      const newIndex = prev.findIndex(w => w.id === overId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const updated = [...prev]
      const [moved] = updated.splice(oldIndex, 1)
      updated.splice(newIndex, 0, moved)
      return updated.map((w, i) => ({ ...w, order: i }))
    })
  }, [])

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS.map((w, i) => ({ ...w, id: `w-${Date.now()}-${i}`, order: i })))
  }, [])

  const isToolOnDashboard = useCallback((toolSlug: string) => {
    return widgetsRef.current.some(w => w.toolSlug === toolSlug)
  }, [])

  return { widgets, loading, addWidget, removeWidget, resizeWidget, reorderWidgets, resetLayout, isToolOnDashboard }
}
```

- [ ] **Step 2: Commit**

```bash
git add tools/dashboard/use-dashboard.ts
git commit -m "feat(dashboard): add useDashboard hook with auto-save"
```

---

## Task 4: Widget Card Component

**Files:**
- Create: `tools/dashboard/widget-card.tsx`

- [ ] **Step 1: Create widget-card.tsx**

`'use client'` component rendering a tool shortcut card in 3 sizes.

Props: `widget: DashboardWidget`, `tool: Tool` (from lib/tools), `onRemove`, `onResize`, `isDragging: boolean`

Uses `useSortable` from `@dnd-kit/sortable` for drag behavior.

**Small (1×1):** icon + name + "Open →" link. Compact 12px padding.
**Medium (2×1):** icon + name + activity line + "Open" button. Horizontal flex.
**Large (2×2):** icon + name + category badge + activity + "Open Tool" button. Spacious 20px padding.

All cards: `rounded-xl bg-[#131a23] border border-[#1e2631]`. Hover: `bg-[#1e2631]`. Drag handle (grip icon) + delete X + resize handle visible on hover.

Category badge colors from `tool-categories.ts`: creative=amber, utility=blue, interactive=cyan.

Grid span classes: small=`col-span-1`, medium=`col-span-2`, large=`col-span-2 row-span-2`.

- [ ] **Step 2: Commit**

```bash
git add tools/dashboard/widget-card.tsx
git commit -m "feat(dashboard): add widget card with 3 sizes and drag support"
```

---

## Task 5: Dashboard Grid + Toolbar

**Files:**
- Create: `tools/dashboard/dashboard-grid.tsx`
- Create: `tools/dashboard/dashboard-toolbar.tsx`

- [ ] **Step 1: Create dashboard-grid.tsx**

Main grid wrapping widgets in `DndContext` + `SortableContext` from @dnd-kit. 

4-column grid on desktop (`grid-template-columns: repeat(4, 1fr)`), 2 on tablet, 1 on mobile. Gap-3. Subtle dot grid background.

Maps `widgets` to `<WidgetCard>` components. Passes tool info by looking up `tools.find(t => t.href === '/tools/' + w.toolSlug)`.

Empty state: centered grid icon + "Your dashboard is empty" + "Add Widget" button.

`onDragEnd` calls `reorderWidgets(activeId, overId)`.

- [ ] **Step 2: Create dashboard-toolbar.tsx**

Toolbar above the grid: "Add Widget" button (gradient) left, widget count center, "Reset Layout" button right.

Props: `onAddWidget: () => void`, `onReset: () => void`, `widgetCount: number`, `maxWidgets: number`

- [ ] **Step 3: Commit**

```bash
git add tools/dashboard/dashboard-grid.tsx tools/dashboard/dashboard-toolbar.tsx
git commit -m "feat(dashboard): add drag-and-drop grid and toolbar"
```

---

## Task 6: Add Widget Drawer

**Files:**
- Create: `tools/dashboard/add-widget-drawer.tsx`

- [ ] **Step 1: Create add-widget-drawer.tsx**

Same pattern as Mood Board side drawer. Slides from right on desktop, bottom sheet on mobile.

Props: `open`, `onClose`, `onAdd: (toolSlug: string) => void`, `isToolOnDashboard: (slug: string) => boolean`, `widgetCount`, `maxWidgets`

Content: search input, category filter pills (All/Creative/Utility/Interactive), scrollable list of all tools. Each tool row: icon + name + category badge + "Add" button or "Added ✓" badge.

Filter logic: search by name (case-insensitive), filter by category using `getToolCategory` from `tool-categories.ts`.

Tools sourced from `lib/tools.tsx`.

- [ ] **Step 2: Commit**

```bash
git add tools/dashboard/add-widget-drawer.tsx
git commit -m "feat(dashboard): add widget picker drawer with search and categories"
```

---

## Task 7: Dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`
- Modify: `components/layout/tool-categories.ts`

- [ ] **Step 1: Create dashboard page**

```typescript
// app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { ToolFrame } from '@/components/layout/tool-frame'
import { useDashboard } from '@/tools/dashboard/use-dashboard'
import { DashboardGrid } from '@/tools/dashboard/dashboard-grid'
import { DashboardToolbar } from '@/tools/dashboard/dashboard-toolbar'
import { AddWidgetDrawer } from '@/tools/dashboard/add-widget-drawer'

export default function DashboardPage() {
  const dashboard = useDashboard()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <ToolFrame
      toolName="Dashboard"
      toolSlug="dashboard"
      category="utility"
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
        </svg>
      }
    >
      <DashboardToolbar
        onAddWidget={() => setDrawerOpen(true)}
        onReset={dashboard.resetLayout}
        widgetCount={dashboard.widgets.length}
        maxWidgets={12}
      />
      <DashboardGrid
        widgets={dashboard.widgets}
        loading={dashboard.loading}
        onRemove={dashboard.removeWidget}
        onResize={dashboard.resizeWidget}
        onReorder={dashboard.reorderWidgets}
        onAddWidget={() => setDrawerOpen(true)}
      />
      <AddWidgetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={(slug) => { dashboard.addWidget(slug); setDrawerOpen(false) }}
        isToolOnDashboard={dashboard.isToolOnDashboard}
        widgetCount={dashboard.widgets.length}
        maxWidgets={12}
      />
    </ToolFrame>
  )
}
```

- [ ] **Step 2: Add dashboard to tool-categories.ts**

Add `'dashboard': 'utility'` to the `TOOL_CATEGORY_MAP`.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx components/layout/tool-categories.ts
git commit -m "feat(dashboard): add dashboard page with ToolFrame"
```

---

## Task 8: Homepage Integration

**Files:**
- Create: `components/home/dashboard-preview.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create dashboard-preview.tsx**

`'use client'` component. Fetches the user's first 6 widgets from `/api/v1/dashboard/layout`. Renders a compact 2×3 grid of small widget cards (tool icon + name only). Shows "Your Dashboard" heading + "Customize →" link to `/dashboard`.

Only renders if user is authenticated (use `useAuth`). If not authenticated, returns null.

Loading state: 6 skeleton cards.

- [ ] **Step 2: Modify app/page.tsx**

Import `DashboardPreview` and render it above the `<HeroSection>`:

```tsx
<DashboardPreview />
<HeroSection />
```

Since `app/page.tsx` is a server component, `DashboardPreview` must be a client component (it uses hooks). Just import and render — Next.js handles the boundary.

- [ ] **Step 3: Commit**

```bash
git add components/home/dashboard-preview.tsx app/page.tsx
git commit -m "feat(dashboard): add condensed widget grid to homepage"
```

---

## Task 9: E2E Test & Verification

- [ ] **Step 1: Build check**

```bash
pnpm build
```

- [ ] **Step 2: Test layout API**

```bash
curl -s http://localhost:3000/api/v1/dashboard/layout | python3 -m json.tool | head -20
```

- [ ] **Step 3: Screenshot dashboard page**

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000/dashboard', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)
    page.screenshot(path='/tmp/dashboard-e2e.png')
    browser.close()
"
```

- [ ] **Step 4: Screenshot homepage with dashboard preview**

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000/', timeout=60000)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    page.screenshot(path='/tmp/homepage-dashboard.png')
    browser.close()
"
```

- [ ] **Step 5: Fix any issues, re-test, commit**

```bash
git add -A && git commit -m "fix(dashboard): e2e test fixes"
```

---

## Task Summary

| Task | Description | Dependencies | Complexity |
|---|---|---|---|
| 1 | Types, default layout, DB | None | Simple |
| 2 | Layout API | Task 1 | Simple |
| 3 | useDashboard hook | Task 1 | Medium |
| 4 | Widget card component | Task 1 | Medium |
| 5 | Dashboard grid + toolbar | Tasks 3, 4 | Medium |
| 6 | Add widget drawer | Task 1 | Medium |
| 7 | Dashboard page | Tasks 2-6 | Simple (integration) |
| 8 | Homepage integration | Task 2 | Medium |
| 9 | E2E test | All | Medium |

Tasks 1-2 parallel. Tasks 3-4-6 parallel. Task 5 depends on 3+4. Task 7 depends on 2-6. Task 8 independent of 3-7. Task 9 last.
