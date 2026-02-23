# Design: ECard Studio UX Overhaul

**Date**: 2026-02-24
**Status**: Approved
**Scope**: Single-page layout with editable content fields, remove discovery/editor split

---

## Problem

1. **Can't personalize content** — The 5 most important fields (name, title, message, company, tagline) are locked to template defaults. Users see "Your Name" / "Chief Executive Officer" but can't change them.
2. **Jarring view switch** — Discovery → Editor is a full page swap with lost context.
3. **Split editing** — Some fields editable in discovery, others only in editor. Confusing.
4. **Unnecessary step** — The "What's the occasion?" intent picker adds a step without value.

## Solution: Single-Page Editor

Replace the 2-view flow (discovery → editor) with one unified page.

### Layout (Desktop ≥ md)

```
┌──────────────────────────────────────────────────────┐
│  Breadcrumb: Home / Tools / ECard Studio             │
├──────────────────────────────────────────────────────┤
│  Templates: [■ Marble] [□ Corp] [□ Tech] [□ Aura]   │
│             [□ Noir]  [□ Blank]                      │
├──────────────────────────┬───────────────────────────┤
│                          │  Content                  │
│    Live Card Preview     │  Name: [Your Name      ]  │
│    (600×400 scaled)      │  Title: [CEO           ]  │
│                          │  Message: [Leading...  ]  │
│    ┌──────────────────┐  │  Company: [Acme Corp   ]  │
│    │  Your Name       │  │  Tagline: [Excellence..]  │
│    │  CEO             │  │                           │
│    │  Leading innov...│  │  Typography               │
│    │                  │  │  Font: [Playfair Display▼] │
│    │  Acme Corp       │  │  Size: [28] Bold: [✓]     │
│    └──────────────────┘  │                           │
│                          │  Colors                   │
│    [Preview] [Download]  │  Background: [#1a1a2e]    │
│                          │  Accent: [#d4af37]        │
│                          │  Presets: ● ● ● ● ●      │
├──────────────────────────┴───────────────────────────┤
│  Footer                                              │
└──────────────────────────────────────────────────────┘
```

### Layout (Mobile < md)

- Templates: horizontal scroll strip at top
- Preview: full width, below template strip
- Edit panel: below preview (scrollable), or in a bottom sheet/drawer
- Action buttons (Preview/Download): sticky at bottom

### Key Changes

1. **Remove discovery/editor split** — `page.tsx` renders one component, not two views.

2. **Add 5 content fields to edit panel**:
   - `heading` → labeled "Name"
   - `subheading` → labeled "Title"
   - `body` → labeled "Message" (textarea)
   - `companyName` → labeled "Company"
   - `companyTagline` → labeled "Tagline"
   All fields update live preview as user types.

3. **Template picker = compact strip** — Horizontal row of small template thumbnails at top. Clicking one swaps all defaults (full reset).

4. **Remove occasion/intent picker** — No "What's the occasion?" step.

5. **Edit panel sections ordered by importance**:
   - **Content** (text fields) — most important, top
   - **Typography** (font, size, bold, align, line height)
   - **Colors** (bg, accent, presets, border toggle)

### Template Switch Behavior

When user clicks a different template:
- Reset ALL fields to that template's defaults
- Simple, predictable, no partial-state confusion

### Files Affected

| File | Action |
|---|---|
| `app/tools/ecard-studio/page.tsx` | Simplify — remove discovery/editor state routing, render single layout |
| `tools/ecard-studio/card-editor.tsx` | Major rewrite — integrate template strip at top, two-column layout (preview + panel) |
| `tools/ecard-studio/customization-panel.tsx` | Add Content section with 5 text inputs above existing Typography/Colors sections |
| `tools/ecard-studio/template-discovery.tsx` | Remove or convert to a compact `TemplateStrip` component (horizontal thumbnail row) |

### What Stays the Same

- `CardPreview` component (rendering logic unchanged)
- `types.ts` (ECardData interface unchanged — fields already exist)
- `templates.ts` (template definitions unchanged)
- `export.ts` (PNG export unchanged)
- `preview-modal.tsx` (full-size preview modal unchanged)

### UX Heuristics Met

| Heuristic | How |
|---|---|
| Visibility of system status | Live preview updates as user types |
| User control & freedom | All fields editable, template switch resets cleanly |
| Consistency | Single editing surface, no mode confusion |
| Recognition over recall | All options visible on one page |
| Aesthetic & minimalist | Removed unnecessary occasion step and view transition |
| Efficiency | 0 steps to start editing (pick template → type) |
