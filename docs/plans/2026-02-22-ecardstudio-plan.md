# ECard Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a professional e-card design tool with template discovery and a 3-panel editor, supporting customization and PNG export.

**Architecture:** Single-page client component at `/tools/ecard-studio` with two views: template discovery (landing) and 3-panel editor. HTML/CSS card rendering exported to PNG via html2canvas. 5 hardcoded templates + blank option. All client-side, no API calls.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, html2canvas, Playwright

---

### Task 1: Types & Template Data

**Files:**
- Create: `tools/ecard-studio/types.ts`
- Create: `tools/ecard-studio/templates.ts`

**Step 1: Create type definitions**

Create `tools/ecard-studio/types.ts`:

```typescript
export type TemplateId = 'executive' | 'midnight-pinstripe' | 'tech-blueprint' | 'aura-signature' | 'black-tie-matte' | 'blank'

export type BackgroundPattern = 'arcs' | 'stripes' | 'grid' | 'gradient' | 'solid'

export type TemplateCategory = 'classic-marble' | 'corporate' | 'modernist' | 'ethereal' | 'noir'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export interface ECardData {
  template: TemplateId
  heading: string
  subheading: string
  body: string
  companyName: string
  companyTagline: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  textAlign: TextAlign
  bold: boolean
  backgroundColor: string
  accentColor: string
  borderAccents: boolean
  logoOverlay: boolean
}

export interface Template {
  id: TemplateId
  name: string
  description: string
  category: TemplateCategory
  categoryLabel: string
  defaults: ECardData
  backgroundPattern: BackgroundPattern
}

export interface ColorPreset {
  name: string
  background: string
  accent: string
}
```

**Step 2: Create template definitions**

Create `tools/ecard-studio/templates.ts`:

