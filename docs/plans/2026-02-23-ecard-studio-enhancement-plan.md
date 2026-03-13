# Ecard Studio Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the Ecard Studio from 5 templates to 50+ with search/filter, business card support, and Adobe Express-inspired discovery UX.

**Architecture:** Split template data into separate files by card type, extend the type system with CardType discriminator and new patterns, rewrite discovery page with search + filter + 4-col grid, and extend the editor for business card contact fields.

**Tech Stack:** React 19, Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, html2canvas

**Design doc:** `docs/plans/2026-02-23-ecard-studio-enhancement-design.md`

---

### Task 1: Update Type System

**Files:**
- Modify: `tools/ecard-studio/types.ts`

**Step 1: Replace types.ts with expanded type definitions**

```typescript
export type CardType = 'ecard' | 'business-card'

export type BackgroundPattern =
  | 'arcs' | 'stripes' | 'grid' | 'gradient' | 'solid'
  | 'dots' | 'diagonal' | 'waves' | 'circles' | 'hexagons'

export type TemplateCategory =
  | 'classic' | 'corporate' | 'minimalist' | 'bold'
  | 'creative' | 'nature' | 'tech' | 'luxury'
  | 'warm' | 'festive'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export interface ECardData {
  template: string
  cardType: CardType
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
  // Business card contact fields (optional)
  phone?: string
  email?: string
  website?: string
  address?: string
}

export interface Template {
  id: string
  name: string
  description: string
  cardType: CardType
  category: TemplateCategory
  categoryLabel: string
  backgroundPattern: BackgroundPattern
  tags: string[]
  width: number
  height: number
  defaults: ECardData
}

export interface ColorPreset {
  name: string
  background: string
  accent: string
}
```

**Step 2: Fix all TypeScript errors from TemplateId → string change**

- `page.tsx`: Change `TemplateId` to `string` in state type
- `card-editor.tsx`: Change `TemplateId` to `string` in props and function params
- `design-library.tsx`: Change `TemplateId` to `string` in props
- `template-discovery.tsx`: Change `TemplateId` to `string` in props

Run: `pnpm tsc --noEmit`
Expected: PASS (0 errors)

**Step 3: Commit**

```bash
git add tools/ecard-studio/types.ts app/tools/ecard-studio/page.tsx tools/ecard-studio/card-editor.tsx tools/ecard-studio/design-library.tsx tools/ecard-studio/template-discovery.tsx
git commit -m "refactor(ecard-studio): expand type system for 50+ templates and business cards"
```

---

### Task 2: Add New SVG Pattern Overlays

**Files:**
- Modify: `tools/ecard-studio/card-preview.tsx`

**Step 1: Add 5 new pattern overlay components after existing ones**

Add these SVG overlay components: `DotsOverlay`, `DiagonalOverlay`, `WavesOverlay`, `CirclesOverlay`, `HexagonsOverlay`. Each takes `{ accent: string, width?: number, height?: number }` props (default 600x400).

Update `PatternOverlay` switch to include the new cases.

Also update the card dimensions to use template `width`/`height` instead of hardcoded 600x400. Add a `width` and `height` prop to `CardPreviewProps` (default 600 and 400).

**Step 2: Add business card layout variant**

When `data.cardType === 'business-card'`, render a two-column layout:
- Left: name (heading), title (subheading), company
- Right: phone, email, website, address (stacked, right-aligned)

Keep existing e-card layout for `cardType === 'ecard'`.

**Step 3: Verify patterns render**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add tools/ecard-studio/card-preview.tsx
git commit -m "feat(ecard-studio): add 5 new SVG patterns and business card layout"
```

---

### Task 3: Create 25 E-card Templates

**Files:**
- Create: `tools/ecard-studio/data/ecard-templates.ts`

**Step 1: Create the e-card templates file**

Create 25 `Template` objects following the table in the design doc (Section 4). Each template must include:
- `id`, `name`, `description`, `cardType: 'ecard'`
- `category`, `categoryLabel`, `backgroundPattern`
- `tags` array (e.g. `['dark', 'serif', 'patterned']`)
- `width: 600`, `height: 400`
- `defaults` with full `ECardData` (including sample heading/subheading/body/company)

Export as `ECARD_TEMPLATES: Template[]`.

Keep the first 5 templates matching existing IDs exactly (executive, midnight-pinstripe, tech-blueprint, aura-signature, black-tie-matte) for backward compatibility.

**Step 2: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/ecard-studio/data/ecard-templates.ts
git commit -m "feat(ecard-studio): add 25 e-card template definitions"
```

