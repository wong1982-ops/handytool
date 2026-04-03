# Stitch Prompt — Component Lab

## Tool Summary

Component Lab is an AI-powered UI component builder. Users describe a component in plain text, configure generation settings, and get production-ready code in React, Vue, Svelte, or HTML. The studio layout is a 3-panel desktop app: a left prompt/settings panel, a center live preview iframe, and a right code editor. A chat bar at the bottom allows iterative AI refinements with version history undo/redo. On mobile it collapses to a tabbed layout (Preview / Code / Chat) with a FAB that opens the prompt panel as a bottom sheet. There is also a Library page (saved components) and an Explore page (public community components).

---

## Stitch Prompt

Component Lab — AI component builder studio for Toolk1t

**Layout:** Full-height desktop studio with three vertical panels, fixed header, and a bottom chat/refine bar.

**Screens to generate:**

1. **Main Studio (desktop, generated state)** — active component loaded
2. **Main Studio (desktop, empty state)** — first-load before generating

---

### Screen 1 — Main Studio (desktop, generated state)

**Header bar (full width, 56px tall, dark, border-bottom):**
- Left: breadcrumb "Tools / Component Lab" in muted text; then page title "Component Lab" — "Component" in white, "Lab" in blue-to-purple gradient text
- Right nav: "Library" ghost button, "Explore" ghost button, "Save" primary gradient button (blue → purple) with bookmark icon and "1cr" credit badge in small muted text

**Left sidebar (288px wide, scrollable, border-right):**
- Section: "Component Description" label, multi-line textarea (5 rows, dark card bg, rounded-xl, blue focus ring), char count "247/1000" right-aligned in muted text
- Section: "Reference Image" label, uploaded image thumbnail (h-32, rounded-xl, object-cover) with a small × remove button top-right
- Section: "Settings" label then four sub-groups:
  - **Theme** — pill buttons: Light / Dark / Both (Dark is active/blue)
  - **Responsive** — pill buttons: Yes (active/blue) / No
  - **Animations** — pill buttons: None / Subtle (active/blue) / Rich
  - **Accessibility** — pill buttons: Standard (active/blue) / WCAG AA
  - **CSS Framework** — pill buttons: Tailwind (active/blue) / Vanilla / None
- Bottom: "Generate Component" full-width button, blue→purple gradient, sparkle icon, 44px tall

**Center panel (flex-1, live preview):**
- Toolbar row: left side — viewport preset pills "Mobile 375", "Tablet 768", "Desktop 1280" (Desktop active with filled bg); right side — three small square background toggles (white swatch, dark swatch, checker swatch — white is active with blue ring)
- Preview area: iframe rendered inside a subtle shadow box, showing a pricing table component with 3 tier cards (Basic / Pro / Enterprise) in white bg, toggle for Monthly/Annual at top
- Empty area below iframe shows the component naturally

**Right panel (480px wide, code editor, border-left):**
- Tab bar: pill tabs "React" (active/blue), "Vue", "Svelte", "HTML"; spacer; "Reset" ghost button with refresh icon; "Copy" button with copy icon
- Code area: dark code editor (#131a23), line numbers on left in dark gutter, syntax-highlighted JSX code (keywords in blue, strings in sky-blue, functions in purple, HTML tags in green, comments in gray/italic)
- A realistic React pricing table component code is shown

**Bottom chat bar (full width, border-top):**
- Collapsed chat log toggle: "Chat history (2)" with chevron, shows previous exchange when expanded
- Two chat bubbles visible: user bubble (right-aligned, blue tint bg, "Make the Pro tier card glow blue"), assistant bubble (left-aligned, dark card bg, "Added a blue glow ring and gradient border to the Pro card")
- Input row: ← v2 → version nav (left chevron, "v2", right chevron); text input "Describe changes…" placeholder; blue send button (arrow icon)

---

### Screen 2 — Main Studio (desktop, empty state)

Same layout as Screen 1 but:
- Left sidebar: textarea is empty, placeholder text cycling animation hint ("A pricing table with 3 tiers..."), no reference image (dashed border dropzone with image upload icon), all settings at defaults (Light theme, Yes responsive, Subtle animations, Standard a11y, Tailwind CSS)
- Center panel: empty state illustration — code brackets icon, "Preview will appear here" in muted text, "Generate or write a component to see it rendered" in lighter muted text
- Right panel: code area shows "// No code generated yet" placeholder
- Chat bar: no chat history, just the input row with version nav showing "—"

---

### Visual Style

- **Color palette:** page-bg `#090f16`, card/panel-bg `#131a23`, border `#1e2631`, hover-bg `#1a2333`, text-primary `#ffffff`, text-secondary `#a6abb5`, text-muted `#70767f`, text-dim `#4a5060`
- **Brand colors:** primary blue `#3D6AF2`, gradient `from-[#3D6AF2] to-[#7C3AED]`
- **Code syntax colors:** keyword `#79c0ff`, string `#a5d6ff`, function `#d2a8ff`, tag `#7ee787`, comment `#6e7681 italic`, variable `#ffa657`, operator `#ff7b72`
- **Design style:** Studio IDE aesthetic — dark, dense, professional. Panels separated by 1px borders, no drop shadows between panels. Subtle rounded corners on interactive elements. No gradients on backgrounds — only on the primary CTA button and the word "Lab" in the header.
- **Typography:** Inter font, tight tracking on headings, 13px monospace in code areas
- **Interactive elements:** All buttons min 44px tall (or 32px for compact toolbar pills); pill-shaped toggles for settings; active state = solid blue bg; hover state = subtle lighter bg
- **Pill settings buttons:** 32px height, rounded-full, `#131a23` default bg, `#3D6AF2` active bg

---

### Platform

Desktop web, 1440px viewport. No mobile layout needed in this design (mobile is a separate bottom-sheet pattern, skip for Stitch).