```typescript
import type { Template, ColorPreset } from './types'

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Gold', background: '#101922', accent: '#D4AF37' },
  { name: 'Royal Blue', background: '#0A1628', accent: '#1173D4' },
  { name: 'Slate', background: '#1E293B', accent: '#94A3B8' },
  { name: 'Silver', background: '#18181B', accent: '#A1A1AA' },
  { name: 'Emerald', background: '#022C22', accent: '#059669' },
]

export const FONT_OPTIONS = [
  'Playfair Display',
  'Inter',
  'Space Grotesk',
  'Georgia',
  'Montserrat',
]

export const TEMPLATES: Template[] = [
  {
    id: 'executive',
    name: 'The Executive',
    description: 'Minimalist & Elegant',
    category: 'classic-marble',
    categoryLabel: 'Classic Marble',
    backgroundPattern: 'arcs',
    defaults: {
      template: 'executive',
      heading: 'Thank You',
      subheading: 'Dear Valued Client,',
      body: 'Thank you for your continued partnership. We are honored to be part of your growth journey and look forward to achieving more milestones together.',
      companyName: 'LUMINA GROUP',
      companyTagline: 'Innovation Excellence 2024',
      fontFamily: 'Playfair Display',
      fontSize: 48,
      lineHeight: 1.2,
      textAlign: 'center',
      bold: false,
      backgroundColor: '#101922',
      accentColor: '#D4AF37',
      borderAccents: true,
      logoOverlay: false,
    },
  },
  {
    id: 'midnight-pinstripe',
    name: 'Midnight Pinstripe',
    description: 'Professional Trust',
    category: 'corporate',
    categoryLabel: 'Corporate',
    backgroundPattern: 'stripes',
    defaults: {
      template: 'midnight-pinstripe',
      heading: 'Welcome',
      subheading: 'Dear Partner,',
      body: 'We are pleased to welcome you to our network. Together, we will build lasting success.',
      companyName: 'YOUR COMPANY',
      companyTagline: 'Building Trust Since 2020',
      fontFamily: 'Inter',
      fontSize: 42,
      lineHeight: 1.3,
      textAlign: 'center',
      bold: false,
      backgroundColor: '#0A1628',
      accentColor: '#1173D4',
      borderAccents: true,
      logoOverlay: false,
    },
  },
  {
    id: 'tech-blueprint',
    name: 'Tech Blueprint',
    description: 'Clean & Geometric',
    category: 'modernist',
    categoryLabel: 'Modernist',
    backgroundPattern: 'grid',
    defaults: {
      template: 'tech-blueprint',
      heading: 'Innovation',
      subheading: 'A New Chapter,',
      body: 'We are excited to share our latest breakthrough. Thank you for being part of our journey.',
      companyName: 'TECH CORP',
      companyTagline: 'Expanding Tomorrow',
      fontFamily: 'Space Grotesk',
      fontSize: 44,
      lineHeight: 1.2,
      textAlign: 'center',
      bold: false,
      backgroundColor: '#F5F5F0',
      accentColor: '#18181B',
      borderAccents: true,
      logoOverlay: false,
    },
  },
  {
    id: 'aura-signature',
    name: 'Aura Signature',
    description: 'Creative & Fluid',
    category: 'ethereal',
    categoryLabel: 'Ethereal',
    backgroundPattern: 'gradient',
    defaults: {
      template: 'aura-signature',
      heading: 'Celebrate',
      subheading: 'A Special Moment,',
      body: 'Your dedication inspires us every day. Here is to another year of remarkable achievements.',
      companyName: 'AURORA INC',
      companyTagline: 'Creative Excellence',
      fontFamily: 'Georgia',
      fontSize: 46,
      lineHeight: 1.2,
      textAlign: 'center',
      bold: false,
      backgroundColor: '#2D3B2D',
      accentColor: '#C4956A',
      borderAccents: false,
      logoOverlay: false,
    },
  },
  {
    id: 'black-tie-matte',
    name: 'Black Tie Matte',
    description: 'Luxury Premium',
    category: 'noir',
    categoryLabel: 'Noir',
    backgroundPattern: 'solid',
    defaults: {
      template: 'black-tie-matte',
      heading: 'Exclusive',
      subheading: 'Dear Distinguished Guest,',
      body: 'You are cordially invited to an evening of elegance and networking.',
      companyName: 'PRESTIGE & CO',
      companyTagline: 'Where Excellence Meets Luxury',
      fontFamily: 'Playfair Display',
      fontSize: 48,
      lineHeight: 1.2,
      textAlign: 'center',
      bold: false,
      backgroundColor: '#18181B',
      accentColor: '#A1A1AA',
      borderAccents: true,
      logoOverlay: false,
    },
  },
]

export const BLANK_DEFAULTS: ECardData = {
  template: 'blank',
  heading: 'Your Heading',
  subheading: 'Dear Recipient,',
  body: 'Your message goes here. Click to edit and personalize this card.',
  companyName: 'YOUR COMPANY',
  companyTagline: 'Your Tagline',
  fontFamily: 'Inter',
  fontSize: 42,
  lineHeight: 1.3,
  textAlign: 'center',
  bold: false,
  backgroundColor: '#101922',
  accentColor: '#3D6AF2',
  borderAccents: true,
  logoOverlay: false,
}

// Need to import the type at top
import type { ECardData } from './types'
```

**Step 3: Commit**

```bash
git add tools/ecard-studio/types.ts tools/ecard-studio/templates.ts
git commit -m "feat(ecard-studio): add type definitions and template data"
```

---

### Task 2: Card Preview Component

The card preview is the core visual — the 600x400 HTML div that renders the e-card. This component is used in both the discovery view (thumbnails) and the editor (main canvas).

**Files:**
- Create: `tools/ecard-studio/card-preview.tsx`

**Step 1: Create the card preview component**

Create `tools/ecard-studio/card-preview.tsx`:

This component renders an e-card as a styled HTML div. It accepts `ECardData` and renders:
- Background with the template's background color
- A decorative SVG overlay based on the `backgroundPattern` (arcs = golden circles, stripes = vertical lines, grid = line grid, gradient = radial gradient, solid = nothing)
- Heading text in the selected font, size, alignment
- Subheading text
- Body text
- Company name in the accent color
- Company tagline
- Bottom accent bar (if `borderAccents` is true)

The component should accept an optional `scale` prop (default 1) for rendering thumbnails at smaller sizes. It should also accept `className` and forward a `ref` (for html2canvas export).

Key implementation details:
- Use `forwardRef` so the parent can capture the DOM node for export
- Use inline styles for dynamic values (backgroundColor, color, fontFamily, fontSize)
- Use Tailwind for layout structure
- The card has a fixed aspect ratio of 3:2 (600x400 at scale=1)
- Text should overflow with ellipsis if too long
- The decorative SVG overlay is absolutely positioned, semi-transparent

