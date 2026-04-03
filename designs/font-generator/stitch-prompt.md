# Google Stitch Prompt — Font Generator (Toolk1t Redesign)

## Context

UI redesign of the "Font Generator" tool on Toolk1t. This is a 5-step wizard that lets users design custom AI-generated font alphabets. The redesign is for **visual consistency only** — all features and functionality remain identical.

---

## Stitch Prompt

---

Font Generator tool — 5-step AI wizard for creating custom font alphabets. Dark theme web app (desktop-first, responsive down to 375px mobile).

**Design system tokens:**
- Page background: #090f16
- Card background: #131a23
- Card hover: #1e2631
- Border: #1e2631
- Primary blue: #3D6AF2
- Primary gradient: linear from #3D6AF2 to #7C3AED (purple)
- Text primary: #ffffff
- Text secondary: #a6abb5
- Text muted: #70767f
- Success: #10B981
- Danger: #EF4444
- Font: Inter (system fallback sans-serif)

---

### Screen 1 — Step 1: Describe (active state)

**Layout:** Single-column centered, max-width 896px, padding 40px top.

**Breadcrumb strip** at top: small text "Tools / Font Generator" in muted color (#70767f), left-aligned.

**Page title:** "Font Generator" — "Font" in white bold, "Generator" in gradient text (blue→purple, #3D6AF2→#7C3AED). Center-aligned. 32px on desktop.

**Step subtitle:** "Choose your font style" — secondary text, center-aligned, below title, 14px, color #a6abb5.

**Tab switcher:** Pill toggle, max-width 320px, centered. Two tabs: "Create" (active, filled primary blue #3D6AF2) and "My Fonts" (inactive, muted). Background #131a23, rounded-xl, inner padding 4px.

**Step progress indicator (desktop):** 5-step horizontal stepper centered below tab. Each step has:
- A circle (36px) with step number or checkmark (completed steps filled solid #3D6AF2, current step has blue ring glow effect with #3D6AF2/20 fill, future steps border-only #1e2631)
- Step label below circle: "Describe", "Preview", "Generate", "Refine", "Download" — 11px, color #93aaff for active/completed, #70767f for future
- Connector lines between circles (12px width, filled #3D6AF2 for completed segments, #1e2631 for future)
- Step 1 is current (glowing ring)

**Section: Font Style**
- Label: "Font Style" — 14px semibold, #a6abb5
- 2×4 grid of style cards (2 columns on mobile, 4 columns on desktop), gap 12px
- Each card: rounded-xl, overflow hidden. Top half: colored gradient banner (64px tall). Bottom half: dark card bg #131a23 with style name (14px white semibold) and short description (12px #70767f, 2 lines max)
- 8 styles with distinct gradients:
  - Neon: pink→blue gradient
  - Hand-drawn: amber→orange gradient
  - Retro Pixel: green→emerald gradient
  - Watercolor: sky→indigo gradient
  - 3D Bubble: fuchsia→pink gradient
  - Gothic: dark slate→slate gradient
  - Graffiti: red→yellow gradient
  - Minimalist: gray→light gray gradient
- Selected card: 3px solid blue ring + subtle blue glow shadow, scale 1.03
- "Neon" style is selected (show selected ring)

**Section: Creative Direction (optional)**
- Label: "Creative Direction" in #a6abb5, "(optional)" suffix in #70767f
- Textarea: 3 rows, rounded-xl, bg #131a23, border #1e2631, white text, placeholder in #4a5060. Focus state: blue border + ring. Placeholder text: 'Describe your vision... e.g. "Include swirls, made of chocolate, fantasy RPG look"'
- Character counter bottom-right: "0/500" in #4a5060, 10px

**Section: Color Palette**
- Label: "Color Palette" in #a6abb5
- Toggle row (2 buttons): "Let AI decide" / "Choose palette". Each button: flex-1, min-height 44px, rounded-xl. Active: gradient bg (#3D6AF2→#7C3AED), white text. Inactive: bg #131a23, color #a6abb5.
- Show "Let AI decide" as active

**Section: Reference Image (optional)**
- Label: "Reference Image" with "(optional)" in #70767f
- Dashed upload zone: border-dashed, border-2, border #1e2631, bg #131a23, rounded-xl, centered icon (upload arrow, 32px, #70767f) + "Drop an image or click to upload" (14px, #70767f) + "Max 10 MB" (10px, #4a5060). Height ~104px.

**CTA button:** "Next" — full width, gradient bg (#3D6AF2→#7C3AED), white, semibold, rounded-xl, min-height 44px. Enabled (style is selected).

---

### Screen 2 — Step 2: Preview

Same header/breadcrumb/title/tab/stepper as Screen 1. Step 2 is current.

**Character preview grid:** 2 columns mobile / 4 columns desktop, gap 12px.
8 sample character tiles: A, B, G, R, a, g, 1, &
- Each tile: character label (12px bold #70767f uppercase) above, white square card (rounded-xl, aspect-square, overflow hidden) below showing the AI-generated letter image (use colored placeholder squares with large stylized letter shapes for mockup — neon style: dark bg with glowing colored letter)

**Action row (3 buttons):**
- "Back" (left arrow icon + text): outline border #3D6AF2, text #3D6AF2, rounded-xl, min-height 44px, flex-1
- "Try Again": same outline style, flex-1
- "Love it →": gradient fill (#3D6AF2→#7C3AED), white, rounded-xl, min-height 44px, flex-1

---

### Screen 3 — Step 3: Generate (loading state)

Same header. Step 3 is current.

**Progress indicator:** centered text "Generated 18/36 characters..." — "18" in white semibold, "/36" and "characters..." in #70767f.

Below: slim progress bar (max-width 320px, height 6px, bg #1e2631, fill gradient #3D6AF2→#7C3AED, 50% filled, rounded-full).

**Character grid:** 3 columns mobile / 4 columns tablet / 6 columns desktop, gap 12px.
Show 36 character slots (A–Z, 0–9):
- First 18 characters: white square tiles with character images (colored placeholder squares)
- Remaining 18: pulsing skeleton tiles (bg #1e2631, animate-pulse, rounded-xl, aspect-square)
- Small character label above each: #a6abb5 for generated, #70767f for pending

**Actions:** "Back" (outline, disabled look) + "Next: Refine" (gradient, disabled/opacity 40% since not complete).

---

### Screen 4 — Step 4: Refine

Same header. Step 4 is current.

**Instruction text:** "Click any character to regenerate it" — 14px, #a6abb5, centered.
**Badge:** "3 regenerated" — pill badge, bg #3D6AF2/15, text #93aaff, 12px, rounded-full, inline below instruction.

**Character grid (full, 36 chars):** 6 columns desktop. Each tile:
- Character label above (12px, #a6abb5)
- White square button (rounded-xl, aspect-square) with character image
- On hover: dark overlay with refresh/sync icon (white, centered) — show this hover state on letter "K"
- Show letter "M" with spinning loader overlay (regenerating state: black/50 overlay + white spinner)
- Other tiles: normal state

**Actions:** "Back" (outline) + "Next: Download" (gradient, enabled).

---

### Screen 5 — Step 5: Download

Same header. Step 5 is current (all steps completed/filled).

**Section: Your Alphabet**
- "Your Alphabet" — 18px white semibold
- 6-column grid of small character tiles (white square, rounded-lg, aspect-square, character images). All 36 characters displayed.

**Section: Download Options**
- "Download Options" — 18px white semibold

Three download cards (bg #131a23, border #1e2631, rounded-xl, padding 20px):

1. **Alphabet Sheet PNG** — "Alphabet Sheet PNG" in white semibold + "Free" badge (text #10B981, 12px). Description: "All 36 characters in a single 6-column grid image." (14px, #70767f). Download button right side: "Download PNG" with download icon. Bg: emerald-600, white text, rounded-xl, min-height 44px.

2. **Individual PNGs ZIP** — Same layout. "Individual PNGs ZIP" + "Free" badge. Description: "Each character as a separate PNG file in a ZIP archive." Button: "Download ZIP", same emerald style.

3. **SVG Pack ZIP** — "SVG Pack ZIP" + "1 credit" badge (bg #7C3AED/30, text #c084fc, rounded-full, 12px). Description: "Scalable vector versions of each character, perfect for print." Button: "Download SVGs", bg #7C3AED/80 (purple), white text, rounded-xl.

**Start Over link:** centered below, outlined button "#Start Over" in #70767f, border #1e2631, min-height 44px.

---

### Screen 6 — My Fonts tab (history)

Same header/title. "My Fonts" tab is active.

**Subtitle:** "Your generated fonts" — #a6abb5, centered.

List of past font projects (3 items, card layout, bg #131a23, border #1e2631, rounded-xl):
Each card:
- Left: mini character row (6 small white tiles, showing A B C D E F with the generated style)
- Middle: style name (e.g. "Neon", "Gothic") in white semibold 14px. Date: "3 days ago" in #70767f 12px.
- Right: "Load" button — outline border #3D6AF2, text #3D6AF2, rounded-lg, min-height 44px, 80px wide.

Show 3 example entries: "Neon" (3 days ago), "Graffiti" (1 week ago), "Watercolor" (2 weeks ago).

---

## Visual Style Summary

- Dark rich background (#090f16) with slightly lighter card surfaces (#131a23)
- Primary accent: blue (#3D6AF2) with purple gradient to (#7C3AED)
- Interactions: glowing blue ring for selected state, pulse animation for loading skeletons
- All interactive elements min-height 44px (WCAG touch target compliance)
- Rounded-xl corners (12px) throughout for cards, buttons, inputs
- Subtle borders (#1e2631) define card boundaries without harsh contrast
- Typography: Inter, weights 400/500/600/700/800, tight tracking for headings
- Consistent 6–12px gap grid system, 24px section spacing

## Platform

Responsive web — desktop-first (max-width 896px centered content), responsive breakpoints at 640px (sm) and 768px (md).