---

### Task 4: Create 25 Business Card Templates

**Files:**
- Create: `tools/ecard-studio/data/business-card-templates.ts`

**Step 1: Create the business card templates file**

Create 25 `Template` objects following the design doc (Section 4). Each template must include:
- `id` prefixed with `bc-`, e.g. `bc-classic-white`
- `cardType: 'business-card'`
- `width: 700`, `height: 400`
- `defaults` with sample contact fields: `phone`, `email`, `website`
- Appropriate `tags` array

Export as `BUSINESS_CARD_TEMPLATES: Template[]`.

**Step 2: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/ecard-studio/data/business-card-templates.ts
git commit -m "feat(ecard-studio): add 25 business card template definitions"
```

---

### Task 5: Update templates.ts to Aggregate All Templates

**Files:**
- Modify: `tools/ecard-studio/templates.ts`

**Step 1: Replace TEMPLATES array with aggregated import**

```typescript
import type { ColorPreset, Template } from './types'
import { ECARD_TEMPLATES } from './data/ecard-templates'
import { BUSINESS_CARD_TEMPLATES } from './data/business-card-templates'

export const TEMPLATES: Template[] = [
  ...ECARD_TEMPLATES,
  ...BUSINESS_CARD_TEMPLATES,
]

// Keep existing exports
export const COLOR_PRESETS: ColorPreset[] = [ /* same as before */ ]
export const FONT_OPTIONS: string[] = [ /* same as before */ ]
export const BLANK_DEFAULTS = { /* add cardType: 'ecard' */ }
```

**Step 2: Update BLANK_DEFAULTS to include `cardType: 'ecard'`**

**Step 3: Verify build**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add tools/ecard-studio/templates.ts
git commit -m "refactor(ecard-studio): aggregate templates from data files"
```

---

### Task 6: Create Search & Filter Component

**Files:**
- Create: `tools/ecard-studio/search-filter.tsx`

**Step 1: Build the SearchFilter component**

Props:
```typescript
interface SearchFilterProps {
  search: string
  onSearchChange: (value: string) => void
  cardTypeFilter: 'all' | 'ecard' | 'business-card'
  onCardTypeChange: (value: 'all' | 'ecard' | 'business-card') => void
  categoryFilters: Set<TemplateCategory>
  onCategoryToggle: (cat: TemplateCategory) => void
  toneFilter: 'all' | 'dark' | 'light' | 'colorful'
  onToneChange: (value: 'all' | 'dark' | 'light' | 'colorful') => void
  resultCount: number
}
```

Layout:
1. Search input with magnifying glass icon and clear button
2. Card type pill row: All | E-cards | Business Cards
3. Category pill row (horizontally scrollable): 10 categories
4. Tone pill row: All | Dark | Light | Colorful
5. Result count: "{N} templates" below pills

Styling: Match existing dark theme (slate-900 bg, slate-800 borders, blue-500 active).

**Step 2: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/ecard-studio/search-filter.tsx
git commit -m "feat(ecard-studio): add search and filter component"
```

---

### Task 7: Create Enhanced Template Card Component

**Files:**
- Create: `tools/ecard-studio/template-card.tsx`

**Step 1: Build the TemplateCard component**

Props:
```typescript
interface TemplateCardProps {
  template: Template
  onClick: () => void
}
```

Layout:
- Thumbnail area: Scaled `CardPreview` (scale ~0.3)
- Category badge: top-left chip
- Card type badge: top-right chip ("E-card" / "Business Card")
- Hover overlay: dark semi-transparent with template name + "Use Template" text
- Bottom: template name + truncated description (2-line clamp)
- Full button semantics (the entire card is a `<button>`)
- `cursor-pointer`, hover border highlight (matches test-card.tsx pattern)

**Step 2: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/ecard-studio/template-card.tsx
git commit -m "feat(ecard-studio): add enhanced template card with hover overlay"
```

---

### Task 8: Rewrite Template Discovery Page

**Files:**
- Modify: `tools/ecard-studio/template-discovery.tsx`

**Step 1: Rewrite TemplateDiscovery with search, filter, and grid**

State:
- `search: string` (debounced filter)
- `cardTypeFilter: 'all' | 'ecard' | 'business-card'`
- `categoryFilters: Set<TemplateCategory>`
- `toneFilter: 'all' | 'dark' | 'light' | 'colorful'`

