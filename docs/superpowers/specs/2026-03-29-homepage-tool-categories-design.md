# Homepage Tool Categories — Design Spec

**Date:** 2026-03-29
**Location:** `components/home/bento-showcase.tsx`
**Purpose:** Split the homepage bento showcase into two labeled sections — "AI-Powered Tools" and "Utility Tools" — with mobile accordion and schema.org structured data.

---

## Understanding Summary

- **What**: Categorize homepage tools into AI-powered and utility sections within the existing bento showcase
- **Why**: Help users quickly distinguish AI-powered tools from free utility tools
- **Who**: All homepage visitors
- **Non-goals**: No filter tabs, no changes to tool card design/previews, no changes to `lib/tools.tsx`

## Assumptions

- Static categorization at build time (no API calls)
- AI-Powered Tools section always expanded on all screen sizes
- Utility Tools section collapsed by default on mobile (`< lg`), expanded on desktop
- Schema.org `ItemList` structured data for each section
- All changes contained within `bento-showcase.tsx`

---

## Tool Categorization

### AI-Powered Tools (15)
- Image Editor
- Story Video (picture books)
- Sketch to Art
- Logo Generator
- Font Generator
- Favicon Generator
- E-Card Generator
- Color Palette
- Mood Board
- Music Studio
- VBlog Studio
- ID Photo
- Component Lab
- Tax Manager
- Story Video (cartoon video)

### Utility Tools (13)
- IP Lookup
- My IP
- Speed Test
- Data Formatter
- API Playground
- JWT Decoder
- Regex Tester
- PDF Tools
- Currency Converter
- Image to SVG
- Brain Games
- Job Board
- AI Tracker

---

## Data Structure

Add a `category` field to each bento item:

```typescript
interface BentoItem {
  name: string
  description: string
  href: string
  gridClass: string
  glowClass: string
  category: 'ai' | 'utility'
  preview: React.ReactNode
}
```

At render time, split into two arrays:
```typescript
const aiTools = bentoItems.filter(item => item.category === 'ai')
const utilityTools = bentoItems.filter(item => item.category === 'utility')
```

---

## Layout

### AI-Powered Tools Section
- `<section>` wrapper with `<h2>AI-Powered Tools</h2>`
- Bento grid with existing layout logic (same `gridClass`, responsive columns)
- Always expanded on all screen sizes

### Utility Tools Section
- `<section>` wrapper with `<h2>Utility Tools</h2>`
- **Desktop (`lg+`)**: Always expanded, same bento grid
- **Mobile (`< lg`)**: Collapsed by default
  - Heading row acts as toggle: "Utility Tools" + chevron icon
  - `useState` boolean toggle + `hidden lg:block` pattern
  - Chevron rotates on expand/collapse
  - No animation library — simple show/hide

Both sections use the same bento grid CSS (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).

---

## Schema.org Structured Data

A `<script type="application/ld+json">` block rendered inside the component:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "mainEntity": [
    {
      "@type": "ItemList",
      "name": "AI-Powered Tools",
      "numberOfItems": 15,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Story Video",
          "url": "https://toolk1t.com/tools/story-video",
          "description": "Create AI-illustrated picture books from your story ideas"
        }
      ]
    },
    {
      "@type": "ItemList",
      "name": "Utility Tools",
      "numberOfItems": 13,
      "itemListElement": [...]
    }
  ]
}
```

- Generated dynamically from `bentoItems` array (not hardcoded)
- Uses `NEXT_PUBLIC_SITE_URL` env var for base URL (fallback: `https://toolk1t.com`)

---

## Decision Log

| # | Decision | Alternatives Considered | Reason |
|---|----------|------------------------|--------|
| 1 | Split bento into two sections with headings | Filter tabs, replace bento with card grid | Minimal change, preserves existing bento previews |
| 2 | Categorization via `category` field on bento items | Add to `lib/tools.tsx` Tool interface, separate config file | Bento has its own item list; no need to change shared tool data |
| 3 | AI-Powered Tools first | Utility first, keep current mixed order | Leads with premium/differentiated offering |
| 4 | Accordion on mobile for Utility Tools only | Collapse both, no collapse | AI tools are the hero content; collapsing utilities reduces scroll without hiding the primary offering |
| 5 | `useState` + CSS toggle for accordion | Animation library, `<details>` element | Simple, no dependencies, consistent with existing patterns |
| 6 | Schema.org `ItemList` per section | Single ItemList, no structured data | Two lists match the two sections; better SEO signal for tool categorization |
| 7 | All changes in `bento-showcase.tsx` only | Multiple files | Single-file change, minimal blast radius |

---

## Scope

- **Modified**: `components/home/bento-showcase.tsx`
- **No new files**
- **No changes to**: `lib/tools.tsx`, `app/page.tsx`, or any other component
