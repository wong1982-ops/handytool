# Color Palette Generator — Google Stitch Prompt

## Main Prompt

Design a dark-themed **Color Palette Generator** tool page for the Toolk1t design system. The tool lets designers and developers create, manage, and export color palettes using four generation methods: Wheel (harmony rules), Image (color extraction), AI (prompt-based generation), and Saved (local palette library).

**Theme tokens:**
- Page background: `#090f16` (near-black deep space)
- Card background: `#131a23`
- Card hover: `#1e2631`
- Border: `#1e2631`
- Primary: `#3D6AF2` (blue), Primary-light: `#3D9DF2`, Secondary: `#32A9D9` (cyan)
- Text: `#ffffff` / `#a6abb5` / `#70767f`
- Success: `#10B981`, Danger: `#EF4444`, Warning: `#F59E0B`
- Font: Inter

**Layout:**
1. **Themed header** — deep space gradient (`#0c1424` → `#111b2e` → `#0c1424`) with subtle radial dot starfield particles in blue/cyan. Contains: breadcrumb (Home › Tools › Color Palette), tool icon (`palette` Material Symbol in `#3D6AF2`), title "Color Palette Generator" in bold white, and a brief subtitle "Create palettes with harmony rules, image extraction, and accessibility checking" in muted text.

2. **Palette Strip** — The hero component directly below the header, full width. Shows 5 color swatches horizontally as tall rounded rectangles (`h-16`), each displaying:
   - The swatch block (colored background, 2px border highlight when selected)
   - Hex code in monospace below
   - Row of 3 icon buttons: Copy (clipboard), Lock (padlock), Expand (chevron-down) — each `min-height: 44px`
   - A shuffle button (refresh icon) on the right end to randomize unlocked colors
   - When expanded: scrollable tint/shade scale (steps 50–950) as small `48x48px` swatches below the strip

3. **Two-column content area** (desktop: left flex-1 / right w-[400px], mobile: stacked):
   - **Left column:** Tab switcher + tab content panel
   - **Right column:** Share URL button, Export panel, Accessibility panel (stacked)

**Tab switcher style:** Pill tabs inside a dark `#131a23` background container, active tab with white background and shadow, inactive tabs with muted text.

**Tabs:**
- **Wheel** — Hue ring visualization (conic gradient wheel, 200x200px circle with inner cutout) showing color dots at their hue positions; Harmony rule pill buttons (Complementary, Analogous, Triadic, Split-Comp, Tetradic, Mono, Square, Custom); Base color controls with hex input + H/S/L sliders; "Generate Palette" primary CTA
- **Image** — Drag-and-drop zone with dashed border for image upload (PNG/JPG/WebP); After upload: image thumbnail, color count slider (3–8), Re-extract button; Extracted color swatches; "Apply to Palette" CTA
- **AI** — Text prompt textarea (multi-line, "Describe your palette" label); "Generate with AI" gradient button (blue→purple); Quick preset pills (Sunrise, Ocean, Forest, Neon, Pastel, Corporate, Vintage, Candy); AI result palette cards (selectable, showing color strip); "Apply to Palette" CTA
- **Saved** — Save current palette form (name input + Save button + color strip preview); Saved palettes grid (2-col, each card has color strip, name, relative timestamp, delete button)

**Right column panels:**
- **Share URL** — Full-width ghost button with share icon, "Copy Share URL" label, switches to "URL Copied!" on click
- **Export panel** — Card with format pills (CSS, Tailwind, SCSS, JSON, ASE, PNG); For text formats: syntax-highlighted code block with Copy overlay button; For ASE/PNG: download button
- **Accessibility panel** — Two collapsible sections: (1) Contrast Checker: 5x5 matrix showing "Aa" preview, ratio, AA/AAA pass/fail badges; (2) Color Blindness Simulation: three rows (Protanopia, Deuteranopia, Tritanopia) each showing simulated + original swatches side by side

**Interaction patterns:**
- All buttons `min-height: 44px`
- Active harmony rule / active tab / selected export format: filled `#3D6AF2` background, white text
- Inactive pills: `#1e2631` background, `#a6abb5` text, hover darkens
- Locked swatches show filled padlock icon in primary color
- WCAG pass badge: `bg-green-500/20 text-green-500`; fail: `bg-red-500/20 text-red-500`
- Warning triangle icon `text-amber-500` when color blindness simulation detects indistinguishable adjacent colors

---

## Screen-by-Screen Refinement

### Screen 1 — Default State (Wheel Tab, Analogous Rule)

The page loads with a 5-color analogous palette (blues/purples). The Palette Strip shows five swatches in a pleasing analogous gradient. The Wheel tab is active, the hue ring shows 5 colored dots clustered on the blue segment of the wheel. The Analogous rule pill is highlighted in primary blue. The H/S/L sliders show the base color values. The Export panel defaults to CSS format, showing CSS variable output. Accessibility panel is collapsed on mobile, open on desktop showing the 5x5 contrast matrix.

**Prompt addition:** "Show the tool in its natural loaded state — 5 analogous blue/purple swatches, hue ring with dots, harmony rules, and the contrast matrix with some AA passes and some fails."

---

### Screen 2 — Image Tab (Extraction Done)

The Image tab is active. A nature photo (golden forest, warm tones) is shown as a thumbnail. Below it: the color count slider set to 5, a Re-extract button. Extracted colors shown as square swatches: warm amber, terracotta, deep forest green, sandy beige, warm brown. "Apply to Palette" CTA below. The main palette strip at top now reflects these extracted colors.

**Prompt addition:** "Show the image extraction result state — nature photo loaded, 5 warm earth-tone swatches extracted, Apply button prominent."

---

### Screen 3 — AI Tab (Prompt Entered, Results Shown)

The AI tab is active. The prompt textarea contains "sunset over the ocean, warm and luxurious". Three AI palette suggestion cards are shown below the generate button, each with a color strip and palette name (e.g., "Golden Dusk", "Coral Horizon", "Deep Amber"). The first card is selected (highlighted with `border-primary`). The selected palette preview strip is shown above the "Apply to Palette" button.

**Prompt addition:** "Show AI palette generation results — 3 named palette cards, first one selected and previewed, ready to apply."

---

### Screen 4 — Tint/Shade Expansion

The primary swatch in the Palette Strip is expanded (chevron rotated, primary color ring highlight). Below the 5 swatches, a horizontal scrollable row of 11 tint/shade steps (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950) appears as small squares, each labeled with its step number and hex code below.

**Prompt addition:** "Show the tint/shade expansion — 11 scale steps visible in a scrollable row under the main swatches, the active swatch has a primary color ring."

---

### Screen 5 — Mobile Layout

Full-width single-column layout on a 390px viewport. Header is compact. Palette Strip swatches are tighter. Tab switcher is full-width. Content is stacked. The right column panels (Share, Export, Accessibility) stack below the tab content. Touch targets are all 44px+. The hue ring is centered.

**Prompt addition:** "Show the mobile layout at 390px width — compact palette strip, full-width tabs, stacked panels, all touch-friendly."