**Step 2: Commit**

```bash
git add tools/ecard-studio/card-preview.tsx
git commit -m "feat(ecard-studio): add card preview component with template patterns"
```

---

### Task 3: Template Discovery View

**Files:**
- Create: `tools/ecard-studio/template-discovery.tsx`

**Step 1: Create the template discovery component**

Create `tools/ecard-studio/template-discovery.tsx`:

This is Screen 2 from the design. It contains:

1. **Hero section:**
   - Heading: "What's the occasion?" (text-4xl sm:text-5xl font-bold, centered)
   - Subtitle text (text-slate-400, centered)
   - Intent pills row: 6 pill buttons (rounded-full border, one highlighted in blue on click). State is local — pills are visual only, they don't filter templates.

2. **Section heading:** "Recommended for You" with subtitle "Based on [selected intent] Intent" + "View All Templates →" link (visual placeholder)

3. **Template grid:** 3-column responsive grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
   - Each template card: dark card with category badge (top-left), thumbnail rendered via CardPreview at small scale, template name (font-semibold), description (text-slate-400), bookmark icon (visual placeholder)
   - 6th card: "Start from Scratch" — dashed border, plus icon, description
   - onClick: calls `onSelectTemplate(templateId)` prop

4. **Bottom editor preview section:** A styled div showing a split layout (left: form fields mock, right: card preview mock). "Generate Preview" button is visual only. This is static HTML/CSS, not functional.

Props:
```typescript
interface TemplateDiscoveryProps {
  onSelectTemplate: (templateId: TemplateId) => void
}
```

**Step 2: Commit**

```bash
git add tools/ecard-studio/template-discovery.tsx
git commit -m "feat(ecard-studio): add template discovery view"
```

---

### Task 4: Customization Panel (Right Panel)

**Files:**
- Create: `tools/ecard-studio/customization-panel.tsx`

**Step 1: Create the customization panel**

Create `tools/ecard-studio/customization-panel.tsx`:

This is the right panel of the editor (Screen 1). It renders:

1. **CUSTOMIZATION header** with an icon

2. **TYPOGRAPHY section:**
   - FONT FAMILY: `<select>` dropdown with FONT_OPTIONS
   - FONT SIZE (number input, "PX" label) + LINE HEIGHT (number input) — side by side
   - Text alignment: 4 buttons (left, center, right, justify) — toggle group, highlight active
   - Bold toggle: "B" button

3. **BUSINESS PALETTE section:**
   - 5 color preset circles (from COLOR_PRESETS). Clicking a preset sets both backgroundColor and accentColor on the card data.
   - BACKGROUND FILL: hex input + color swatch. Clicking the swatch opens a native `<input type="color">` picker.
   - ACCENT COLOR: hex input + color swatch with picker.

4. **CARD ELEMENTS section:**
   - Border Accents: label + toggle switch (styled checkbox)
   - Logo Overlay: label + toggle switch (visual placeholder — always disabled with "Coming soon" tooltip)

5. **Save as Template button:** full-width button, disabled, "Coming soon" tooltip

Props:
```typescript
interface CustomizationPanelProps {
  cardData: ECardData
  onChange: (updates: Partial<ECardData>) => void
}
```

All controls call `onChange` with the partial update. The parent manages state.

**Step 2: Commit**

```bash
git add tools/ecard-studio/customization-panel.tsx
git commit -m "feat(ecard-studio): add customization panel with typography and palette controls"
```

---

### Task 5: Design Library Sidebar (Left Panel)

**Files:**
- Create: `tools/ecard-studio/design-library.tsx`

**Step 1: Create the design library sidebar**

Create `tools/ecard-studio/design-library.tsx`:

This is the left panel of the editor (Screen 1). It renders:

1. **DESIGN LIBRARY header**

2. **CATEGORIES section:**
   - List of 4 category items: Modern Corporate, Classic Patterns, Minimalist, Floral
   - Each has an icon + label
   - Active category is highlighted (bg-blue-500/20 text-blue-400 for dark mode)
   - Clicking a category filters the quick templates shown below (or shows all if "Modern Corporate" default)

