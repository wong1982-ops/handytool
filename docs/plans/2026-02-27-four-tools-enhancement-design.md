# Four Tools Enhancement Design

**Date:** 2026-02-27
**Status:** APPROVED
**Tools:** ECard Studio, Human Benchmark, Image Editor, PDF Converter

---

## 1. ECard Studio Enhancements

### 1.1 Discovery Page
- "What's the occasion?" hero with 6 intent buttons (New Product Launch, Client Anniversary, Employee Welcome, Quarterly Milestone, Holiday Greetings, Thank You Note)
- Filtered template grid (4-column desktop, 2-column mobile) showing matching templates
- Each card: thumbnail preview, title, category badge, "Personalize" button
- Click → opens editor with pre-selected template
- Route: `/tools/ecard-studio` shows discovery, `/tools/ecard-studio?template=<id>` opens editor

### 1.2 Template Expansion (25+ new)
- 15 new e-card templates across 6 occasion categories
- 10 business card templates with contact field layouts
- Each template: name, category, occasion tags, cardType (ecard|business-card), layout, colors, pattern
- Split into `ecard-templates.ts` and `business-card-templates.ts`

### 1.3 Business Card Layout
- New `cardType: 'business-card'` discriminator
- 2-column layout: name/title/company left, contact fields (phone, email, website, address) right
- Contact fields added to customization panel when business card selected
- Standard business card aspect ratio (3.5:2)

### 1.4 Undo/Redo
- State history array with pointer index
- Push snapshot on every meaningful change (content, color, font, pattern, layout)
- Max 50 history entries
- Wire up existing toolbar buttons

### 1.5 Template Search & Filter
- Search bar above template grid (filters by name, category, occasion)
- Category tabs: All | E-Cards | Business Cards
- Occasion filter chips when E-Cards selected

---

## 2. Human Benchmark Enhancements

### 2.1 Score Trend Charts
- Per-test line chart (last 20 attempts) using SVG
- X-axis: attempt number, Y-axis: score
- Color-coded by test theme color
- Shows on test detail page below StatCards

### 2.2 Test Tips/Strategies
- Collapsible "Tips" card below each test's results area
- 3-5 practical tips per test (e.g., "Focus on the center of the screen" for Reaction Time)
- Collapsed by default, remembers open/closed state

### 2.3 Keyboard Shortcuts
- Space: start/restart test
- Escape: return to dashboard
- Visual hint on test intro screens ("Press Space to start")

### 2.4 Share Results
- "Share" button on result screen
- Generates canvas-based image card: test name, score, rank badge, branding
- Download as PNG or copy to clipboard

### 2.5 Daily Challenge
- One featured test per day (rotating through all 8)
- "Daily Challenge" banner on dashboard
- Highlighted card with countdown timer to next challenge
- Stores daily best in localStorage

---

## 3. Image Editor Enhancements

### 3.1 Navigator Panel
- Thumbnail preview of full image (150x100px)
- Blue rectangle overlay showing current viewport bounds
- Click on navigator to jump to that area
- Placed in adjustments panel as collapsible section

### 3.2 Sharpen Adjustment
- Add "Sharpen" slider (0-100) to adjustments panel
- Implement via CSS `filter: contrast()` combined with custom convolution, or use Fabric.js Convolute filter
- Default: 0 (no sharpening)

### 3.3 Layer Thumbnails
- Generate 40x40px canvas thumbnail per layer
- Update on layer content change (debounced)
- Show in layers panel alongside layer name
- Fallback icon for empty layers

### 3.4 History Filmstrip
- Horizontal scrollable strip at bottom of canvas
- Each entry: small thumbnail + label (e.g., "Brightness +20", "Filter: Valencia")
- Click to revert to that state
- Current state highlighted
- Max 20 visible entries

### 3.5 Export Presets
- Dropdown/menu with preset sizes: Instagram Post (1080x1080), Instagram Story (1080x1920), Twitter (1200x675), Facebook Cover (820x312), Print A4 (2480x3508), Custom
- Auto-resize canvas to target dimensions
- Format selection (PNG/JPEG/WEBP) with quality slider for lossy formats

---

## 4. PDF Converter Enhancements

### 4.1 Conversion History
- Store last 20 conversions in localStorage
- Fields: filename, mode, timestamp, outputSize, status
- "Recent Conversions" section below upload zone
- Re-download not possible (blob URLs expire), but shows metadata
- Clear history button

### 4.2 Drag-and-Drop Page Reordering
- Replace click-based move up/down with HTML5 drag-and-drop
- Visual drag handle on each file/page item
- Drop indicator line between items
- Works in: merge-pdf, images-to-pdf, page-manager

### 4.3 Output Format Options
- PDF→Images: choose PNG/JPEG/WEBP via radio buttons
- JPEG/WEBP: quality slider (10-100%)
- Show estimated output size based on quality selection

### 4.4 File Size Comparison
- After processing, show: input size → output size (reduction %)
- Color-coded: green for reduction, yellow for similar, red for increase
- Especially useful for compress-pdf mode

### 4.5 Web Worker Processing
- Move pdf-lib and pdfjs-dist operations to dedicated Web Worker
- Keep UI responsive during heavy operations
- Show animated progress with cancel button
- Fallback to main thread if Worker unavailable

---

## Implementation Order

1. **ECard Studio** — biggest design gap, most new features
2. **Human Benchmark** — moderate additions, mostly new components
3. **Image Editor** — targeted enhancements to existing editor
4. **PDF Converter** — quality-of-life improvements

## Technical Constraints

- All processing stays client-side (no new API endpoints needed)
- No external font loading (system fonts only)
- pnpm for all package management
- Tailwind CSS v4 + SCSS
- Mobile-first responsive design
- WCAG 2.1 AA accessibility
