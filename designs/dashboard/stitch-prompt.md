# Google Stitch Prompt — Widget Dashboard

## Screen Overview

Customizable widget dashboard for Toolk1t. Users arrange smart shortcut cards for their tools in a drag-and-drop grid. Three widget sizes. Dark theme.

**Platform:** Responsive web (desktop 1440px, tablet 768px, mobile 390px)
**Theme:** Dark mode with Toolk1t design tokens

---

## Brand Tokens

```
page-bg:        #090f16
card-bg:        #131a23
card-hover:     #1e2631
border:         #1e2631
text-primary:   #ffffff
text-secondary: #a6abb5
text-muted:     #70767f
primary:        #3D6AF2
primary-light:  #3D9DF2
success:        #10B981
purple:         #7C3AED
```

---

## Screen 1: Full Dashboard (`/dashboard`)

### ToolFrame Header
- Utility blue gradient header: back arrow + grid icon + "Dashboard" title + favorite star

### Toolbar Row (below header, sticky)
- Left: `"Add Widget"` button (primary gradient, 44px, sparkle icon)
- Center: widget count `"6 / 12 widgets"` (13px, text-muted)
- Right: `"Reset Layout"` button (card-bg, border, text-secondary, 44px)

### Widget Grid
- Background: subtle dot grid pattern (dots at 24px intervals, 1px, `#1e2631` opacity 30%)
- 4-column grid on desktop, gap-3
- Widgets are draggable cards with subtle drop shadow when being dragged

### Widget Card — Small (1×1, one grid cell)
- Card: card-bg, border, 12px radius, 16px padding
- Layout: centered vertically
- Tool icon (24px, category accent color) + tool name (13px, white, truncated) below
- "Open →" micro link (11px, primary blue) at bottom
- Hover: card-hover bg, slight lift shadow
- Drag handle: top-left grip dots icon (text-muted, visible on hover)
- Delete X: top-right, visible on hover (text-muted, hover red)
- Resize handle: bottom-right corner triangle (text-muted, visible on hover)

### Widget Card — Medium (2×1, spans 2 columns)
- Same card styling, wider
- Layout: horizontal flex
- Left: tool icon (32px)
- Middle: tool name (14px bold white) + activity line below (12px text-muted, e.g. "Last used 2h ago" or "Used 3 times this week")
- Right: "Open" button (card-bg, border, rounded-lg, 36px height, text-secondary)
- Same hover controls (drag, delete, resize)

### Widget Card — Large (2×2, spans 2 columns + 2 rows)
- Same card styling, larger
- Top: tool icon (40px) + tool name (16px bold white) + category badge (rounded-full, category color/20 bg, category color text, 11px)
- Middle: activity line + "Last used: Apr 5" (text-muted)
- Bottom: "Open Tool" button (primary gradient, full width, 44px)
- More spacious padding (20px)

### Drag State
- Card being dragged: elevated shadow (`shadow-2xl`), slight scale (1.02×), opacity 90%
- Drop placeholder: dashed border `border-2 border-dashed border-[#3D6AF2]/30`, rounded-xl, matching the widget size

### Empty Grid State
- Centered: grid icon (48px, text-muted) + "Your dashboard is empty" (16px, text-secondary) + "Add widgets to get started" (14px, text-muted) + "Add Widget" button (primary gradient)

---

## Screen 2: Add Widget Drawer

### Overlay
- Backdrop: `fixed inset-0 bg-black/30`
- Panel: `fixed right-0 top-0 bottom-0 w-80 bg-[#0d1117] border-l border-[#1e2631] shadow-2xl`

### Header
- "Add Widget" title (16px bold white) + close X button (text-muted)

### Search
- Input: card-bg, border, 12px radius, 44px height, search icon left
- Placeholder: "Search tools..."

### Category Filters
- Horizontal pills: All / Creative / Utility / Interactive
- Active: primary blue fill, inactive: card-bg border

### Tool List (scrollable)
- Each tool row: px-4 py-3, border-b, hover card-hover
- Left: tool icon (24px) + name (14px white) + category badge (11px)
- Right: "Add" button (primary gradient, small, 32px height) OR "Added" badge (text-muted, card-bg)
- Already on dashboard: greyed out, "Added ✓" text

### Mobile
- Full-width bottom sheet instead of right drawer
- Max-h-[70vh], scrollable, drag handle

---

## Screen 3: Homepage Condensed (logged-in users)

### Section (above existing hero)
- Container: max-w-7xl, px-4, py-6
- Header row: "Your Dashboard" (18px bold white) + "Customize →" link (primary blue, 14px)
- 2×3 grid (gap-3) of first 6 widgets — always small (1×1) size
- Same card styling as small widgets but slightly more compact (12px padding)
- Below grid: subtle divider before the existing hero section

---

## Interaction Notes

- Drag: press and hold (200ms) to start drag on desktop. Touch drag on mobile disabled (use reorder button instead).
- Resize: click bottom-right handle to cycle small→medium→large→small
- Auto-save: 2s debounce after any layout change
- Category accent colors match tool-categories.ts: Creative=amber, Utility=blue, Interactive=cyan
- Widget "Open" navigation uses Next.js router.push
- Activity fetched once on mount, not real-time
