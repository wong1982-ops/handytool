# AI Usage Dashboard — Design Spec

**Date:** 2026-03-29
**Location:** Admin portal (`admin/app/(admin)/ai-usage/`)
**Purpose:** Track AI tool usage (call volume + credit consumption) with tool drill-down and per-user detail views.

---

## Overview

A new top-level admin page that aggregates `credit_transactions` (type = `usage`) into an operational dashboard. Shows platform-wide usage trends, per-tool breakdowns with operation-level drill-down, and per-user usage with a dedicated detail page.

## Data Source

All data comes from the existing `credit_transactions` table, filtered on `type = 'usage'`. Fields used:
- `tool_id` — e.g., `story-illustrate`, `image-editor-inpaint`, `logo-generate`
- `amount` — credits consumed (negative values stored as positive for display)
- `user_id` — links to auth.users
- `created_at` — timestamp

**Tool category grouping:** Parse `tool_id` to extract the tool prefix (e.g., `image-editor` from `image-editor-inpaint`). A static mapping in the frontend maps prefixes to display names (e.g., `image-editor` → "Image Editor", `story` → "Story Video").

---

## Route Structure

| Route | Page |
|-------|------|
| `/ai-usage` | Main dashboard |
| `/ai-usage/users/[id]` | Per-user detail page |

**Sidebar:** New top-level nav item "AI Usage" with a sparkles/cpu icon, placed between Analytics and Settings.

---

## Page: `/ai-usage` — Main Dashboard

### Top Bar

- **Period presets:** 7d, 14d, 30d, 90d buttons (default: 30d)
- **Custom date range:** Date picker for arbitrary from/to
- **Comparison toggle:** "vs previous period" checkbox — when active, summary cards show delta percentages

### Summary Cards (4)

| Card | Value | Source |
|------|-------|--------|
| Total AI Calls | Count of transactions | `ai_usage_summary` RPC |
| Credits Consumed | Sum of amounts | `ai_usage_summary` RPC |
| Unique Users | Distinct user_id count | `ai_usage_summary` RPC |
| Avg Credits / Call | credits / calls | Computed from above |

When comparison is active, each card shows a delta badge (e.g., "+12%" in green or "-5%" in red).

### Section 1: Usage Over Time

- **Chart type:** Line chart (Recharts), dual Y-axis
- **Left axis:** Call count per day
- **Right axis:** Credits consumed per day
- **Data:** `ai_usage_daily` RPC returns `(date, call_count, total_credits)`
- When comparison is active, overlay the previous period as dashed lines

### Section 2: Tool Breakdown

- **Default view:** Horizontal bar chart ranking tools by total credits consumed. Each bar labeled with call count.
- **Expand:** Click a tool → inline expansion showing sub-operations (full `tool_id` values within that prefix group). Each sub-row shows: operation name, call count, total credits, avg credits/call.
- **Table below chart:** Sortable columns — Tool, Operations, Total Calls, Total Credits, Avg Credits/Call.
- **Data:** `ai_usage_by_tool` RPC returns `(tool_id, call_count, total_credits)`. Frontend groups by prefix.

### Section 3: Top Users

- **Table:** Top 20 users ranked by credits consumed in selected period
- **Columns:** User (email/name), Total Calls, Total Credits, Most Used Tool, Last Active
- **Row click:** Navigates to `/ai-usage/users/[id]`
- **Data:** `ai_usage_top_users` RPC returns `(user_id, email, display_name, call_count, total_credits, most_used_tool, last_active)`

---

## Page: `/ai-usage/users/[id]` — User Detail

### Top

- Back button → `/ai-usage`
- User info: name, email
- Period selector (same presets + custom range)

### Summary Cards (4)

| Card | Value |
|------|-------|
| Total Calls | Count for this user in period |
| Credits Consumed | Sum for this user in period |
| Favorite Tool | Tool with highest call count |
| Active Since / Last Active | First and most recent usage timestamps |

### Per-Tool Breakdown

- Horizontal bar chart showing this user's usage by tool category
- Same drill-down expand behavior as the main page

### Transaction History

- Paginated table (20 per page), most recent first
- Columns: Date, Tool, Operation, Credits
- Data: Direct query on `credit_transactions` filtered by `user_id` + date range