3. **QUICK TEMPLATES section:**
   - 2x2 grid of template thumbnails
   - Each thumbnail: a small CardPreview (scale ~0.15) with a label underneath
   - Show 4 templates: Executive, Startup (= midnight-pinstripe), Seasonal (= aura-signature), Classic (= black-tie-matte)
   - Clicking a thumbnail calls `onSelectTemplate(templateId)`

4. **Bottom: Workspace Storage** (visual placeholder)
   - Progress bar at 65%
   - "65% OF 2GB USED" label
   - Non-functional

Props:
```typescript
interface DesignLibraryProps {
  activeTemplate: TemplateId
  onSelectTemplate: (templateId: TemplateId) => void
}
```

**Step 2: Commit**

```bash
git add tools/ecard-studio/design-library.tsx
git commit -m "feat(ecard-studio): add design library sidebar with categories and templates"
```

---

### Task 6: Card Canvas (Center Panel)

**Files:**
- Create: `tools/ecard-studio/card-canvas.tsx`

**Step 1: Create the card canvas component**

Create `tools/ecard-studio/card-canvas.tsx`:

This is the center panel of the editor. It renders:

1. **Canvas toolbar** (top, horizontal bar):
   - Undo button (icon, disabled — visual placeholder)
   - Redo button (icon, disabled — visual placeholder)
   - Zoom out button (decreases zoom by 10%, min 50%)
   - Zoom in button (increases zoom by 10%, max 200%)
   - Zoom percentage display (e.g. "100%")
   - Layers button (icon, disabled — visual placeholder)

2. **Smart Recommendation banner** (dismissible):
   - "SMART RECOMMENDATION" label (green gradient badge)
   - "Suggested for:" text + 3 pill badges (Real Estate, Tech Startup, Holiday Greeting)
   - X button to dismiss (useState, hidden after dismiss)

3. **Card preview area** (centered, scrollable if card exceeds container):
   - Uses `CardPreview` component with current `cardData`
   - Applies CSS transform: `scale(zoom / 100)` for zoom
   - The `CardPreview` ref is forwarded to allow html2canvas export

4. **Autosave indicator** (bottom center):
   - "Changes autosaved 2m ago" badge — visual placeholder, always shows same text

Props:
```typescript
interface CardCanvasProps {
  cardData: ECardData
  cardRef: React.RefObject<HTMLDivElement>
  zoom: number
  onZoomChange: (zoom: number) => void
}
```

**Step 2: Commit**

```bash
git add tools/ecard-studio/card-canvas.tsx
git commit -m "feat(ecard-studio): add card canvas with toolbar and zoom controls"
```

---

### Task 7: Preview Modal & Export Utility

**Files:**
- Create: `tools/ecard-studio/preview-modal.tsx`
- Create: `tools/ecard-studio/export.ts`

**Step 1: Install html2canvas**

```bash
pnpm add html2canvas
```

**Step 2: Create export utility**

Create `tools/ecard-studio/export.ts`:

```typescript
import html2canvas from 'html2canvas'

export async function exportCardAsPng(
  element: HTMLElement,
  templateName: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2, // High DPI export
    useCORS: true,
    backgroundColor: null,
  })

  const link = document.createElement('a')
  link.download = `ecard-${templateName}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
