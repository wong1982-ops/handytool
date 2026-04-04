# Google Stitch Prompt — Admin Analytics Dashboard

## Screen Overview

Admin-only analytics section within the profile page on Toolk1t. Shows user growth, tool usage, credits/revenue, and referral metrics in a vertical scroll layout with CSS-only bar charts. Only visible to admin users.

**Platform:** Responsive web (mobile-first, 390px → 1440px)
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
success:        #10B981
purple:         #7C3AED
danger:         #EF4444
```

---

## Layout

This is a **section within the profile page**, rendered below the existing referral section. Design only this analytics section.

### Header Row
- Left: `"📊 Analytics"` heading (18px, bold, white)
- Right: time period pills — `"7d"` / `"30d"` / `"90d"` (active = primary blue fill, inactive = card-bg + border, each 36px height, rounded-full, px-4)

---

### Section 1 — User Growth (mt-4)

**3 metric cards** in a row (grid-cols-3, gap-3):
- Card: card-bg, border, 12px radius, 16px padding, text-center
- Large number: 28px bold (white for total/new, primary blue for active)
- Label: 12px text-muted

**Signup chart** (mt-4):
- Container: card-bg, border, 12px radius, 16px padding
- Title: `"New Signups"` (13px semibold white)
- Bar chart area: flex row, items-end, gap-1, h-[120px]
  - Each bar: `bg-[#3D6AF2]` rounded-t, min-w-[8px], flex-1
  - Count label above bar: 10px text-muted (only if > 0)
  - Date label below: 10px text-muted, rotated 45deg or horizontal if space
- X-axis: light border-t

---

### Section 2 — Tool Usage (mt-6)

**Section title:** `"Top Tools"` (14px semibold white)

**Table:** card-bg, border, 12px radius, overflow hidden
- Header: 11px uppercase text-muted, px-4 py-2, border-b
- Columns: `#` (rank), `Tool`, `Credits`, `Uses`, `Trend`
- Data rows: px-4 py-3, border-b last:border-0, hover card-hover
  - Rank: text-muted
  - Tool: white, 14px
  - Credits/Uses: text-secondary, 13px
  - Trend: ↑ green / ↓ red / → slate (13px)

**Horizontal bars** (mt-3): top 5 tools
- Each row: tool name (13px text-secondary, w-24) + bar (flex-1, h-6, bg-[#3D6AF2] rounded-r, width proportional) + count (13px text-muted, w-12 text-right)

---

### Section 3 — Credits (mt-6)

**3 metric cards** (grid-cols-3, gap-3):
- Purchased: number in success green
- Consumed: number in primary blue
- Conversion: number in purple (with % suffix)

**Credits chart** (mt-4):
- Same bar chart container as signups
- Title: `"Credits Flow"`
- Two-color bars per day: blue bottom (consumed) + green top (purchased)
- Legend: two small dots + labels (`"Consumed"` blue, `"Purchased"` green)

---

### Section 4 — Referrals (mt-6)

**3 metric cards** (grid-cols-3, gap-3):
- Referrals: white
- Credits Awarded: success green
- Conversion: purple

**Top referrers table** (top 5):
- Same table style as tool usage
- Columns: User (email truncated to first 3 chars + ***), Referrals, Credits

---

## Mobile (< 768px)

- Metric cards: grid-cols-1 (stack vertically)
- Tables: horizontal scroll if needed
- Bar charts: fewer bars, wider per bar
- Period pills: smaller text (12px)

## Interaction Notes

- Period selector updates all sections instantly (re-fetch)
- Loading state: skeleton pulse for all cards and charts
- No click-through or drill-down (read-only dashboard)
- Charts use CSS only (div height = percentage of max value)
