# Story Studio — Google Stitch Design Prompt

## Context

Story Studio is a children's story creation tool within the Toolk1t platform. This is a **UI consistency redesign only** — no features change. The goal is to replace the existing indigo/purple theme with the Toolk1t brand primary blue (#3D6AF2) across the full shell and all components.

---

## Stitch Prompt

```
Story Studio tool page for a children's AI story creation platform called Toolk1t.

This is a DARK-THEME web app. The design uses the Toolk1t design system:
- Page background: #090f16 (very dark navy)
- Card background: #131a23
- Card hover: #1e2631
- Border color: #1e2631
- Primary brand blue: #3D6AF2
- Text primary: #ffffff
- Text secondary: #a6abb5
- Text muted: #70767f
- Success green: #10B981
- Danger red: #EF4444

---

SCREEN 1 — Main "Stories" tab (default view)

Layout: Full-width dark page with a sticky branded header + sticky tab bar + scrollable content area.

HEADER SECTION (dark gradient, NOT indigo/purple — use a deep navy-to-blue gradient from #090f16 via #0d1829 to #090f16):
- Breadcrumb top-left: "Tools / Story Studio" in muted text (#70767f) on desktop only
- Title row: sparkle/wand icon in GOLD (#f59e0b, animated pulse dot on it) + "Story Studio" bold heading in white
  (use a tasteful serif or elegant font for the title only — Inter everywhere else)
- Right side of title row: "My Book" dropdown selector (shows currently active book, pill-shaped, #1e2631 background, white text, chevron icon, min-height 44px)
- Subtle star-particle shimmer effect overlaid on the header background (small white/amber dots)
- NO indigo or purple anywhere in the header

TAB BAR (sticky, sits below header, z-index above content):
- Background: #131a23 (card-bg)
- Bottom border: 1px solid #1e2631
- Three tabs: "Stories" (sparkle icon), "Characters" (people icon), "Bookshelf" (book icon)
- Active tab: bottom border 2px solid #3D6AF2, text color #3D6AF2, icon #3D6AF2
- Inactive tabs: text #a6abb5, hover text #ffffff, hover border #1e2631
- Min-height 44px per tab, horizontally scrollable on mobile

CONTENT AREA (below tabs, max-width 1280px centered, px-4 md:px-6, py-6):

IN-PROGRESS SECTION (shows when stories are generating — show 1 card as example):
- Section heading: "In Progress (1)" in small caps, #70767f
- Job card: #131a23 bg, #1e2631 border, rounded-xl, p-4
  - Left: small book-cover thumbnail placeholder (56×72px, rounded-lg, spinner icon)
  - Content: job title "The Dragon and the Moon Princess", blue-to-cyan progress bar at 68%, status label "Generating illustrations... 68%"
  - Top-right: ✕ dismiss button (small circle, #1e2631 bg)
  - On failure state: red progress bar, "Generation paused" message, retry button (red ghost style)

MY STORIES SECTION:
- Row: "My Stories" heading (text-lg, white, font-semibold) + "New Story" button (right-aligned, #3D6AF2 bg, white text, + icon, rounded-lg, min-height 44px, hover: darken)
- Filter row below heading:
  - Search input (flex-1): magnifier icon inside, placeholder "Search stories...", #131a23 bg, #1e2631 border, focus ring #3D6AF2, rounded-lg
  - Sort dropdown: "Newest first", same styling as search
  - Series dropdown: "All series", same styling
- Story card grid: 2 cols mobile → 3 cols sm → 4 cols lg, gap-4

STORY CARDS (4 visible, realistic mock data):
Each card is #131a23 bg, #1e2631 border, rounded-xl, overflow-hidden, hover: shadow-lg, hover border #3D6AF2/30

Card 1 — "The Dragon and the Moon Princess" (complete)
  - Cover: tall 3:4 aspect book-cover image area (gradient placeholder: top #1e2985 to bottom #0a0f1e with a crescent moon silhouette illustration in gold)
  - Info section p-3:
    - Title truncated, font-medium text-sm white
    - "12 pages · Mar 15, 2026" in text-muted
    - Status badge: "Complete" pill, green bg/text (#10B981)
  - Actions row (border-top #1e2631):
    - "Edit" button (flex-1, icon + text, text-secondary, hover: text-white, hover bg #1e2631, min-height 44px)
    - Eye icon button (toggle share — active shows blue eye icon #3D6AF2, inactive shows crossed-out eye icon #70767f)
    - Trash icon button (#70767f, hover: #EF4444)

Card 2 — "Benny the Brave Bunny" (draft)
  - Cover: warm orange-to-amber gradient placeholder with bunny silhouette
  - "8 pages · Apr 1, 2026", status badge: "Draft" amber pill
  - "✓ Complete" small action badge in blue (blue bg, white text) next to Draft badge — lets user mark it complete

Card 3 — "Stars Above Sleepy Hollow" (complete)
  - Cover: deep purple-to-navy gradient with star cluster illustration
  - "6 pages · Feb 20, 2026"

Card 4 — "Mia and the Talking Teapot" (draft)
  - Cover: teal-to-emerald gradient with teapot silhouette
  - "4 pages · Apr 2, 2026"

All cards use Inter font, system sans-serif stack.
No cards show real photos — use CSS gradient placeholders with icon silhouettes.

---

SCREEN 2 — "Characters" tab (show as separate screen/view)

Same header + tab bar. Characters tab is active (blue underline).

Content area:
- "My Characters" heading + "New Character" button (same style as New Story, #3D6AF2)
- Character cards grid: 2 cols mobile → 3 sm → 4 lg
- Each character card: #131a23 bg, rounded-xl, p-4, flex col, items-center, text-center
  - Avatar circle (64px diameter, gradient background) with initials or silhouette icon
  - Character name (font-medium, white)
  - "Used in 3 stories" (#a6abb5, text-xs)
  - "Edit" link (#3D6AF2, text-sm)

Mock characters:
1. "Princess Amara" — rose gradient avatar, Used in 4 stories
2. "Captain Finn" — ocean blue gradient avatar, Used in 2 stories
3. "Granny Moss" — forest green gradient avatar, Used in 1 story
4. "Shadow the Cat" — charcoal gradient avatar, Used in 3 stories

---

SCREEN 3 — "Bookshelf" tab (show as separate screen/view)

Same header + tab bar. Bookshelf tab active.

Content area:
- "My Bookshelf" heading (no CTA button needed)
- Subtitle: "Complete stories ready to read" (#a6abb5, text-sm)
- Grid: 2 cols → 3 → 4, same gap
- Completed book cards: taller 3:5 aspect ratio (portrait book-cover style), hover: scale 1.02, shadow-xl
  - Rounded-xl book cover with spine shadow effect on left edge (4px darker strip)
  - Title overlay at bottom: dark gradient overlay → title in white, bold
  - "Read" CTA button (overlays on hover, #3D6AF2, white text, rounded-lg, centered)

Show 3 completed books:
1. "The Dragon and the Moon Princess" — navy/gold cover
2. "Stars Above Sleepy Hollow" — purple/silver cover  
3. "Captain Finn's Ocean Adventure" — teal/blue cover

---

VISUAL STYLE SUMMARY:
- Dark theme throughout (NO light mode depicted)
- Primary blue #3D6AF2 for ALL active states, CTAs, focus rings, interactive highlights
- NO indigo-500/purple/violet anywhere
- Gold (#f59e0b) used ONLY for the Story Studio icon/sparkle decoration
- Red (#EF4444) for delete/danger actions only
- Green (#10B981) for complete/success states only
- Rounded-xl corners on cards, rounded-lg on buttons and inputs
- Subtle border glow on hover: border-color transitions to #3D6AF2/40
- Inter font for all UI text; an elegant serif (Georgia, Palatino) for the "Story Studio" title only
- Smooth transitions (150ms ease) on all interactive states
- Mobile-first: touch targets min 44px height

Platform: Responsive web (mobile + desktop shown), dark theme only.
```

