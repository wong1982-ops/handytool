# Google Stitch Prompt — NZ Tax Manager

## Context
Design a dark-themed web application screen for "NZ Tax Manager", a tool built for New Zealand sole traders and companies to manage GST returns and income tax. The tool lets users upload bank statements, categorise transactions with AI assistance, and generate IRD (Inland Revenue) forms (GST101A, IR3, IR4). UI consistency redesign only — no feature changes.

---

## Design System

### Color Tokens
- **Page background**: `#090f16` (near-black, deep navy)
- **Card background**: `#131a23` (dark blue-grey)
- **Card hover / elevated surface**: `#1e2631`
- **Border**: `#1e2631`
- **Primary accent**: `#3D6AF2` (vibrant blue)
- **Gradient**: `from-[#3D6AF2] to-[#7C3AED]` (blue to violet)
- **Text primary**: `#ffffff`
- **Text secondary**: `#a6abb5`
- **Text muted**: `#70767f`
- **Success / Income**: `#10B981` (emerald green)
- **Danger / Expense**: `#EF4444` (red)
- **Warning / GST owing**: `#F59E0B` (amber)

### Typography
- Font: **Inter** (system fallback: -apple-system, sans-serif)
- Weights used: 400 (body), 500 (medium), 600 (semibold), 700 (bold)
- Base size: 14px (sm), 16px (base), 12px (xs)

### Spacing & Radius
- Border radius: `rounded-xl` (12px) for cards and inputs; `rounded-lg` (8px) for inner elements; `rounded-full` for pills
- Card padding: 16px (mobile), 24px (desktop)
- Gaps: 12px between cards, 16px between sections, 24px between major areas

