# Component Lab — Design Specification

## Overview

AI-powered UI component builder. User describes a component via text prompt (+ optional image reference + settings), AI generates working code for React, Vue, Svelte, and HTML with live preview, editable code, and AI chat for iterative refinement. Save to personal library, share with public links.

## User Flow

1. Describe component (text + optional image + settings)
2. Click Generate → AI produces code for 4 frameworks
3. Live preview renders in sandboxed iframe
4. Edit code directly or refine via AI chat
5. Switch framework tabs to see React/Vue/Svelte/HTML versions
6. Save to library (1 credit) or copy code (free)
7. Optionally share publicly

## Page Layout

### Desktop (lg+)
```
┌──────────────────────────────────────────────────────────────┐
│  Component Lab            [My Library] [Explore]  [Save 1cr] │
├──────────┬───────────────────────┬───────────────────────────┤
│ Prompt   │                      │  [React] [Vue] [Svelte]   │
│ Panel    │    Live Preview       │  [HTML]                   │
│ (w-72)   │    (iframe sandbox)   │                           │
│          │                      │  Code Editor               │
│ [Prompt] │                      │  (CodeMirror 6)            │
│ [Image]  │                      │                           │
│ [Settings│                      │                           │
├──────────┴───────────────────────┴───────────────────────────┤
│  AI Chat: "Make the buttons more rounded..."        [Send]   │
└──────────────────────────────────────────────────────────────┘
```

### Tablet (md)
Prompt panel collapses to top bar. Preview and code stack vertically.

### Mobile
Prompt as floating bottom sheet (FAB). Tabbed view: Preview / Code / Chat. No CodeMirror — read-only code block with copy button.

## Prompt Panel

Three sections:

### 1. Component Description
- Textarea max 1000 chars with counter
- Rotating placeholder examples

