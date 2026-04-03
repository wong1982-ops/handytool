# Google Stitch Prompt — Mood Board Studio

## Tool Overview

**Mood Board Studio** is a multi-view AI creative tool on Toolk1t. It lets users generate aesthetic mood boards from a text description by choosing a vibe and color direction, then viewing the resulting board of images, a color palette, typography suggestions, notes, and color swatches.

The tool has four views:
1. **Wizard** — 3-step flow (describe theme → pick vibe → choose color direction)
2. **Loading** — generation progress screen
3. **Board** — the finished sectioned board with a toolbar and side drawer
4. **My Boards** — history list of past boards

---

## Design Goals

- Apply the **Toolk1t dark design language** consistently across all views
- Maintain all existing features — visual redesign only
- Ensure WCAG 2.1 AA contrast, 44px minimum touch targets
- Mobile-first responsive layout

---

## Brand Tokens

```
page-bg:      #090f16
card-bg:      #131a23
card-hover:   #1e2631
border:       #1e2631
text-primary: #ffffff
text-secondary: #a6abb5
text-muted:   #70767f

primary:      #3D6AF2
primary-light: #3D9DF2
secondary:    #32A9D9

success:  #10B981
danger:   #EF4444
warning:  #F59E0B
```

---

## Screen Specifications

### View 1 — Wizard (3 Steps)

**Layout:** Centered single-column card on the page background. The card is `max-w-xl` with 40px padding. A "My Boards" secondary button is pinned to top-right of the page.

#### Step 1 — Describe your theme

- Heading: `"What's your mood board for?"` (28px, bold, text-primary)
- Subtext: `"Describe your project, brand, or creative vision."` (14px, text-secondary)
- Multi-line textarea (3 rows), card-bg fill, border, 12px radius, focus ring in primary blue
  - Placeholder: `"A cozy autumn wedding with rustic details..."`
- Primary CTA button: `"Next →"` — full width, gradient from primary to primary-light, 12px radius, 44px height, disabled when empty
- Divider with "or" text (muted)
- Secondary link text: `"Start from a template"` — inline link in primary blue
- Template grid (2 cols, 2×3 cards): each card has a label + short description, card-bg, hover to card-hover, border, 12px radius

#### Step 2 — Pick a vibe

- Heading: `"Pick a vibe"` (24px bold, text-primary)
- Step indicator: `1 ● 2 ● 3` dots with active step highlighted in primary blue
- 2×4 grid of mood cards (on desktop 4 cols, on mobile 2 cols):
  - Each card: aspect-ratio 4:3 top gradient swatch area + label + description below
  - Gradient fills per mood:
    - Cozy: warm terracotta `#D4845A → #8B4513`
    - Bold: vivid crimson `#FF3366 → #CC0033`
    - Elegant: warm greige `#C9B8A8 → #887868`
    - Playful: pink-purple `#FF6B9D → #6C63FF`
    - Minimal: light grey `#F5F5F5 → #BDBDBD`
    - Vintage: dusty amber `#D4A574 → #8B7355`
    - Luxurious: deep navy with gold accents `#2C2C2C → #16213E`
    - Natural: forest green `#5B8C5A → #2D6A4F`
  - Selected state: 2px ring in matching accent color, subtle glow, white check badge top-right
  - Hover: slight scale-up (1.03×), shimmer overlay
- Back + Next buttons in a 2-col row (secondary + primary style)

#### Step 3 — Color direction

- Heading: `"Any color direction?"` (24px bold)
- 4 pill buttons in a centered wrap row: `Warm`, `Cool`, `Neutral`, `Surprise me`
  - Active: primary blue fill, white text
  - Inactive: card-bg, border, text-secondary
  - Each pill: min-height 44px, rounded-full, 24px horizontal padding
- "Skip" text link (text-muted)
- `"Generate Board"` primary gradient CTA button (full width, 44px, prominent)
- Back button below (secondary style)

---

### View 2 — Loading Screen

**Layout:** Full-height centered column on page-bg.

- Large animated spinner (40px diameter, 2px border, primary blue, transparent top)
- Heading: `"Building your board…"` (16px, text-secondary)
- 4 progress steps listed vertically with left icon:
  - Active step: blue pulsing dot + white bold text
  - Completed step: checkmark ✓ + text-secondary
  - Pending step: empty dot + text-muted
  - Labels: `Generating images… / Creating palette… / Picking fonts… / Arranging board…`
- 4×2 image skeleton grid below (8 square cells):
  - Filled cells: card-hover color (solid, appears "loaded")
  - Empty cells: card-bg with pulse animation
- Subtle ambient glow orb behind spinner (primary blue, 20% opacity, large blur radius)

