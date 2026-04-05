# Widget Dashboard — Design Spec (Phase 1)

**Date:** 2026-04-05
**Status:** Approved

---

## Overview

Customizable widget dashboard where logged-in users arrange smart shortcut cards for all 35 tools in a drag-and-drop grid. Layout persisted to Supabase. Condensed version on homepage for logged-in users.

## Routes

- `/dashboard` — full dashboard page with ToolFrame (utility theme)
- `/` — when logged in, shows condensed 2×3 widget grid above the hero + "Go to Dashboard" link

## Grid System

- Desktop: `grid-template-columns: repeat(4, 1fr)`, 4-column grid
- Tablet: `repeat(2, 1fr)`
- Mobile: `repeat(1, 1fr)`, no drag (reorder only)
- Widget sizes: small (1×1), medium (2×1), large (2×2)
- Max 12 widgets on dashboard
- `@dnd-kit` for drag-to-reorder
- Resize: click resize handle on widget corner to cycle small→medium→large→small

## Toolbar

- "Add Widget" button → opens drawer
- "Reset Layout" button → restores default 6 widgets
- Widget count: "8/12 widgets"

## Widget Types (Phase 1 — Smart Shortcut Cards)

All 35 tools get a shortcut card:

**Small (1×1):** tool icon + name + "Open" button
**Medium (2×1):** tool icon + name + recent activity line + "Open" button
**Large (2×2):** tool icon + name + recent activity + category badge + last used date

### Recent Activity

Fetched from `credit_transactions` — last transaction for each tool:
- "Last used 2h ago"
- "Used 3 times this week"
- "Never used" (no transactions)

### Widget Data Structure

```typescript
interface DashboardWidget {
  id: string
  toolSlug: string
  size: 'small' | 'medium' | 'large'
  col: number
  row: number
}

interface DashboardLayout {
  widgets: DashboardWidget[]
}
```

## Add Widget Drawer

- Slide-out from right (same pattern as Mood Board)
- Search input to filter by name
- Category pills: All / Creative / Utility / Interactive
- Available tools grid: icon + name + category badge + "Add" button
- Already-added: greyed out with "Added" badge
- Adding places widget at first available position, size medium

## Remove Widget

- Hover widget → X button top-right corner
- Removes from layout, auto-saves

## Persistence

### Table: `user_dashboard_layouts`
```sql
CREATE TABLE IF NOT EXISTS public.user_dashboard_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  layout JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Auto-save: debounced 2s on any layout change

### Default Layout (new users)
6 pre-selected widgets:
1. JSON Converter (medium)
2. Image Editor (medium)
3. Story Studio (medium)
4. Color Palette (small)
5. Speed Test (small)
6. Mood Board (medium)

## Homepage Integration

When user is logged in, show above the existing hero:
- Section: "Your Dashboard" heading + "Customize →" link to /dashboard
- 2×3 grid of first 6 widgets from their layout (small cards)
- If no layout saved, show default 6

## API

### GET `/api/v1/dashboard/layout`
- Auth required
- Returns user's layout (or default if none saved)
- Also returns recent activity per tool (last transaction timestamps)

### POST `/api/v1/dashboard/layout`
- Auth required
- Body: `{ layout: DashboardWidget[] }`
- Upserts layout

## File Structure

### New Files
| File | Responsibility |
|---|---|
| `app/dashboard/page.tsx` | Dashboard route page |
| `tools/dashboard/dashboard-grid.tsx` | Main grid with @dnd-kit |
| `tools/dashboard/widget-card.tsx` | Individual widget card (small/medium/large) |
| `tools/dashboard/add-widget-drawer.tsx` | Widget picker drawer |
| `tools/dashboard/use-dashboard.ts` | Layout state + persistence hook |
| `tools/dashboard/types.ts` | Dashboard types |
| `tools/dashboard/default-layout.ts` | Default widget config |
| `app/api/v1/dashboard/layout/route.ts` | Layout CRUD API |
| `supabase/migrations/039_dashboard_layouts.sql` | Database table |

### Modified Files
| File | Changes |
|---|---|
| `app/page.tsx` | Add condensed widget grid for logged-in users |
| `components/layout/tool-categories.ts` | Add 'dashboard' slug |
| `lib/tools.tsx` | Add Dashboard tool entry |

## Styling

Dark theme tokens. Widget cards: `rounded-xl bg-[#131a23] border border-[#1e2631]`. Drag ghost: elevated shadow + slight scale. Grid background: subtle dot pattern.

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Shortcut cards only (Phase 1) | Functional mini widgets | Ship fast |
| 2 | @dnd-kit drag-and-drop | Fixed grid | User requested |
| 3 | 3 sizes (1×1, 2×1, 2×2) | Fixed; unlimited | Balance |
| 4 | Max 12 widgets | Unlimited | Performance |
| 5 | Supabase persistence | localStorage | Cross-device |
| 6 | Homepage condensed + /dashboard | One or other | Both served |
| 7 | Drawer for adding | Inline; palette | Consistent pattern |
| 8 | Default 6 for new users | Empty; all | Good first experience |

## Out of Scope (Phase 2)

- Functional mini widgets (inline JSON formatter, IP checker, etc.)
- Widget marketplace
- Sharing dashboard layouts
- Widget notifications/alerts
