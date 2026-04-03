# Regex Tester — Google Stitch Design Prompt

## Tool Overview

Regex Tester is a 100% client-side regular expression testing tool with 30+ preset patterns. Users enter a regex pattern with flag toggles (g, i, m, s), paste test text, and see live match highlights in the text area. Two modes: **Match** (default) and **Replace**. A sidebar preset library lets users pick common patterns (email, phone, IP, date, etc.) grouped by category. History is auto-saved. State can be shared via URL hash.

---

## Stitch Prompt

### Screen: Regex Tester — Desktop (Match Mode, Active Matches)

Regex Tester tool page for a developer utility web app called Toolk1t.

**Layout:** Two-column desktop layout (1200px max-width). Left column: 256px sticky preset sidebar. Right column: flexible main workspace stacked vertically.

**Design System:**
- Dark theme only
- Page background: #090f16
- Card/panel background: #131a23
- Border color: #1e2631
- Text primary: #ffffff
- Text secondary: #a6abb5
- Text muted: #70767f
- Primary blue: #3D6AF2
- Success green: #10B981
- Danger red: #EF4444
- Font: Inter, system-ui
- Border radius: 12px for cards/inputs, 8px for buttons/badges
- All interactive elements min-height 44px

---

### Breadcrumb (top of page)

Small breadcrumb row: `Home / Tools / Regex Tester` in text-muted color with `/` separators. "Regex Tester" is the active crumb in text-secondary.

---

### Page Header

Left-aligned block below breadcrumb:
- H1: "Regex Tester" — font-size 28px, font-weight 700, color #ffffff
- Subtext: "Test, match, and replace with regular expressions — 100% client-side with 30+ preset patterns." — font-size 14px, color #a6abb5

---

### Left Column — Preset Sidebar (256px wide, sticky)

Card with background #131a23, border #1e2631, border-radius 12px.

**Top: Search input**
- Full-width search input inside the card header section, separated by a bottom border
- Placeholder: "Search presets..."
- Left icon: magnifying glass in #70767f
- Input background: #0d1420, border #1e2631, color #ffffff, border-radius 8px
- Min-height 44px

**Body: Grouped preset list (scrollable)**
Category headers in ALL CAPS, font-size 10px, font-weight 700, letter-spacing 0.08em, color #70767f. Padding top/bottom 6px.

Categories shown (with presets below each):
- **COMMON** — Email Address ✉️ *(active — highlighted)*, URL 🔗, Hex Color 🎨
- **NETWORK** — IPv4 Address, IPv6 Address, MAC Address
- **IDENTITY** — Social Security Number, Passport Number
- **PHONE NUMBERS** — US Phone Number 📞, International Phone
- **DATE & TIME** — ISO Date, US Date
- **FINANCIAL** — Credit Card, IBAN

Each preset is a full-width button, min-height 44px, padding 8px 12px, border-radius 8px, font-size 13px.

Active preset ("Email Address ✉️") has:
- Background: rgba(61, 106, 242, 0.12)
- Text color: #3D6AF2 (primary blue)
- Font weight: 600

Inactive presets: text #a6abb5, hover background #1e2631.

---

### Right Column — Main Workspace

**Toolbar row (full width, flex, space-between):**