```

**Step 3: Create preview modal**

Create `tools/ecard-studio/preview-modal.tsx`:

Full-screen overlay modal that shows the card at actual size:
- Dark backdrop (bg-black/70, backdrop-blur)
- Centered card rendered via `CardPreview` at scale=1
- Close button (X) in top-right
- Click outside card to close
- "Download PNG" button below the card
- Uses `export.ts` for download

Props:
```typescript
interface PreviewModalProps {
  cardData: ECardData
  onClose: () => void
}
```

**Step 4: Commit**

```bash
pnpm add html2canvas
git add tools/ecard-studio/preview-modal.tsx tools/ecard-studio/export.ts package.json pnpm-lock.yaml
git commit -m "feat(ecard-studio): add preview modal and PNG export via html2canvas"
```

---

### Task 8: Card Editor View (Main Orchestrator)

**Files:**
- Create: `tools/ecard-studio/card-editor.tsx`

**Step 1: Create the card editor component**

Create `tools/ecard-studio/card-editor.tsx`:

This is the main editor view (Screen 1) that composes all panels. Layout:

```
┌────────────────────────────────────────────────────────────┐
│ ECard Studio    Project: [name]    Preview  Schedule  Download │  (top bar)
├──────────┬─────────────────────────────────┬───────────────┤
│ Design   │                                 │ Customization │
│ Library  │     Card Canvas                 │ Panel         │
│ (250px)  │     (flex-grow)                 │ (300px)       │
│          │                                 │               │
└──────────┴─────────────────────────────────┴───────────────┘
```

**Desktop layout:** `flex` row with 3 children
- Left panel: `w-[250px] flex-shrink-0` (DesignLibrary)
- Center: `flex-1 min-w-0` (CardCanvas)
- Right panel: `w-[300px] flex-shrink-0` (CustomizationPanel)

**Mobile layout:** Single column
- Top bar with hamburger for left panel (slide-in drawer) and settings icon for right panel (bottom sheet)
- Canvas takes full width
- Panels are toggle-able overlays

**Top bar contents:**
- Left: "ECard Studio" text + "Professional Design Suite" subtitle
- Center: "Project:" + editable text input (local state, display only)
- Right: Preview button, Schedule button (disabled), Download button (primary, blue)

**State management:**
- `cardData: ECardData` — the current card configuration
- `zoom: number` — canvas zoom level
- `showPreview: boolean` — preview modal visibility
- `showMobileLibrary: boolean` — mobile left panel drawer
- `showMobileCustomization: boolean` — mobile right panel

**Handlers:**
- `handleCardChange(updates: Partial<ECardData>)` — merges into cardData
- `handleTemplateSelect(templateId)` — loads template defaults into cardData
- `handleDownload()` — calls `exportCardAsPng` with the cardRef
- `handlePreview()` — opens preview modal

**Back button:** A "← Back to Templates" link in the top bar that calls `onBack` prop to return to discovery view.

Props:
```typescript
interface CardEditorProps {
  initialTemplate: TemplateId
  onBack: () => void
}
```

**Step 2: Commit**

```bash
git add tools/ecard-studio/card-editor.tsx
git commit -m "feat(ecard-studio): add card editor with 3-panel layout and mobile responsive"
```

---

### Task 9: Page Route & Tool Registration

**Files:**
- Create: `app/tools/ecard-studio/page.tsx`
- Modify: `lib/tools.tsx`

**Step 1: Create the page route**

Create `app/tools/ecard-studio/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { TemplateDiscovery } from '@/tools/ecard-studio/template-discovery'
import { CardEditor } from '@/tools/ecard-studio/card-editor'
import type { TemplateId } from '@/tools/ecard-studio/types'

export default function ECardStudioPage() {
  const [view, setView] = useState<'discovery' | 'editor'>('discovery')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('executive')

  function handleSelectTemplate(templateId: TemplateId) {
    setSelectedTemplate(templateId)
    setView('editor')
  }

  function handleBack() {
    setView('discovery')
  }

  if (view === 'editor') {
    return <CardEditor initialTemplate={selectedTemplate} onBack={handleBack} />
  }

  return <TemplateDiscovery onSelectTemplate={handleSelectTemplate} />
}
```

**Step 2: Register the tool in lib/tools.tsx**

Add to the `tools` array in `lib/tools.tsx` (after the Currency Exchange entry):

```typescript
{
  name: 'ECard Studio',
  href: '/tools/ecard-studio',
  description: 'Design professional e-cards for business occasions',
  icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  color: 'from-yellow-500 to-amber-400',
},
```

**Step 3: Commit**

```bash
git add app/tools/ecard-studio/page.tsx lib/tools.tsx
git commit -m "feat(ecard-studio): add page route and register tool"
```

---

### Task 10: E2E Tests

**Files:**
- Create: `e2e/ecard-studio.spec.ts`

**Step 1: Write E2E tests**

Create `e2e/ecard-studio.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('ECard Studio - Template Discovery', () => {
  test('renders discovery page with heading and templates', async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await expect(page.getByRole('heading', { name: /what.?s the occasion/i })).toBeVisible()
    await expect(page.getByText('The Executive')).toBeVisible()
    await expect(page.getByText('Midnight Pinstripe')).toBeVisible()
    await expect(page.getByText('Start from Scratch')).toBeVisible()
  })

  test('renders intent pills', async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await expect(page.getByRole('button', { name: /New Product Launch/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Holiday Greetings/i })).toBeVisible()
  })

  test('clicking a template opens the editor', async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await page.getByText('The Executive').click()
    await expect(page.getByText(/ECard Studio/i)).toBeVisible()
    await expect(page.getByText(/CUSTOMIZATION/i)).toBeVisible()
  })
})

