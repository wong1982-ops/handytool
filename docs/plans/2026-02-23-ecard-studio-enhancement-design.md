# Ecard Studio Enhancement — Design Document

**Date**: 2026-02-23
**Inspiration**: Adobe Express business card template gallery
**Status**: Draft

---

## 1. Goals

Enhance the Ecard Studio from a 5-template proof-of-concept to a rich template gallery with 50+ templates, search/filter, business card support, and improved discovery UX — inspired by Adobe Express's template browsing patterns.

## 2. Scope

### In Scope
- Expand templates from 5 → 50+ (25 e-cards + 25 business cards)
- Add business card format (700x400px, 3.5:2 inch ratio)
- Search bar with text matching
- Category filter pills (Adobe Express style)
- Richer template cards with hover previews and badges
- Result count display
- New background patterns for visual variety

### Out of Scope
- AI template generation
- Backend persistence / user accounts
- Multi-page cards
- Image/photo upload

---

## 3. Template Taxonomy

### 3.1 Card Types

| Type | Dimensions | Fields |
|---|---|---|
| **E-card** | 600x400px | heading, subheading, body, companyName, companyTagline |
| **Business Card** | 700x400px | heading (name), subheading (title), body (unused), companyName, companyTagline, phone, email, website |

### 3.2 Categories (10)

| Category | ID | Card Types | Description |
|---|---|---|---|
| Classic | `classic` | Both | Timeless, elegant patterns |
| Corporate | `corporate` | Both | Professional, authoritative |
| Minimalist | `minimalist` | Both | Clean lines, whitespace |
| Bold | `bold` | Both | High contrast, strong typography |
| Creative | `creative` | Both | Artistic, colorful, expressive |
| Nature | `nature` | Both | Earth tones, organic shapes |
| Tech | `tech` | Both | Geometric, modern, grid-based |
| Luxury | `luxury` | Both | Dark backgrounds, metallic accents |
| Warm | `warm` | E-card | Friendly, inviting tones |
| Festive | `festive` | E-card | Holiday/celebration themes |

### 3.3 Style Tags (for filtering)

- `dark` / `light` (background tone)
- `serif` / `sans-serif` (typography)
- `patterned` / `solid` (background style)
- `colorful` / `monochrome` (color range)

### 3.4 New Background Patterns

Extend the existing 5 patterns with 5 new ones (10 total):

| Pattern | ID | SVG Description |
|---|---|---|
| Arcs | `arcs` | (existing) Golden circles |
| Stripes | `stripes` | (existing) Vertical lines |
| Grid | `grid` | (existing) Square grid |
| Gradient | `gradient` | (existing) Radial gradient |
| Solid | `solid` | (existing) No overlay |
| Dots | `dots` | Evenly spaced dot matrix |
| Diagonal | `diagonal` | 45° diagonal lines |
| Waves | `waves` | Horizontal wave curves |
| Circles | `circles` | Concentric circles from corner |
| Hexagons | `hexagons` | Honeycomb hex pattern |

---

## 4. Template List (50+)

### E-card Templates (25)