Left side — Mode toggle segmented control:
- Background: #131a23, border-radius 8px, padding 4px
- "Match" tab: active — white background (#1e2631 inner card look), font-weight 600, color #ffffff, min-height 44px, padding 8px 20px
- "Replace" tab: inactive — color #70767f, hover color #a6abb5, same sizing

Right side — Icon+label action buttons (inline, 44px min-height each):
- 🕐 **History** — icon + "History" label, color #70767f, hover background #1e2631, border-radius 8px, padding 8px 12px
- 🔗 **Share** — icon + "Share" label, same styling
- ✕ **Clear** — icon + "Clear" label, hover text #EF4444, hover background rgba(239, 68, 68, 0.08)

---

**Regex Pattern Input (below toolbar):**

Full-width row with background #131a23, border #1e2631, border-radius 12px. Active focus ring: 2px solid rgba(61, 106, 242, 0.4).

Structure (left to right):
- Leading `/` character in #70767f, font-mono, font-size 18px, padding-left 16px
- Input field (flex-1): font-mono 14px, color #ffffff, placeholder "Enter regex pattern...", background transparent, no outline
- Mock value shown: `[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}` in #ffffff
- Trailing `/` character in #70767f, padding-right 4px
- Vertical divider line #1e2631
- Flag toggle buttons (4 buttons: g, i, m, s) — each 32x32px, border-radius 6px, font-mono font-weight 700
  - `g` active: background #3D6AF2, text #ffffff
  - `m` active: background #3D6AF2, text #ffffff
  - `i` inactive: text #70767f, hover background #1e2631
  - `s` inactive: text #70767f, hover background #1e2631

---

**Preset description hint (below regex input):**

Slim info bar, background rgba(61, 106, 242, 0.06), border rgba(61, 106, 242, 0.2), border-radius 8px, padding 8px 12px.
Text: "Validates standard email addresses including subdomains and plus-addressing. Requires a TLD of 2+ characters." — font-size 13px, color #6B9CF4 (light primary blue).

---

**Test String textarea (below hint bar):**

Label: "TEST STRING" — font-size 10px, font-weight 700, letter-spacing 0.08em, color #70767f, margin-bottom 8px.

Textarea container: background #131a23, border #1e2631, border-radius 12px, overflow hidden, focus ring 2px primary.

The textarea shows test text with inline match highlights. The text content displayed:

```
Contact us at support@toolk1t.com or hello@example.org for help.
Billing invoices go to billing+invoices@company.co.uk.
Invalid addresses: not-an-email, @missing-user.com, missingdomain@
```

Match highlights (rendered as colored `<mark>` spans over a transparent textarea):
- `support@toolk1t.com` — yellow highlight rgba(250, 204, 21, 0.35)
- `hello@example.org` — cyan highlight rgba(34, 211, 238, 0.35)
- `billing+invoices@company.co.uk` — pink highlight rgba(244, 114, 182, 0.35)

Textarea min-height 160px, font-mono 13px, padding 12px, resize vertical handle visible at bottom-right, color transparent (caret is white), text rendered via the highlight layer.

---

**Match Results section (below textarea):**

Header row (flex, space-between):
- Left: "MATCHES" label — 10px, 700 weight, tracking wide, color #70767f
- Right: badge "3 matches" — background rgba(61, 106, 242, 0.12), text #3D6AF2, font-weight 600, border-radius 20px, padding 2px 10px, font-size 12px

Match list (scrollable, max-height 320px), background #131a23, border #1e2631, border-radius 12px, padding 8px:

**Match row 1 (collapsed):**
- Full-width row, min-height 44px, border-radius 8px, border #1e2631
- Left: index `#0` — font-size 10px, color #70767f, font-mono, width 24px, text-right
- Center: `"support@toolk1t.com"` — font-mono 12px, color #ffffff, flex-1, truncate
- Right: position `0–22` — font-size 10px, color #70767f, font-mono
- No expand arrow (no groups)

**Match row 2 (collapsed):**
- Same structure
- `"hello@example.org"` / position `27–45`

**Match row 3 (expanded — has named groups):**
- `"billing+invoices@company.co.uk"` / position `78–108`
- Expand arrow (chevron-up, rotated 180° meaning expanded), color #a6abb5
- Expanded panel below the row (background #0d1420, border-top #1e2631, padding 8px 12px):
  - Table rows:
    - `user` | `billing+invoices` — key in #70767f font-mono semibold, value in #a6abb5 font-mono
    - `domain` | `company.co.uk`

---

**Status bar (bottom of workspace):**

Full-width slim bar, background #131a23, border-radius 8px, padding 6px 12px.
Flex row, gap 12px, font-mono 11px, color #70767f.

Items separated by `|` dividers (#1e2631):
- `3 matches`
- `2 groups`
- `Flags: /gm/`
- `JavaScript RegExp`

---

### Mobile Behavior (375px — show in a second frame)

Single column. The preset sidebar is hidden. Instead, a full-width "Pattern Library" button appears at the top (background #131a23, border #1e2631, icon + label centered, min-height 44px). All other sections stack vertically. Toolbar wraps to two rows. The mode toggle takes full width.

---

## Design Notes for Stitch

- Use dark theme exclusively — no light mode variant needed
- All inputs use `#131a23` card background, not pure black
- Primary interactive color is #3D6AF2 — use for active states, focus rings, badges, active flags
- Match highlights in the textarea are purely visual overlays (semi-transparent colored marks)
- The font throughout is Inter; monospace sections use system mono stack
- Keep component density medium — not cramped, not airy. Labels have 8px gap above inputs.
- The preset sidebar has a thin scrollbar styled to match the dark theme
- No gradients, no glassmorphism — flat dark surfaces with subtle borders
- Consistent border-radius: 12px for major panels/inputs, 8px for secondary elements (buttons, badges)