test.describe('ECard Studio - Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/ecard-studio')
    await page.getByText('The Executive').click()
  })

  test('renders 3-panel editor layout', async ({ page }) => {
    await expect(page.getByText(/DESIGN LIBRARY/i)).toBeVisible()
    await expect(page.getByText(/CUSTOMIZATION/i)).toBeVisible()
    await expect(page.getByText('Thank You')).toBeVisible()
  })

  test('font family dropdown changes card text', async ({ page }) => {
    const fontSelect = page.locator('select').first()
    await fontSelect.selectOption('Inter')
    // Card text should now use Inter font
    await expect(page.getByText('Thank You')).toBeVisible()
  })

  test('color preset changes card colors', async ({ page }) => {
    // Click the second color preset (Royal Blue)
    const presets = page.locator('[data-testid="color-preset"]')
    await presets.nth(1).click()
    await expect(page.getByText('Thank You')).toBeVisible()
  })

  test('back button returns to discovery', async ({ page }) => {
    await page.getByRole('button', { name: /back/i }).click()
    await expect(page.getByRole('heading', { name: /what.?s the occasion/i })).toBeVisible()
  })

  test('download button exists and is clickable', async ({ page }) => {
    const downloadBtn = page.getByRole('button', { name: /download/i })
    await expect(downloadBtn).toBeVisible()
    await expect(downloadBtn).toBeEnabled()
  })

  test('preview button opens modal', async ({ page }) => {
    await page.getByRole('button', { name: /preview/i }).click()
    // Modal should be visible with a close button
    await expect(page.getByRole('button', { name: /close/i })).toBeVisible()
  })
})
```

**Step 2: Run the tests**

```bash
pnpm exec playwright test e2e/ecard-studio.spec.ts --reporter=list
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add e2e/ecard-studio.spec.ts
git commit -m "test(ecard-studio): add E2E tests for discovery and editor views"
```

---

### Task 11: Visual Polish & Final Verification

**Files:**
- Various files in `tools/ecard-studio/`

**Step 1: Visual verification**

Run the dev server and visually verify against the design screenshots:
- `designs/12.ECardStudio/screen.png` (editor)
- `designs/12.ECardStudio/screen_1.png` (discovery)

```bash
pnpm dev --port 3002
```

Visit `http://localhost:3002/tools/ecard-studio` and verify:
1. Discovery page matches Screen 2 design (dark theme, template grid, intent pills)
2. Editor matches Screen 1 design (3-panel layout, canvas, customization controls)
3. Mobile responsive (panels collapse, canvas fills width)
4. Download works (PNG generated)
5. Preview modal works

**Step 2: Fix any visual discrepancies**

Compare each section against the design and adjust:
- Colors, spacing, typography to match the design
- Dark mode styling consistency with the rest of Toolk1t
- Border radius, shadows, opacity values

**Step 3: Run full E2E suite**

```bash
pnpm exec playwright test e2e/ecard-studio.spec.ts --reporter=list
```

**Step 4: Commit**

```bash
git add -A
git commit -m "style(ecard-studio): visual polish to match design specs"
```

---

## Task Summary

| Task | Component | Dependencies |
|------|-----------|--------------|
| 1 | Types & Template Data | None |
| 2 | Card Preview Component | Task 1 |
| 3 | Template Discovery View | Tasks 1, 2 |
| 4 | Customization Panel | Task 1 |
| 5 | Design Library Sidebar | Tasks 1, 2 |
| 6 | Card Canvas | Tasks 1, 2 |
| 7 | Preview Modal & Export | Tasks 1, 2 |
| 8 | Card Editor (Orchestrator) | Tasks 4, 5, 6, 7 |
| 9 | Page Route & Registration | Tasks 3, 8 |
| 10 | E2E Tests | Task 9 |
| 11 | Visual Polish | Task 10 |