| # | ID | Name | Category | Pattern | BG Color | Accent | Font |
|---|---|---|---|---|---|---|---|
| 1 | `executive` | The Executive | classic | arcs | #101922 | #D4AF37 | Playfair Display |
| 2 | `midnight-pinstripe` | Midnight Pinstripe | corporate | stripes | #0A1628 | #1173D4 | Inter |
| 3 | `tech-blueprint` | Tech Blueprint | tech | grid | #F5F5F0 | #18181B | Space Grotesk |
| 4 | `aura-signature` | Aura Signature | nature | gradient | #2D3B2D | #C4956A | Georgia |
| 5 | `black-tie-matte` | Black Tie Matte | luxury | solid | #18181B | #A1A1AA | Playfair Display |
| 6 | `warm-welcome` | Warm Welcome | warm | waves | #FDF2E9 | #D97706 | Georgia |
| 7 | `midnight-aurora` | Midnight Aurora | creative | gradient | #0C0A2A | #7C3AED | Montserrat |
| 8 | `coral-reef` | Coral Reef | nature | dots | #1A1A2E | #FF6B6B | Inter |
| 9 | `ice-crystal` | Ice Crystal | minimalist | hexagons | #F0F9FF | #0EA5E9 | Inter |
| 10 | `autumn-harvest` | Autumn Harvest | warm | waves | #2C1810 | #E87040 | Georgia |
| 11 | `electric-pulse` | Electric Pulse | bold | diagonal | #0D0D0D | #00FF88 | Space Grotesk |
| 12 | `royal-crest` | Royal Crest | luxury | arcs | #1A0A2E | #FFD700 | Playfair Display |
| 13 | `spring-bloom` | Spring Bloom | nature | dots | #F0FDF4 | #16A34A | Georgia |
| 14 | `neon-night` | Neon Night | creative | grid | #0A0A0A | #F43F5E | Montserrat |
| 15 | `ocean-depth` | Ocean Depth | creative | waves | #0B1628 | #06B6D4 | Inter |
| 16 | `festive-joy` | Festive Joy | festive | circles | #1A0000 | #DC2626 | Playfair Display |
| 17 | `winter-wonder` | Winter Wonderland | festive | hexagons | #0F172A | #CBD5E1 | Inter |
| 18 | `sunrise-glow` | Sunrise Glow | warm | gradient | #FFF7ED | #EA580C | Montserrat |
| 19 | `deep-forest` | Deep Forest | nature | stripes | #0A1F0A | #22C55E | Georgia |
| 20 | `lavender-dream` | Lavender Dream | creative | dots | #FAF5FF | #9333EA | Playfair Display |
| 21 | `steel-resolve` | Steel Resolve | corporate | diagonal | #1E293B | #64748B | Inter |
| 22 | `champagne-toast` | Champagne Toast | festive | arcs | #1C1917 | #D4A574 | Playfair Display |
| 23 | `metro-line` | Metro Line | minimalist | stripes | #FFFFFF | #18181B | Space Grotesk |
| 24 | `ruby-gala` | Ruby Gala | luxury | gradient | #1A0000 | #BE123C | Playfair Display |
| 25 | `fresh-start` | Fresh Start | warm | solid | #ECFDF5 | #059669 | Montserrat |

### Business Card Templates (25)