---

## Key Design Decisions

| Element | Old (Indigo/Purple) | New (Toolk1t Blue) |
|---|---|---|
| Header gradient | `from-indigo-950 via-purple-900` | Deep navy `#090f16 → #0d1829` |
| Active tab underline | `border-indigo-500` | `border-[#3D6AF2]` |
| Active tab text | `text-indigo-600 dark:text-indigo-400` | `text-[#3D6AF2]` |
| New Story button | `bg-indigo-600 hover:bg-indigo-700` | `bg-[#3D6AF2] hover:bg-[#2d58d4]` |
| Search focus ring | `focus:ring-indigo-500` | `focus:ring-[#3D6AF2]` |
| Series label | `text-indigo-500 dark:text-indigo-400` | `text-[#3D6AF2]` |
| Sign-in button | `bg-indigo-600 hover:bg-indigo-700` | `bg-[#3D6AF2] hover:bg-[#2d58d4]` |
| Job card hover border | `hover:border-indigo-300` | `hover:border-[#3D6AF2]/50` |
| Share icon (active) | `text-indigo-500` | `text-[#3D6AF2]` |
| Tab background | `bg-white dark:bg-slate-900` | `bg-[#131a23]` |

## Screens to Generate
1. Stories tab (default) — with in-progress job + 4 story cards
2. Characters tab — 4 character cards
3. Bookshelf tab — 3 completed book covers

## Reference
Current implementation uses: `from-indigo-950 via-purple-900 to-indigo-950` header, `border-indigo-500 text-indigo-600` active tabs, `bg-indigo-600` CTAs — all to be replaced with Toolk1t blue #3D6AF2.
