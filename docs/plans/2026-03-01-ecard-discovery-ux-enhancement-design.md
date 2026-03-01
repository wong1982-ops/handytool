# ECard Studio Discovery Page — UX Enhancement Design

**Date**: 2026-03-01
**Status**: Approved
**Design Principles**: Jakob Nielsen's 10 Usability Heuristics

## Problem Statement

The discovery page has UX issues:
1. **Redundant filter areas** — Hero occasion buttons duplicate the filter bar chips
2. **Filters feel hidden** — Occasion chips only show for E-Cards tab; business cards have no sub-filters
3. **Visual polish lacking** — Basic styling on filter bar, no animations, weak active states
4. **Search is underwhelming** — No autocomplete, no feedback, no result count

## Design: Unified Filter Bar

### Hero Section (Simplified)

Remove the 6 large occasion intent buttons. Keep only:
- Title: "What's the occasion?"
- Subtitle: "Choose a template to get started"

**Rationale (H8 Aesthetic & Minimalist)**: All interactive filtering consolidated into the unified bar.

### Unified Sticky Filter Bar

Three-row sticky bar below the hero:

**Row 1 — Search + Category Tabs**

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Search by name, style, or occasion...  ×  │ All (30) │ E-Cards (20) │ Business (10) │
└─────────────────────────────────────────────────────────────────┘
```

- Desktop: search left, tabs right (single row)
- Mobile: search full-width top, tabs below (stacked)
- Search features:
  - Live filtering as you type (H1 Visibility of System Status)
  - Clear button (×) when text present (H3 User Control & Freedom)
  - Debounced 200ms for performance
- Tab features:
  - Count badge updates live as filters change (H1)
  - Active tab: filled bg (`bg-blue-600 text-white`) with `transition-all duration-200`
  - Inactive: `text-slate-400 hover:text-white`

**Row 2 — Occasion Tags (always visible)**

```
│  🚀 Product Launch  🎉 Client Anniversary  👋 Employee Welcome  📊 Quarterly  🎄 Holiday  💝 Thank You  │
```

- Always visible regardless of active tab (H6 Recognition over Recall)
- Multi-select toggle with `ring-2 ring-blue-500` active state
- When a tag is active on "All" tab, results auto-filter to matching e-cards
- Horizontal scroll on mobile with `overflow-x-auto`
- Chips: `px-3 py-1.5 rounded-full border transition-all` with emoji icon
- Active: `bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500`
- Inactive: `bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500`

**Row 3 — Active Filters Summary (conditional)**

Only shows when any filter is active:

```
│  Showing 8 of 30 templates  │  🚀 Product Launch ×  │  E-Cards ×  │  [Clear all filters]  │
```

- Each active filter as a removable pill with × button (H3 User Control)
- "Clear all filters" link at the end
- Smooth enter/exit animation (H1 system status feedback)
- Text: `text-sm text-slate-400` with pill count
- Pills: `bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs`

### Template Cards (Enhanced)

- Hover: `hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200`
- Type badge: Overlay positioned top-right of preview box (not inline with title)
- Description: Show on all screen sizes (currently hidden on mobile)

### Empty State (H9 Error Recovery)

When no templates match:
- Illustration: Faded search icon (existing pattern)
- Title: "No templates match your filters"
- Subtitle: "Try removing some filters or searching with different terms"
- Action: "Clear all filters" button (primary style)

### Nielsen's Heuristics Compliance

| # | Heuristic | Implementation |
|---|-----------|---------------|
| H1 | Visibility of System Status | Live result count, count badges on tabs, active filter summary |
| H2 | Match Real World | Emoji icons, natural "Showing X of Y" language |
| H3 | User Control & Freedom | Clear individual filters, clear all, ×  on search, removable pills |
| H4 | Consistency & Standards | Uniform chip styles, tab patterns, hover states across all elements |
| H5 | Error Prevention | Occasion chips show count; visually de-emphasize 0-result options |
| H6 | Recognition over Recall | Active filters always visible as removable pills, tabs show counts |
| H7 | Flexibility & Efficiency | Search + browse + filter compose freely; keyboard shortcuts |
| H8 | Aesthetic & Minimalist | No duplicate controls, hero stripped to essentials |
| H9 | Help Users Recover | Friendly empty state with clear path to fix |
| H10 | Help & Documentation | Placeholder guides input, tooltips on non-obvious controls |

### Responsive Behavior

| Element | Desktop (lg+) | Tablet (md) | Mobile (<md) |
|---------|--------------|-------------|--------------|
| Search + Tabs | Single row, search left / tabs right | Single row | Stacked: search top, tabs below |
| Occasion chips | Single row | Single row with scroll | Horizontal scroll |
| Active filters | Inline row | Inline row | Wrapping flex |
| Template grid | 4 columns | 3 columns | 2 columns |
| Card preview height | 200px | 200px | 140px |

## Files to Modify

1. `tools/ecard-studio/discovery-page.tsx` — Main rewrite of filter bar + grid
2. `.claude/ui-ux-guideline.md` — Add Nielsen's 10 heuristics reference section