---

## Backend: Supabase RPC Functions

### Migration file: `supabase/migrations/031_ai_usage_rpcs.sql`

#### 1. `ai_usage_summary(p_from timestamptz, p_to timestamptz)`

Returns single row:
```sql
SELECT
  count(*)::int AS total_calls,
  coalesce(sum(abs(amount)), 0)::int AS total_credits,
  count(distinct user_id)::int AS unique_users
FROM credit_transactions
WHERE type = 'usage'
  AND created_at >= p_from
  AND created_at < p_to;
```

#### 2. `ai_usage_daily(p_from timestamptz, p_to timestamptz)`

Returns rows per day:
```sql
SELECT
  date_trunc('day', created_at)::date AS date,
  count(*)::int AS call_count,
  coalesce(sum(abs(amount)), 0)::int AS total_credits
FROM credit_transactions
WHERE type = 'usage'
  AND created_at >= p_from
  AND created_at < p_to
GROUP BY 1
ORDER BY 1;
```

#### 3. `ai_usage_by_tool(p_from timestamptz, p_to timestamptz)`

Returns rows per tool_id:
```sql
SELECT
  tool_id,
  count(*)::int AS call_count,
  coalesce(sum(abs(amount)), 0)::int AS total_credits
FROM credit_transactions
WHERE type = 'usage'
  AND created_at >= p_from
  AND created_at < p_to
GROUP BY tool_id
ORDER BY total_credits DESC;
```

#### 4. `ai_usage_top_users(p_from timestamptz, p_to timestamptz, p_limit int default 20)`

Returns top users with email:
```sql
SELECT
  ct.user_id,
  u.raw_user_meta_data->>'email' AS email,
  u.raw_user_meta_data->>'display_name' AS display_name,
  count(*)::int AS call_count,
  coalesce(sum(abs(ct.amount)), 0)::int AS total_credits,
  mode() WITHIN GROUP (ORDER BY ct.tool_id) AS most_used_tool,
  max(ct.created_at) AS last_active
FROM credit_transactions ct
JOIN auth.users u ON u.id = ct.user_id
WHERE ct.type = 'usage'
  AND ct.created_at >= p_from
  AND ct.created_at < p_to
GROUP BY ct.user_id, u.raw_user_meta_data
ORDER BY total_credits DESC
LIMIT p_limit;
```

---

## Admin API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-usage/summary` | GET | Summary cards (accepts `from`, `to` query params) |
| `/api/ai-usage/daily` | GET | Daily time-series |
| `/api/ai-usage/by-tool` | GET | Tool breakdown |
| `/api/ai-usage/top-users` | GET | Top users table |
| `/api/ai-usage/users/[id]` | GET | Per-user transactions (paginated) |

All endpoints require admin auth via `requireAdminApi()`.

---

## Frontend: Tool Category Mapping

Static map in `admin/lib/ai-usage.ts`:

```typescript
export const TOOL_CATEGORIES: Record<string, string> = {
  'story': 'Story Video',
  'image-editor': 'Image Editor',
  'logo': 'Logo Generator',
  'favicon': 'Favicon Generator',
  'sketch-to-art': 'Sketch to Art',
  'ecard': 'E-Card Generator',
  'vblog': 'VBlog Studio',
  'mood-board': 'Mood Board',
  'font-generator': 'Font Generator',
  'tax-manager': 'Tax Manager',
  'component-lab': 'Component Lab',
  'id-photo': 'ID Photo',
  'palette': 'Color Palette',
  'blog': 'Blog',
}
```

Prefix extraction: split `tool_id` on `-`, try longest match first (e.g., `image-editor` before `image`).

---

## UI Style

Follows existing admin patterns:
- Dark theme: zinc-950 background, zinc-900 cards, blue-600 accents
- Recharts for all charts (consistent with Analytics page)
- Sortable tables with hover states
- Loading skeletons during data fetch
- Responsive: cards stack on mobile, charts full-width

---

## Scope Exclusions

- No real-time / WebSocket updates — data refreshes on page load or manual refresh
- No export to CSV (can be added later)
- No alerting thresholds (e.g., "notify when daily spend exceeds X")
- No cost-to-dollar conversion (credits only, not actual API spend)