| # | ID | Name | Category | Pattern | BG Color | Accent | Font |
|---|---|---|---|---|---|---|---|
| 26 | `bc-classic-white` | Classic White | classic | solid | #FFFFFF | #1E293B | Inter |
| 27 | `bc-corporate-blue` | Corporate Blue | corporate | stripes | #0A1628 | #2563EB | Inter |
| 28 | `bc-minimalist-black` | Minimalist Black | minimalist | solid | #18181B | #FFFFFF | Space Grotesk |
| 29 | `bc-bold-orange` | Bold Orange | bold | diagonal | #1A1A1A | #F97316 | Montserrat |
| 30 | `bc-elegant-gold` | Elegant Gold | luxury | arcs | #101922 | #D4AF37 | Playfair Display |
| 31 | `bc-nature-green` | Nature Green | nature | dots | #F0FDF4 | #166534 | Georgia |
| 32 | `bc-tech-grid` | Tech Grid | tech | grid | #0F172A | #3B82F6 | Space Grotesk |
| 33 | `bc-creative-gradient` | Creative Gradient | creative | gradient | #2E1065 | #A78BFA | Montserrat |
| 34 | `bc-warm-beige` | Warm Beige | classic | solid | #F5F0EB | #92400E | Georgia |
| 35 | `bc-midnight-silver` | Midnight Silver | luxury | stripes | #0F172A | #94A3B8 | Inter |
| 36 | `bc-clean-slate` | Clean Slate | minimalist | solid | #F8FAFC | #475569 | Inter |
| 37 | `bc-royal-purple` | Royal Purple | luxury | gradient | #1E0A3C | #A855F7 | Playfair Display |
| 38 | `bc-ocean-blue` | Ocean Blue | creative | waves | #0C2D48 | #0EA5E9 | Inter |
| 39 | `bc-earth-tone` | Earth Tone | nature | dots | #292118 | #B8860B | Georgia |
| 40 | `bc-neon-cyber` | Neon Cyber | bold | grid | #0A0A0A | #00FF88 | Space Grotesk |
| 41 | `bc-rose-gold` | Rose Gold | luxury | arcs | #1C1012 | #E8B4B8 | Playfair Display |
| 42 | `bc-fresh-mint` | Fresh Mint | nature | waves | #F0FDFA | #0D9488 | Montserrat |
| 43 | `bc-charcoal` | Charcoal Studio | minimalist | solid | #27272A | #D4D4D8 | Space Grotesk |
| 44 | `bc-sunset-coral` | Sunset Coral | creative | gradient | #1A0505 | #FB7185 | Montserrat |
| 45 | `bc-blueprint` | Blueprint | tech | grid | #172554 | #60A5FA | Space Grotesk |
| 46 | `bc-vintage-cream` | Vintage Cream | classic | dots | #FFFBEB | #78350F | Georgia |
| 47 | `bc-deep-teal` | Deep Teal | corporate | stripes | #042F2E | #2DD4BF | Inter |
| 48 | `bc-mono-bold` | Mono Bold | bold | solid | #000000 | #FFFFFF | Montserrat |
| 49 | `bc-sage-garden` | Sage Garden | nature | hexagons | #2D3B2D | #86EFAC | Georgia |
| 50 | `bc-crimson-edge` | Crimson Edge | bold | diagonal | #1A0000 | #EF4444 | Montserrat |

---

## 5. Discovery Page Redesign

### 5.1 Layout (top → bottom)

```
┌─────────────────────────────────────────────────┐
│  Hero: "Design Studio"                          │
│  Subtitle: "Professional e-cards & business     │
│  cards for every occasion"                      │
├─────────────────────────────────────────────────┤
│  [🔍 Search templates...                    ✕]  │
├─────────────────────────────────────────────────┤
│  Type:  [All] [E-cards] [Business Cards]        │
│  Style: [Classic] [Corporate] [Minimalist] ...  │
│  Tone:  [Dark] [Light] [Colorful]               │
├─────────────────────────────────────────────────┤
│  "52 templates" (result count)                  │
├─────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │
│  │ T1 │ │ T2 │ │ T3 │ │ T4 │  ← 4-col grid   │
│  └────┘ └────┘ └────┘ └────┘    (lg)           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │
│  │ T5 │ │ T6 │ │ T7 │ │ T8 │                   │
│  └────┘ └────┘ └────┘ └────┘                   │
│  ... (scrollable)                               │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐                 │
│  │  + Start from Scratch     │                  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘                 │
└─────────────────────────────────────────────────┘
```

### 5.2 Search Bar

- Full-width input with search icon (left) and clear button (right)
- Filters templates by name, category, and description
- Debounced (200ms) for performance
- Shows "No templates match" empty state if 0 results

### 5.3 Filter Pills (Adobe Express style)

Three filter rows with horizontally scrollable pill buttons:

**Row 1 — Card Type** (single select):
`All` | `E-cards` | `Business Cards`

**Row 2 — Category** (multi-select):
`Classic` | `Corporate` | `Minimalist` | `Bold` | `Creative` | `Nature` | `Tech` | `Luxury` | `Warm` | `Festive`

**Row 3 — Tone** (single select):
`All` | `Dark` | `Light` | `Colorful`

Active pills: filled background (blue-500/20, blue border)
Inactive pills: slate border, hover highlight

### 5.4 Template Cards (Enhanced)

Each card shows:
- **Thumbnail**: Scaled CardPreview (scale 0.35 for e-cards, adjusted for business cards)
- **Hover overlay**: Semi-transparent dark overlay with template name + "Use Template" CTA
- **Category badge**: Top-left chip (e.g. "Corporate", "Luxury")
- **Card type badge**: Top-right chip ("E-card" or "Business Card")
- **Bottom**: Template name + truncated description

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