### Interactive Elements
- Minimum height for all buttons, selects, inputs: **44px** (accessibility)
- Primary button: gradient blue-to-violet, white text, semibold
- Outline button: `border-[#3D6AF2]` text-[#3D6AF2], hover fills with 10% opacity
- Ghost button: `border-[#1e2631]` text-[#a6abb5], hover darkens bg

---

## Layout Structure

### Page Layout
- Max width: `1024px`, horizontally centered, padding `40px 16px`
- Background: `#090f16`
- Top breadcrumb: "Toolk1t / NZ Tax Manager" in muted text

### Header Area
- **Page title**: "NZ Tax" in white bold + "Manager" in blue-to-violet gradient (gradient text clip)
- **Top control bar** (below title): horizontal row with:
  1. Entity selector dropdown (flex-1, rounded-xl, dark bg) — e.g. "Acme Design Studio (Sole Trader)"
  2. Tax year selector dropdown (fixed width) — e.g. "2025-26"
  3. Settings icon button (gear icon, 44x44px, border rounded-xl)

### Tab Navigation
- Horizontal scrollable pill tabs below the control bar
- Tabs: Overview, Upload, Transactions, GST Return, Income Tax, Settings
- Each tab has a Material Symbol icon + label (label hidden on mobile)
- Active tab: `bg-[#3D6AF2] text-white`
- Inactive tab: `bg-[#131a23] text-[#70767f]`, hover brightens

---

## Screens to Design

### Screen 1 — Overview Tab (primary view to show)

**KPI Cards Grid** (2-col mobile, 4-col desktop):
- Total Income: emerald value `$84,320.00`
- Total Expenses: red value `$31,450.00`
- GST Collected: white value `$12,648.00`
- GST Paid: white value `$4,717.50`

**Summary Row** (2 cards side-by-side):
- GST Owing: amber value `$7,930.50` (card bg `#131a23`, border `#1e2631`)
- Net Profit: emerald value `$52,870.00`

### Screen 2 — Transactions Tab

**Toolbar** inside card:
- Title: "Transactions" + count badge "47 of 52"
- Right: "Re-categorise" outline button + "Approve All" gradient button
- Filter row: 3 dropdowns — All Categories | All Status | All Types

**Transaction Table** (desktop):
| Date | Description | Amount | GST | Category | Approved | Actions |
|---|---|---|---|---|---|---|
| 14 Mar 2026 | GOOGLE WORKSPACE | -$23.00 | $3.00 | Software / SaaS ✅ | ☑ | 🗑 |
| 12 Mar 2026 | CLIENT PAYMENT — INV-0041 | +$3,450.00 | — | Sales / Income ✅ | ☑ | 🗑 |
| 10 Mar 2026 | ADOBE CREATIVE CLOUD | -$89.99 | $11.74 | Software / SaaS ✅ | ☑ | 🗑 |
| 08 Mar 2026 | OFFICE SUPPLIES — WAREHOUSE | -$145.30 | $18.96 | Office Supplies ⚠️ | ☐ | 🗑 |
| 05 Mar 2026 | PETROL — Z ENERGY | -$92.40 | $12.05 | Travel ✅ | ☑ | 🗑 |

- Pending (unapproved) rows: subtle amber tint bg `amber-500/5`
- Confidence indicators: ✅ high/manual, ⚠️ medium, ❓ low
- Category: inline dropdown per row
- Approved: checkbox per row
- Mobile: card layout (one card per transaction)

### Screen 3 — GST Return Tab

Card with collapsible header (expanded state shown):
- Header: "GST Summary" + subtext "GST101A breakdown for selected period"
- Period selector: dropdown "Apr 2025 – May 2025"
- Warning banner (if unapproved): amber bg, "3 unapproved transactions in this period"

**GST Boxes table**:
| Box | Line | Amount |
|---|---|---|
| Box 5 | Total sales including GST | $23,460.00 |
| Box 6 | Zero-rated supplies | $0.00 |
| Box 7 | GST on sales (collected) | $3,060.00 |
| Box 8 | Adjustments | $0.00 |
| Box 9 | Total purchases including GST | $5,830.00 |
| Box 11 | GST on purchases | $760.17 |
| — | Entertainment adjustment (50%) | $45.00 |
| **Box 12** | **GST to pay / (refund)** | **$2,254.83** (amber, highlighted row) |

- "Generate GST101A" gradient button at bottom

### Screen 4 — Income Tax Tab

Card with collapsible header (expanded):
- Header: "Income Tax Summary" + subtext "IR3 estimate for 2025-26 tax year"

**Income by Category** table:
- Sales / Income: `$84,320.00` (emerald)
- Total Income: bold `$84,320.00`

**Deductible Expenses** table:
- Software / SaaS: `$1,247.88` (red)
- Office Supplies: `$892.40`
- Travel: `$1,845.00`
- Professional Services: `$3,200.00`
- Total Expenses: bold `$7,185.28`

**Net Profit** highlighted row: `$77,134.72` emerald, `bg-[#1e2631]`

**Manual Adjustments** (2-col grid of inputs):
- Other Income | Prior Year Losses | RWT Credits | Provisional Tax Paid

**Tax Bracket Breakdown** table (sole trader):
| Bracket | Income | Tax |
|---|---|---|
| 10.5% (up to $14,000) | $14,000.00 | $1,470.00 |
| 17.5% ($14,001–$48,000) | $34,000.00 | $5,950.00 |
| 30% ($48,001–$70,000) | $22,000.00 | $6,600.00 |
| 33% ($70,001–$180,000) | $7,134.72 | $2,354.46 |

- Estimated Income Tax: `$16,374.46` (amber, highlighted)
- ACC Earners' Levy (est.): `$1,234.16`
- "Generate IR3" gradient button

### Screen 5 — Settings Tab

Entity form card:
- Section title: "Entity Settings"
- Entity Name input: "Acme Design Studio"
- Entity Type toggle: [Sole Trader] [Company] — pill radio buttons with glow on selected
- IRD Number input: "123-456-789"
- GST Registered toggle switch (on)
- Filing Basis radio: [Invoice] [Payments]
- Filing Period select: "2-Monthly"
- Actions: "Cancel" outline + "Update Entity" gradient button

---

## Visual Details & Refinements (Stitch-specific notes)

1. **Card depth**: Cards use `bg-[#131a23]` with `border border-[#1e2631]`. No shadow — dark theme creates depth via color contrast alone.
2. **Gradient text**: Page title "Manager" word uses `background-clip: text` with the blue-to-violet gradient.
3. **Tab active state**: Blue fill, not underline. Tabs are pill-shaped (`rounded-lg`), not underlined.
4. **Select inputs**: Dark styled, same card background color, border matches cards. Chevron arrow in muted color.
5. **Gradient buttons**: Linear gradient `from-[#3D6AF2] to-[#7C3AED]`, white semibold text, `rounded-xl`, hover reduces opacity to 0.9.
6. **Pending transaction rows**: `bg-amber-500/5` — very subtle amber wash, not full highlight. This communicates "needs attention" without overwhelming.
7. **GST Box 12 row**: Highlighted with `bg-[#1e2631]` background and amber text for the final owing amount.
8. **Collapsible sections**: GST and Income Tax panels use chevron-down icons that rotate 180° on expand.
9. **Mobile-first**: Below `md` breakpoint, transaction table becomes stacked cards. Tabs show icon only (label hidden on mobile).
10. **Material Symbols icons**: Use `weight=300, FILL=0` style (outlined) for tab icons: `bar_chart`, `upload_file`, `receipt_long`, `calculate`, `account_balance`, `settings`.

---

## Component Inventory

| Component | Description |
|---|---|
| ToolBreadcrumb | "Toolk1t / NZ Tax Manager" in muted text |
| PageTitle | "NZ Tax **Manager**" with gradient on last word |
| EntitySelector | Dropdown + TaxYear dropdown + Settings icon button |
| TabNav | Horizontal scrollable pill tabs with icon + label |
| KpiCard | Label (xs muted) + Value (lg bold, colored) in `#131a23` card |
| SummaryCard | Label (sm secondary) + Value (xl bold, colored) + optional "(refund)" suffix |
| TransactionToolbar | Title + count + Re-categorise + Approve All buttons + filter selects |
| TransactionTable | Sortable columns, inline category select, checkbox, delete icon |
| TransactionCard | Mobile-only card: date + amount header, description, category pill, note, actions |
| GstPanel | Collapsible card: period select + warning banner + box rows + generate button |
| IncomeTaxPanel | Collapsible card: income/expense tables + manual adjustments + bracket table + generate button |
| SettingsForm | Entity name + type radio + IRD + GST toggle + GST options + save button |
| ConfidenceIndicator | ✅ high/manual, ⚠️ medium, ❓ low |
