# Google Stitch Prompt — Job Radar

## Overview

Design a dark-themed job listing tool called **Job Radar** for the **Toolk1t** web platform. This tool aggregates IT/tech and French-language jobs across Australia and New Zealand from Seek, Indeed, LinkedIn, and Trade Me. The redesign is purely cosmetic — all existing features remain identical.

---

## Design System

**Theme:** Dark mode only (no light mode toggle needed in this design)

| Token | Value |
|---|---|
| Page background | `#090f16` |
| Card background | `#131a23` |
| Card hover | `#1e2631` |
| Border | `#1e2631` |
| Primary blue | `#3D6AF2` |
| Text primary | `#ffffff` |
| Text secondary | `#a6abb5` |
| Text muted | `#70767f` |
| Success green | `#10B981` |
| Danger red | `#EF4444` |

**Typography:** Inter (system fallback stack), 300–900 weights available
**Icons:** Material Symbols Outlined (weight 400, fill 0)
**Spacing unit:** 4px base
**Border radius:** 12px for cards, 8px for inputs/badges, 20px for pill badges

---

## Page Structure

### 1. Page Header (within max-w-1200px container, centered)

- **Breadcrumb:** `Home > Tools > Job Radar` in muted text, small size
- **Title:** `Job Radar` — 28px bold, white
- **Subtitle:** `IT & French language jobs across Australia and New Zealand — updated daily` — 14px, text-secondary

### 2. Category Tabs (below header)

Two pill-style tabs in a row:
- `IT / Tech` (default active)
- `French Language`

Active tab: white text, card-bg background, subtle shadow ring
Inactive tab: muted text, transparent background, hover lightens slightly

Container: a rounded-xl pill group with border, page-bg fill, padding 4px

### 3. Main Layout (two-column on desktop, stacked on mobile)

**Left column — Filters Sidebar (240px, sticky top-24, visible only on lg+)**

Card style: `#131a23` bg, `#1e2631` border, 12px radius, 16px padding

Sidebar contains:
- Section heading "Filters" — 13px, semibold, white
- 4 select dropdowns stacked vertically:
  - **Employment** — options: All / Full-time / Contract / Part-time
  - **Work Mode** — options: All / Remote / Hybrid / On-site
  - **Country** — options: All / 🇦🇺 Australia / 🇳🇿 New Zealand
  - **Posted Within** — options: All / Last 24h / Last 3 days / Last 7 days / Last 14 days / Last 30 days
- **Salary Range (Annual)** — two number inputs side by side: Min / Max (placeholder text)
- **Hourly Rate (Contract)** — two number inputs side by side: Min / Max
- **Clear all filters** — danger-red text link button, only shown when filters are active

Dropdown/input style: `#090f16` bg, `#1e2631` border, 10px radius, 40px height, 14px Inter, white text, primary-blue focus ring

Label style: 10px uppercase tracking-widest, text-muted

**Right column — Job List Area (flex-1)**

At the top of the right column (sticky on mobile):
- **Search bar:** full width, 48px height, `#131a23` bg, `#1e2631` border, 12px radius, magnifying glass icon left-padded, placeholder "Search jobs by title, skill, or keyword...", primary-blue focus ring

Below search bar on mobile only — a collapsed "Filters" toggle button (icon + label + active dot indicator):
- 44px height, full width, centered content, card-bg bg, border border, rounded-xl

---

## Job Card Design

Grid: 2 columns on sm+, 1 column on mobile. Gap 12px.

Each card is a button (interactive, keyboard-focusable):
- Background: `#131a23`
- Border: `#1e2631` (1px solid)
- Border radius: 12px
- Padding: 20px
- Hover state: border shifts to `#3D6AF2` at 50% opacity, slight box-shadow glow, title text turns primary blue
- Transition: all 150ms ease

**Card layout (top to bottom):**

1. **Top row:** Job title (left, semibold 15px white, max 2 lines clamped) + Relative date (right, 12px muted, whitespace-nowrap). E.g., "Today", "2 days ago", "1w ago"

2. **Company + Location row:** `CompanyName · 🇦🇺 Sydney NSW` — 13px, text-secondary

3. **Badges row:** Pill badges horizontally wrapped, 8px gap
   - Employment type badge: blue tint — `rgba(61,106,242,0.15)` bg, `#3D6AF2` text, "Full-time" / "Contract" / "Part-time"
   - Work mode badge: green tint — `rgba(16,185,129,0.15)` bg, `#10B981` text, "Remote" / "Hybrid" / "On-site"

4. **Footer row:** Salary (left, 14px semibold white) + Source label (right, 12px muted). E.g., `$95k–$120k AUD` and `Seek`

