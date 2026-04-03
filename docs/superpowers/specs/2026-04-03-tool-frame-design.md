# ToolFrame — Unified Tool Layout System

**Date:** 2026-04-03
**Status:** Approved

---

## Overview

A shared `ToolFrame` layout component that wraps all tools with consistent header, navigation, scrollable content area, and optional fixed action bar. Replaces the current per-tool layout approach where each tool reinvents its own header, back button, mobile behavior, and padding.

## Core UX Principle

**Buttons must be reachable at all times.** The viewport is divided into fixed zones — only the content area scrolls. Users never need to scroll up to find controls or scroll down to reach action buttons.

```
┌──────────────────────────────────────┐
│  FIXED: Themed header                │
│  breadcrumb / back + icon + title    │
├──────────────────────────────────────┤
│  FIXED: Tab bar (if tabs provided)   │
├──────────────────────────────────────┤
│                                      │
│  SCROLLABLE: {children}              │
│  This is the ONLY scrolling zone     │
│                                      │
├──────────────────────────────────────┤
│  FIXED: {actions} (if provided)      │
└──────────────────────────────────────┘
```

## Component API

```tsx
interface ToolFrameProps {
  toolName: string
  toolSlug: string
  category: 'creative' | 'utility' | 'interactive'
  variant?: 'standard' | 'compact'   // default: 'standard'
  icon?: React.ReactNode
  tabs?: { label: string; href: string; icon?: React.ReactNode }[]
  actions?: React.ReactNode           // optional fixed bottom action bar
  children: React.ReactNode
}
```

## Variants

### Standard (default)

- Themed gradient header (~80px) — category-colored gradient background
- Desktop: breadcrumb (Home / Tool Name) + icon + title
- Mobile: back arrow (top-left) + icon + title (compact)
- Sticky tab bar below header if `tabs` provided (~44px)
- Content area: `max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8`, flex-1 overflow-y-auto
- Action bar (if provided): pinned bottom, border-top, backdrop blur

### Compact

For full-screen tools (maps, editors, games) that need maximum viewport.

- Thin header bar (~48px) — subtle gradient, back arrow + icon + title only
- No tabs
- Content area: full width, no max-width, no padding (tool controls its own layout)
- Action bar (if provided): pinned bottom, same as standard

## CSS Structure

```
Root:          h-screen flex flex-col
Header:        shrink-0
Tabs:          shrink-0 sticky
Content:       flex-1 overflow-y-auto min-h-0
Action bar:    shrink-0
```

## Category Themes

| Category | Gradient | Border | Icon Accent | Tools |
|---|---|---|---|---|
| Creative | `from-indigo-950 via-purple-900 to-indigo-950` | `border-purple-800/50` | `text-amber-400` | Story Studio, Mood Board, Sketch to Art, Logo Gen, Font Gen, Favicon, ECard, Music Studio, VBlog, Story Video, Component Lab |
| Utility | `from-slate-900 via-blue-950 to-slate-900` | `border-blue-800/50` | `text-blue-400` | JSON Converter, Swagger Editor, Regex, JWT, PDF, IP tools, Speed Test, Currency, Color Palette, SVG Converter, Tax Manager |
| Interactive | `from-slate-900 via-cyan-950 to-slate-900` | `border-cyan-800/50` | `text-cyan-400` | Local Services, Human Benchmark, Slots, OpenClaw, Image Editor, ID Photo, Resume |

Category config stored in `components/layout/tool-categories.ts` — maps each `toolSlug` to its category and defines color tokens. Tools can override category via prop.

## Action Bar

- Styling: `border-t border-[category-border] bg-[category-bg]/80 backdrop-blur-sm px-4 md:px-6 py-3`
- Contains whatever the tool passes: buttons, progress indicators, credit badges
- Mobile: stays pinned above MobileShell's bottom tab bar (if present)
- Optional — tools that don't need it simply omit the `actions` prop

## Mobile Behavior

- Header compresses: no breadcrumb, back arrow + icon + title
- Tab bar: horizontally scrollable if many tabs
- Action bar: pinned above MobileShell bottom tabs
- Content area: single-column scroll, same flex-1 overflow-y-auto

## File Structure

| File | Responsibility |
|---|---|
| `components/layout/tool-frame.tsx` | Main ToolFrame — standard + compact variants |
| `components/layout/tool-header.tsx` | Themed gradient header |
| `components/layout/tool-action-bar.tsx` | Fixed bottom action bar wrapper |
| `components/layout/tool-tabs.tsx` | Sticky tab navigation bar |
| `components/layout/tool-categories.ts` | Slug → category mapping, color theme definitions |

No new dependencies. The existing `ToolBreadcrumb` (`components/ui/tool-breadcrumb.tsx`) is absorbed into `tool-header.tsx`.

## Migration Strategy

### Phase 1 — Build + 3 pilots (one per category)

1. Build `ToolFrame` and supporting components
2. Migrate **Mood Board** (Creative) — just redesigned, easy to adapt
3. Migrate **JSON Converter** (Utility) — simple layout, good test case
4. Migrate **Image Editor** (Interactive, compact variant) — validates compact mode

### Phase 2 — Remaining tools incrementally

Per-tool migration checklist:
1. Wrap page in `<ToolFrame>` with correct props
2. Remove custom breadcrumb/header
3. Move action buttons to `actions` prop (if applicable)
4. Ensure content scrolls independently (remove `min-h-screen` from inner content)
5. Verify mobile — back button, action bar reachable
6. Delete old wrapper components (e.g. `studio-shell.tsx`)

Backward compatible — unmigrated tools keep working as-is.

## Assumptions

- Global site header (logo, search, nav) renders above ToolFrame from root layout
- MobileShell bottom tab bar continues separately from ToolFrame
- Story Studio migrates from custom shell to ToolFrame (Phase 2)
- Tools with wizard entry points (Mood Board) render wizard INSIDE the frame's content area

## Decision Log

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| 1 | Single ToolFrame with props | Composable sub-components; auto-wrapper | Consistency + simplicity |
| 2 | 3 category themes | Uniform; per-tool; 4 categories | Natural grouping, enough variety |
| 3 | Standard + Compact variants | Force all same; full opt-out | Full-screen tools need space but still benefit from consistent nav |
| 4 | Fixed header + scroll content + fixed actions | Scroll everything; FAB | Core UX: buttons always reachable |
| 5 | Optional action bar via prop | Mandatory; separate only | Simple tools stay simple |
| 6 | Category config file | Per-tool specification | Single source of truth |
| 7 | Phased migration (3 pilots → rest) | Big-bang; new tools only | Low risk validation |

## Out of Scope

- Redesigning individual tool internals
- Adding new tool features
- Changing tool functionality
- Real-time collaboration features
- Tool marketplace/plugin system