### 5.5 Result Count

Below filter pills: "{N} templates" or "{N} templates matching '{query}'"

---

## 6. Data Model Changes

### 6.1 Updated Types

```typescript
// Card type discriminator
type CardType = 'ecard' | 'business-card'

// Expanded template categories
type TemplateCategory =
  | 'classic' | 'corporate' | 'minimalist' | 'bold'
  | 'creative' | 'nature' | 'tech' | 'luxury'
  | 'warm' | 'festive'

// New patterns
type BackgroundPattern =
  | 'arcs' | 'stripes' | 'grid' | 'gradient' | 'solid'
  | 'dots' | 'diagonal' | 'waves' | 'circles' | 'hexagons'

// Template gains cardType, tags, and dimensions
interface Template {
  id: string              // no longer union type — too many
  name: string
  description: string
  cardType: CardType
  category: TemplateCategory
  categoryLabel: string
  backgroundPattern: BackgroundPattern
  tags: string[]          // for search/filter
  width: number           // 600 for e-card, 700 for business card
  height: number          // 400 for both
  defaults: ECardData
}

// ECardData gains optional business card fields
interface ECardData {
  // ... existing fields ...
  cardType: CardType
  phone?: string          // business card only
  email?: string          // business card only
  website?: string        // business card only
  address?: string        // business card only
}
```

### 6.2 CardPreview Changes

- Accept `width` and `height` from template (instead of hardcoded 600x400)
- SVG overlays must support both 600x400 and 700x400
- Business card layout: name/title on left, contact info on right (two-column)

---

## 7. File Changes

| File | Change |
|---|---|
| `types.ts` | Add CardType, expand TemplateCategory, BackgroundPattern, add fields |
| `templates.ts` | Replace 5 templates with 50+ (split into `ecard-templates.ts` + `business-card-templates.ts`) |
| `card-preview.tsx` | Support variable dimensions, business card layout, new patterns |
| `template-discovery.tsx` | Complete rewrite: search bar, filter pills, 4-col grid, hover cards |
| `card-editor.tsx` | Add business card fields (phone, email, website) to customization |
| `customization-panel.tsx` | Add contact info section for business cards |

### New Files
| File | Purpose |
|---|---|
| `data/ecard-templates.ts` | 25 e-card template definitions |
| `data/business-card-templates.ts` | 25 business card template definitions |
| `template-card.tsx` | New enhanced template card component with hover overlay |
| `search-filter.tsx` | Search + filter pill components |

---

## 8. Remove Bottom Editor Preview Section

The current discovery page has a static "Editor" marketing section at the bottom. Remove it — with 50+ templates, the grid itself is the discovery experience.

---

## 9. Migration Strategy

- Existing 5 templates keep their IDs (backward-compatible with localStorage scores)
- Categories renamed (e.g. `classic-marble` → `classic`, `noir` → `luxury`)
- `TemplateId` becomes `string` instead of a union type (too many values)
- `BLANK_DEFAULTS` stays as-is

---

## 10. Acceptance Criteria

- [ ] 50+ templates render correctly in the grid
- [ ] Search filters templates by name/description in real-time
- [ ] Category pills filter correctly (multi-select)
- [ ] Card type filter (All/E-card/Business Card) works
- [ ] Tone filter (Dark/Light/Colorful) works
- [ ] Template cards show hover overlay with name + CTA
- [ ] Business card templates use 700x400 dimensions
- [ ] Business card editor shows contact fields (phone, email, website)
- [ ] All new patterns (dots, diagonal, waves, circles, hexagons) render
- [ ] Mobile responsive: 1-col → 2-col → 3-col → 4-col grid
- [ ] Result count updates dynamically
- [ ] Empty state when no templates match search/filters
- [ ] Existing e-cards still work with no regression
- [ ] E2E tests pass
