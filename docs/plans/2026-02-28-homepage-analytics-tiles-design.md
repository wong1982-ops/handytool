# Homepage Analytics Tiles — Design

**Goal:** Show top 5 most-used tools as compact "Trending This Week" tiles on the homepage, giving visitors social proof.

**Architecture:** Server component with ISR (revalidate = 3600). Calls existing `tool_popularity` Supabase RPC at build time. No client-side fetching.

## Layout

Placed between the page heading ("Free Online Tools") and the tools grid.

- 5 tiles in a single horizontal row on desktop, wrapping on mobile
- Each tile: rank number (#1–#5), tool icon, tool name, formatted usage count (e.g. "1.2K")
- Gold/silver/bronze accent colors for ranks #1/#2/#3
- ~80px tile height, clickable (navigates to tool)
- Section heading: "Trending This Week" with fire icon

## Data Source

- `tool_popularity` Supabase RPC with `time_range_days: 7`
- Returns `{ tool_slug: string, page_views: number }[]`
- Map `tool_slug` to tool metadata (name, icon, color) via `lib/tools.tsx`

## Fallback

If no data or RPC fails, hide the entire section. No empty state.

## Files

- Modify: `app/tools/page.tsx` — add trending section above tools grid
- No new files needed