Filter logic:
1. Text search: match `template.name`, `template.description`, `template.tags` (case-insensitive)
2. Card type: match `template.cardType` (skip if 'all')
3. Categories: match `template.category` (skip if empty set)
4. Tone: check `template.tags` for 'dark'/'light'/'colorful' (skip if 'all')

Layout:
```
Hero heading: "Design Studio"
Subtitle: "Professional e-cards & business cards for every occasion"
SearchFilter component
4-column grid of TemplateCard components
"Start from Scratch" dashed card at end
Empty state if 0 results
```

Remove: Intent pills, bottom "Editor Preview" section, BookmarkIcon.

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`

**Step 2: Update the `onSelectTemplate` prop type from `TemplateId` to `string`**

**Step 3: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add tools/ecard-studio/template-discovery.tsx
git commit -m "feat(ecard-studio): rewrite discovery page with search, filter, and 4-col grid"
```

---

### Task 9: Add Business Card Contact Fields to Editor

**Files:**
- Modify: `tools/ecard-studio/customization-panel.tsx`

**Step 1: Add "Contact Information" section below existing Typography section**

Only show when `cardData.cardType === 'business-card'`:

```tsx
{cardData.cardType === 'business-card' && (
  <section className="flex flex-col gap-3">
    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
      Contact Information
    </h3>
    {/* Phone input */}
    {/* Email input */}
    {/* Website input */}
    {/* Address textarea */}
  </section>
)}
```

Each field: `<input>` with label, same styling as existing inputs (bg-slate-800, border-slate-700, rounded-lg).

**Step 2: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/ecard-studio/customization-panel.tsx
git commit -m "feat(ecard-studio): add contact info fields for business cards"
```

---

### Task 10: Update Card Editor for Variable Dimensions

**Files:**
- Modify: `tools/ecard-studio/card-editor.tsx`
- Modify: `tools/ecard-studio/card-canvas.tsx`

**Step 1: Pass template width/height through to CardCanvas and CardPreview**

Look up the active template from `TEMPLATES` to get `width` and `height`. Pass these down to `CardCanvas` → `CardPreview`.

Default to 600x400 for blank/unknown templates.

**Step 2: Update CardCanvas to accept and use width/height props**

The zoom calculation and container sizing should use the template dimensions.

**Step 3: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add tools/ecard-studio/card-editor.tsx tools/ecard-studio/card-canvas.tsx
git commit -m "feat(ecard-studio): support variable card dimensions in editor"
```

---

### Task 11: Update Design Library Sidebar for New Templates

**Files:**
- Modify: `tools/ecard-studio/design-library.tsx`

**Step 1: Update the Quick Templates section**

The design library shows a small template grid. Update it to:
- Show templates grouped by card type
- Support the new `string` ID type (not `TemplateId` union)
- Handle the larger template count (show first 4 per type, or add tabs)

**Step 2: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add tools/ecard-studio/design-library.tsx
git commit -m "refactor(ecard-studio): update design library for new template structure"
```

---

### Task 12: Update E2E Tests

**Files:**
- Modify: `e2e/ecard-studio.spec.ts`

**Step 1: Update discovery view tests**

- Test that search input exists and filters templates
- Test that card type filter pills work (click "Business Cards" → only bc-* templates show)
- Test result count updates
- Test that clicking a template card opens editor

**Step 2: Add business card editor tests**

- Test that selecting a business card template shows contact fields
- Test that phone/email/website inputs are editable
- Test that e-card template does NOT show contact fields

**Step 3: Run tests**

Run: `pnpm exec playwright test e2e/ecard-studio.spec.ts`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add e2e/ecard-studio.spec.ts
git commit -m "test(ecard-studio): update E2E tests for enhanced discovery and business cards"
```

---

### Task 13: Final Integration Verification

**Step 1: Type check**

Run: `pnpm tsc --noEmit`
Expected: PASS

**Step 2: Visual verification**

Run: `pnpm dev` and verify in browser:
- Discovery page shows 50+ templates in 4-col grid
- Search filters in real-time
- Category pills filter correctly
- Card type toggle works
- Business card templates show 700px wide preview
- Clicking template opens editor
- Business card editor shows contact fields
- Export still works for both card types

**Step 3: Run all E2E tests**

Run: `pnpm exec playwright test`
Expected: ALL PASS

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(ecard-studio): complete 50+ template gallery with search, filter, and business cards"
```
