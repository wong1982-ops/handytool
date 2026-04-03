# Logo Generator — Google Stitch Prompt

## Tool Summary

The Logo Generator is a 5-step wizard tool that lets users create AI-generated logo concepts for their business. The flow is:
1. **Info** — Business name, tagline, industry
2. **Style** — Logo style (Modern, Playful, Elegant, Bold, Vintage, Minimalist) + color palette + creative direction
3. **Generate** — AI generates 12 logo concept thumbnails; user picks one
4. **Edit** — Logo editor with live preview: change colors, font, font weight, letter spacing, layout (icon above/left/right/text-only/icon-only), and editable text
5. **Download** — Size previews, mockup previews (business card, website header, app icon), background toggle, download buttons (Free PNG 512px, Free PNG 1024px, 1-credit PNG 2048px, 1-credit SVG, 1-credit Brand Kit)

There is also a **My Logos** tab that shows history of previously generated logos.

---

## Stitch Prompt

Logo Generator tool — 5-step wizard UI for a dark-theme AI logo creation web app called Toolk1t.

**Design System:**
- Dark theme: page background #090f16, card background #131a23, hover #1e2631, border #1e2631
- Text: white (#FFFFFF) for headings, #a6abb5 for labels/descriptions, #70767f for muted/hints
- Primary: #3D6AF2 (blue), gradient: #3D6AF2 → #7C3AED (purple)
- Secondary accent: #32A9D9 (teal)
- Success: #10B981 (emerald green), Credit-gated: #7C3AED (purple)
- All interactive elements: min-height 44px
- Border radius: 12px (rounded-xl) for cards, inputs, buttons
- Font: Inter (system sans-serif)

**Page Layout:**
- Sticky top navigation header (dark bg, Toolk1t logo left, nav links center, dark mode toggle right)
- Hero header section: rich gradient banner (dark blue to purple starfield effect), centered tool icon (sparkle emoji in gradient circle), "Logo Generator" title with gradient word, breadcrumb trail "Home / Tools / Logo Generator"
- Content area below header: max-width 896px, centered, 40px top padding

**Within content area:**

1. **Title + Subtitle:** "Logo Generator" in 36px extrabold white, the word "Generator" in a blue→cyan gradient. Below: 14px secondary text (the current step subtitle, e.g. "Tell us about your business")

2. **Tab Toggle:** "Create" / "My Logos" pill toggle, max-width 288px centered, in a #131a23 rounded-xl pill container. Active tab: solid #3D6AF2 bg, white text. Inactive: #70767f text, transparent.

3. **Wizard Step Indicator (desktop, horizontal):**
   - 5 steps inline with connecting lines between them
   - Step circles: 36x36px rounded-full
     - Completed step: solid #3D6AF2 fill with white checkmark icon
     - Current step: #3D6AF2/20 fill, #3D6AF2 border-2, soft blue glow (box-shadow 0 0 15px rgba(61,106,242,0.4))
     - Upcoming step: transparent fill, #1e2631 border-2
   - Step label below each circle: 11px, #a6abb5 (active/completed) or #70767f (upcoming)
   - Labels: Info, Style, Generate, Edit, Download
   - Connecting line between steps: 48-80px wide, 2px tall, rounded, #3D6AF2 for completed segments, #1e2631 for upcoming
   - Mobile variant: compact pill badges (horizontal scroll), only current step shows its label text
   - No step is clickable (it's a wizard, not free navigation)

4. **Step 1 — Business Info (show this step as active):**
   Card container: bg #131a23, rounded-2xl, padding 24px, space-y-5
   - "Business Name" label (14px, #a6abb5, "* " in #3D6AF2) + text input (bg #131a23, white text, rounded-xl, 44px min-height, focus ring #3D6AF2/50, placeholder "e.g. Bright Spark Creative")
   - "Tagline" label + "(optional)" muted suffix + text input (placeholder "e.g. Illuminating Ideas")
   - "Industry" label + combobox input with dropdown (placeholder "Search or type your industry"). Dropdown: bg #1e2631, rounded-xl, max-height 208px overflow scroll, each item 44px hover zone, hover bg #3D6AF2/20 with white text
   - "Next" button: full width, gradient bg from #3D6AF2 to #7C3AED, white text, semibold, rounded-xl, 44px height, disabled state opacity-40 when business name is empty

5. **Step 2 — Style (for reference):**
   - "Logo Style" section: 2x3 grid of style cards, each card has a colored gradient header (64px tall) + dark info panel below with style name (white, 14px semibold) + description (12px muted). Selected state: 3px #3D6AF2 ring + 20px blue glow.
   - Style gradients: Modern=blue→cyan, Playful=yellow→orange, Elegant=purple→pink, Bold=red→orange, Vintage=amber→yellow, Minimalist=gray gradient
   - "Color Palette" section: two toggle buttons "Let AI decide" / "Choose palette" (full width, 44px, active=gradient, inactive=dark)
   - When "Choose palette" selected: list of palette rows (name label + 5 color swatches 28x28px each, selected row has blue ring glow)
   - "Creative Direction" optional textarea (3 rows, dark bg, character counter bottom-right)
   - Back + Next buttons in a row (Back: outline #3D6AF2, Next: gradient)

6. **Step 3 — Generate (for reference):**
   - Loading state: centered spinner with animated ring in #3D6AF2, sparkle icon, cycling messages "Sketching concepts…", "Generating 12 logo concepts" subtitle
   - Grid state: 2 cols mobile / 3 cols tablet / 4 cols desktop, square tiles, white bg, rounded-2xl
   - Each tile: logo image (object-contain), hover scale 1.02 + shadow, selected: 3px #3D6AF2 ring + glow + centered white circle with blue checkmark overlay
   - Hover: gradient overlay at bottom with variation name label (10px, white)
   - "Regenerate" ghost button (border #1e2631, centered, with refresh icon)
   - Back + "Customize This Logo" (primary) navigation row

7. **Step 4 — Editor (for reference):**
   - Two-column layout: 8/12 left (preview) + 4/12 right (controls panel)
   - Preview area: white bg rounded-2xl, min-height 420px, logo image + business name text + tagline composited per layout mode
   - Controls panel: bg #131a23, rounded-2xl, scrollable, sections: Logo Colors (color swatch buttons 40x40 each), Font (2-col grid of font buttons grouped by category: sans-serif / serif / display / handwritten), Font Weight slider, Letter Spacing slider, Layout (5 icon toggle buttons 44x44), Text (Business Name + Tagline editable inputs)
   - Section headers: 12px uppercase semibold #a6abb5 with tracking-wider
   - Back + Download navigation row

8. **Step 5 — Download (for reference):**
   - Section: "Size Previews" — 3 white cards in a row (Large 1024px, Medium 512px, Icon 128px) each showing the logo at scale with label below
   - Section: "Preview Background" — Dark / Light toggle buttons + live preview box
   - Section: "Mockup Previews" — 3 mockup cards: Business Card, Website Header, App Icon
   - Section: "Download" — stacked download buttons:
     - PNG 512px and 1024px: emerald green (#10B981) bg, "Free" badge pill
     - PNG 2048px and SVG: purple (#7C3AED) bg, "1 credit" badge pill in purple/pink tones
     - Brand Kit: gradient from #3D6AF2 → #7C3AED, "1 credit" badge
   - "Create Another Logo" ghost button (outline #3D6AF2, full width, at bottom)

**My Logos tab (for reference):**
- Grid of history cards, each showing a small logo thumbnail, business name, style badge, date, and a "Load" action button

**Accessibility & Interaction:**
- All buttons and inputs: 44px min touch target
- Focus rings: 2px #3D6AF2 ring with #090f16 offset
- Inputs: focus border changes to #3D6AF2 with subtle ring
- Disabled buttons: opacity-40, cursor-not-allowed
- aria-label on icon-only buttons
- Smooth transitions 200-300ms on all interactive state changes

**Platform:** Responsive web, desktop-first (max-width 896px content). Mobile shows single-column layout with compact step indicator.

---

## Screens to Generate in Stitch

Generate **Step 1 (Business Info)** as the primary screen in active state, with the full header, wizard stepper (step 1 current), and the business info form below. Use realistic mock data pre-filled: business name "Bright Spark Creative", tagline "Illuminating Ideas", industry dropdown showing options.

Optionally generate additional variants for:
- Step 2 (Style) — show "Modern" style selected + "Ocean" palette selected
- Step 3 (Generate) — show 12 logo concept tiles in a 4-col grid, first tile selected with blue ring
- Step 4 (Editor) — show logo preview on white bg with "Bright Spark Creative" in Inter Bold, icon-above layout, controls panel on right
- Step 5 (Download) — show all download sections with the logo ready