---

### View 3 — Board View (main view)

#### Toolbar (sticky top bar)

- Full-width, 56px height, separated by a subtle border-bottom from board content
- **Left:** `"+ New Board"` secondary button (icon + label, card-bg background)
- **Right cluster:** auto-save indicator dot (green = saved, amber = saving) + label, then "My Boards" icon-button, "Share" icon-button, "Download ▾" dropdown button
  - Dropdown menu: `Export as PNG` / `Export as PDF` — card-bg bg, border, 12px radius

#### Board Canvas

- Board title: large editable input (24px bold, white, transparent bg, no border unless focused) with inline edit affordance
- Theme subtitle (14px, text-muted) below title
- Breadcrumb section labels (uppercase, tracking-wider, 11px, text-muted) above each section

**Section 1 — Images**
- Masonry / CSS grid of up to 8 images, 3–4 columns on desktop, 2 on mobile
- Each image card: 12px radius, overflow hidden, subtle border, selection ring on click (primary blue 2px)
- Hover: delete (×) button appears top-right in a small rounded pill
- Drag-reorder affordance: cursor changes to grab, item gets a raised shadow while dragging

**Section 2 — Palette & Typography** (horizontal row, separated by border-top/bottom)
- **Color palette column:**
  - Label `"PALETTE"` (uppercase, 11px, text-muted)
  - Row of 5 swatches: 48×48px rounded squares, hex label beneath each in monospace text-muted
  - Hover: slight scale-up, selected: blue ring with offset
- **Typography column:**
  - Label `"TYPOGRAPHY"` (uppercase, 11px, text-muted)
  - Font cards: card-bg bg, border, 12px radius, 16px padding
    - Font name (14px semibold, white)
    - Sample text rendered in that font (14px, text-secondary)
    - Category tag below (12px, text-muted, `"heading"` / `"body"`)
  - Hover: primary blue border tint

**Section 3 — Notes & Swatches**
- Horizontal wrap row of note + swatch cards:
  - Text note: sticky-note style card (card-bg, border-l-4 in warning yellow, 12px radius)
    - Editable textarea inline, font-size 14px
    - Hover: delete button appears
  - Color swatch: large rounded square with hex label beneath
  - All: 44px min touch target, selected ring

#### Side Drawer

**Collapsed state (desktop):** 48px-wide icon strip anchored to right edge at vertical center. 5 icons vertically stacked:
- AI Sparkle (Generate more)
- Image (Upload)
- Text T (Add note)
- Palette (Add swatch)
- Link (Cross-tool links)
- Each icon: 44×44px, text-muted, hover to white, card-bg bg, tooltip on hover

**Expanded state (desktop):** 288px wide panel slides in from right, full height:
- Header row: 5 icon tabs (active tab: primary blue tint bg, primary-light icon) + close ×
- Active section title (uppercase, 11px, text-muted)
- Content area scrollable:
  - **AI Add More:** prompt textarea + element counter + "1 credit" badge (purple) + Add button (gradient)
  - **Upload Image:** drag-and-drop zone (dashed border, center icon, click-to-browse)
  - **Add Text Note:** description + "Add Note" secondary button
  - **Add Color:** color picker input + hex display + "Add to Board" button
  - **Cross-tools:** list of link cards to Color Palette / Font Generator / Logo Generator

**Mobile bottom sheet:** slides up from bottom, drag handle, same icon tabs + close, content below. FAB (+) button triggers it.

#### Mobile FAB

- 56×56px circle, gradient primary fill, white + icon, fixed bottom-right, drop shadow

---

### View 4 — My Boards

**Layout:** Scrollable list within the main content area (below toolbar). Back link top-left.

- Empty state: centered icon + `"No boards yet"` title + sub-description
- Loading state: spinner centered
- Board entry card: card-bg, border, hover to card-hover, 12px radius, 16px padding
  - Left: 64×64px thumbnail (image or placeholder icon)
  - Right: bold title (truncated), theme subtitle (truncated, text-muted), element count + date (text-muted)
  - "Shared" badge (primary blue pill, 10px font) when board is shared
  - Hover: blue-tint border, title turns primary-light

---

## Interaction Notes

- All primary actions use the `from-[#3D6AF2] to-[#3D9DF2]` gradient
- All secondary actions use card-bg + border + text-secondary styling
- Selected states use a 2px primary blue ring
- Transitions: 150–200ms ease for hovers, 200ms for drawer open/close
- Disabled states: 40% opacity, not-allowed cursor
- Focus visible: 2px primary blue focus ring for keyboard navigation
- Error banner (if API fails): red-900/30 bg, red-400 text, 12px radius, appears below toolbar
