# ECard Studio — Design Document

**Date:** 2026-02-22
**Status:** Approved

## Goal

Build a professional e-card design tool for Toolk1t that lets users pick a template, customize typography/colors/layout, preview the card, and download it as PNG.

## Scope

- Template discovery page (Screen 2) + 3-panel editor (Screen 1)
- 5 hardcoded templates + "Start from Scratch"
- HTML/CSS card rendering with html2canvas export
- Download as PNG (no email sending)
- Visual placeholders for: Schedule, Smart Recommendations, Workspace Storage, Save as Template, Logo Overlay upload

## Architecture

**Single route:** `app/tools/ecard-studio/page.tsx` (client component)

**View states:** `'discovery' | 'editor'`

**Approach:** Single-page app with view toggle. Discovery view is the default. Selecting a template transitions to the editor view.

### Component Tree

```
page.tsx (view state manager)
├── TemplateDiscovery (Screen 2)
│   ├── IntentSelector (occasion pills)
│   ├── TemplateGrid (6 cards: 5 templates + blank)
│   └── EditorPreviewSection (bottom marketing)
└── CardEditor (Screen 1)
    ├── DesignLibrarySidebar (left panel)
    │   ├── CategoryList
    │   └── QuickTemplates
    ├── CardCanvas (center)
    │   ├── CanvasToolbar (undo/redo/zoom/layers)
    │   └── CardPreview (HTML/CSS rendered card)
    └── CustomizationPanel (right panel)
        ├── TypographyControls
        ├── BusinessPalette
        └── CardElements (toggles)
```

### File Structure

```
app/tools/ecard-studio/page.tsx          # Route page (view state manager)
tools/ecard-studio/types.ts              # TypeScript interfaces
tools/ecard-studio/templates.ts          # Hardcoded template definitions
tools/ecard-studio/template-discovery.tsx # Discovery view
tools/ecard-studio/card-editor.tsx       # Editor view (3-panel layout)
tools/ecard-studio/design-library.tsx    # Left panel
tools/ecard-studio/card-canvas.tsx       # Center panel + card preview
tools/ecard-studio/customization.tsx     # Right panel
tools/ecard-studio/preview-modal.tsx     # Full-size preview modal
tools/ecard-studio/export.ts            # html2canvas export utility
e2e/ecard-studio.spec.ts                # Playwright E2E tests
```

## Data Model

```typescript
type TemplateId = 'executive' | 'midnight-pinstripe' | 'tech-blueprint' | 'aura-signature' | 'black-tie-matte' | 'blank'

interface ECardData {
  template: TemplateId
  heading: string
  subheading: string
  body: string
  companyName: string
  companyTagline: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  textAlign: 'left' | 'center' | 'right' | 'justify'
  bold: boolean
  backgroundColor: string
  accentColor: string
  borderAccents: boolean
  logoOverlay: boolean
}

interface Template {
  id: TemplateId
  name: string
  description: string
  category: 'classic-marble' | 'corporate' | 'modernist' | 'ethereal' | 'noir'
  defaults: ECardData
  backgroundPattern: 'arcs' | 'stripes' | 'grid' | 'gradient' | 'solid'
}
```

## Template Discovery View (Screen 2)

- **Hero:** "What's the occasion?" heading + intent pills (New Product Launch, Client Anniversary, Employee Welcome, Quarterly Milestone, Holiday Greetings, Thank You Note). Clicking highlights the pill (visual only).
- **Template grid:** 3-column responsive (3 desktop, 2 tablet, 1 mobile). 5 template cards with CSS-rendered previews + "Start from Scratch" card.
- **Bottom marketing section:** Static preview of editor UI concept. "Generate Preview" button is a visual placeholder.
- Uses global Toolk1t footer (not the ECard-specific footer from the design).

## Card Editor View (Screen 1)

### Left Panel — Design Library (~250px)
- Categories: Modern Corporate, Classic Patterns, Minimalist, Floral (with icons)
- Quick Templates: 2x2 grid of thumbnails (Executive, Startup, Seasonal, Classic)
- Workspace Storage bar: visual placeholder

### Center — Canvas Area (flex-grow)
- Toolbar: Undo, Redo, Zoom In/Out, Zoom %, Layers — placeholders except zoom
- Smart Recommendation banner: dismissible, visual placeholder
- Card preview: 600x400px HTML div with:
  - Background color + template-specific decorative SVG overlay
  - Heading, subheading, body text with selected font/size/alignment
  - Company name (accent color) + tagline
  - Bottom accent bar (if borderAccents enabled)
- Autosave indicator: visual placeholder

### Right Panel — Customization (~300px)
- Typography: font family dropdown, font size, line height, text alignment, bold
- Business Palette: 5 preset swatches + background/accent hex inputs with color pickers
- Card Elements: Border Accents toggle, Logo Overlay toggle (placeholder)
- Save as Template: visual placeholder

### Top Bar
- "ECard Studio" branding
- Project name: editable text field (display only)
- Preview: opens full-size modal
- Schedule: visual placeholder (disabled)
- Download: primary action, exports PNG via html2canvas

### Mobile Responsive
- Single-column layout on mobile/tablet
- Canvas full width, panels become collapsible drawers

## Export

- `html2canvas` captures card preview div as PNG
- Browser download: `ecard-{template}-{timestamp}.png`
- Toast notification on success
- Error toast on html2canvas failure

## Preview Modal

- Full-screen overlay with card at actual size (600x400)
- Close via X button or click-outside
- Download button available in modal

## Tool Registration

- Add to `lib/tools.tsx`: name "ECard Studio", href "/tools/ecard-studio", description "Design professional e-cards for business occasions"
- Use `ecard.png` icon from `designs/images/toolIcons/`

## E2E Tests

Coverage:
- Discovery page renders (heading, intent pills, template grid)
- Template click transitions to editor
- Editor renders all 3 panels
- Customization controls update card preview
- Download button triggers export
- Back button returns to discovery
- Mobile responsive panels collapse

## Non-Goals (Visual Placeholders Only)

- Email sending (Schedule, Send via Email)
- AI Smart Recommendations
- Workspace storage / persistence
- Save as Template / My Designs
- Logo upload
- Undo/Redo history
- Layers management
