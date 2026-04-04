# Google Stitch Prompt — SEO Studio

## Tool Overview

**SEO Studio** is a hybrid public/admin SEO tool on Toolk1t. It helps users discover keywords and plan content, while admins can audit existing pages and generate SEO landing pages. It uses the ToolFrame layout system with a blue/utility category theme.

The tool has four tabs:
1. **Keywords** (public) — keyword research with Google Autocomplete + AI analysis
2. **Content** (public) — content calendar with AI blog draft generation
3. **Audit** (admin) — scan tool pages for SEO issues
4. **Pages** (admin) — auto-generate SEO landing pages for tools

---

## Design Goals

- Apply the **Toolk1t dark design language** and **ToolFrame utility theme** (blue gradient header)
- Fixed header + scrollable content + optional action bar (ToolFrame pattern)
- WCAG 2.1 AA contrast, 44px minimum touch targets
- Mobile-first responsive layout
- Admin tabs show a lock icon and gate non-admin users

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
secondary:      #32A9D9
purple:         #7C3AED

success:  #10B981
danger:   #EF4444
warning:  #F59E0B
```

**ToolFrame utility header:** `bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900`

---

## ToolFrame Header (shared across all tabs)

- Compact gradient header bar (~48px) with:
  - Back arrow (left) → links to homepage
  - Search magnifying glass SVG icon (blue-400 accent)
  - Tool title: "SEO Studio" (16px, semibold, white)
  - Favorite star button (right)
- No global site header (hidden by ToolFrame)

## Tab Navigation (sticky below header)

- 4 tabs in a horizontal row, scrollable on mobile:
  - **Keywords** — active: blue-400 text + blue bottom border
  - **Content** — same active style when selected
  - **Audit** — lock icon suffix, muted when non-admin
  - **Pages** — lock icon suffix, muted when non-admin
- Background: page-bg with border-bottom in border color
- Sticky top (z-20), scrolls with content below

---

## Screen Specifications

### Tab 1 — Keywords (Public)

**Layout:** Centered content, max-w-5xl, vertical stack.

#### Search Section (top, centered max-w-2xl)
- Large text input: card-bg fill, border, 12px radius, 44px height
  - Placeholder: `"Enter a keyword or topic..."`
  - Search icon (left, text-muted)
- "Research" button: primary gradient, 44px height, 12px radius
  - Loading state: spinner replaces text
  - Credit badge below: `"1 credit"` in purple text (12px)
- Enter key submits

#### Results (full width, space-y-6)

**Keyword Suggestions Table:**
- Section header: `"Keyword Suggestions"` (14px semibold white) + count badge (rounded-full, card-bg, text-muted)
- Export CSV button (right-aligned, secondary style, small)
- Table: card-bg background, border, 12px radius
  - Header row: `Keyword | Volume | Competition | Relevance` (11px uppercase tracking-wider text-muted)
  - Data rows: hover to card-hover
    - Keyword: 14px white
    - Volume: badge pill — `high` = green-500/20 bg + green-400 text, `medium` = amber-500/20 bg + amber-400 text, `low` = slate-500/20 bg + slate-400 text
    - Competition: badge pill — `easy` = green, `medium` = amber, `hard` = red (same badge pattern)
    - Relevance: percentage text (14px, text-secondary)
  - Click row: brief "Copied!" toast feedback

**People Also Ask:**
- Section header: `"People Also Ask"` (14px semibold white)
- List of question cards: card-bg, border, 12px radius, 12px padding
  - Question mark icon (text-muted) + question text (14px, text-secondary)

**Google Autocomplete:**
- Section header: `"Google Autocomplete"` (14px semibold white)
- Horizontal flex-wrap of pills: card-bg, border, rounded-full, px-3 py-1.5, 13px text-secondary

**Long-tail Keywords:**
- Section header: `"Long-tail Keywords"` (14px semibold white)
- Same pill style as autocomplete

---

### Tab 2 — Content (Public)

**Layout:** Full width, max-w-5xl.

#### List View (default)
- Header row: `"Content Calendar"` title (20px bold white) + `"New Post"` button (primary gradient, 44px)
- Post cards: card-bg, border, 12px radius, 16px padding, hover to card-hover
  - Left column: keyword (14px bold white), topic below (13px text-secondary)
  - Right column: status badge + scheduled date (if set)
  - Status badges:
    - `planned` = slate-500/20 bg + slate-400 text
    - `generating` = amber-500/20 bg + amber-400 text + animate-pulse
    - `draft` = blue-500/20 bg + blue-400 text
    - `published` = green-500/20 bg + green-400 text
  - Click → opens editor
- Empty state: document icon (text-muted) + `"No content plans yet"` + `"Create First Post"` CTA

#### Editor View (replaces list)
- Back arrow + `"Back to Calendar"` link (text-secondary)
- Form section: card-bg, border, 12px radius, 20px padding
  - 4 fields in a 2×2 grid on desktop, stacked on mobile:
    - Keyword (text, required) — label above, card-bg input
    - Topic/Angle (text, optional)
    - Target Tool (select dropdown with all tools)
    - Schedule Date (date input)
  - All inputs: card-bg fill, border, 12px radius, 44px height, focus ring primary
- `"Generate Draft"` button: primary gradient, full width max-w-sm, centered
  - `"2 credits"` badge below in purple

#### Draft Preview (shown after generation)
- Card: card-bg, border, 12px radius, 24px padding
  - Title: 20px bold white
  - Meta description: 14px text-secondary + char count right-aligned (turns red > 160)
  - Divider (border-bottom)
  - Body: monospace pre block, 13px, text-secondary, card-hover bg, 12px radius, 16px padding, max-h-[400px] overflow-y-auto
  - Suggested links: list of link pills (text-primary-light)
- Actions row: `"Save Plan"` (secondary, 44px) + `"Publish to Blog"` (primary gradient, 44px)

---

### Tab 3 — Audit (Admin Only)

**Layout:** Full width, max-w-5xl.

**Admin Gate** (if non-admin): centered lock icon (48px, text-muted) + heading `"Admin Access Required"` + subtitle.

#### Scan Controls
- `"Run Full Audit"` button: primary gradient, 44px
  - When scanning: progress bar (12px height, card-bg track, primary fill) + `"Scanning 12/34..."` label
  - Last scan timestamp (13px text-muted)

#### Results Dashboard (after scan)

**Overall Score:**
- Large centered number (48px bold) with color:
  - 80-100: green-400
  - 50-79: amber-400
  - 0-49: red-400
- Subtitle: `"Overall SEO Score"` (14px text-secondary)
- Issue count summary: 3 badge pills showing `"5 Critical"` (red), `"8 Warnings"` (amber), `"12 Info"` (blue)

**Tool Results List:**
- Cards for each tool: card-bg, border, 12px radius, 16px padding
  - Left: tool name (14px bold white) + score number (right, colored)
  - Expandable: click to show issues list
  - Each issue row:
    - Icon: red circle (critical), amber triangle (warning), blue info circle (info)
    - Message (14px text-secondary)
    - Current value: `"Currently: 'My Tool | Toolk1t' (42 chars)"` (13px text-muted)
    - Recommended: `"Recommended: 50-60 characters"` (13px primary-light)

---

### Tab 4 — Pages (Admin Only)

**Layout:** Full width, max-w-5xl.

**Admin Gate** same as Audit tab.

#### Page List (default)
- Header row: `"Landing Pages"` title (20px bold white) + `"New Page"` button (primary gradient, 44px)
- Table: card-bg, border, 12px radius
  - Header: `URL | Keyword | Tool | Status | Created` (11px uppercase text-muted)
  - Data rows: hover to card-hover
    - URL: primary-light link text (truncated)
    - Keyword: 14px text-secondary
    - Tool: 14px white
    - Status badge: `draft` = amber, `live` = green (same badge pattern)
    - Created: 13px text-muted date
- Empty state: globe icon + `"No landing pages yet"`

#### New Page Form
- 3 fields:
  - Target Tool (select dropdown, required)
  - Target Keyword (text input, required)
  - Page Type: 2 radio pills — `"Use Case"` / `"Free Tool"` (same as color direction pills)
- `"Generate Page"` button: primary gradient, 44px
  - `"3 credits"` badge below in purple

#### Generated Preview
- Card with structured sections:
  - Hero preview: gradient bg (primary to primary-light), headline (24px bold white) + subheadline (16px text-secondary)
  - Benefits: numbered list cards
  - FAQ: accordion-style Q&A list
  - CTA: simulated button preview
- Actions: `"Save as Draft"` (secondary) + `"Publish"` (primary gradient)

---

## Interaction Notes

- All primary actions use the `from-[#3D6AF2] to-[#3D9DF2]` gradient
- All secondary actions use card-bg + border + text-secondary styling
- Selected/active states use a 2px primary blue ring
- Tab active indicator: blue-400 text + 2px bottom border
- Transitions: 150–200ms ease for hovers
- Disabled states: 40% opacity, not-allowed cursor
- Focus visible: 2px primary blue focus ring for keyboard navigation
- Credit badges: purple (#7C3AED) text, 12px size
- Admin lock icon: small padlock SVG suffix on tab labels
- Error banner: red-900/30 bg, red-400 text, 12px radius
- Toast/copy feedback: brief overlay at bottom-center, card-bg, border, auto-dismiss 2s

## Responsive Behavior

- **Desktop (md+):** max-w-5xl centered, tables show all columns, forms in 2-col grid
- **Mobile:** full width, tables collapse to card list, forms stack vertically, tabs horizontally scrollable
- ToolFrame handles header/content/footer zones — content scrolls, header stays fixed