### 2. Reference Image (optional)
- Drop zone, image/* max 10MB
- Thumbnail preview with remove
- Sent to Gemini as visual context

### 3. Settings
| Setting | Options | Default |
|---------|---------|---------|
| Theme | Light / Dark / Both | Light |
| Responsive | Yes / No | Yes |
| Animations | None / Subtle / Rich | Subtle |
| Accessibility | Standard / WCAG AA | Standard |
| CSS Framework | Tailwind / Vanilla / None | Tailwind |

## Code Generation

Single Gemini API call generates all 4 frameworks. System prompt requests structured JSON:
```json
{
  "react": "full component code...",
  "vue": "full SFC code...",
  "svelte": "full component code...",
  "html": "full HTML+CSS code..."
}
```

All outputs should be visually identical, self-contained, and production-ready.

## Live Preview

- Sandboxed `<iframe sandbox="allow-scripts allow-same-origin">`
- Framework runtimes loaded via CDN (React/Vue from unpkg, Svelte compiled to vanilla JS)
- Tailwind loaded via CDN script
- Background toggle: white / dark / checkerboard
- Viewport presets: Mobile 375px / Tablet 768px / Desktop 1280px (drag handles)
- Auto-refreshes on code edit (debounced 500ms)

## Code Editor

- CodeMirror 6 with JSX + HTML syntax highlighting
- Framework tabs: React / Vue / Svelte / HTML
- Dark theme (`#131a23` background)
- Copy button per tab (clipboard + toast)
- Reset button (revert to AI-generated version)
- Edits are live — update preview immediately
- Edits are per-framework (independent)
- Lazy-loaded (dynamic import, ~80KB gzipped)

## AI Chat Refinement

- Single-line input (expandable) at bottom, full width
- Sends to `/api/v1/component-lab/refine` with: original prompt, current code, conversation history, refinement instruction
- Gemini returns updated code for all 4 frameworks
- Collapsible chat log above input (max 200px, user + AI messages)
- Version stack: undo/redo through generations, version counter "v3 of 5"
- Free (no credits for refinement)

## Library & Sharing

### Save (1 credit)
- Modal: component name + tags
- Saves all 4 framework codes + prompt + settings
- Gets unique slug for sharing

### My Library (`/tools/component-lab/library`)
- Grid of saved components with PNG thumbnails
- Search by name/tag
- Click to open in editor
- Share toggle (public/private)
- Delete button

### Explore (`/tools/component-lab/explore`)
- Public shared components grid
- Preview thumbnails (static PNGs, not live iframes)
- Sort: Newest / Most Copied
- Filter by tag
- Click to view → "Fork to Editor" to customize
- 20 per page with "Load more"

### Shared View (`/tools/component-lab/view/[slug]`)
- Read-only preview + code tabs
- Copy button (free, increments copy_count)
- "Open in Editor" button
- Author attribution

## File Structure

| File | Purpose |
|------|---------|
| `tools/component-lab/types.ts` | Types, settings, frameworks, constants |
| `tools/component-lab/component-lab.tsx` | Main studio orchestrator |
| `tools/component-lab/prompt-panel.tsx` | Left panel: prompt, image, settings |
| `tools/component-lab/live-preview.tsx` | Iframe sandbox with viewport controls |
| `tools/component-lab/code-editor.tsx` | CodeMirror with framework tabs |
| `tools/component-lab/chat-bar.tsx` | AI refinement chat + history |
| `tools/component-lab/library-grid.tsx` | My Library grid |
| `tools/component-lab/explore-grid.tsx` | Public explore grid |
| `tools/component-lab/component-viewer.tsx` | Shared component view |
| `lib/component-lab/prompts.ts` | Gemini prompt templates |
| `app/tools/component-lab/page.tsx` | Main page route |
| `app/tools/component-lab/library/page.tsx` | My Library page |
| `app/tools/component-lab/explore/page.tsx` | Explore page |
| `app/tools/component-lab/view/[slug]/page.tsx` | Shared view |
| `app/api/v1/component-lab/generate/route.ts` | Generate (4 frameworks) |
| `app/api/v1/component-lab/refine/route.ts` | AI refinement |
| `app/api/v1/component-lab/save/route.ts` | Save to library (1 credit) |
| `app/api/v1/component-lab/library/route.ts` | Fetch user's components |
| `app/api/v1/component-lab/explore/route.ts` | Fetch public components |
| `app/api/v1/component-lab/[slug]/route.ts` | Fetch single component |
| `supabase/migrations/031_components.sql` | DB table + RLS |

## API Design

### POST /api/v1/component-lab/generate
- Auth: Not required (free)
- Input: `{ prompt, settings, referenceImageBase64? }`
- Output: `{ react, vue, svelte, html }`
- Max duration: 30s

### POST /api/v1/component-lab/refine
- Auth: Not required (free)
- Input: `{ prompt, currentCode, history[], instruction, settings }`
- Output: `{ react, vue, svelte, html }`
- Max duration: 30s

### POST /api/v1/component-lab/save
- Auth: Required
- Credits: 1
- Input: `{ name, tags[], prompt, settings, codeReact, codeVue, codeSvelte, codeHtml, isPublic }`
- Output: `{ id, slug }`

### GET /api/v1/component-lab/library
- Auth: Required
- Output: `{ entries: [...] }`

### GET /api/v1/component-lab/explore
- Auth: Not required
- Query: `?sort=newest|popular&tag=pricing&offset=0`
- Output: `{ entries: [...], hasMore }`

### GET /api/v1/component-lab/[slug]
- Auth: Not required
- Output: `{ component: {...} }`

## Data Model

### `components_library` table

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID NOT NULL
name            TEXT NOT NULL
slug            TEXT UNIQUE NOT NULL
tags            TEXT[] DEFAULT '{}'
prompt          TEXT
settings        JSONB
code_react      TEXT
code_vue        TEXT
code_svelte     TEXT
code_html       TEXT
thumbnail_url   TEXT
is_public       BOOLEAN DEFAULT false
copy_count      INT DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

- RLS: users CRUD own. Anyone reads `is_public = true`.
- Slug: name + random suffix.
- Code as plain text per framework.
- Thumbnail: static PNG from html-to-image, stored in R2.

## Credit Model

| Operation | Cost |
|-----------|------|
| Generate component | Free |
| AI chat refinement | Free |
| Edit code | Free |
| Copy code | Free |
| Preview | Free |
| Save to library | 1 credit |
| Share publicly | Free |
| View/copy shared components | Free |
| Fork shared to editor | Free |

## Dependencies

- `@codemirror/lang-javascript` — JSX syntax
- `@codemirror/lang-html` — HTML/Vue/Svelte syntax
- `@codemirror/theme-one-dark` — dark theme (or custom)
- `codemirror` — core editor
- `html-to-image` — thumbnail generation (already installed)

## Edge Cases

- **Syntax errors in generated code**: Show error in iframe with "Refine with AI" suggestion
- **Truncated code**: Show warning + "Continue generating" button
- **Framework inconsistency**: "Regenerate" button per framework tab
- **Large components**: Max 50KB per framework output
- **Mobile**: No CodeMirror, read-only code blocks with copy
- **Explore performance**: Static PNG thumbnails, not live iframes. Paginated.
- **Duplicate slugs**: Name + 6-char random suffix

## Non-Goals (v1)

- npm package export
- Drag-and-drop component builder
- Deployment/hosting
- Version history (beyond session undo/redo)
- Component composition (combining multiple components)
- TypeScript output (JSX only for React)

## Decision Log

| # | Decision | Alternatives | Reason |
|---|----------|-------------|--------|
| 1 | Component builder | Full app, landing pages | Well-scoped |
| 2 | Multi-framework (4) | React only | Maximum audience |
| 3 | Text + image + settings | Text only | Full control |
| 4 | Preview + editor + chat | Preview only, chat-first | Best iteration |
| 5 | Library + sharing | No library | Social discovery |
| 6 | Gen free, 1cr save | Per-gen credits | Low friction |
| 7 | Split-panel studio | Wizard, chat-first | IDE-like |
| 8 | CodeMirror 6 | Monaco | Lighter, mobile-friendly |
| 9 | Sandboxed iframe | Direct DOM | Security |
| 10 | 4 frameworks in 1 call | Per-framework | Consistent, efficient |
| 11 | Static thumbnails | Live iframes | Performance |
| 12 | No editor on mobile | Full editor | Code editing UX |