---

## Job Detail Modal (slide-up sheet on mobile, centered dialog on desktop)

**Backdrop:** `rgba(0,0,0,0.6)` overlay

**Panel:**
- Mobile: anchored bottom, rounded-t-2xl, max-height 85vh, scrollable body
- Desktop: centered, max-width 640px, rounded-2xl
- Background: `#131a23`
- Border: `#1e2631`

**Sticky modal header:**
- Background: `#131a23`, bottom border `#1e2631`
- Job title: 18px bold white
- Company + flag + location: 14px text-secondary
- X close button: 40px tap target, hover bg card-hover

**Modal body (scrollable, 20px padding, 20px gap between sections):**

1. **Badges row:** Employment + Work Mode + Source badges (same pill style as card, slightly larger 13px)

2. **Compensation block:** Rounded 10px card, `#0d1520` bg (slightly darker). Label "COMPENSATION" 10px uppercase muted. Value: full salary string, 18px semibold white. E.g., `$95,000 – $120,000 AUD per year`

3. **Description section:** "Description" label 13px semibold white. Body text 14px text-secondary, line-height 1.6, whitespace-pre-line

4. **Skills & Tags section:** "Skills & Tags" label 13px semibold white. Tag pills: `rgba(61,106,242,0.1)` bg, primary blue text, 12px, rounded-full, 10px horizontal padding

5. **Posted date footer line:** `Posted 3 April 2026` — 12px muted

**Sticky modal footer:**
- Background: `#131a23`, top border `#1e2631`
- Two buttons side by side:
  - **Apply button (flex-1):** 48px height, rounded-xl, primary blue bg (#3D6AF2), white text, "Apply on Seek" + external link icon. Hover: slightly lighter blue.
  - **Share button:** 48px height, fixed width ~80px, card-hover bg, border, "Share" label white text

---

## Pagination (below job list)

Centered. Shown only when totalPages > 1.

- Count line: `147 jobs found` — 14px text-secondary
- Prev / Next buttons: 40px height, card-bg bg, border, text-secondary, disabled state 40% opacity
- Page number buttons: 40px square, centered text
  - Active: primary blue bg, white text, no border
  - Inactive: card-bg bg, border border, text-secondary, hover card-hover bg
- Ellipsis: `...` in muted color

---

## Loading Skeleton

While fetching, show a 2-column grid of 6 skeleton cards:
- Each: 144px height, `#131a23` bg, `#1e2631` border, 12px radius
- Animated shimmer: gradient sweep left to right, looping 1.5s

Also show a skeleton for the search bar (48px height, full width).

---

## Empty State

Centered block:
- Icon: Material Symbol `work_off` — 48px, muted color
- Heading: "No jobs found" — 16px semibold white
- Subtext: "Try adjusting your search or filters" — 14px text-secondary

---

## Error State

Rounded error card:
- Background: `rgba(239,68,68,0.08)` (danger tint)
- Border: `rgba(239,68,68,0.25)`
- Icon: `error_outline` Material Symbol, danger red, 24px
- Message: error text, 14px danger-red
- Retry button: 40px height, `rgba(239,68,68,0.15)` bg, danger-red text, 12px radius

---

## Mobile Filter Drawer (toggled on mobile)

When the "Filters" toggle is tapped on mobile:
- An inline panel expands below the toggle button
- Same filter fields as desktop sidebar, but in a 2-column grid
- Salary/hourly range inputs span full width

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| < 640px (mobile) | 1-column job grid, filters hidden behind toggle, bottom-sheet modal |
| 640–1023px (tablet) | 2-column job grid, filters behind toggle, centered modal |
| 1024px+ (desktop) | Sidebar filters visible, 2-column job grid, centered modal |

---

## Key Interactions

1. Tab switch (IT/Tech ↔ French Language): resets all filters and refetches
2. Search: 300ms debounce, resets page to 1
3. Any filter change: resets page to 1, immediate refetch
4. Job card click: opens detail modal
5. Modal backdrop click or X: closes modal
6. "Apply on [Source]": opens source_url in new tab
7. "Share" button: copies source_url to clipboard
8. Pagination: smooth scroll to top of results

---

## Accessibility Requirements

- All interactive elements minimum 44px touch target
- `role="tablist"` / `role="tab"` / `aria-selected` on category tabs
- `aria-label` on all icon-only buttons
- `aria-busy="true"` on grid during loading
- `aria-current="page"` on active pagination button
- `aria-label` on pagination nav
- Dialog uses native `<dialog>` element with `showModal()` / `close()`
- Focus trap inside open modal
- Keyboard: Escape closes modal
